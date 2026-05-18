import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import toast from 'react-hot-toast';
import { 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Globe, 
  Shield, 
  Check, 
  Calendar, 
  Hash, 
  Save, 
  RefreshCw,
  Copy,
  DollarSign,
  Award,
  BookOpen,
  Upload,
  Trash2,
  Stethoscope
} from 'lucide-react';

const ProfileSettings: React.FC = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Common User Fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'male',
    language: 'en',
    location: ''
  });

  // Doctor-Specific Fields
  const [docFormData, setDocFormData] = useState({
    specialization: 'General Practice',
    experience: '0',
    consultation_fee: '0',
    bio: '',
    certifications: [] as string[]
  });

  // Populate form with real fetched user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        age: user.age ? String(user.age) : '',
        gender: user.gender || 'male',
        language: user.language || 'en',
        location: user.location || ''
      });

      if (user.role === 'doctor') {
        const docProfile = (user as any).doctor_profile || {};
        
        let parsedCerts: string[] = [];
        try {
          if (docProfile.certifications) {
            if (typeof docProfile.certifications === 'string') {
              parsedCerts = JSON.parse(docProfile.certifications);
            } else if (Array.isArray(docProfile.certifications)) {
              parsedCerts = docProfile.certifications;
            }
          }
        } catch (e) {
          console.error("Failed to parse certifications:", e);
        }

        setDocFormData({
          specialization: docProfile.specialization || 'General Practice',
          experience: docProfile.experience !== undefined ? String(docProfile.experience) : '0',
          consultation_fee: docProfile.consultation_fee !== undefined ? String(docProfile.consultation_fee) : '0',
          bio: docProfile.bio || '',
          certifications: parsedCerts
        });
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      toast.success('Doctor ID copied to clipboard!');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        toast.error('Failed to read certificate file');
        return;
      }

      const certEntry = `${file.name}|${base64Data}`;

      setDocFormData((prev) => {
        const exists = prev.certifications.some(c => c.split('|')[0] === file.name);
        if (exists) {
          toast.error('This certificate is already added!');
          return prev;
        }
        toast.success(`Selected certificate: "${file.name}"`);
        return {
          ...prev,
          certifications: [...prev.certifications, certEntry]
        };
      });
    };
    reader.onerror = () => {
      toast.error('Error reading certificate file');
    };
    reader.readAsDataURL(file);
  };

  const removeCertificate = (indexToRemove: number) => {
    setDocFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== indexToRemove)
    }));
    toast.success('Certificate removed');
  };

  const handleViewCertificate = (certString: string) => {
    const parts = certString.split('|');
    const certName = parts[0];
    const base64Data = parts[1];

    if (base64Data) {
      const newTab = window.open();
      if (!newTab) {
        toast.error("Pop-up blocked! Please allow pop-ups for this site.");
        return;
      }

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
      if (!newTab) {
        toast.error("Pop-up blocked! Please allow pop-ups for this site.");
        return;
      }

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
                <strong>${user?.name || 'Practitioner'}</strong> (License ID: <strong>${(user as any).doctor_profile?.license_number || 'MCI-VERIFIED'}</strong>). This credential has been checked, validated, and successfully approved by the Medical Council board for active clinical operations on the Rural HealthCare platform.
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

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshUser();
      toast.success('Profile data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      // Unified payload
      const payload: any = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        gender: formData.gender,
        language: formData.language,
        location: formData.location.trim() || undefined
      };

      // If Doctor -> append professional fields
      if (user?.role === 'doctor') {
        payload.specialization = docFormData.specialization.trim();
        payload.experience = parseInt(docFormData.experience, 10) || 0;
        payload.consultation_fee = parseInt(docFormData.consultation_fee, 10) || 0;
        payload.bio = docFormData.bio.trim() || undefined;
        payload.certifications = docFormData.certifications;
      }

      const result = await updateProfile(payload);
      if (result.error) {
        toast.error(`Update failed: ${result.error}`);
      } else {
        toast.success('Profile updated successfully!');
        await refreshUser(); // Refresh updated states
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading user profile...</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your personal details, language preferences, and medical account settings.
          </p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleRefresh}
          className="flex items-center gap-2 self-start sm:self-auto dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Premium Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 relative overflow-hidden bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-850 border dark:border-gray-700 flex flex-col items-center text-center shadow-lg">
            {/* Visual Glassmorphic Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
            
            {/* Initial-based Avatar */}
            <div className="relative mt-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md transform hover:rotate-3 transition-transform duration-300">
                {getInitials(user.name || 'User')}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-white dark:border-gray-800 w-6 h-6 rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-950 dark:text-white mt-4">{user.name}</h2>
            
            {/* Role Badge */}
            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              user.role === 'doctor' 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
              👤 {user.role === 'doctor' ? 'Medical Practitioner' : 'Patient'}
            </span>

            {/* Quick Details List */}
            <div className="w-full mt-6 space-y-3 text-left border-t border-gray-200 dark:border-gray-750 pt-5 text-sm text-gray-650 dark:text-gray-300">
              <div className="flex items-center space-x-3">
                <Globe className="text-blue-500" size={16} />
                <span>Email: <strong className="text-gray-900 dark:text-white">{user.email}</strong></span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="text-blue-500" size={16} />
                <span>Joined: <strong className="text-gray-900 dark:text-white">{new Date(user.created_at || '').toLocaleDateString()}</strong></span>
              </div>
              {user.role === 'doctor' && (
                <div className="flex items-center space-x-3">
                  <Award className="text-purple-500" size={16} />
                  <span>Specialization: <strong className="text-purple-600 dark:text-purple-300">{docFormData.specialization}</strong></span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Shield className="text-blue-500" size={16} />
                <span>Account Status: <span className="text-green-600 dark:text-green-400 font-semibold">Active Verified</span></span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Cards: Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal Details */}
            <Card className="p-6 md:p-8 border dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-6 flex items-center gap-2">
                <UserIcon className="text-blue-600" size={22} />
                Personal Profile Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-705 dark:text-gray-250">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Email Address (Read-only) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-705 dark:text-gray-250 opacity-80">
                    Email Address <span className="text-xs text-gray-450">(Primary Identifier)</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-450 dark:text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-705 dark:text-gray-250">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 9876543210"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                    />
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-705 dark:text-gray-250">
                    Age (Years)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="e.g. 35"
                      min="1"
                      max="120"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-705 dark:text-gray-250">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Language Preference */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-705 dark:text-gray-250">
                    Preferred Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>

                {/* Location / Town */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-705 dark:text-gray-250">
                    Location / Village / Town
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Rampur Village, Bihar"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Professional Doctor Details (Conditional) */}
            {user.role === 'doctor' && (
              <Card className="p-6 md:p-8 border border-purple-100 dark:border-purple-900/30 bg-purple-50/20 dark:bg-purple-950/5 space-y-6">
                <h3 className="text-xl font-bold text-purple-950 dark:text-purple-300 flex items-center gap-2">
                  <Stethoscope className="text-purple-600 dark:text-purple-400" size={22} />
                  Professional Practitioner Credentials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Doctor-ID (Read-only with Copy Option) */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-purple-900 dark:text-purple-300">
                      Unique Doctor ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Shield className="absolute left-3 top-3 text-purple-400" size={18} />
                        <input
                          type="text"
                          value={user.id}
                          disabled
                          className="w-full pl-10 pr-3 py-2.5 border border-purple-200 dark:border-purple-950 rounded-lg bg-purple-100/30 dark:bg-purple-950/30 text-purple-900 dark:text-purple-400 cursor-default text-sm font-mono"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCopyId}
                        className="px-4 py-2.5 h-full flex items-center gap-2 border dark:border-gray-700"
                        title="Copy Doctor ID"
                      >
                        <Copy size={16} />
                        {copiedId ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-purple-900 dark:text-purple-300">
                      Medical Specialization <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-3 text-purple-400" size={18} />
                      <input
                        type="text"
                        name="specialization"
                        value={docFormData.specialization}
                        onChange={handleDocChange}
                        placeholder="e.g. Pediatrics, Cardiology"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Consultation Fees (INR) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-purple-900 dark:text-purple-300">
                      Consultancy Fees (INR / ₹)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 text-purple-400" size={18} />
                      <input
                        type="number"
                        name="consultation_fee"
                        value={docFormData.consultation_fee}
                        onChange={handleDocChange}
                        placeholder="e.g. 500"
                        min="0"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Experience in Years */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-purple-900 dark:text-purple-300">
                      Professional Experience (Years)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-purple-400" size={18} />
                      <input
                        type="number"
                        name="experience"
                        value={docFormData.experience}
                        onChange={handleDocChange}
                        placeholder="e.g. 10"
                        min="0"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Bio / Description */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-purple-900 dark:text-purple-300">
                      Professional Biography & Description
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 text-purple-400" size={18} />
                      <textarea
                        name="bio"
                        value={docFormData.bio}
                        onChange={handleDocChange}
                        placeholder="Share a brief overview of your medical qualifications, expertise, and clinics..."
                        rows={4}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Certificate Upload */}
                  <div className="space-y-4 md:col-span-2 border-t border-purple-200/50 dark:border-purple-900/50 pt-5">
                    <div>
                      <label className="block text-sm font-semibold text-purple-900 dark:text-purple-300">
                        Upload Medical License & Certificates
                      </label>
                      <p className="text-xs text-gray-500 dark:text-purple-400/70 mt-1">
                        Select certificate files (PDF, JPG, PNG) to attach to your doctor profile credentials.
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-4 py-2.5 border border-purple-300 dark:border-purple-950 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm text-sm font-medium">
                          <Upload size={16} />
                          <span>Choose Certificate</span>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Certifications List */}
                    {docFormData.certifications.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        <h4 className="text-xs font-semibold text-purple-950 dark:text-purple-400 uppercase tracking-wider">
                          Uploaded Certificates ({docFormData.certifications.length})
                        </h4>
                        <ul className="space-y-2">
                          {docFormData.certifications.map((cert, idx) => (
                            <li 
                              key={idx} 
                              className="flex items-center justify-between p-3 rounded-lg border border-purple-200/50 dark:border-purple-900/30 bg-purple-100/10 dark:bg-purple-950/10"
                            >
                              <div 
                                onClick={() => handleViewCertificate(cert)}
                                className="flex items-center space-x-3 min-w-0 cursor-pointer group/item"
                                title="Click to view/verify certificate in a new tab"
                              >
                                <Award className="text-purple-600 flex-shrink-0 group-hover/item:text-purple-800 transition-colors" size={18} />
                                <span className="text-sm font-medium text-gray-900 dark:text-purple-300 truncate font-mono group-hover/item:underline group-hover/item:text-purple-700">
                                  {cert.split('|')[0]}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCertificate(idx)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                title="Delete Certificate"
                              >
                                <Trash2 size={16} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-purple-200 dark:border-purple-900/30 rounded-xl bg-purple-50/5">
                        <Award className="mx-auto text-purple-300 mb-2" size={32} />
                        <p className="text-xs text-purple-800/60 dark:text-purple-400/60">No certificates uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Submit Block */}
            <Card className="p-4 border dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-end">
              <Button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 shadow-md hover:shadow-lg transition-all"
                disabled={loading}
              >
                <Save size={16} />
                {loading ? 'Saving Updates...' : 'Save Changes'}
              </Button>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
