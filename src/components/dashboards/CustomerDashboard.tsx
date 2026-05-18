/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Calendar,
  FileText,
  Heart,
  Activity,
  User,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Video,
  ExternalLink,
  Copy,
  CheckCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { formatDate } from '../../lib/utils';
import { Consultation } from '../../types';
import { doctorsAPI, appointmentsAPI, healthRecordsAPI } from '../../lib/supabase';

interface AppointmentForm {
  doctorId: string;
  doctorName: string;
  specialization: string;
  scheduledAt: string;
  symptoms: string;
}

const CustomerDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(t('logout_success') || "Logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const navigate = useNavigate();

  // Health Records states
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    title: '',
    type: 'lab_report' as 'consultation' | 'symptom_check' | 'prescription' | 'lab_report',
    description: ''
  });

  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>({
    doctorId: '',
    doctorName: '',
    specialization: '',
    scheduledAt: '',
    symptoms: ''
  });

  // Fetch doctors, appointments, and health records from API on component mount
  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
    fetchHealthRecords();
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response: any = await healthRecordsAPI.getMetrics();
      if (response.data?.data) {
        setMetricsData({
          blood_pressure: response.data.data.blood_pressure || '120/80',
          heart_rate: response.data.data.heart_rate || '72 bpm',
          weight: response.data.data.weight || '65 kg',
          last_checkup: response.data.data.last_checkup || '10 days ago'
        });
      }
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    }
  };

  const fetchHealthRecords = async () => {
    setLoadingRecords(true);
    try {
      const response: any = await healthRecordsAPI.getAll();
      if (response.data?.data) {
        setHealthRecords(response.data.data);
      } else if (Array.isArray(response.data)) {
        setHealthRecords(response.data);
      } else {
        setHealthRecords([]);
      }
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleUploadRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.title) {
      toast.error('Please enter a title for the health record');
      return;
    }

    try {
      const response: any = await healthRecordsAPI.create({
        title: recordForm.title,
        type: recordForm.type,
        description: recordForm.description,
        data: {},
        attachments: []
      });

      if (response.error) {
        toast.error(`Failed to upload health record: ${response.error}`);
        return;
      }

      toast.success('Health record uploaded successfully!');
      
      // Refresh the health records
      fetchHealthRecords();
      
      // Reset form and close modal
      setRecordForm({
        title: '',
        type: 'lab_report',
        description: ''
      });
      setIsRecordModalOpen(false);
    } catch (error) {
      console.error('Error uploading health record:', error);
      toast.error('Failed to upload health record');
    }
  };

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const response: any = await doctorsAPI.getAll();
      // Backend returns { data: { data: [...] } }, so we need to access data.data
      if (response.data?.data) {
        setAvailableDoctors(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Fallback in case response structure is different
        setAvailableDoctors(response.data);
      } else {
        setAvailableDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      alert('Failed to load doctors. Please refresh the page.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response: any = await appointmentsAPI.getAll();
      if (response.data?.data) {
        setAppointments(response.data.data);
      } else if (Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Don't show alert for initial load failure
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    const selectedDoctor = availableDoctors.find(doc => doc.id === doctorId);
    if (selectedDoctor) {
      setAppointmentForm({
        ...appointmentForm,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization
      });
    }
  };
  const [appointments, setAppointments] = useState<Consultation[]>([]);

  const recentConsultations = [
    {
      id: '1',
      doctor: 'Dr. Sunita Patel',
      date: '2024-01-10',
      diagnosis: 'Common Cold',
      status: 'completed',
      rating: 5
    },
    {
      id: '2',
      doctor: 'Dr. Arun Singh',
      date: '2024-01-05',
      diagnosis: 'Skin Allergy',
      status: 'completed',
      rating: 4
    }
  ];

  const [metricsData, setMetricsData] = useState({
    blood_pressure: '120/80',
    heart_rate: '72 bpm',
    weight: '65 kg',
    last_checkup: '10 days ago'
  });

  const healthMetrics = [
    { label: 'Blood Pressure', value: metricsData.blood_pressure, status: 'normal', icon: Heart },
    { label: 'Heart Rate', value: metricsData.heart_rate, status: 'normal', icon: Activity },
    { label: 'Weight', value: metricsData.weight, status: 'normal', icon: TrendingUp },
    { label: 'Last Checkup', value: metricsData.last_checkup, status: 'due', icon: Calendar }
  ];

  const handleBookAppointment = async () => {
    if (!appointmentForm.doctorId || !appointmentForm.scheduledAt) {
      alert('Please select a doctor and appointment date/time');
      return;
    }

    try {
      // Prepare appointment data
      const appointmentData = {
        doctor_id: appointmentForm.doctorId,
        scheduled_at: new Date(appointmentForm.scheduledAt).toISOString(),
        notes: '',
        symptoms: appointmentForm.symptoms ? appointmentForm.symptoms.split(',').map(s => s.trim()) : []
      };

      // Call API to create appointment
      const response: any = await appointmentsAPI.create(appointmentData);

      if (response.error) {
        alert(`Failed to book appointment: ${response.error}`);
        return;
      }

      // Add the new appointment to local state
      const newAppointment: Consultation = {
        ...response.data.data,
        doctor: appointmentForm.doctorName
      };

      setAppointments([newAppointment, ...appointments]);
      setIsBookingModalOpen(false);
      setAppointmentForm({
        doctorId: '',
        doctorName: '',
        specialization: '',
        scheduledAt: '',
        symptoms: ''
      });

      alert(`Appointment booked successfully with ${appointmentForm.doctorName}!\nMeeting Link: ${response.data.data.meeting_link}`);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-gray-600">
              Your health is our priority. Here's your health overview.
            </p>
          </div>
          <div className="bg-blue-600 p-4 rounded-full">
            <User className="text-white" size={32} />
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 cursor-pointer" hover onClick={() => navigate('/QuickConsultant')}>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MessageCircle className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Consultation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Chat with AI assistant</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 cursor-pointer" hover onClick={() => setIsBookingModalOpen(true)}>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Book Appointment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Schedule with doctor</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 cursor-pointer" hover onClick={() => navigate('/EmergencyServices')}>
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Emergency</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get immediate help</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Health Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {healthMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  metric.status === 'normal' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <Icon className={`${
                    metric.status === 'normal' ? 'text-green-600' : 'text-yellow-600'
                  }`} size={20} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{metric.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Appointments</h3>
          <Button size="sm" onClick={() => setIsBookingModalOpen(true)}>
            <Calendar size={16} className="mr-1" />
            Book New
          </Button>
        </div>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No appointments scheduled yet.</p>
              <Button onClick={() => setIsBookingModalOpen(true)}>Book Your First Appointment</Button>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Video className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appointment.doctor ? `Consultation with ${appointment.doctor}` : 'Video Consultation'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(appointment.scheduled_at)}</p>
                      {appointment.symptoms && appointment.symptoms.length > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Symptoms: {appointment.symptoms.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>

                {appointment.meeting_link && (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-3 border dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Video size={16} className="text-gray-600 dark:text-gray-300" />
                          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{appointment.meeting_link}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(appointment.meeting_link || '', appointment.id)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {copiedId === appointment.id ? (
                            <CheckCircle size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(appointment.meeting_link, '_blank')}
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Join Video Call
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(appointment.meeting_link || '', `${appointment.id}-btn`)}
                      >
                        {copiedId === `${appointment.id}-btn` ? 'Copied!' : 'Copy Link'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );

  const renderConsultations = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Consultations</h3>
        <div className="space-y-4">
          {recentConsultations.map((consultation) => (
            <div key={consultation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{consultation.doctor}</h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">{consultation.date}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Diagnosis: {consultation.diagnosis}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {consultation.status}
                </span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Rating:</span>
                  <div className="flex">
                    {[...Array(consultation.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderHealthRecords = () => {
    const getTypeBadgeClass = (type: string) => {
      switch (type) {
        case 'prescription':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'lab_report':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'symptom_check':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        default:
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      }
    };

    const getTypeLabel = (type: string) => {
      switch (type) {
        case 'prescription':
          return 'Prescription';
        case 'lab_report':
          return 'Lab Report';
        case 'symptom_check':
          return 'Symptom Check Log';
        default:
          return 'Consultation';
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Health Records</h3>
          <Button onClick={() => setIsRecordModalOpen(true)}>
            <FileText size={16} className="mr-2" />
            Upload New Record
          </Button>
        </div>

        {loadingRecords ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading health records...</p>
          </div>
        ) : healthRecords.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">No health records available yet.</p>
              <Button className="mt-4" onClick={() => setIsRecordModalOpen(true)}>
                Upload Your First Record
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthRecords.map((record) => (
              <Card key={record.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getTypeBadgeClass(record.type)}`}>
                      {getTypeLabel(record.type)}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white mt-2 text-lg">
                      {record.title}
                    </h4>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(record.created_at)}
                  </span>
                </div>
                {record.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                    {record.description}
                  </p>
                )}
                {record.doctor_name && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Associated Doctor:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{record.doctor_name}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAppointments = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Book an Appointment</h3>
            <p className="text-gray-600 dark:text-gray-300">Schedule a video consultation with a doctor</p>
          </div>
          <Button onClick={() => setIsBookingModalOpen(true)}>
            <Calendar size={16} className="mr-2" />
            Book Appointment
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Appointments</h3>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No appointments scheduled yet.</p>
              <Button onClick={() => setIsBookingModalOpen(true)}>Book Your First Appointment</Button>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Video className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appointment.doctor ? `Consultation with ${appointment.doctor}` : 'Video Consultation with Doctor'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(appointment.scheduled_at)}</p>
                      {appointment.symptoms && appointment.symptoms.length > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Symptoms: {appointment.symptoms.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : appointment.status === 'ongoing'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>

                {appointment.meeting_link && (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-3 border dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Video size={16} className="text-gray-600 dark:text-gray-350" />
                          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{appointment.meeting_link}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(appointment.meeting_link || '', `apt-${appointment.id}`)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {copiedId === `apt-${appointment.id}` ? (
                            <CheckCircle size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(appointment.meeting_link, '_blank')}
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Join Video Call
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(appointment.meeting_link || '', `apt-btn-${appointment.id}`)}
                      >
                        {copiedId === `apt-btn-${appointment.id}` ? 'Copied!' : 'Copy Link'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Book an Appointment"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            <select
              value={appointmentForm.doctorId}
              onChange={(e) => handleDoctorSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-750 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={loadingDoctors}
            >
              <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {loadingDoctors ? 'Loading doctors...' : 'Choose a doctor...'}
              </option>
              {availableDoctors.map((doctor) => (
                <option
                  key={doctor.id}
                  value={doctor.id}
                  disabled={!doctor.available}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {doctor.name} - {doctor.specialization} ({doctor.experience}) {!doctor.available ? '- Unavailable' : ''}
                </option>
              ))}
            </select>
            {availableDoctors.length === 0 && !loadingDoctors && (
              <p className="text-sm text-red-600 mt-1">No doctors available. Please try again later.</p>
            )}
          </div>

          {appointmentForm.doctorId && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <User size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{appointmentForm.doctorName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{appointmentForm.specialization}</p>
                  {availableDoctors.find(d => d.id === appointmentForm.doctorId) && (
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {availableDoctors.find(d => d.id === appointmentForm.doctorId)?.experience}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-yellow-600 dark:text-yellow-400">
                        ⭐ {availableDoctors.find(d => d.id === appointmentForm.doctorId)?.rating}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Preferred Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={appointmentForm.scheduledAt}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, scheduledAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-750 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select your preferred appointment date and time</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Symptoms
            </label>
            <textarea
              value={appointmentForm.symptoms}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, symptoms: e.target.value })}
              placeholder="Describe your symptoms (separate multiple with commas)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-750 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={3}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Example: Fever, Headache, Cough</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Video size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Video Consultation</p>
                <p className="text-blue-600 dark:text-blue-400">A secure Jitsi video meeting link will be generated for your appointment</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setIsBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookAppointment}>
              Book Appointment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patient Dashboard</h1>
          <p className="text-gray-600 dark:text-white">Manage your health and appointments</p>
        </div>
        <Button
          variant="ghost"
          className="border border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center gap-2 self-start sm:self-auto px-4 py-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>{t('logout')}</span>
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'consultations', label: 'Consultations', icon: MessageCircle },
            { id: 'records', label: 'Health Records', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'consultations' && renderConsultations()}
        {activeTab === 'records' && renderHealthRecords()}
      </motion.div>

      {/* Upload Health Record Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Upload Health Record"
        size="md"
      >
        <form onSubmit={handleUploadRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Record Title
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., Blood Test Report Q1"
              value={recordForm.title}
              onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Record Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={recordForm.type}
              onChange={(e: any) => setRecordForm({ ...recordForm, type: e.target.value })}
            >
              <option value="lab_report">Lab Report</option>
              <option value="prescription">Prescription</option>
              <option value="consultation">Consultation Record</option>
              <option value="symptom_check">Symptom Check Log</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Description / Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Add any extra notes or diagnostic summaries..."
              value={recordForm.description}
              onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Upload Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerDashboard;