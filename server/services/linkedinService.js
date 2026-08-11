import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export const auditLinkedinProfile = async (profileData) => {
  if (!genAI) {
    return {
      optimizedHeadline: "Software Engineer | Web Developer | React & Node.js",
      optimizedAbout: "Friendly and focused Software Engineer who loves building websites. I write clean code using React for the front part of apps, and Node.js for the back. I always look for ways to make pages load fast and look great on all devices.",
      skillsSuggestions: ["JavaScript", "React", "Node.js", "Web Development"],
      visibilityTips: [
        "Put your main coding languages in your headline so recruiters can find you easily.",
        "Add links to your actual websites or GitHub projects in the 'Featured' section.",
        "Write simple summaries of what you did at each job or internship."
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert LinkedIn optimization coach.
      Analyze the candidate's professional LinkedIn profile details below:

      [CURRENT HEADLINE]
      ${profileData.headline || "Not provided"}

      [ABOUT SECTION]
      ${profileData.about || "Not provided"}

      [CURRENT SKILLS]
      ${profileData.skills || "Not provided"}

      [EXPERIENCE SUMMARY]
      ${profileData.experiences || "Not provided"}

      IMPORTANT LANGUAGE RULE: Write ALL text output (optimized headline, optimized about, suggestions, and tips) in SIMPLE, CLEAR, BEGINNER-FRIENDLY English. Imagine you are explaining this to a college fresher with zero work experience. Avoid complex corporate jargon like 'scalable architectures', 'RESTful systems', 'SaaS structures', 'boolean search parameters'. Use short sentences and everyday words. Focus on simple value descriptions.

      Evaluate key terms and suggest optimizations for recruiter search results.
      Respond with a JSON object strictly matching this schema:
      {
        "optimizedHeadline": "string",
        "optimizedAbout": "string",
        "skillsSuggestions": ["string"],
        "visibilityTips": ["string"]
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini LinkedIn audit failed:", error.message);
    return {
      optimizedHeadline: "Web Developer | React | Node.js",
      optimizedAbout: "Developer focused on building simple, fast, and friendly websites.",
      skillsSuggestions: ["JavaScript", "React", "Node.js"],
      visibilityTips: ["Use clear and simple keywords in your experience summaries."]
    };
  }
};
