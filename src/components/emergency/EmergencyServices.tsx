import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Heart, 
  Truck,
  Shield,
  Users
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const emergencyServices = [
  {
    id: 'ambulance',
    name: 'Ambulance',
    phone: '108',
    icon: Truck,
    color: 'bg-red-600',
    description: '24/7 Emergency Medical Services'
  },
  {
    id: 'police',
    name: 'Police',
    phone: '100',
    icon: Shield,
    color: 'bg-blue-600',
    description: 'Emergency Police Services'
  },
  {
    id: 'fire',
    name: 'Fire Brigade',
    phone: '101',
    icon: AlertTriangle,
    color: 'bg-orange-600',
    description: 'Fire Emergency Services'
  },
  {
    id: 'women_helpline',
    name: 'Women Helpline',
    phone: '1091',
    icon: Users,
    color: 'bg-purple-600',
    description: '24/7 Women Emergency Support'
  }
];

const nearbyHospitals = [
  {
    name: 'Rural Health Center',
    distance: '2.3 km',
    phone: '+91-9876543210',
    address: 'Main Road, Village Center'
  },
  {
    name: 'District Hospital',
    distance: '15.2 km',
    phone: '+91-9876543211',
    address: 'Civil Lines, District Headquarters'
  },
  {
    name: 'Community Health Center',
    distance: '8.7 km',
    phone: '+91-9876543212',
    address: 'Block Road, Tehsil Center'
  }
];

const EmergencyServices: React.FC = () => {
  const { t } = useTranslation();

  const handleEmergencyCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('emergency_services')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Quick access to emergency services and nearby hospitals
        </p>
      </div>

      {/* Emergency Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {emergencyServices.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 text-center" hover>
                <div className={`${service.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {service.name}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {service.phone}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {service.description}
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleEmergencyCall(service.phone)}
                  className="w-full"
                >
                  <Phone size={16} className="mr-2" />
                  Call Now
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Nearby Hospitals */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <MapPin className="text-blue-600 mr-2" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nearby Hospitals
          </h2>
        </div>
        
        <div className="space-y-4">
          {nearbyHospitals.map((hospital, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{hospital.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{hospital.address}</p>
                <div className="flex items-center mt-1">
                  <MapPin size={14} className="text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{hospital.distance}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEmergencyCall(hospital.phone)}
              >
                <Phone size={16} className="mr-2" />
                Call
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Emergency Tips */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Heart className="text-red-600 mr-2" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Emergency Tips
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Before Emergency Arrives:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Stay calm and keep the patient comfortable</li>
              <li>• Do not move injured person unless necessary</li>
              <li>• Keep airway clear and monitor breathing</li>
              <li>• Apply pressure to bleeding wounds</li>
              <li>• Keep patient warm and conscious</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Information to Provide:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Exact location or landmark</li>
              <li>• Nature of emergency</li>
              <li>• Number of people affected</li>
              <li>• Current condition of patient</li>
              <li>• Your contact number</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmergencyServices;