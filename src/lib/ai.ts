// import { GoogleGenerativeAI } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || 'demo-key');

export interface SymptomAnalysis {
  severity: 'low' | 'medium' | 'high' | 'emergency';
  possibleConditions: string[];
  recommendations: string[];
  urgency: string;
  shouldSeeDoctor: boolean;
}

// export const analyzeSymptoms = async (
//   symptoms: string[],
//   age: number,
//   gender: string,
//   language: string = 'en'
// ): Promise<SymptomAnalysis> => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
//     const prompt = `
// You are a medical AI assistant for rural healthcare in India. Analyze the following symptoms and provide a structured response.

// Patient Details:
// - Age: ${age}
// - Gender: ${gender}
// - Symptoms: ${symptoms.join(', ')}
// - Language: ${language}

// Please provide analysis in this exact JSON format:
// {
//   "severity": "low|medium|high|emergency",
//   "possibleConditions": ["condition1", "condition2"],
//   "recommendations": ["recommendation1", "recommendation2"],
//   "urgency": "brief urgency description",
//   "shouldSeeDoctor": true/false
// }

// Important guidelines:
// - Be conservative and err on the side of caution
// - Consider common conditions in rural India
// - Always recommend seeing a doctor for serious symptoms
// - Provide practical, actionable advice
// - Keep language simple and clear
// `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = await response.text();

//     console.log('RAW RESPONSE:', text);

//     // Try to parse JSON strictly
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       try {
//         return JSON.parse(jsonMatch[0]);
//       } catch (parseErr) {
//         console.error('JSON parse error:', parseErr);
//         // fallback response
//       }
//     }
    
//     return {
//       severity: 'medium',
//       possibleConditions: ['Unable to analyze - please consult a doctor'],
//       recommendations: ['Please consult with a healthcare professional'],
//       urgency: 'Medical consultation recommended',
//       shouldSeeDoctor: true
//     };

//   } catch (error) {
//     console.error('AI Analysis Error:', error);
//     return {
//       severity: 'medium',
//       possibleConditions: ['Analysis unavailable - please consult a doctor'],
//       recommendations: ['Please consult with a healthcare professional for proper diagnosis'],
//       urgency: 'Medical consultation recommended',
//       shouldSeeDoctor: true
//     };
//   }
// };
// export async function analyzeSymptoms(symptomsArray: string[], age: number, gender: string) {
//   try {
//     const response = await fetch('/api/getDiagnosis', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         age,
//         gender,
//         symptoms: symptomsArray.join(', ')
//       }),
//     });

//     const data = await response.json();
//     return data.diagnosis;

//   } catch (error) {
//     console.error('Error calling backend API:', error);
//     return null; // Ya fallback value agar chahiye toh
//   }
// }


// export const getChatResponse = async (message: string, context: string[] = []) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-flash" });
    
//     const conversationContext = context.length > 0 ? 
//       `Previous conversation: ${context.join(' ')}` : '';
    
//     const prompt = `
// You are a helpful medical AI assistant for rural healthcare in India. 
// Provide clear, simple, and safe medical guidance.

// ${conversationContext}

// User message: ${message}

// Guidelines:
// - Keep responses simple and easy to understand
// - Always prioritize safety
// - Recommend professional medical consultation when needed
// - Be empathetic and supportive
// - Consider common health issues in rural India
// `;


//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return await response.text();
    
//   } catch (error) {
//     console.error('Chat AI Error:', error);
//     return "I'm having trouble responding right now. Please consult with a healthcare professional for medical advice.";
//   }
// };
export async function analyzeSymptoms(
  symptomsArray: string[],
  age: number,
  gender: string
): Promise<SymptomAnalysis | null> {
  try {
    const response = await fetch("http://localhost:5000/api/getDiagnosis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age,
        gender,
        symptoms: symptomsArray.join(", "),
      }),
    });

    const data = await response.json();
    return data.diagnosis;
  } catch (error) {
    console.error("Error calling backend API:", error);
    return null;
  }
}