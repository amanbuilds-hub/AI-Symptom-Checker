import React, { useState, useEffect } from 'react';
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
import { analyticsAPI } from '../../lib/supabase';

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

  // Real-time Analytics States
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDoctors: 0,
    consultationsToday: 0,
    completedConsultations: 0,
    revenue: 0
  });
  const [trends, setTrends] = useState<{ date: string; count: number }[]>([]);
  const [roles, setRoles] = useState<{ role: string; count: number }[]>([]);
  const [specializations, setSpecializations] = useState<{ specialization: string; count: number }[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        const [statsRes, trendsRes, rolesRes, specsRes] = await Promise.all([
          analyticsAPI.getPlatformStats(),
          analyticsAPI.getTrends(),
          analyticsAPI.getRoles(),
          analyticsAPI.getSpecializations()
        ]);

        if (statsRes.data) {
          const actualStats = (statsRes.data as any).data || statsRes.data;
          setStats({
            totalUsers: actualStats.totalUsers || 0,
            activeDoctors: actualStats.activeDoctors || 0,
            consultationsToday: actualStats.consultationsToday || 0,
            completedConsultations: actualStats.completedConsultations || 0,
            revenue: actualStats.revenue || 0
          });
        }
        if (trendsRes.data) {
          const actualTrends = (trendsRes.data as any).data || trendsRes.data;
          setTrends(Array.isArray(actualTrends) ? actualTrends : []);
        }
        if (rolesRes.data) {
          const actualRoles = (rolesRes.data as any).data || rolesRes.data;
          setRoles(Array.isArray(actualRoles) ? actualRoles : []);
        }
        if (specsRes.data) {
          const actualSpecs = (specsRes.data as any).data || specsRes.data;
          setSpecializations(Array.isArray(actualSpecs) ? actualSpecs : []);
        }
      } catch (error) {
        console.error("Error loading platform analytics:", error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    if (user?.role === 'manager') {
      fetchAnalytics();
    }
  }, [user]);

  const platformStats = [
    { label: 'Total Patients', value: stats.totalUsers.toLocaleString(), change: 'Live', icon: Users, color: 'text-blue-600' },
    { label: 'Active Doctors', value: stats.activeDoctors.toLocaleString(), change: 'Live', icon: UserCheck, color: 'text-green-600' },
    { label: 'Consultations Today', value: stats.consultationsToday.toLocaleString(), change: 'Live', icon: Activity, color: 'text-purple-600' },
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, change: 'Completed', icon: DollarSign, color: 'text-yellow-600' }
  ];

  // Static data removed

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

    </div>
  );

  const renderAnalytics = () => {
    const maxTrendCount = Math.max(...trends.map(t => t.count), 1);
    const totalUsersCount = roles.reduce((sum, r) => sum + r.count, 0) || 1;

    return (
      <div className="space-y-6">
        {loadingAnalytics ? (
          <Card className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 font-medium">Fetching live analytics data...</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consultation Trends Line-Style Bar Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Consultation Trends (Last 7 Days)</h3>
                {trends.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">No consultation trend records found</p>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 240">
                      {/* Grid Lines */}
                      <line x1="40" y1="40" x2="480" y2="40" stroke="#E5E7EB" strokeDasharray="4 4" className="stroke-gray-200 dark:stroke-gray-700" />
                      <line x1="40" y1="90" x2="480" y2="90" stroke="#E5E7EB" strokeDasharray="4 4" className="stroke-gray-200 dark:stroke-gray-700" />
                      <line x1="40" y1="140" x2="480" y2="140" stroke="#E5E7EB" strokeDasharray="4 4" className="stroke-gray-200 dark:stroke-gray-700" />
                      <line x1="40" y1="190" x2="480" y2="190" stroke="#E5E7EB" className="stroke-gray-300 dark:stroke-gray-600" />

                      {/* Y-Axis Labels */}
                      <text x="30" y="45" textAnchor="end" fontSize="10" className="fill-gray-400 font-medium">{(maxTrendCount).toFixed(0)}</text>
                      <text x="30" y="115" textAnchor="end" fontSize="10" className="fill-gray-400 font-medium">{(maxTrendCount / 2).toFixed(0)}</text>
                      <text x="30" y="195" textAnchor="end" fontSize="10" className="fill-gray-400 font-medium">0</text>

                      {/* Render Dynamic Bars */}
                      {trends.map((item, idx) => {
                        const x = 55 + idx * 60;
                        const barHeight = (item.count / maxTrendCount) * 130;
                        const y = 190 - barHeight;
                        const dateLabel = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

                        return (
                          <g key={idx} className="group cursor-pointer">
                            <title>{`${item.count} consultations scheduled on ${item.date}`}</title>
                            <rect
                              x={x}
                              y={y}
                              width="28"
                              height={Math.max(barHeight, 4)}
                              rx="4"
                              className="fill-indigo-500 hover:fill-indigo-600 dark:fill-indigo-600 dark:hover:fill-indigo-500 transition-all duration-300 drop-shadow"
                            />
                            {item.count > 0 && (
                              <text
                                x={x + 14}
                                y={y - 6}
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="700"
                                className="fill-indigo-600 dark:fill-indigo-400"
                              >
                                {item.count}
                              </text>
                            )}
                            <text
                              x={x + 14}
                              y="210"
                              textAnchor="middle"
                              fontSize="10"
                              className="fill-gray-500 dark:fill-gray-400 font-medium"
                            >
                              {dateLabel}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
              </Card>

              {/* User Growth Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth & Role Shares</h3>
                {roles.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">No user distributions recorded</p>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center h-64 space-y-6">
                    {roles.map((roleObj, idx) => {
                      const sharePct = (roleObj.count / totalUsersCount) * 100;
                      const roleMeta =
                        roleObj.role === 'customer' ? { label: 'Patients', bar: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' } :
                        roleObj.role === 'doctor' ? { label: 'Doctors', bar: 'bg-green-500', text: 'text-green-600 dark:text-green-400' } :
                        { label: 'Managers', bar: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' };

                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-gray-700 dark:text-gray-300">{roleMeta.label}</span>
                            <span className={roleMeta.text}>{roleObj.count.toLocaleString()} ({sharePct.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                            <div
                              className={`${roleMeta.bar} h-full rounded-full transition-all duration-1000`}
                              style={{ width: `${sharePct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Doctor Specializations Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Doctor Specializations</h3>
              {specializations.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No specialty metrics available</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specializations.map((spec, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-gray-800/40 dark:to-gray-800/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize">{spec.specialization}</span>
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{spec.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </>
        )}
      </div>
    );
  };

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manager Dashboard</h1>
        <p className="text-gray-600 dark:text-white">Platform management and analytics</p>
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