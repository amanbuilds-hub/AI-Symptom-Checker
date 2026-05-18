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

module.exports = router;
