const express = require("express");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = "google/flan-t5-small"; // or a public test model like "gpt2"

router.post("/getDiagnosis", async (req, res) => {
  try {
    const { age, gender, symptoms } = req.body;

    if (!HF_API_KEY) {
      return res.status(500).json({ error: "HF_API_KEY is missing in .env" });
    }

    const prompt = `
You are a medical AI assistant for rural healthcare in India.
Analyze the patient's details and give a structured JSON response.

Patient Details:
- Age: ${age}
- Gender: ${gender}
- Symptoms: ${symptoms}

Return response ONLY in this JSON format:
{
  "severity": "low|medium|high|emergency",
  "possibleConditions": ["condition1", "condition2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "urgency": "brief urgency description",
  "shouldSeeDoctor": true/false
}
    `;


    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const rawText = await response.text(); // always read as text
    console.log("HF RAW RESPONSE:", rawText);

    // Default fallback analysis
    let analysis = {
      severity: "medium",
      possibleConditions: ["Unable to analyze - please consult a doctor"],
      recommendations: ["Please consult a healthcare professional"],
      urgency: "Medical consultation recommended",
      shouldSeeDoctor: true,
    };

    // Try parsing JSON if possible
    try {
      let jsonResult;
      try {
        jsonResult = JSON.parse(rawText); // may fail
      } catch {
        jsonResult = null;
      }

      let text = "";
      if (Array.isArray(jsonResult)) {
        text = jsonResult.map(r => r.generated_text || r.text || "").join(" ");
      } else if (jsonResult?.generated_text) {
        text = jsonResult.generated_text;
      } else if (jsonResult?.text) {
        text = jsonResult.text;
      } else {
        text = rawText; // fallback to raw text
      }

      // Extract JSON from text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error("HF response parsing failed, using fallback:", err);
    }

    res.json({ diagnosis: analysis });

  } catch (error) {
    console.error("HF Diagnosis Error:", error);
    res.status(500).json({ error: "Failed to get diagnosis" });
  }
});

router.post("/analyze-symptoms", async (req, res) => {
  try {
    const { age, gender, symptoms, duration, severity, additionalInfo } = req.body;
    const GROK_API_KEY = process.env.GROK_API_KEY;

    if (!GROK_API_KEY || GROK_API_KEY.includes("your-grok-api-key") || GROK_API_KEY === "") {
      console.warn("⚠️ GROK_API_KEY is not configured in .env. Falling back to local offline analysis.");
      return res.status(501).json({ error: "Grok API key is not configured in .env" });
    }

    const systemPrompt = `
You are a highly skilled professional medical AI assistant for rural healthcare in India. 
Analyze the patient's symptoms, duration, severity, and details, and provide safe, high-quality, practical medical advice and medicine recommendations.

You MUST respond ONLY with a valid JSON object conforming exactly to this JSON schema:
{
  "possibleConditions": [
    {
      "name": "string (name of possible medical condition)",
      "probability": "string ('High', 'Moderate', 'Low')",
      "description": "string (brief details about the condition, friendly for rural patients)"
    }
  ],
  "preventionTips": ["string (prevention tip 1)", "string (prevention tip 2)"],
  "medications": [
    {
      "name": "string (medicine name, e.g. Paracetamol, Cetirizine, ORS, etc.)",
      "usage": "string (briefly why this medicine is recommended)",
      "dosage": "string (clear, safe dosage instructions and frequency)"
    }
  ],
  "recommendations": ["string (general recommendation 1)", "string (general recommendation 2)"],
  "disclaimer": "string (a standard safety disclaimer advising to consult a real doctor before taking any medicines)"
}

Guidelines for analysis:
- Recommendations must be safe and culturally appropriate for patients in rural India.
- Suggest commonly available medicines (generic or brand names widely known in India) for mild/moderate symptoms.
- Always include clear warnings and advise consulting a medical professional, especially if symptoms are severe or persistent.
`;

    const userPrompt = `
Patient details:
- Age: ${age || 'Unknown'} years
- Gender: ${gender || 'Unknown'}
- Symptoms reported: ${symptoms}
- Duration of symptoms: ${duration || 'Not specified'}
- Severity: ${severity || 'Not specified'}
- Additional details: ${additionalInfo || 'None'}
`;

    // Auto-detect key provider (Groq vs Grok/x.ai) based on prefix gsk_
    const cleanApiKey = GROK_API_KEY.replace(/"/g, "").trim();
    const isGroq = cleanApiKey.startsWith("gsk_");
    const GROK_MODEL = process.env.GROK_MODEL || (isGroq ? "meta-llama/llama-4-scout-17b-16e-instruct" : "grok-beta");
    const apiEndpoint = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";

    console.log(`🔌 Provider detected: ${isGroq ? "Groq" : "Grok/x.ai"}`);
    console.log(`🚀 Sending symptom check request to: ${apiEndpoint} using model: ${GROK_MODEL}`);

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cleanApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Grok API Error Response:", errText);
      return res.status(502).json({ error: `Grok API returned error: ${response.statusText}` });
    }

    const data = await response.json();
    const gResponseContent = data.choices[0].message.content.trim();
    
    // Safely parse JSON returned by Grok
    let analysis;
    try {
      analysis = JSON.parse(gResponseContent);
    } catch (parseErr) {
      console.error("Failed to parse Grok JSON response:", parseErr, "Content:", gResponseContent);
      return res.status(502).json({ error: "Failed to parse Grok medical analysis JSON response" });
    }

    res.json({ diagnosis: analysis });

  } catch (error) {
    console.error("Grok Analysis Route Error:", error);
    res.status(500).json({ error: "Failed to connect to symptom checker API" });
  }
});

module.exports = router;

