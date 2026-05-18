export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  language: string;
  location: string;
  role: 'customer' | 'doctor' | 'manager';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  experience: number;
  languages: string[];
  availability: boolean;
  rating: number;
  consultation_fee: number;
  license_number: string;
  verified: boolean;
  bio?: string;
  education: string[];
  certifications: string[];
  working_hours: {
    start: string;
    end: string;
    days: string[];
  };
}

export interface Customer extends User {
  role: 'customer';
  medical_history?: string[];
  allergies?: string[];
  current_medications?: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Manager extends User {
  role: 'manager';
  permissions: string[];
  department: string;
}

export interface Consultation {
  id: string;
  customer_id: string;
  doctor_id: string;
  type: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  scheduled_at: string;
  duration: number;
  symptoms: string[];
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  meeting_link?: string;
  created_at: string;
  // Optional display properties from API joins
  patient?: string;
  doctor?: string;
  customer_name?: string;
  doctor_name?: string;
  time?: string;
  specialization?: string;
  experience?: string;
  languages?: string[] | string;
  available?: number | boolean;
  consultation_fee?: number;
  license_number?: string;
  verified?: number | boolean;
  bio?: string;
  certifications?: string[] | string;
}

export interface HealthRecord {
  id: string;
  customer_id: string;
  consultation_id?: string;
  type: 'consultation' | 'symptom_check' | 'prescription' | 'lab_report';
  title: string;
  description: string;
  data: any;
  attachments?: string[];
  created_at: string;
}

export interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_type: 'customer' | 'doctor' | 'ai';
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  type: 'ambulance' | 'hospital' | 'doctor' | 'family';
  location?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}