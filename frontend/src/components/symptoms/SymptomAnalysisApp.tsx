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

    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = analyzeSymptoms(input);
    setAnalysis(result);
    setIsAnalyzing(false);
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
