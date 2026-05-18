import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Users,
  UserCheck,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Video,
  Calendar,
  ExternalLink,
  Copy,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { generateMeetingId, createJitsiLink, formatDate } from '../../lib/utils';
import { Consultation } from '../../types';

interface AppointmentForm {
  doctorId: string;
  doctorName: string;
  scheduledAt: string;
  notes: string;
}

const ManagerDashboard: React.FC = () => {
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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Consultation[]>([]);
  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>({
    doctorId: '',
    doctorName: '',
    scheduledAt: '',
    notes: ''
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const platformStats = [
    { label: 'Total Users', value: '12,456', change: '+12%', icon: Users, color: 'text-blue-600' },
    { label: 'Active Doctors', value: '234', change: '+5%', icon: UserCheck, color: 'text-green-600' },
    { label: 'Consultations Today', value: '89', change: '+18%', icon: Activity, color: 'text-purple-600' },
    { label: 'Revenue (Monthly)', value: '₹2.3L', change: '+25%', icon: DollarSign, color: 'text-yellow-600' }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'doctor_registration',
      message: 'Dr. Amit Sharma registered as a new doctor',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: '2',
      type: 'consultation_completed',
      message: '156 consultations completed today',
      time: '4 hours ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'system_alert',
      message: 'Server response time increased by 15%',
      time: '6 hours ago',
      status: 'warning'
    }
  ];

  const doctorRequests = [
    {
      id: '1',
      name: 'Dr. Priya Verma',
      specialization: 'Cardiology',
      experience: '8 years',
      location: 'Mumbai',
      status: 'pending',
      documents: 'Complete'
    },
    {
      id: '2',
      name: 'Dr. Rajesh Gupta',
      specialization: 'Pediatrics',
      experience: '12 years',
      location: 'Delhi',
      status: 'pending',
      documents: 'Incomplete'
    }
  ];

  const regionalData = [
    { region: 'North India', patients: 3456, doctors: 89, consultations: 1234 },
    { region: 'South India', patients: 2890, doctors: 76, consultations: 987 },
    { region: 'West India', patients: 2345, doctors: 65, consultations: 876 },
    { region: 'East India', patients: 1876, doctors: 54, consultations: 654 }
  ];

  const handleScheduleAppointment = () => {
    if (!appointmentForm.doctorId || !appointmentForm.scheduledAt) {
      alert('Please fill in all required fields');
      return;
    }

    const meetingId = generateMeetingId();
    const meetingLink = createJitsiLink(meetingId);

    const newAppointment: Consultation = {
      id: `apt-${Date.now()}`,
      customer_id: user?.id || '',
      doctor_id: appointmentForm.doctorId,
      type: 'video',
      status: 'scheduled',
      scheduled_at: appointmentForm.scheduledAt,
      duration: 30,
      symptoms: [],
      notes: appointmentForm.notes,
      meeting_link: meetingLink,
      created_at: new Date().toISOString()
    };

    setAppointments([...appointments, newAppointment]);
    setIsScheduleModalOpen(false);
    setAppointmentForm({
      doctorId: '',
      doctorName: '',
      scheduledAt: '',
      notes: ''
    });

    alert(`Appointment scheduled! Meeting Link: ${meetingLink}`);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name}!
            </h2>
            <p className="text-gray-600">
              Platform overview and management dashboard
            </p>
          </div>
          <div className="bg-purple-600 p-4 rounded-full">
            <BarChart3 className="text-white" size={32} />
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {platformStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon className={stat.color} size={24} />
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Regional Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Region</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Patients</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Doctors</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Consultations</th>
              </tr>
            </thead>
            <tbody>
              {regionalData.map((region, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 text-sm font-medium text-gray-900">{region.region}</td>
                  <td className="py-3 text-sm text-gray-600">{region.patients.toLocaleString()}</td>
                  <td className="py-3 text-sm text-gray-600">{region.doctors}</td>
                  <td className="py-3 text-sm text-gray-600">{region.consultations.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Activities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-100' :
                activity.status === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                {activity.status === 'success' ? (
                  <CheckCircle className="text-green-600" size={16} />
                ) : activity.status === 'warning' ? (
                  <AlertTriangle className="text-yellow-600" size={16} />
                ) : (
                  <Clock className="text-blue-600" size={16} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderDoctorManagement = () => (
    <div className="space-y-6">
      {/* Schedule Appointment Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Doctor Appointment</h3>
            <p className="text-gray-600">Create a video meeting with a doctor</p>
          </div>
          <Button onClick={() => setIsScheduleModalOpen(true)}>
            <Calendar size={16} className="mr-2" />
            New Appointment
          </Button>
        </div>
      </Card>

      {/* Scheduled Appointments */}
      {appointments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Scheduled Appointments</h3>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Video className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Doctor Meeting</h4>
                      <p className="text-sm text-gray-600">{formatDate(appointment.scheduled_at)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>

                {appointment.notes && (
                  <p className="text-sm text-gray-600 mb-3">Notes: {appointment.notes}</p>
                )}

                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Video size={16} className="text-gray-600" />
                      <span className="text-sm font-mono text-gray-700">{appointment.meeting_link}</span>
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
                    Join Meeting
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(appointment.meeting_link || '', `${appointment.id}-btn`)}
                  >
                    {copiedId === `${appointment.id}-btn` ? 'Copied!' : 'Copy Link'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Doctor Verification Requests</h3>
          <Button size="sm">View All</Button>
        </div>
        <div className="space-y-4">
          {doctorRequests.map((doctor) => (
            <div key={doctor.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                  <p className="text-sm text-gray-600">{doctor.specialization} • {doctor.experience}</p>
                  <div className="flex items-center mt-1">
                    <MapPin size={14} className="text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">{doctor.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    doctor.documents === 'Complete' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doctor.documents}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">Review Documents</Button>
                <Button size="sm" variant="ghost">Reject</Button>
                <Button size="sm">Approve</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">94.5%</div>
            <p className="text-sm text-gray-600">System Uptime</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2.3s</div>
            <p className="text-sm text-gray-600">Avg Response Time</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.7/5</div>
            <p className="text-sm text-gray-600">User Satisfaction</p>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Schedule Appointment Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Doctor Appointment"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Doctor ID <span className="text-red-500">*</span>
            </label>
            <Input
              value={appointmentForm.doctorId}
              onChange={(val) => setAppointmentForm({ ...appointmentForm, doctorId: val })}
              placeholder="Enter doctor ID"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Doctor Name
            </label>
            <Input
              value={appointmentForm.doctorName}
              onChange={(val) => setAppointmentForm({ ...appointmentForm, doctorName: val })}
              placeholder="Enter doctor name (optional)"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Scheduled Date & Time <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={appointmentForm.scheduledAt}
              onChange={(val) => setAppointmentForm({ ...appointmentForm, scheduledAt: val })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Notes
            </label>
            <textarea
              value={appointmentForm.notes}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
              placeholder="Add any notes for the appointment"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-750 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Video size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Video Meeting Link</p>
                <p className="text-blue-600 dark:text-blue-400">A unique Jitsi meeting link will be automatically generated</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleAppointment}>
              Schedule Appointment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manager Dashboard</h1>
          <p className="text-gray-600 dark:text-white">Platform management and analytics</p>
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
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'doctors', label: 'Doctor Management', icon: UserCheck },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
        {activeTab === 'doctors' && renderDoctorManagement()}
        {activeTab === 'analytics' && renderAnalytics()}
      </motion.div>
    </div>
  );
};

export default ManagerDashboard;