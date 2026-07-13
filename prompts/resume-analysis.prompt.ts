export const resumeAnalysisPrompt = `
You are an expert technical recruiter and resume reviewer.

Analyze the following resume text carefully. Extract key information and evaluate the resume's strengths and weaknesses.

Respond strictly with a valid JSON object matching this schema:
{
  "summary": "Concise 2-3 sentence professional summary",
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "soft": ["Communication", "Leadership"],
    "tools": ["Git", "Docker"]
  },
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree/Major Name",
      "year": "Graduation Year or expected"
    }
  ],
  "experience": [
    {
      "role": "Job or Project Title",
      "organization": "Company or Project Name",
      "duration": "Dates or duration",
      "highlights": ["Key accomplishment 1", "Key accomplishment 2"]
    }
  ],
  "strengths": [
    "Key candidate strength 1",
    "Key candidate strength 2"
  ],
  "weaknesses": [
    "Potential area of improvement 1",
    "Potential area of improvement 2"
  ],
  "suggestedRoles": [
    "Suggested Job Role 1",
    "Suggested Job Role 2"
  ]
}

Ensure all JSON keys are present and values are accurate based on the text.
Resume Text:
`;
