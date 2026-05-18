// SymptomAnalysisApp.tsx
import React, { useState } from 'react';
import { SymptomForm } from '../SymptomForm';
import { AnalysisResults } from '../AnalysisResults';
import { SymptomCheckInput, SymptomAnalysis } from './symptom';
import { analyzeSymptoms } from '../utils/symptomAnalyzer';

const SymptomAnalysisApp: React.FC = () => {
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (input: SymptomCheckInput) => {
    setIsAnalyzing(true);

    try {
      // Try to fetch analysis from Grok API on the backend
      const response = await fetch("http://localhost:5000/api/analyze-symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.diagnosis) {
        setAnalysis(data.diagnosis);
      } else {
        throw new Error("Invalid diagnosis payload received from API");
      }
    } catch (error) {
      console.warn("⚠️ Grok AI API Symptom Checker failed or not configured. Falling back to local offline analysis. Error:", error);
      
      // Fallback: Use the rule-based local symptom analyzer
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = analyzeSymptoms(input);
      setAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-12 px-4">
      <div className="container mx-auto flex flex-col items-center">
        {!analysis ? (
          <SymptomForm onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
        ) : (
          <AnalysisResults analysis={analysis} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

export default SymptomAnalysisApp;
