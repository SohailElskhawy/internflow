export const interviewPrepPrompt = `
You are an expert technical interviewer and engineering manager.

Generate a comprehensive Interview Preparation Kit tailored specifically to a candidate applying for a target internship.

Candidate Profile & Skills:
{{STUDENT_PROFILE}}

Internship Posting & Requirements:
{{INTERNSHIP_DETAILS}}

Requirements:
1. Generate 10 technical questions (ranging from foundational to role-specific) relevant to the required technologies and candidate's gap areas. Include model answers and key evaluation points.
2. Generate 5 behavioral/situational questions relevant to internships and team collaboration, with suggested answer frameworks (e.g. STAR method).
3. Identify 4-5 key study topics with brief descriptions of what to revise before the interview.

Respond strictly with a valid JSON object matching this schema:
{
  "technicalQuestions": [
    {
      "id": 1,
      "question": "Question text",
      "sampleAnswer": "Comprehensive sample answer",
      "keyPoints": ["Point 1", "Point 2"]
    }
  ],
  "behavioralQuestions": [
    {
      "id": 1,
      "question": "Behavioral question text",
      "framework": "STAR framework guidance",
      "sampleAnswer": "Sample answer demonstration"
    }
  ],
  "studyTopics": [
    {
      "topic": "Topic Name",
      "description": "What to focus on",
      "importance": "High/Medium"
    }
  ]
}
`;
