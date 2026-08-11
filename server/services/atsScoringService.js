/**
 * ATS Scoring Engine Service
 * Calculates match score using keywords, experience metrics, education matches, and structure audits.
 */

export const calculateAtsScore = (extractedData, jobDescription = "", rawText = "") => {
  if (!extractedData) {
    throw new Error("Invalid extracted resume data provided for scoring.");
  }

  const result = {
    atsScore: 70, // Default baseline score
    matchingSkills: [],
    missingSkills: [],
    keywordSuggestions: [],
    improvementAreas: []
  };

  const resumeSkills = extractedData.skills || [];
  const resumeExperience = extractedData.experience || [];
  const resumeEducation = extractedData.education || [];
  const resumeProjects = extractedData.projects || [];

  // --- 1. KEYWORD & SKILLS MATCHING (40% weight) ---
  let jobKeywords = [];
  if (jobDescription && jobDescription.trim().length > 0) {
    // Extract keywords (words > 4 letters, capitalized, avoiding common layout words)
    const cleanJd = jobDescription.replace(/[^a-zA-Z\s#+]/g, " ");
    const words = cleanJd.split(/[\s,.\n()]+/gi)
      .map(w => w.trim())
      .filter(w => w.length > 2);

    // Common technical tools / skills to target
    const techDictionary = [
      "react", "javascript", "typescript", "node", "express", "postgresql", "mysql", "mongodb",
      "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "jenkins", "git", "python",
      "django", "flask", "java", "spring", "c++", "c#", "dotnet", "ruby", "rails", "php",
      "graphql", "rest", "api", "sass", "css", "html", "tailwind", "bootstrap", "redux",
      "vue", "angular", "jest", "cypress", "mocha", "linux", "agile", "scrum"
    ];

    const extractedJdSkills = new Set();
    words.forEach(w => {
      const lower = w.toLowerCase();
      if (techDictionary.includes(lower)) {
        // Normalize name
        const normalized = techDictionary.find(d => d === lower);
        extractedJdSkills.add(normalized.charAt(0).toUpperCase() + normalized.slice(1));
      }
    });

    jobKeywords = Array.from(extractedJdSkills);
  } else {
    // Default target keywords if no JD is provided
    jobKeywords = ["React", "JavaScript", "TypeScript", "Node.js", "Git", "CSS", "HTML"];
  }

  // Calculate matching vs missing
  const matched = [];
  const missing = [];
  jobKeywords.forEach(kw => {
    const isMatched = resumeSkills.some(s => s.toLowerCase().includes(kw.toLowerCase()));
    if (isMatched) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  });

  result.matchingSkills = matched;
  result.missingSkills = missing;

  let skillsScore = 70; // baseline if no keywords found
  if (jobKeywords.length > 0) {
    skillsScore = Math.floor((matched.length / jobKeywords.length) * 100);
  }

  // --- 2. EXPERIENCE RELEVANCE (25% weight) ---
  let experienceScore = 50;
  if (resumeExperience.length > 0) {
    experienceScore = 70; // baseline for having experience

    // Check for metrics (quantification) e.g., %, $10k, 20%
    const hasMetrics = resumeExperience.some(line => /\b\d+(%|\s?k|\s?%|\s?million)\b/i.test(line));
    if (hasMetrics) {
      experienceScore += 15;
    } else {
      result.improvementAreas.push("Experience descriptions lack quantified achievements (e.g., percentages, revenue, latency reductions).");
    }

    // Check for action verbs
    const actionVerbs = ["spearheaded", "engineered", "designed", "implemented", "orchestrated", "developed", "optimized", "built"];
    const hasActionVerbs = resumeExperience.some(line => {
      const lower = line.toLowerCase();
      return actionVerbs.some(v => lower.includes(v));
    });

    if (hasActionVerbs) {
      experienceScore += 15;
    } else {
      result.improvementAreas.push("Incorporate high-impact action verbs (e.g., 'Spearheaded', 'Optimized') at the beginning of experience bullet points.");
      result.keywordSuggestions.push("Optimized", "Spearheaded", "Engineered", "Orchestrated");
    }
  } else {
    result.improvementAreas.push("No work experience section identified. Add professional history details.");
  }
  experienceScore = Math.min(experienceScore, 100);

  // --- 3. EDUCATION CHECK (15% weight) ---
  let educationScore = 55;
  if (resumeEducation.length > 0) {
    educationScore = 80;
    const hasDegree = resumeEducation.some(line => {
      const lower = line.toLowerCase();
      return /degree|bachelor|master|b\.s|m\.s|ph\.d|graduate|university|college/i.test(lower);
    });
    if (hasDegree) {
      educationScore += 20;
    }
  } else {
    result.improvementAreas.push("Education section is missing or lacks clear academic program titles.");
  }

  // --- 4. STRUCTURE & FORMATTING QUALITY (20% weight) ---
  let formatScore = 60;
  let sectionCount = 0;
  if (resumeSkills.length > 0) sectionCount++;
  if (resumeExperience.length > 0) sectionCount++;
  if (resumeEducation.length > 0) sectionCount++;
  if (resumeProjects.length > 0) sectionCount++;

  formatScore += (sectionCount * 10); // 10 points per core section

  // Check layout length guidelines (e.g. check total characters to ensure it fits 1-2 pages)
  if (rawText.length > 1000 && rawText.length < 8000) {
    formatScore += 10;
  } else {
    result.improvementAreas.push("Resume content is either too brief or excessively long. Aim for a clean 1-2 page layout.");
  }
  formatScore = Math.min(formatScore, 100);

  // --- 5. COMBINE SCORES FOR FINAL ATS METRIC ---
  const weightedScore = Math.floor(
    (skillsScore * 0.40) +
    (experienceScore * 0.25) +
    (educationScore * 0.15) +
    (formatScore * 0.20)
  );

  result.atsScore = Math.max(10, Math.min(weightedScore, 99));

  // Populate missing keyword suggestions
  if (missing.length > 0) {
    result.keywordSuggestions.push(...missing.slice(0, 5));
  } else {
    result.keywordSuggestions.push("Cloud Operations", "Agile Methodologies");
  }

  // Clean deduplicated keyword suggestions
  result.keywordSuggestions = Array.from(new Set(result.keywordSuggestions));

  return result;
};


