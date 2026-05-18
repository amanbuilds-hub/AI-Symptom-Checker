import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Stethoscope, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { analyzeSymptoms, SymptomAnalysis } from '../../lib/ai';

const SymptomChecker: React.FC = () => {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('other');

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);
    try {
      const result = await analyzeSymptoms(
        symptoms.split(',').map(s => s.trim()),
        age,
        gender
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);

      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return CheckCircle;
      case 'medium': return Info;
      case 'high': return AlertTriangle;
      case 'emergency': return AlertTriangle;
      default: return Info;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('symptom_checker')}
        </h1>
        <p className="text-gray-600">
          {t('describe_symptoms')}
        </p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('describe_symptoms')}
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={t('symptom_placeholder')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <Button
          onClick={handleAnalyze}
          loading={loading}
          disabled={!symptoms.trim()}
          className="w-full"
        >
          {t('analyze')}
        </Button>
      </Card>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-6">
            <div className="flex items-center mb-4">
              {React.createElement(getSeverityIcon(analysis.severity), {
                className: `mr-3 ${getSeverityColor(analysis.severity).split(' ')[0]}`,
                size: 24
              })}
              <div>
                <h3 className="text-lg font-semibold">Analysis Results</h3>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(analysis.severity)}`}>
                  {t(`severity_${analysis.severity}`)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Urgency</h4>
                <p className="text-gray-700">{analysis.urgency}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Possible Conditions</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {analysis.possibleConditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>

              {analysis.shouldSeeDoctor && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium">
                    We recommend consulting with a healthcare professional for proper diagnosis and treatment.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SymptomChecker;