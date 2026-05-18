export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          age: number | null
          gender: 'male' | 'female' | 'other' | null
          language: string
          location: string | null
          role: 'customer' | 'doctor' | 'manager'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'other' | null
          language?: string
          location?: string | null
          role?: 'customer' | 'doctor' | 'manager'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'other' | null
          language?: string
          location?: string | null
          role?: 'customer' | 'doctor' | 'manager'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          specialization: string
          experience: number
          languages: string[]
          availability: boolean
          rating: number
          consultation_fee: number
          license_number: string | null
          verified: boolean
          bio: string | null
          education: string[]
          certifications: string[]
          working_hours: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          specialization: string
          experience?: number
          languages?: string[]
          availability?: boolean
          rating?: number
          consultation_fee?: number
          license_number?: string | null
          verified?: boolean
          bio?: string | null
          education?: string[]
          certifications?: string[]
          working_hours?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          specialization?: string
          experience?: number
          languages?: string[]
          availability?: boolean
          rating?: number
          consultation_fee?: number
          license_number?: string | null
          verified?: boolean
          bio?: string | null
          education?: string[]
          certifications?: string[]
          working_hours?: Json
          created_at?: string
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          customer_id: string | null
          doctor_id: string | null
          type: 'video' | 'audio' | 'chat'
          status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
          scheduled_at: string | null
          duration: number
          symptoms: string[]
          diagnosis: string | null
          prescription: string | null
          notes: string | null
          rating: number | null
          feedback: string | null
          meeting_link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          doctor_id?: string | null
          type?: 'video' | 'audio' | 'chat'
          status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
          scheduled_at?: string | null
          duration?: number
          symptoms?: string[]
          diagnosis?: string | null
          prescription?: string | null
          notes?: string | null
          rating?: number | null
          feedback?: string | null
          meeting_link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          doctor_id?: string | null
          type?: 'video' | 'audio' | 'chat'
          status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
          scheduled_at?: string | null
          duration?: number
          symptoms?: string[]
          diagnosis?: string | null
          prescription?: string | null
          notes?: string | null
          rating?: number | null
          feedback?: string | null
          meeting_link?: string | null
          created_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          customer_id: string | null
          consultation_id: string | null
          type: 'consultation' | 'symptom_check' | 'prescription' | 'lab_report'
          title: string
          description: string | null
          data: Json
          attachments: string[]
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          consultation_id?: string | null
          type?: 'consultation' | 'symptom_check' | 'prescription' | 'lab_report'
          title: string
          description?: string | null
          data?: Json
          attachments?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          consultation_id?: string | null
          type?: 'consultation' | 'symptom_check' | 'prescription' | 'lab_report'
          title?: string
          description?: string | null
          data?: Json
          attachments?: string[]
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}