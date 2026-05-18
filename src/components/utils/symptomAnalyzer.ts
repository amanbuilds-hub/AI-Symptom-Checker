import { SymptomCheckInput, SymptomAnalysis, PossibleCondition, Medication } from '../symptoms/symptom';

export function analyzeSymptoms(input: SymptomCheckInput): SymptomAnalysis {
  const symptoms = input.symptoms.toLowerCase();
  const severity = input.severity.toLowerCase();
  const age = input.age;

  const possibleConditions: PossibleCondition[] = [];
  const medications: Medication[] = [];
  const preventionTips: string[] = [];
  const recommendations: string[] = [];

  if (symptoms.includes('fever') || symptoms.includes('temperature')) {
    possibleConditions.push({
      name: 'Viral Infection',
      probability: 'High',
      description: 'Common viral infections can cause fever, body aches, and fatigue. Most resolve within 7-10 days with rest and hydration.'
    });

    medications.push({
      name: 'Acetaminophen (Paracetamol)',
      usage: 'Reduces fever and relieves pain',
      dosage: '500-1000mg every 4-6 hours as needed (max 4000mg/day for adults)'
    });

    medications.push({
      name: 'Ibuprofen',
      usage: 'Anti-inflammatory and fever reducer',
      dosage: '200-400mg every 4-6 hours as needed (max 1200mg/day without medical supervision)'
    });

    preventionTips.push('Get adequate rest and sleep (7-9 hours per night)');
    preventionTips.push('Stay well hydrated with water and electrolyte solutions');
  }

  if (symptoms.includes('cough') || symptoms.includes('throat')) {
    possibleConditions.push({
      name: 'Upper Respiratory Infection',
      probability: 'High',
      description: 'Infections affecting the nose, throat, and airways. Can be caused by viruses or bacteria.'
    });

    medications.push({
      name: 'Dextromethorphan',
      usage: 'Cough suppressant for dry coughs',
      dosage: '15-30mg every 4-6 hours as needed'
    });

    medications.push({
      name: 'Guaifenesin',
      usage: 'Expectorant to loosen mucus',
      dosage: '200-400mg every 4 hours as needed'
    });

    preventionTips.push('Drink warm liquids like tea with honey');
    preventionTips.push('Use a humidifier to keep air moist');
    preventionTips.push('Gargle with warm salt water for sore throat');
  }

  if (symptoms.includes('headache') || symptoms.includes('head pain')) {
    possibleConditions.push({
      name: 'Tension Headache',
      probability: 'Moderate',
      description: 'The most common type of headache, often caused by stress, poor posture, or dehydration.'
    });

    if (severity === 'severe' || symptoms.includes('migraine')) {
      possibleConditions.push({
        name: 'Migraine',
        probability: 'Moderate',
        description: 'Intense headaches often accompanied by sensitivity to light, sound, and sometimes nausea.'
      });
    }

    medications.push({
      name: 'Aspirin',
      usage: 'Pain relief for headaches',
      dosage: '325-650mg every 4 hours as needed'
    });

    preventionTips.push('Stay hydrated throughout the day');
    preventionTips.push('Maintain good posture, especially when working');
    preventionTips.push('Practice stress management techniques');
    preventionTips.push('Ensure adequate sleep');
  }

  if (symptoms.includes('stomach') || symptoms.includes('nausea') || symptoms.includes('vomit')) {
    possibleConditions.push({
      name: 'Gastroenteritis',
      probability: 'Moderate',
      description: 'Inflammation of the digestive tract, often caused by viral or bacterial infection.'
    });

    medications.push({
      name: 'Ondansetron (if prescribed)',
      usage: 'Anti-nausea medication',
      dosage: 'As prescribed by physician'
    });

    medications.push({
      name: 'Oral Rehydration Solution',
      usage: 'Prevents dehydration',
      dosage: 'Sip slowly throughout the day'
    });

    preventionTips.push('Avoid solid foods until nausea subsides');
    preventionTips.push('Gradually reintroduce bland foods (BRAT diet: bananas, rice, applesauce, toast)');
    preventionTips.push('Drink clear fluids in small amounts frequently');
  }

  if (symptoms.includes('diarrhea')) {
    medications.push({
      name: 'Loperamide',
      usage: 'Reduces diarrhea frequency',
      dosage: '4mg initially, then 2mg after each loose stool (max 8mg/day)'
    });

    preventionTips.push('Maintain hydration with electrolyte solutions');
    preventionTips.push('Avoid dairy products temporarily');
  }

  if (symptoms.includes('congestion') || symptoms.includes('stuffy') || symptoms.includes('runny nose')) {
    possibleConditions.push({
      name: 'Common Cold or Allergic Rhinitis',
      probability: 'High',
      description: 'Nasal congestion and discharge, often accompanied by sneezing and mild discomfort.'
    });

    medications.push({
      name: 'Pseudoephedrine',
      usage: 'Decongestant for nasal congestion',
      dosage: '30-60mg every 4-6 hours as needed'
    });

    medications.push({
      name: 'Cetirizine or Loratadine',
      usage: 'Antihistamine for allergies',
      dosage: '10mg once daily'
    });

    preventionTips.push('Use saline nasal spray to moisturize nasal passages');
    preventionTips.push('Wash hands frequently to prevent spread');
  }

  if (symptoms.includes('back pain') || symptoms.includes('muscle') || symptoms.includes('joint')) {
    possibleConditions.push({
      name: 'Musculoskeletal Pain',
      probability: 'Moderate',
      description: 'Pain in muscles, bones, or joints, often due to strain, overuse, or minor injury.'
    });

    medications.push({
      name: 'Naproxen',
      usage: 'Anti-inflammatory for muscle and joint pain',
      dosage: '220-440mg every 8-12 hours as needed'
    });

    preventionTips.push('Apply ice for acute injuries (first 48 hours)');
    preventionTips.push('Apply heat for chronic pain and muscle tension');
    preventionTips.push('Gentle stretching and movement');
    preventionTips.push('Maintain good posture');
  }

  if (age > 60) {
    recommendations.push('Consider more frequent medical check-ups due to age-related factors');
    recommendations.push('Consult with a healthcare provider before starting any new medication');
  }

  if (severity === 'severe') {
    recommendations.push('Severe symptoms warrant medical evaluation within 24 hours');
    recommendations.push('Consider urgent care or emergency services if symptoms worsen');
  }

  if (possibleConditions.length === 0) {
    possibleConditions.push({
      name: 'General Malaise',
      probability: 'Uncertain',
      description: 'Based on the symptoms provided, it is difficult to determine a specific condition. Please consult a healthcare provider for proper evaluation.'
    });

    recommendations.push('Keep a symptom diary to track changes');
    recommendations.push('Schedule an appointment with a healthcare provider');
  }

  recommendations.push('Monitor symptoms for any changes or worsening');
  recommendations.push('Maintain a healthy diet and stay hydrated');
  recommendations.push('Get adequate rest');

  if (preventionTips.length === 0) {
    preventionTips.push('Maintain a balanced diet rich in fruits and vegetables');
    preventionTips.push('Exercise regularly (at least 150 minutes per week)');
    preventionTips.push('Get 7-9 hours of sleep per night');
    preventionTips.push('Practice good hygiene, including regular handwashing');
  }

  return {
    possibleConditions: possibleConditions.slice(0, 3),
    preventionTips,
    medications: medications.slice(0, 4),
    recommendations,
    disclaimer: 'This is an informational tool only and not a substitute for professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.'
  };
}
