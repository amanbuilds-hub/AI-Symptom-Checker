/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Calendar,
  Users,
  Video,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  LogOut,
  Heart,
  Activity,
  FileText,
  Plus,
  Phone,
  Mail,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { formatDate } from "../../lib/utils";
import { Consultation } from "../../types";
import { appointmentsAPI, healthRecordsAPI } from "../../lib/supabase";

const DoctorDashboard: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Consultation[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null
  );

  // Patient Health Metrics states
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [loadingPatientMetrics, setLoadingPatientMetrics] = useState(false);
  const [updatingPatientMetrics, setUpdatingPatientMetrics] = useState(false);
  const [patientMetricsForm, setPatientMetricsForm] = useState({
    blood_pressure: "120/80",
    heart_rate: "72 bpm",
    weight: "65 kg",
    last_checkup: "Today"
  });

  // Patient Search & Filter states
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientStatusFilter, setPatientStatusFilter] = useState("all");

  const openMetricsModal = async (patientId: string, patientName: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);
    setIsMetricsModalOpen(true);
    setLoadingPatientMetrics(true);

    try {
      const response: any = await healthRecordsAPI.getPatientMetrics(patientId);
      if (response.data?.data) {
        setPatientMetricsForm({
          blood_pressure: response.data.data.blood_pressure || "120/80",
          heart_rate: response.data.data.heart_rate || "72 bpm",
          weight: response.data.data.weight || "65 kg",
          last_checkup: response.data.data.last_checkup || "Today"
        });
      } else {
        setPatientMetricsForm({
          blood_pressure: "120/80",
          heart_rate: "72 bpm",
          weight: "65 kg",
          last_checkup: "Today"
        });
      }
    } catch (error) {
      console.error("Error loading patient metrics:", error);
      toast.error("Failed to load patient health metrics");
    } finally {
      setLoadingPatientMetrics(false);
    }
  };

  const handleUpdateMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setUpdatingPatientMetrics(true);
    try {
      const response: any = await healthRecordsAPI.updatePatientMetrics(selectedPatientId, patientMetricsForm);
      if (response.error) {
        toast.error(`Failed to update metrics: ${response.error}`);
        return;
      }
      toast.success("Patient health metrics updated successfully!");
      setIsMetricsModalOpen(false);
    } catch (error) {
      console.error("Error updating patient metrics:", error);
      toast.error("Failed to update health metrics");
    } finally {
      setUpdatingPatientMetrics(false);
    }
  };

  // View Patient Details states
  const [selectedPatientInfo, setSelectedPatientInfo] = useState<any>(null);
  const [selectedPatientRecords, setSelectedPatientRecords] = useState<any[]>([]);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form for doctor to upload record for patient
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [doctorRecordForm, setDoctorRecordForm] = useState({
    title: '',
    type: 'prescription' as 'consultation' | 'symptom_check' | 'prescription' | 'lab_report',
    description: ''
  });
  const [uploadingDoctorRecord, setUploadingDoctorRecord] = useState(false);

  const openPatientDetails = async (patientId: string, patientName: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);
    setIsDetailsModalOpen(true);
    setLoadingPatientDetails(true);
    setIsAddRecordOpen(false); // Reset add record form view

    try {
      // 1. Fetch metrics
      const metricsRes: any = await healthRecordsAPI.getPatientMetrics(patientId);
      if (metricsRes.data?.data) {
        setPatientMetricsForm({
          blood_pressure: metricsRes.data.data.blood_pressure || "120/80",
          heart_rate: metricsRes.data.data.heart_rate || "72 bpm",
          weight: metricsRes.data.data.weight || "65 kg",
          last_checkup: metricsRes.data.data.last_checkup || "Today"
        });
      } else {
        setPatientMetricsForm({
          blood_pressure: "120/80",
          heart_rate: "72 bpm",
          weight: "65 kg",
          last_checkup: "Today"
        });
      }

      // 2. Fetch user information and health records
      const recordsRes: any = await healthRecordsAPI.getPatientHealthRecords(patientId);
      if (recordsRes.data) {
        setSelectedPatientInfo(recordsRes.data.patient || { name: patientName });
        setSelectedPatientRecords(recordsRes.data.data || []);
      } else {
        setSelectedPatientInfo({ name: patientName });
        setSelectedPatientRecords([]);
      }
    } catch (error) {
      console.error("Error loading patient details:", error);
      toast.error("Failed to load patient medical file");
    } finally {
      setLoadingPatientDetails(false);
    }
  };

  const handleCreateDoctorRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setUploadingDoctorRecord(true);
    try {
      const response: any = await healthRecordsAPI.createPatientHealthRecord(selectedPatientId, doctorRecordForm);
      if (response.error) {
        toast.error(`Failed to create record: ${response.error}`);
        return;
      }
      toast.success("Health record created successfully!");
      // Reload details to show newly added record
      await openPatientDetails(selectedPatientId, selectedPatientName);
      // Reset form
      setDoctorRecordForm({
        title: '',
        type: 'prescription',
        description: ''
      });
      setIsAddRecordOpen(false);
    } catch (error) {
      console.error("Error creating record:", error);
      toast.error("Failed to create health record");
    } finally {
      setUploadingDoctorRecord(false);
    }
  };

  // Fetch appointments from API on component mount
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setAppointmentsError(null);
    try {
      const response: any = await appointmentsAPI.getAll();
      if (response.error) {
        setAppointmentsError(response.error);
        console.error("Error fetching appointments:", response.error);
      } else if (response.data) {
        // Handle nested data structure - backend returns { data: [...] }
        console.log("Response data:", response.data);
        const appointmentsData = Array.isArray(response.data?.data)
          ? response.data?.data
          : [];
        setAppointments(appointmentsData);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointmentsError("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Filter today's appointments
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.scheduled_at);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  // Get upcoming appointments (including today and future)
  const upcomingAppointments = appointments;

  console.log("Upcoming Appointments:", upcomingAppointments);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate completed consultations
  const completedConsultations = appointments.filter(
    (apt) => apt.status === "completed"
  );

  // Get all unique patients who have any appointment with this doctor (to establish patient relationship)
  const uniquePatientsMap = new Map<string, Consultation>();
  appointments.forEach(apt => {
    if (!uniquePatientsMap.has(apt.customer_id)) {
      uniquePatientsMap.set(apt.customer_id, apt);
    } else {
      const existing = uniquePatientsMap.get(apt.customer_id)!;
      // Keep the most recent appointment to show latest info
      if (new Date(apt.scheduled_at) > new Date(existing.scheduled_at)) {
        uniquePatientsMap.set(apt.customer_id, apt);
      }
    }
  });

  const uniquePatientsList = Array.from(uniquePatientsMap.values());

  // Filter unique patients based on search query and status filter
  const filteredPatients = uniquePatientsList.filter(apt => {
    const name = (apt.customer_name || apt.patient || "Patient").toLowerCase();
    const query = patientSearchQuery.toLowerCase();
    const matchesSearch = name.includes(query);

    if (patientStatusFilter === "all") {
      return matchesSearch;
    }
    return matchesSearch && apt.status === patientStatusFilter;
  });

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments.length.toString(),
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      label: "Total Appointments",
      value: appointments.length.toString(),
      icon: Users,
      color: "text-green-600",
    },
    {
      label: "Completed",
      value: completedConsultations.length.toString(),
      icon: CheckCircle,
      color: "text-yellow-600",
    },
    {
      label: "Unique Patients",
      value: uniquePatientsList.length.toString(),
      icon: Users,
      color: "text-purple-600",
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Good morning, Dr. {user?.name}!
            </h2>
            <p className="text-gray-600">
              {loadingAppointments
                ? "Loading appointments..."
                : todayAppointments.length === 0
                ? "No appointments scheduled for today."
                : `You have ${todayAppointments.length} appointment${
                    todayAppointments.length !== 1 ? "s" : ""
                  } scheduled for today.`}
            </p>
          </div>
          <div className="bg-green-600 p-4 rounded-full">
            <Users className="text-white" size={32} />
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <Icon className={stat.color} size={24} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Appointments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Upcoming Appointments
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("appointments")}
          >
            View All
          </Button>
        </div>
        {loadingAppointments ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : appointmentsError ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <p className="text-red-600 mb-2">{appointmentsError}</p>
            <Button size="sm" onClick={fetchAppointments}>
              Retry
            </Button>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No upcoming appointments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${
                        appointment.status === "ongoing"
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <Video
                        className={
                          appointment.status === "ongoing"
                            ? "text-green-600"
                            : "text-blue-600"
                        }
                        size={20}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.customer_name ||
                          appointment.patient ||
                          "Patient"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(appointment.scheduled_at)}
                      </p>
                      {appointment.symptoms &&
                        appointment.symptoms.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Symptoms: {appointment.symptoms.join(", ")}
                          </p>
                        )}
                      {appointment.notes && (
                        <p className="text-sm text-gray-500">
                          Notes: {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === "ongoing"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                {appointment.meeting_link && (
                  <>
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Video size={16} className="text-gray-600" />
                          <span className="text-sm font-mono text-gray-700">
                            {appointment.meeting_link}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              appointment.meeting_link || "",
                              appointment.id
                            )
                          }
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

                    <div className="flex space-x-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          window.open(appointment.meeting_link, "_blank")
                        }
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Join Meeting
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(
                            appointment.meeting_link || "",
                            `${appointment.id}-btn`
                          )
                        }
                      >
                        {copiedId === `${appointment.id}-btn`
                          ? "Copied!"
                          : "Copy Link"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openPatientDetails(appointment.customer_id, appointment.customer_name || "Patient")}
                      >
                        View Medical File & Info
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 cursor-pointer" hover>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Schedule</h3>
              <p className="text-sm text-gray-600">Update availability</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 cursor-pointer" hover>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MessageCircle className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Patient Messages</h3>
              <p className="text-sm text-gray-600">3 unread messages</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 cursor-pointer" hover>
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">View performance</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            All Appointments
          </h3>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              Today
            </Button>
            <Button variant="ghost" size="sm">
              This Week
            </Button>
            <Button variant="ghost" size="sm">
              This Month
            </Button>
          </div>
        </div>
        {loadingAppointments ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : appointmentsError ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <p className="text-red-600 mb-2">{appointmentsError}</p>
            <Button size="sm" onClick={fetchAppointments}>
              Retry
            </Button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No appointments found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Video size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {appointment.customer_name ||
                          appointment.patient ||
                          "Patient"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(appointment.scheduled_at)}
                      </p>
                      {appointment.symptoms &&
                        appointment.symptoms.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Symptoms: {appointment.symptoms.join(", ")}
                          </p>
                        )}
                      {appointment.notes && (
                        <p className="text-sm text-gray-500">
                          Notes: {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === "ongoing"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                {appointment.meeting_link && (
                  <>
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Video size={16} className="text-gray-600" />
                          <span className="text-sm font-mono text-gray-700">
                            {appointment.meeting_link}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              appointment.meeting_link || "",
                              `apt-${appointment.id}`
                            )
                          }
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
                        onClick={() =>
                          window.open(appointment.meeting_link, "_blank")
                        }
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Join Video Meeting
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(
                            appointment.meeting_link || "",
                            `apt-btn-${appointment.id}`
                          )
                        }
                      >
                        {copiedId === `apt-btn-${appointment.id}`
                          ? "Copied!"
                          : "Copy Link"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openPatientDetails(appointment.customer_id, appointment.customer_name || "Patient")}
                      >
                        View Medical File & Info
                      </Button>
                      <Button size="sm" variant="ghost">
                        Reschedule
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-gray-100 dark:border-gray-750 pb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Patient Directory & Records File
            </h3>
            <p className="text-sm text-gray-555 dark:text-gray-400 mt-1">
              Search and view patient medical histories, health reports, metrics, and manage prescriptions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search patients by name..."
              value={patientSearchQuery}
              onChange={(e) => setPatientSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-64"
            />

            {/* Filter Dropdown */}
            <select
              value={patientStatusFilter}
              onChange={(e) => setPatientStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Consultation Statuses</option>
              <option value="completed">Completed Only</option>
              <option value="scheduled">Scheduled Only</option>
              <option value="ongoing">Ongoing Only</option>
              <option value="cancelled">Cancelled Only</option>
            </select>
          </div>
        </div>

        {loadingAppointments ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto animate-pulse"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading patients folder...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700/60 rounded-xl">
            <Users className="mx-auto text-gray-300 mb-3" size={48} />
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">No Patients Found</h4>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {patientSearchQuery || patientStatusFilter !== "all" 
                ? "Try adjusting your search query or status filter." 
                : "No patient relationships established yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.map((consultation) => {
              const statusColors = {
                completed: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-205 dark:border-green-900/30",
                scheduled: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-205 dark:border-blue-900/30",
                ongoing: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 border border-yellow-205 dark:border-yellow-900/30",
                cancelled: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-205 dark:border-red-900/30"
              }[consultation.status] || "bg-gray-50 text-gray-700";

              return (
                <div
                  key={consultation.id}
                  className="border border-gray-205 dark:border-gray-700/60 rounded-xl p-4 bg-white dark:bg-gray-800/40 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                        {consultation.customer_name ||
                          consultation.patient ||
                          "Patient"}
                      </h4>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors}`}>
                        {consultation.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm mb-4">
                      <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Calendar size={14} />
                        Last Consultation: {formatDate(consultation.scheduled_at)}
                      </p>
                      {consultation.symptoms && consultation.symptoms.length > 0 && (
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong className="text-gray-700 dark:text-gray-200 font-medium">Symptoms:</strong> {consultation.symptoms.join(", ")}
                        </p>
                      )}
                      {consultation.notes && (
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong className="text-gray-700 dark:text-gray-200 font-medium">Notes:</strong> {consultation.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <span className="text-xs text-gray-450 dark:text-gray-400">
                      Duration: {consultation.duration} min
                    </span>
                    <Button
                      size="sm"
                      onClick={() => openPatientDetails(consultation.customer_id, consultation.customer_name || "Patient")}
                    >
                      View Medical File & Info
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Doctor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-white">Manage your practice and patients</p>
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
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "appointments", label: "Appointments", icon: Calendar },
            { id: "patients", label: "Patients", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
        {activeTab === "overview" && renderOverview()}
        {activeTab === "appointments" && renderAppointments()}
        {activeTab === "patients" && renderPatients()}
      </motion.div>

      {/* Patient Health Metrics Update Modal */}
      <Modal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        title={`Update Health Metrics - ${selectedPatientName}`}
        size="md"
      >
        {loadingPatientMetrics ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto animate-pulse"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading current patient metrics...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdateMetrics} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Blood Pressure (e.g. 120/80)
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="120/80"
                value={patientMetricsForm.blood_pressure}
                onChange={(e) => setPatientMetricsForm({ ...patientMetricsForm, blood_pressure: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Heart Rate (e.g. 72 bpm)
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="72 bpm"
                value={patientMetricsForm.heart_rate}
                onChange={(e) => setPatientMetricsForm({ ...patientMetricsForm, heart_rate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Weight (e.g. 65 kg)
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="65 kg"
                value={patientMetricsForm.weight}
                onChange={(e) => setPatientMetricsForm({ ...patientMetricsForm, weight: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Last Checkup (e.g. Today, 5 days ago)
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Today"
                value={patientMetricsForm.last_checkup}
                onChange={(e) => setPatientMetricsForm({ ...patientMetricsForm, last_checkup: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsMetricsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatingPatientMetrics}>
                {updatingPatientMetrics ? "Updating..." : "Save Metrics"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Patient Medical File & Info Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Patient Medical File - ${selectedPatientName}`}
        size="lg"
      >
        {loadingPatientDetails ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto animate-pulse"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading medical records folder...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Patient Contact Info & Profile card */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  {selectedPatientInfo?.name || selectedPatientName}
                </h4>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} />
                    {selectedPatientInfo?.email || "No email provided"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} />
                    {selectedPatientInfo?.phone || "No phone number"}
                  </span>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsMetricsModalOpen(true);
                }}
              >
                Edit Health Metrics
              </Button>
            </div>

            {/* Health Metrics layout */}
            <div>
              <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Current Health Metrics
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                    <Heart size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">BP</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{patientMetricsForm.blood_pressure}</p>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pulse</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{patientMetricsForm.heart_rate}</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{patientMetricsForm.weight}</p>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Checkup</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{patientMetricsForm.last_checkup}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Doctor Add Record Form */}
            <div className="border-t border-gray-100 dark:border-gray-700/50 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" />
                  Health Records & Prescriptions
                </h5>
                <Button
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => setIsAddRecordOpen(!isAddRecordOpen)}
                >
                  <Plus size={14} />
                  {isAddRecordOpen ? "Cancel Form" : "Add Record / Prescription"}
                </Button>
              </div>

              {isAddRecordOpen && (
                <form onSubmit={handleCreateDoctorRecord} className="bg-gray-50 dark:bg-gray-800/35 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 mb-6 space-y-4">
                  <h6 className="text-sm font-semibold text-gray-900 dark:text-white">Create New Record for {selectedPatientName}</h6>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Record Title
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="e.g., Daily Prescription, ECG Report"
                      value={doctorRecordForm.title}
                      onChange={(e) => setDoctorRecordForm({ ...doctorRecordForm, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-650 dark:text-gray-300 mb-1">
                      Record Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      value={doctorRecordForm.type}
                      onChange={(e: any) => setDoctorRecordForm({ ...doctorRecordForm, type: e.target.value })}
                    >
                      <option value="prescription">Prescription</option>
                      <option value="consultation">Consultation Record</option>
                      <option value="lab_report">Lab Report</option>
                      <option value="symptom_check">Symptom Check Log</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-650 dark:text-gray-300 mb-1">
                      Notes / Description
                    </label>
                    <textarea
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      rows={3}
                      placeholder="Add diagnostic details, dosage, medicine guidelines, etc."
                      value={doctorRecordForm.description}
                      onChange={(e) => setDoctorRecordForm({ ...doctorRecordForm, description: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddRecordOpen(false)}>Cancel</Button>
                    <Button type="submit" size="sm" disabled={uploadingDoctorRecord}>
                      {uploadingDoctorRecord ? "Saving..." : "Save Record"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Records Loop */}
              {selectedPatientRecords.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700/60 rounded-xl">
                  <FileText className="mx-auto text-gray-300 mb-2" size={36} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No medical records uploaded for this patient yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {selectedPatientRecords.map((record) => {
                    const badgeStyles = {
                      lab_report: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                      prescription: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                      consultation: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                      symptom_check: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }[record.type] || "bg-gray-100 text-gray-800";

                    const readableType = {
                      lab_report: "Lab Report",
                      prescription: "Prescription",
                      consultation: "Consultation Record",
                      symptom_check: "Symptom Check Log"
                    }[record.type] || record.type;

                    return (
                      <div key={record.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-850 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${badgeStyles}`}>
                            {readableType}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(record.created_at)}
                          </span>
                        </div>
                        <h6 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                          {record.title}
                        </h6>
                        <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-3">
                          {record.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <Button onClick={() => setIsDetailsModalOpen(false)}>
                Close Medical File
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
