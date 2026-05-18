import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Users, 
  AlertTriangle, 
  Heart,
  TrendingUp,
  Clock,
  MapPin,
  Phone
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const quickActions = [
  {
    id: 'symptoms',
    title: 'Check Symptoms',
    description: 'AI-powered symptom analysis',
    icon: Stethoscope,
    color: 'bg-blue-600',
    tab: 'symptoms'
  },
  {
    id: 'doctors',
    title: 'Find Doctors',
    description: 'Connect with available doctors',
    icon: Users,
    color: 'bg-green-600',
    tab: 'doctors'
  },
  {
    id: 'emergency',
    title: 'Emergency',
    description: 'Quick access to emergency services',
    icon: AlertTriangle,
    color: 'bg-red-600',
    tab: 'emergency'
  }
];

const healthStats = [
  {
    label: 'Total Consultations',
    value: '1,247',
    change: '+12%',
    icon: Heart,
    color: 'text-pink-600'
  },
  {
    label: 'Active Doctors',
    value: '45',
    change: '+5%',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    label: 'Response Time',
    value: '2.3 min',
    change: '-8%',
    icon: Clock,
    color: 'text-green-600'
  }
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('welcome')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get instant AI-powered health advice, connect with qualified doctors, 
          and access emergency services - all designed for rural healthcare needs.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="p-6 cursor-pointer" hover>
                <button
                  onClick={() => onNavigate(action.tab)}
                  className="w-full text-left"
                >
                  <div className={`${action.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Health Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {healthStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className={`${stat.color} mr-2`} size={20} />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                    <TrendingUp className="text-green-500 ml-2" size={16} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Emergency Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border-red-200 dark:border-red-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Emergency Helpline
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                24/7 emergency medical services available
              </p>
              <div className="flex items-center text-red-600 dark:text-red-500">
                <Phone size={20} className="mr-2" />
                <span className="text-xl font-bold">108</span>
              </div>
            </div>
            <div className="text-right">
              <Button
                variant="danger"
                onClick={() => window.location.href = 'tel:108'}
                className="mb-2"
              >
                <Phone size={16} className="mr-2" />
                Emergency Call
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('emergency')}
                className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                View All Services
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Health Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Daily Health Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">💧 Stay Hydrated</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300/80">
                Drink at least 8-10 glasses of clean water daily, especially in hot weather.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 dark:text-green-200 mb-2">🥗 Balanced Diet</h3>
              <p className="text-sm text-green-800 dark:text-green-300/80">
                Include fresh fruits, vegetables, and whole grains in your daily meals.
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">🏃 Regular Exercise</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300/80">
                Take a 30-minute walk daily to maintain good cardiovascular health.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 dark:text-purple-200 mb-2">😴 Good Sleep</h3>
              <p className="text-sm text-purple-800 dark:text-purple-300/80">
                Get 7-8 hours of quality sleep every night for better immunity.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;