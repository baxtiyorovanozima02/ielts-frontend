export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { essay_text, task_prompt } = req.body;

    if (!essay_text) {
        return res.status(400).json({ error: 'essay_text required' });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                max_tokens: 1000,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert IELTS examiner. Always respond with valid JSON only, no extra text, no markdown backticks."
                    },
                    {
                        role: "user",
                        content: `Evaluate the following IELTS Writing Task essay.

Task prompt: ${task_prompt || 'IELTS Writing Task'}

Essay:
${essay_text}

Return this exact JSON structure:
{
  "band_score": <number 0-9, can be 0.5 increments>,
  "feedback": "<detailed feedback in Uzbek language, 3-4 sentences>",
  "criteria": {
    "Task Achievement": <0-9>,
    "Coherence & Cohesion": <0-9>,
    "Lexical Resource": <0-9>,
    "Grammatical Range": <0-9>
  }
}`
                    }
                ]
            })
        });

        const data = await response.json();
        const text = data.choices[0].message.content;
        const clean = text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(clean);

        return res.status(200).json(result);
    } catch (err) {
        console.error('Groq evaluation error:', err);
        return res.status(500).json({ error: 'AI evaluation failed' });
    }
}