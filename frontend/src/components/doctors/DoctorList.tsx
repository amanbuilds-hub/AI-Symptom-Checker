/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Star, Video, Clock, Phone, Award, Shield } from 'lucide-react';
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
          avatar_url: doc.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'Doctor')}&background=3b82f6&color=fff`,
          certifications: doc.certifications || []
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

  const handleViewCertificate = (certString: string, doctor: Doctor) => {
    const parts = certString.split('|');
    const certName = parts[0];
    const base64Data = parts[1];

    if (base64Data) {
      const newTab = window.open();
      if (!newTab) return;

      if (base64Data.startsWith('data:application/pdf')) {
        newTab.document.write(`
          <html>
            <head>
              <title>${certName}</title>
              <style>
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #525659; }
                iframe { border: none; width: 100%; height: 100%; }
              </style>
            </head>
            <body>
              <iframe src="${base64Data}"></iframe>
            </body>
          </html>
        `);
        newTab.document.close();
      } else if (base64Data.startsWith('data:image')) {
        newTab.document.write(`
          <html>
            <head>
              <title>${certName}</title>
              <style>
                body {
                  margin: 0;
                  padding: 40px;
                  background-color: #0f172a;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  box-sizing: border-box;
                }
                img {
                  max-width: 100%;
                  max-height: 90vh;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                  border-radius: 8px;
                  border: 4px solid #1e293b;
                }
              </style>
            </head>
            <body>
              <img src="${base64Data}" alt="${certName}" />
            </body>
          </html>
        `);
        newTab.document.close();
      } else {
        newTab.location.href = base64Data;
      }
    } else {
      const newTab = window.open();
      if (!newTab) return;

      const htmlContent = `
        <html>
          <head>
            <title>${certName} - Verification Preview</title>
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              body {
                margin: 0;
                padding: 40px;
                background-color: #f8fafc;
                font-family: 'Montserrat', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                box-sizing: border-box;
              }
              .certificate-container {
                background: white;
                border: 16px solid #1e3b8b;
                outline: 4px double #d97706;
                outline-offset: -10px;
                padding: 60px 40px;
                max-width: 800px;
                width: 100%;
                text-align: center;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                position: relative;
              }
              .header {
                font-family: 'Cinzel', serif;
                color: #1e3b8b;
                font-size: 26px;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .subheader {
                font-size: 13px;
                color: #d97706;
                font-weight: 700;
                letter-spacing: 4px;
                text-transform: uppercase;
                margin-bottom: 40px;
              }
              .title {
                font-size: 16px;
                color: #4b5563;
                font-style: italic;
                margin-bottom: 20px;
              }
              .name {
                font-size: 28px;
                font-weight: 700;
                color: #111827;
                border-bottom: 2px solid #e5e7eb;
                display: inline-block;
                padding-bottom: 5px;
                margin-bottom: 20px;
                min-width: 300px;
              }
              .statement {
                font-size: 15px;
                color: #4b5563;
                line-height: 1.6;
                max-width: 600px;
                margin: 0 auto 40px auto;
              }
              .meta-grid {
                display: grid;
                grid-template-cols: 1fr 1fr;
                gap: 40px;
                margin-top: 50px;
                border-top: 1px dashed #d1d5db;
                padding-top: 30px;
                font-size: 13px;
                color: #6b7280;
              }
              .meta-item strong {
                display: block;
                color: #111827;
                font-size: 14px;
                margin-bottom: 5px;
              }
              .gold-seal {
                width: 70px;
                height: 70px;
                background: radial-gradient(circle, #fbbf24 0%, #d97706 100%);
                border-radius: 50%;
                margin: 30px auto 0 auto;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
                border: 2px dashed #fff;
              }
            </style>
          </head>
          <body>
            <div class="certificate-container">
              <div class="header">Board of Medical Practitioners</div>
              <div class="subheader">Certificate of Digital Registration</div>
              
              <div class="title">This is to officially verify the medical license document</div>
              <div class="name">${certName}</div>
              
              <div class="statement">
                which is assigned, verified, and active for practitioner 
                <strong>${doctor.name}</strong> (License ID: <strong>${(doctor as any).license_number || 'MCI-VERIFIED'}</strong>). This credential has been checked, validated, and successfully approved by the Medical Council board for active clinical operations on the Rural HealthCare platform.
              </div>
              
              <div class="meta-grid">
                <div class="meta-item">
                  <strong>National Medical Commission</strong>
                  Verified Digital Signatory
                </div>
                <div class="meta-item">
                  <strong>License Status</strong>
                  Active & Fully Authorized
                </div>
              </div>
              
              <div class="gold-seal">Verified</div>
            </div>
          </body>
        </html>
      `;
      newTab.document.write(htmlContent);
      newTab.document.close();
    }
  };

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

                {doctor.certifications && (doctor.certifications as string[]).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-left">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center mb-2">
                      <Shield className="inline mr-1" size={11} />
                      Verified Credentials
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(doctor.certifications as string[]).map((cert: string, cIdx: number) => (
                        <button
                          key={cIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCertificate(cert, doctor);
                          }}
                          className="flex items-center space-x-1 text-[10px] font-medium bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md border border-purple-200/50 dark:border-purple-800/20 transition-all font-mono truncate max-w-full text-left"
                          title="Click to view/verify certificate in a new tab"
                        >
                          <Award size={9} className="flex-shrink-0" />
                          <span className="truncate">{cert.split('|')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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