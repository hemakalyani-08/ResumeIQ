/**
 * Independent Resume Parsing Service
 * Heuristic-based parser extracting Name, Email, Phone, Skills, Education, Experience, Projects, Certifications, and Achievements.
 */

export const parseResumeText = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text content provided for parsing.");
  }

  const result = {
    name: "",
    email: "",
    phone: "",
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    achievements: []
  };

  // Clean lines and split
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return result;
  }

  // 1. Extract Name (Heuristic: First non-empty line of the resume is usually the candidate's name)
  const probableName = lines[0];
  // Filter out headers/contacts if name is placed in title
  if (probableName && probableName.length < 50 && !probableName.includes("@") && !/\d{4,}/.test(probableName)) {
    result.name = probableName;
  } else {
    result.name = "Candidate Profile";
  }

  // 2. Extract Email using standard RegEx
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0];
  }

  // 3. Extract Phone using RegEx matching formats like: +1-555-555-5555, (555) 555-5555, 555.555.5555
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
  }

  // 4. Heuristic Section Splitting
  const headers = [
    { regex: /skills|competencies|technologies|technical tools|programming|technical skills/i, key: "skills" },
    { regex: /education|academic|university|degree|school/i, key: "education" },
    { regex: /experience|employment|work history|professional history|professional background|career history/i, key: "experience" },
    { regex: /projects|personal projects|key projects/i, key: "projects" },
    { regex: /certifications|credentials|licenses|courses/i, key: "certifications" },
    { regex: /achievements|awards|honors|accomplishments/i, key: "achievements" }
  ];

  // Map header matching lines
  const sectionIndices = [];
  lines.forEach((line, index) => {
    // Only flag short headers (less than 40 chars)
    if (line.length < 40) {
      for (const h of headers) {
        if (h.regex.test(line)) {
          sectionIndices.push({ index, key: h.key, header: line });
          break;
        }
      }
    }
  });

  // Sort indices chronologically
  sectionIndices.sort((a, b) => a.index - b.index);

  // Split lines by sections
  if (sectionIndices.length > 0) {
    for (let i = 0; i < sectionIndices.length; i++) {
      const current = sectionIndices[i];
      const start = current.index + 1;
      const end = (i + 1 < sectionIndices.length) ? sectionIndices[i + 1].index : lines.length;
      
      const sectionLines = lines.slice(start, end);

      if (current.key === "skills") {
        const skillSet = new Set();
        sectionLines.forEach(line => {
          // Split skill listings by commas, pipes, bullets, or multiple spaces
          const parts = line.split(/[,|•\uf0a7\u25cf]|\s{2,}/)
            .map(s => s.trim())
            .filter(s => s.length > 1 && s.length < 35 && !headers.some(h => h.regex.test(s)));
          parts.forEach(p => skillSet.add(p));
        });
        result.skills = Array.from(skillSet);
      } else {
        // Store as array of lines/paragraphs
        result[current.key] = sectionLines.map(line => {
          // Remove leading bullet characters
          return line.replace(/^[-•*○\uf0a7\u25cf]\s*/, "").trim();
        }).filter(line => line.length > 0);
      }
    }
  }

  // Fallbacks if section was not identified or parsed
  if (result.skills.length === 0) {
    // Attempt parsing standard skill names from generic text
    const commonSkills = ["React", "JavaScript", "HTML", "CSS", "Node.js", "Python", "SQL", "Git", "AWS", "Docker", "TypeScript"];
    commonSkills.forEach(skill => {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(text)) {
        result.skills.push(skill);
      }
    });
  }

  return result;
};
