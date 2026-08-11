import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log("🚀 Gemini AI SDK initialized successfully.");
} else {
  console.warn("⚠️  GEMINI_API_KEY is not defined in environment. Gemini AI service will run in fallback simulation mode.");
}

export const generateResumeAnalysis = async (resumeText, jobDescription = "") => {
  if (!genAI) {
    console.log("Gemini API Key missing, generating custom mockup report.");
    return generateFallbackReport(resumeText, jobDescription);
  }

  try {
    // Use gemini-2.0-flash for rapid SaaS response times and JSON output support
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert ATS (Applicant Tracking System) Auditor, Resume Reviewer, and Career Coach.
      Your task is to analyze the provided resume text and evaluate it against industry standards.
      
      IMPORTANT LANGUAGE RULE: Write ALL text output (summary, strengths, weaknesses, advice, interview answer outlines, roadmap descriptions, everything) in SIMPLE, CLEAR, BEGINNER-FRIENDLY language. Imagine you are explaining this to a college fresher with zero work experience and no knowledge of corporate jargon. Avoid complex vocabulary, buzzwords, and jargon like "leverage", "synergy", "optimize KPIs", "cross-functional". Use short sentences and everyday words instead. Be encouraging and easy to understand.
      ${jobDescription ? `Compare it specifically to the following targeted job description:\n[JOB DESCRIPTION]\n${jobDescription}\n` : 'Analyze it generally for a standard modern software engineer / developer path.'}
      
      [RESUME TEXT]
      ${resumeText}

      You must evaluate the resume on the following 9 areas:
      1. ATS score (calculate a match score out of 100).
      2. Summary of profile (short, professional 2-3 sentence overview).
      3. Resume Strengths (at least 3 specific items).
      4. Weaknesses / Areas to Improve (at least 3 specific items).
      5. Missing Skills (keywords from job description or general tech stack matching that are missing).
      6. Skill Gap mapping (array of skill objects showing matched or gap, with category 'Frontend', 'Backend', 'Database', 'DevOps', 'Testing', etc.).
      7. Bullet improvements (at least 3 original bullets from the resume parsed and rewritten with active verbs and quantified results/metrics).
      8. Career recommendations (suitable IT roles, suitable Non-IT roles, entry-level opportunities, fresher guidance, and industry certifications).
      9. Interview Questions categorized into 'technical', 'hr', 'project', and 'scenario' topics tailored to this candidate with ideal answer outlines.
      10. Step-by-step learning roadmap categorizing missing skills into 'beginner', 'intermediate', and 'advanced' levels, including descriptions, recommended resource lists, certification suggestions, and an estimated learning order.

      You MUST respond with a JSON object strictly matching this schema:
      {
        "atsScore": number,
        "summary": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "missingKeywords": ["string"],
        "skillGap": [
          { "skill": "string", "status": "Matched" | "Gap", "category": "string" }
        ],
        "improvements": [
          { "original": "string", "optimized": "string" }
        ],
        "careerGuidance": {
          "recommendedRoles": ["string"],
          "certifications": ["string"],
          "itRoles": ["string"],
          "nonItRoles": ["string"],
          "entryLevelOps": ["string"],
          "fresherAdvice": "string",
          "interviewQuestions": {
            "technical": [
              { "question": "string", "answerOutline": "string" }
            ],
            "hr": [
              { "question": "string", "answerOutline": "string" }
            ],
            "project": [
              { "question": "string", "answerOutline": "string" }
            ],
            "scenario": [
              { "question": "string", "answerOutline": "string" }
            ]
          }
        },
        "roadmap": {
          "beginner": [
            { "order": number, "skill": "string", "desc": "string", "resources": ["string"], "certifications": ["string"] }
          ],
          "intermediate": [
            { "order": number, "skill": "string", "desc": "string", "resources": ["string"], "certifications": ["string"] }
          ],
          "advanced": [
            { "order": number, "skill": "string", "desc": "string", "resources": ["string"], "certifications": ["string"] }
          ]
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // Parse response
    const report = JSON.parse(textResponse);
    return report;
  } catch (error) {
    console.error("Gemini API execution failed:", error.message);
    // Fallback if parsing fails or rate limits hit
    return generateFallbackReport(resumeText, jobDescription);
  }
};

// Fallback logic in case of missing keys or network errors
const generateFallbackReport = (resumeText, jobDescription) => {
  const baseScore = jobDescription ? 65 : 74;
  
  let textHash = 0;
  const combinedText = (resumeText || "") + (jobDescription || "");
  for (let i = 0; i < combinedText.length; i++) {
    textHash += combinedText.charCodeAt(i);
  }
  const stableRandomOffset = textHash % 15;
  const atsScore = baseScore + stableRandomOffset;

  const jdKeywords = jobDescription
    ? jobDescription.split(/[\s,.\n()]+/gi)
        .filter(w => w.length > 4 && !["about", "requirements", "responsibilities", "skills", "experience", "working"].includes(w.toLowerCase()))
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 5)
    : [];

  const defaultSkills = ["Kubernetes", "GraphQL", "AWS Cloud", "Jest/Cypress", "Python"];
  const extraGaps = jdKeywords.length > 0 ? jdKeywords : defaultSkills;

  return {
    atsScore: atsScore > 98 ? 98 : atsScore,
    summary: `Your resume looks good, but we can make it better. Adding clear numbers (like percentages or user counts) to your projects will help your resume stand out to recruiters.`,
    strengths: [
      "You have listed good coding skills that companies want.",
      "The resume is clean and easy to read.",
      "Your contact info is clear and easy to find."
    ],
    weaknesses: [
      "Your project details do not show clear results or numbers.",
      "No details about using cloud servers or tools.",
      "No details about how you check or test your code."
    ],
    missingKeywords: extraGaps,
    skillGap: [
      { skill: "React.js", status: "Matched", category: "Frontend" },
      { skill: "Tailwind CSS", status: "Matched", category: "Frontend" },
      { skill: "JavaScript", status: "Matched", category: "Frontend" },
      ...extraGaps.map((skill, index) => ({
        skill,
        status: "Gap",
        category: index % 2 === 0 ? "Backend" : "DevOps"
      }))
    ],
    improvements: [
      {
        original: "Responsible for writing and maintaining application code.",
        optimized: "Engineered and maintained robust web application codebase serving 5,000+ weekly active users, increasing feature deployment velocity by 15%."
      },
      {
        original: "Worked on styling the dashboard and fixing UI bugs.",
        optimized: "Redesigned administrative dashboard interfaces using responsive Tailwind CSS, reducing dashboard layout shift (CLS) by 35%."
      }
    ],
    careerGuidance: {
      recommendedRoles: [
        jobDescription ? "Target Role" : "Software Engineer", 
        "Frontend Developer"
      ],
      certifications: [
        "Google Cloud Professional Cloud Architect",
        "CompTIA Security+"
      ],
      itRoles: [
        "Full Stack Developer",
        "Cloud Operations Associate",
        "Quality Assurance Engineer"
      ],
      nonItRoles: [
        "Technical Product Owner",
        "Tech Recruiter",
        "Developer Advocate"
      ],
      entryLevelOps: [
        "Junior React Developer",
        "Support Engineer Internship"
      ],
      fresherAdvice: "As a career starter, focus heavily on establishing public GitHub repositories containing small-scale deployments. Prioritize clean documentation and simple tests to stand out to engineering leads.",
      interviewQuestions: {
        technical: [
          {
            question: "How do you handle client-side state caching in large React.js codebases?",
            answerOutline: "Discuss React Context, Redux Toolkit slice caches, local storage sync buffers, and hooks optimization like useMemo."
          }
        ],
        hr: [
          {
            question: "Describe a situation where you had to collaborate with a difficult coworker.",
            answerOutline: "Structure via STAR method: focus on active listening, empathy, finding shared priorities, and keeping goals project-centric."
          }
        ],
        project: [
          {
            question: `Explain how you would resolve skill gaps in ${extraGaps[0] || "Backend Systems"} during a live project?`,
            answerOutline: "Discuss proactive technical research, establishing proof of concepts in local sandboxes, consulting documentation, and pairing with domain experts."
          }
        ],
        scenario: [
          {
            question: "A high-priority bug is discovered in production, but the lead developer is out. What do you do?",
            answerOutline: "Analyze log triggers, isolate the issue in local test environments, communicate progress to stack owners, propose patch solutions, and document checks."
          }
        ]
      }
    },
    roadmap: {
      beginner: extraGaps.slice(0, 2).map((gapSkill, index) => ({
        order: index + 1,
        skill: gapSkill,
        desc: `Engage with introductory specifications, build basic syntax checklists, and execute simple sandboxed examples.`,
        resources: [`Intro to ${gapSkill}`, `${gapSkill} Official Docs`],
        certifications: [`${gapSkill} Foundations Certification`]
      })),
      intermediate: extraGaps.slice(2, 4).map((gapSkill, index) => ({
        order: index + 1,
        skill: gapSkill,
        desc: `Build standard CRUD integrations, write unit tests, and resolve typical asynchronous routing scenarios.`,
        resources: [`Advanced ${gapSkill} Guides`, "MDN Web Docs"],
        certifications: [`Certified ${gapSkill} Developer`]
      })),
      advanced: extraGaps.slice(4).map((gapSkill, index) => ({
        order: index + 1,
        skill: gapSkill,
        desc: `Deploy components into cloud clusters, configure CI/CD pipelines, optimize database indices, and design high-scale systems.`,
        resources: [`Scale Architecture with ${gapSkill}`, "AWS Architect Handbooks"],
        certifications: [`Professional Cloud Architect Certification`]
      }))
    },
    createdAt: new Date().toISOString()
  };
};

export const generateSegmentImprovement = async (text, type, instruction = "") => {
  if (!genAI) {
    console.log("Gemini API Key missing, generating mock segment improvement.");
    return {
      original: text,
      optimized: `[Demo Optimize] Spearheaded and scale-optimized core framework systems: "${text}", improving application responsiveness by 24% and reducing CLS.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert resume writer. Rewrite the following resume segment of type "${type}" to make it more professional, impactful, and clear.
      ${instruction ? `Follow this specific optimization instruction: ${instruction}\n` : "Ensure you use strong action verbs and try to add quantified metrics/results if possible."}

      [SEGMENT TO REWRITE]
      "${text}"

      Respond with a JSON object strictly matching this schema:
      {
        "original": "string",
        "optimized": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini segment improvement failed:", error.message);
    return {
      original: text,
      optimized: `Engineered and integrated critical subsystems matching: "${text}" (reducing page latency by 18%).`
    };
  }
};

export const generateJobMatchInsights = async (resumeText, jobDescription) => {
  if (!genAI) {
    console.log("Gemini API Key missing, generating mock job match insights.");
    return {
      strongMatches: [
        "Robust command of core web application fundamentals (HTML/CSS/JS).",
        "Experience building visual layout modules with React framework.",
        "Demonstrated familiarity with Git versioning control pipelines."
      ],
      missingRequirements: [
        "Lacks description of AWS, GCP or other cloud provider environments.",
        "No backend APIs node/express databases schemas integrations listed.",
        "Missing test-driven unit test assertions suites (Jest/Cypress)."
      ],
      recommendedImprovements: [
        "Revise experience descriptions to incorporate specific database/cloud stack details.",
        "Integrate details of API layer routes you engineered in past projects.",
        "Include unit testing and performance checking benchmarks."
      ],
      skillsToLearn: [
        "AWS Cloud Services",
        "Express.js & Database Systems",
        "Jest & Cypress Unit Testing"
      ],
      roleSuitability: "The candidate demonstrates strong frontend foundations, but lacks critical cloud hosting and full-stack backend components required for general developer parity."
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert career auditor and corporate recruiter.
      Analyze the provided resume text against the target job description:

      [JOB DESCRIPTION]
      ${jobDescription}

      [RESUME TEXT]
      ${resumeText}

      Perform a multi-dimensional job match audit:
      1. Identify strong matches (which parts of the candidate's background align with target demands).
      2. Identify missing requirements (what target prerequisites they lack).
      3. Recommend specific resume modifications to align with this JD.
      4. List skills to learn (technologies/methodologies to acquire).
      5. Summarize role suitability (overall narrative review of compatibility).

      Respond with a JSON object strictly matching this schema:
      {
        "strongMatches": ["string"],
        "missingRequirements": ["string"],
        "recommendedImprovements": ["string"],
        "skillsToLearn": ["string"],
        "roleSuitability": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini job match insights failed:", error.message);
    return {
      strongMatches: ["Candidate demonstrates solid baseline frontend competencies."],
      missingRequirements: ["Prerequisites specified in the target job description require further experience depth."],
      recommendedImprovements: ["Incorporate specialized tools highlighted in the job description."],
      skillsToLearn: ["Cloud hosting platforms", "Integration methodologies"],
      roleSuitability: "Candidate displays strong baseline potential, but needs to incorporate additional backend or DevOps tools."
    };
  }
};

export const generateChatbotResponse = async (userMessage, resumeText = "", chatHistory = []) => {
  if (!genAI) {
    return "Gemini AI is currently in simulation mode. Based on your profile guidelines, you show solid full-stack capability! Keep uploading target jobs to optimize your metrics.";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const formattedHistory = chatHistory.map(msg => 
      `${msg.sender === "user" ? "Candidate" : "Coach"}: ${msg.text}`
    ).join("\n");

    const prompt = `
      You are an expert career coach and technical recruiter.
      Analyze the candidate's resume text below and answer their career query.
      Provide highly personalized, actionable advice tailored to their specific projects, credentials, and skills.
      Do not offer generic advice.
      Keep your answer friendly, professional, concise, and structured in Markdown.

      [CANDIDATE RESUME TEXT]
      ${resumeText || "No resume uploaded yet. Inform the candidate to upload a resume PDF to get customized insights."}

      [CONVERSATION HISTORY]
      ${formattedHistory || "No previous messages."}

      [NEW QUERY]
      Candidate: ${userMessage}

      Coach:
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini chatbot generation failed:", error.message);
    return "I encountered a brief connection error while processing your request. Please try asking again.";
  }
};

export const generateMockInterviewAnalysis = async (question, userAnswer, category = "general") => {
  if (!genAI) {
    return {
      communicationFeedback: "Good vocabulary base. Recommendation: Elaborate on how team dependencies are handled.",
      answerQuality: 80,
      preparationLevel: "Intermediate",
      suggestions: ["Elaborate on tech stack choices.", "Detail numerical KPIs of projects."]
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert technical interviewer and communication coach.
      Evaluate the candidate's response to the interview question in the category: "${category}".

      [INTERVIEW QUESTION]
      ${question}

      [CANDIDATE RESPONSE]
      ${userAnswer}

      Assess their answer quality, communication skills (clarity, structure, vocabulary), and preparation level.
      Respond with a JSON object strictly matching this schema:
      {
        "communicationFeedback": "string",
        "answerQuality": number,
        "preparationLevel": "Beginner" | "Intermediate" | "Advanced",
        "suggestions": ["string"]
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini mock interview evaluation failed:", error.message);
    return {
      communicationFeedback: "Solid communication base, but advice detail is pending. Try submitting again.",
      answerQuality: 70,
      preparationLevel: "Intermediate",
      suggestions: ["Incorporate structured frameworks like STAR when answering."]
    };
  }
};

export const generateJobRecommendations = async (resumeText = "", careerInterests = "") => {
  if (!genAI) {
    return {
      it: [
        {
          jobTitle: "Junior React Developer",
          matchPercentage: 85,
          requiredSkills: ["React", "JavaScript", "CSS layouting"],
          missingSkills: ["TypeScript", "Vite configurations"],
          roadmap: ["Convert baseline structures to TS interfaces.", "Bootstrap production environments with Vite."]
        }
      ],
      dataScience: [
        {
          jobTitle: "Data Analyst Trainee",
          matchPercentage: 60,
          requiredSkills: ["Python basic structures", "Excel spreadsheets"],
          missingSkills: ["Pandas & NumPy modules", "SQL database joins"],
          roadmap: ["Complete SQL tutorial course.", "Build data parsing loops in Jupyter notebooks."]
        }
      ],
      banking: [
        {
          jobTitle: "Operations Analyst",
          matchPercentage: 55,
          requiredSkills: ["Analytical documentation", "Communications flow"],
          missingSkills: ["Financial compliance audit frameworks", "Risk analysis metrics"],
          roadmap: ["Acquire introductory banking regulations certificates.", "Review cash reconciliation systems guides."]
        }
      ],
      nonIt: [
        {
          jobTitle: "Technical Content Writer",
          matchPercentage: 75,
          requiredSkills: ["Technical documentation writing", "Product explanations"],
          missingSkills: ["Search engine marketing (SEO)", "CMS platforms editing"],
          roadmap: ["Write 3 sample technical guides on Dev.to.", "Audit key term densities using online metrics tools."]
        }
      ],
      fresher: [
        {
          jobTitle: "Associate Software Engineer",
          matchPercentage: 90,
          requiredSkills: ["Computer science fundamentals", "Git tracking", "Logical problem solving"],
          missingSkills: ["System design foundations", "Cloud deployment setups"],
          roadmap: ["Host personal portfolio apps on Vercel/Netlify.", "Practice 20 medium algorithmic challenges."]
        }
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert recruitment advisor and candidate career counselor.
      Analyze the candidate's resume credentials and career interests below to compile personalized job recommendations.

      [CANDIDATE RESUME TEXT]
      ${resumeText || "No resume uploaded yet."}

      [CANDIDATE CAREER INTERESTS]
      ${careerInterests || "Open to suggestions"}

      Recommend suitable jobs across these five distinct categories:
      1. IT Jobs ("it")
      2. Data Science Roles ("dataScience")
      3. Banking Jobs ("banking")
      4. Non-IT Opportunities ("nonIt")
      5. Fresher Jobs ("fresher")

      For each category, recommend one highly suitable role containing:
      - Job title
      - Match percentage (0 to 100)
      - Required skills (skills they have matching this job)
      - Missing skills (skills they lack but need for this job)
      - Preparation roadmap (3 action steps to qualify)

      Respond with a JSON object strictly matching this schema:
      {
        "it": [
          {
            "jobTitle": "string",
            "matchPercentage": number,
            "requiredSkills": ["string"],
            "missingSkills": ["string"],
            "roadmap": ["string"]
          }
        ],
        "dataScience": [
          {
            "jobTitle": "string",
            "matchPercentage": number,
            "requiredSkills": ["string"],
            "missingSkills": ["string"],
            "roadmap": ["string"]
          }
        ],
        "banking": [
          {
            "jobTitle": "string",
            "matchPercentage": number,
            "requiredSkills": ["string"],
            "missingSkills": ["string"],
            "roadmap": ["string"]
          }
        ],
        "nonIt": [
          {
            "jobTitle": "string",
            "matchPercentage": number,
            "requiredSkills": ["string"],
            "missingSkills": ["string"],
            "roadmap": ["string"]
          }
        ],
        "fresher": [
          {
            "jobTitle": "string",
            "matchPercentage": number,
            "requiredSkills": ["string"],
            "missingSkills": ["string"],
            "roadmap": ["string"]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini job recommendations failed:", error.message);
    return {
      it: [{ jobTitle: "Technical Support Associate", matchPercentage: 70, requiredSkills: ["Troubleshooting"], missingSkills: ["Networking definitions"], roadmap: ["Study TCP/IP settings."] }],
      dataScience: [{ jobTitle: "Data Entry Assistant", matchPercentage: 50, requiredSkills: ["Documentation"], missingSkills: ["Python Data modules"], roadmap: ["Learn pandas libraries."] }],
      banking: [{ jobTitle: "Bank Teller Clerk", matchPercentage: 65, requiredSkills: ["Account auditing"], missingSkills: ["Banking tools experience"], roadmap: ["Review cash registers rules."] }],
      nonIt: [{ jobTitle: "Customer Relations Agent", matchPercentage: 80, requiredSkills: ["Verbal communication"], missingSkills: ["CRM platform systems"], roadmap: ["Register for basic CRM courses."] }],
      fresher: [{ jobTitle: "Engineering Intern", matchPercentage: 85, requiredSkills: ["Coding foundations"], missingSkills: ["Git collaboration workflow"], roadmap: ["Perform repository branching tasks."] }]
    };
  }
};

export const generateSkillQuiz = async (skills = [], targetRole = "Software Engineer", difficulty = "Intermediate", count = 5) => {
  const parsedCount = parseInt(count) || 5;

  if (!genAI) {
    const mockQuestionsPool = [
      {
        id: 1,
        question: `In a standard ${targetRole} application, what is the primary purpose of state reconciliation?`,
        options: ["To clear database memory", "To match UI structure updates with virtual DOM nodes", "To trigger HTTP fetch loops", "To authenticate JWT parameters"],
        correctAnswer: "To match UI structure updates with virtual DOM nodes",
        explanation: "Reconciliation matches render structures with virtual representations to verify nodes before paint cycles."
      },
      {
        id: 2,
        question: "Which of the following is considered a major technical limitation of standard client-side caching?",
        options: ["Server routing drops", "Memory leakage during page rendering", "Lack of server-side data synchronization control", "Vector icon conversion errors"],
        correctAnswer: "Lack of server-side data synchronization control",
        explanation: "Client-side caches remain out-of-sync with active server changes unless cache headers or invalidation rules are set."
      },
      {
        id: 3,
        question: "What is the key difference between relational database tables and NoSQL document collections?",
        options: ["NoSQL collection schemas enforce SQL parameters", "Relational databases use structured foreign-key schemas", "Relational databases do not support indexes", "NoSQL documents can only store arrays"],
        correctAnswer: "Relational databases use structured foreign-key schemas",
        explanation: "Relational tables rely on foreign keys to join schemas, whereas document collection platforms store nested object documents."
      },
      {
        id: 4,
        question: "Why should developers use debounce handlers during input keyup events?",
        options: ["To speed up font loads", "To prevent too many API requests during typing", "To compile CSS styles", "To encrypt user password keys"],
        correctAnswer: "To prevent too many API requests during typing",
        explanation: "Debouncing groups quick keystrokes into a single event, reducing backend network request overhead."
      },
      {
        id: 5,
        question: "What is the primary benefit of deploying containerized Docker environments in production?",
        options: ["Guaranteed 100% database speedups", "Consistent runtime configurations across systems", "Automated SVG vector creation", "Reduced stylesheet sizes"],
        correctAnswer: "Consistent runtime configurations across systems",
        explanation: "Docker containers wrap code and dependencies, guaranteeing the app behaves identically in development and production environments."
      },
      {
        id: 6,
        question: "What is the purpose of Git version control branching?",
        options: ["To compress CSS files", "To work on features in isolation", "To execute unit tests", "To host databases"],
        correctAnswer: "To work on features in isolation",
        explanation: "Branches allow developers to write code without disturbing the stable main code thread."
      },
      {
        id: 7,
        question: "Which HTML tag is used to create an inline style definition?",
        options: ["<font>", "<style>", "<css>", "<design>"],
        correctAnswer: "<style>",
        explanation: "The <style> tag defines style information for a single HTML document."
      },
      {
        id: 8,
        question: "What does API stand for in software engineering?",
        options: ["Applied Product Integration", "Application Programming Interface", "Automated Private Indexing", "Active Project Interface"],
        correctAnswer: "Application Programming Interface",
        explanation: "API stands for Application Programming Interface, allowing different apps to talk to each other."
      },
      {
        id: 9,
        question: "Which Javascript method is used to write text output to the web console?",
        options: ["console.print()", "console.log()", "console.write()", "print.console()"],
        correctAnswer: "console.log()",
        explanation: "The console.log() method writes a message or logs object variables to the developer console."
      },
      {
        id: 10,
        question: "What is the default port number for standard HTTP web servers?",
        options: ["Port 443", "Port 80", "Port 8080", "Port 21"],
        correctAnswer: "Port 80",
        explanation: "HTTP traffic uses port 80 by default, whereas secure HTTPS traffic uses port 443."
      },
      {
        id: 11,
        question: "Which language is primarily used for styling web page layouts?",
        options: ["HTML", "SQL", "CSS", "Python"],
        correctAnswer: "CSS",
        explanation: "CSS (Cascading Style Sheets) is the language used to design the visual presentation of web elements."
      },
      {
        id: 12,
        question: "Which of the following is NOT a valid JavaScript data type?",
        options: ["String", "Boolean", "Float", "Undefined"],
        correctAnswer: "Float",
        explanation: "JavaScript uses the 'Number' type for all numbers (both integers and floats)."
      },
      {
        id: 13,
        question: "What does JSON stand for?",
        options: ["Java Source Object Notation", "JavaScript Object Notation", "JavaScript Online Node", "Java Standard Object Network"],
        correctAnswer: "JavaScript Object Notation",
        explanation: "JSON stands for JavaScript Object Notation, a lightweight data interchange format."
      },
      {
        id: 14,
        question: "Which SQL command is used to add new records to a database table?",
        options: ["ADD RECORD", "INSERT INTO", "SAVE DATA", "UPDATE TABLE"],
        correctAnswer: "INSERT INTO",
        explanation: "The INSERT INTO statement is used to insert new rows in a table."
      },
      {
        id: 15,
        question: "Which of the following is a backend runtime environment for JavaScript?",
        options: ["Node.js", "Chrome", "Firefox", "Vercel"],
        correctAnswer: "Node.js",
        explanation: "Node.js allows developers to run JavaScript code outside a web browser, on a server."
      },
      {
        id: 16,
        question: "What is the primary keyword used to import libraries in Python?",
        options: ["using", "require", "import", "include"],
        correctAnswer: "import",
        explanation: "Python uses the 'import' keyword to import modules and packages."
      },
      {
        id: 17,
        question: "Which Git command is used to save changes locally with a descriptive message?",
        options: ["git push", "git save", "git commit", "git add"],
        correctAnswer: "git commit",
        explanation: "git commit -m 'message' records a snapshot of your changes in your local Git repository."
      },
      {
        id: 18,
        question: "What is the primary function of DNS (Domain Name System)?",
        options: ["To encrypt web traffic", "To translate domain names to IP addresses", "To check firewall rules", "To speed up page rendering"],
        correctAnswer: "To translate domain names to IP addresses",
        explanation: "DNS translates human-readable web addresses (like google.com) into machine-readable IP addresses."
      },
      {
        id: 19,
        question: "Which SQL clause is used to filter records based on a specific condition?",
        options: ["FILTER", "WHERE", "HAVING", "GROUP BY"],
        correctAnswer: "WHERE",
        explanation: "The WHERE clause is used to extract only those records that fulfill a specified condition."
      },
      {
        id: 20,
        question: "What does MVC stand for in software architecture?",
        options: ["Model View Controller", "Main Value Constructor", "Module Variable Container", "Multi Version Compiler"],
        correctAnswer: "Model View Controller",
        explanation: "MVC stands for Model View Controller, a design pattern that separates application logic from user interface presentation."
      },
      {
        id: 21,
        question: "Which tag is used to create a numbered list in HTML?",
        options: ["<ul>", "<ol>", "<li>", "<dl>"],
        correctAnswer: "<ol>",
        explanation: "The <ol> tag defines an ordered (numbered) list."
      },
      {
        id: 22,
        question: "Which symbol is used for ID selectors in CSS?",
        options: [". (dot)", "# (hash)", "$ (dollar)", "* (asterisk)"],
        correctAnswer: "# (hash)",
        explanation: "The # symbol is used in CSS to target elements with a specific ID attribute."
      },
      {
        id: 23,
        question: "What is the output of 3 + '3' in JavaScript?",
        options: ["6", "33", "NaN", "Error"],
        correctAnswer: "33",
        explanation: "JavaScript converts the number to a string and performs concatenation, resulting in '33'."
      },
      {
        id: 24,
        question: "Which array method in JavaScript adds one or more elements to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: "push()",
        explanation: "The push() method adds new items to the end of an array and returns the new length."
      },
      {
        id: 25,
        question: "In Python, which function is used to get the length of a list?",
        options: ["length()", "len()", "count()", "size()"],
        correctAnswer: "len()",
        explanation: "The len() function returns the number of items in a list or characters in a string."
      },
      {
        id: 26,
        question: "Which SQL operator is used to sort the result set in ascending order?",
        options: ["SORT", "ORDER BY", "ARRANGE", "GROUP BY"],
        correctAnswer: "ORDER BY",
        explanation: "The ORDER BY keyword is used to sort the result-set in ascending or descending order."
      },
      {
        id: 27,
        question: "What does DOM stand for in web development?",
        options: ["Document Object Model", "Domain Object Manager", "Digital Object Method", "Document Online Map"],
        correctAnswer: "Document Object Model",
        explanation: "DOM stands for Document Object Model, which represents the page structure as a tree of objects."
      },
      {
        id: 28,
        question: "Which keyword is used to declare a constant variable in JavaScript?",
        options: ["var", "let", "const", "constant"],
        correctAnswer: "const",
        explanation: "The 'const' keyword declares variables that cannot be reassigned after initialization."
      },
      {
        id: 29,
        question: "Which of the following is a NoSQL database?",
        options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
        correctAnswer: "MongoDB",
        explanation: "MongoDB is a document-oriented database classified as NoSQL."
      },
      {
        id: 30,
        question: "What is the primary command used to clone a Git repository to your computer?",
        options: ["git copy", "git clone", "git download", "git fetch"],
        correctAnswer: "git clone",
        explanation: "git clone is used to create a copy of a remote Git repository on your local computer."
      }
    ];

    // Ensure we return exactly the requested count by slicing the pool
    return mockQuestionsPool.slice(0, parsedCount);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert technical interviewer and technical writer.
      Generate a skills assessment quiz for a candidate targeting the role: "${targetRole}".
      Target skills context: ${skills.join(", ") || "General Programming foundations"}.
      Difficulty Tier: ${difficulty}.

      Generate exactly ${parsedCount} multiple choice questions.
      Ensure the questions are highly technical, specific, and relevant to the skills context.
      Avoid generic questions.

      Respond with a JSON array strictly matching this schema:
      [
        {
          "id": number,
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini quiz generation failed:", error.message);
    const fallbackList = [
      {
        id: 1,
        question: "What is the purpose of Git version control branching?",
        options: ["To compress CSS files", "To work on features in isolation", "To execute unit tests", "To host databases"],
        correctAnswer: "To work on features in isolation",
        explanation: "Branches allow developers to write code without disturbing the stable main code thread."
      }
    ];
    return fallbackList;
  }
};

export const generateQuizPerformanceReport = async (quizQuestions = [], userAnswers = [], difficulty = "Intermediate", targetRole = "Software Engineer") => {
  if (!genAI) {
    return {
      strengths: ["Strong baseline comprehension of UI lifecycle updates.", "Familiarity with containerization concepts."],
      weaknesses: ["Requires deeper understanding of cache synchronization limits.", "Debounce throttle timing parameters."],
      recommendations: ["Review MDN Web Guides for performance optimizations.", "Complete NoSQL data modeling courses."]
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert technical assessor and engineering manager.
      Analyze the candidate's performance report on a skills assessment quiz:
      Role: "${targetRole}"
      Difficulty: "${difficulty}"

      [QUIZ QUESTIONS & CORRECT ANSWERS]
      ${JSON.stringify(quizQuestions)}

      [CANDIDATE SELECTED ANSWERS]
      ${JSON.stringify(userAnswers)}

      Evaluate their correct and incorrect answers to map:
      1. Strength areas (technologies/concepts they mastered).
      2. Weak areas (knowledge gaps or topics they failed).
      3. Learning recommendations (courses, documentations, or study topics).

      Respond with a JSON object strictly matching this schema:
      {
        "strengths": ["string"],
        "weaknesses": ["string"],
        "recommendations": ["string"]
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini quiz evaluation failed:", error.message);
    return {
      strengths: ["Coding foundations"],
      weaknesses: ["Target system design patterns"],
      recommendations: ["Study clean code tutorials."]
    };
  }
};
