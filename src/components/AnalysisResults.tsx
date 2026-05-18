import { AlertCircle, Pill, Shield, Lightbulb, ArrowLeft } from 'lucide-react';
import { SymptomAnalysis } from './symptoms/symptom';

interface AnalysisResultsProps {
  analysis: SymptomAnalysis;
  onBack: () => void;
}

export function AnalysisResults({ analysis, onBack }: AnalysisResultsProps) {
  return (
    <div className="w-full max-w-4xl space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        New Symptom Check
      </button>

      <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="bg-red-500 p-2 rounded-lg flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Important Disclaimer</h2>
            <p className="text-red-800 text-sm leading-relaxed">{analysis.disclaimer}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Possible Conditions</h3>
            </div>
            <div className="space-y-4">
              {analysis.possibleConditions.map((condition, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{condition.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      condition.probability === 'High'
                        ? 'bg-red-100 text-red-700'
                        : condition.probability === 'Moderate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {condition.probability} Probability
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{condition.description}</p>
                </div>
              ))}
            </div>
          </section>

          {analysis.medications.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Common Medications</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.medications.map((medication, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5 hover:shadow-md transition"
                  >
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{medication.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Usage:</span>
                        <p className="text-gray-600 mt-1">{medication.usage}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Typical Dosage:</span>
                        <p className="text-gray-600 mt-1">{medication.dosage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Always consult with a pharmacist or doctor before taking any medication. Dosages may vary based on individual factors.
                </p>
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-teal-600" />
              <h3 className="text-xl font-bold text-gray-900">Prevention & Care Tips</h3>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-5">
              <ul className="space-y-3">
                {analysis.preventionTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-teal-500 rounded-full p-1 flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-amber-600" />
              <h3 className="text-xl font-bold text-gray-900">Recommendations</h3>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-5">
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-amber-500 rounded-full p-1 flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-2">When to Seek Immediate Medical Attention</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Difficulty breathing or shortness of breath</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Chest pain or pressure</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Sudden severe headache or confusion</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>Loss of consciousness or severe weakness</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>High fever (over 103°F/39.4°C) that doesn't respond to medication</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
