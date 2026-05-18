/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Star, Video, Clock, Phone } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import VideoCall from './VideoCall';
import { Doctor } from '../../types';
import { doctorsAPI } from '../../lib/supabase';

const DoctorList: React.FC = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response: any = await doctorsAPI.getAll();
        let fetchedDoctors = [];
        if (response.data?.data) {
          fetchedDoctors = response.data.data;
        } else if (Array.isArray(response.data)) {
          fetchedDoctors = response.data;
        }
        
        // Map any backend differences to fit the Doctor interface perfectly
        const mappedDoctors = fetchedDoctors.map((doc: any) => ({
          ...doc,
          id: doc.id || doc._id,
          name: doc.name || 'Doctor',
          specialization: doc.specialization || 'General Medicine',
          experience: doc.experience || 5,
          languages: doc.languages || ['Hindi', 'English'],
          availability: doc.available !== undefined ? doc.available : (doc.availability !== undefined ? doc.availability : true),
          rating: doc.rating || 4.5,
          consultation_fee: doc.consultation_fee || doc.fee || 200,
          avatar_url: doc.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'Doctor')}&background=3b82f6&color=fff`
        }));
        
        setDoctors(mappedDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    if (filter === 'available') return doctor.availability;
    return true;
  });

  const handleVideoCall = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowVideoCall(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('available_doctors')}
        </h1>
        <p className="text-gray-600">
          Connect with qualified doctors for consultations
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Doctors
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'available' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Available Now
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-white mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading available doctors...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 font-medium">No doctors found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6" hover>
              <div className="text-center">
                <div className="relative mb-4">
                  <img
                    src={doctor.avatar_url || `https://ui-avatars.com/api/?name=${doctor.name}&background=3b82f6&color=fff`}
                    alt={doctor.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover"
                  />
                  {doctor.availability && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {doctor.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {doctor.specialization}
                </p>
                
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Star className="text-yellow-400 mr-1" size={16} />
                    <span>{doctor.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1" size={16} />
                    <span>{doctor.experience}y exp</span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-lg font-semibold text-blue-600">
                    ₹{doctor.consultation_fee}
                  </p>
                  <p className="text-xs text-gray-500">per consultation</p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    disabled={!doctor.availability}
                  >
                    <Phone size={16} className="mr-1" />
                    {t('book_consultation')}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleVideoCall(doctor)}
                    disabled={!doctor.availability}
                  >
                    <Video size={16} className="mr-1" />
                    {t('video_call')}
                  </Button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Languages: {doctor.languages.join(', ')}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      )}

      {showVideoCall && selectedDoctor && (
        <Modal
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          title={`Video Call with ${selectedDoctor.name}`}
          size="xl"
        >
          <VideoCall
            doctorId={selectedDoctor.id}
            doctorName={selectedDoctor.name}
            onEndCall={() => setShowVideoCall(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default DoctorList;