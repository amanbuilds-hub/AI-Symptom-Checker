export interface SymptomCheckInput {
  age: number;
  gender: string;
  symptoms: string;
  duration: string;
  severity: string;
  additionalInfo: string;
}

export interface PossibleCondition {
  name: string;
  probability: string;
  description: string;
}

export interface Medication {
  name: string;
  usage: string;
  dosage: string;
}

export interface SymptomAnalysis {
  possibleConditions: PossibleCondition[];
  preventionTips: string[];
  medications: Medication[];
  recommendations: string[];
  disclaimer: string;
}
