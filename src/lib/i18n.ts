import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      symptoms: 'Check Symptoms',
      doctors: 'Find Doctors',
      records: 'Health Records',
      emergency: 'Emergency',
      profile: 'Profile',
      logout: 'Log Out',
      logout_success: 'Logged out successfully!',
      
      // Common
      welcome: 'Welcome to Rural HealthCare',
      loading: 'Loading...',
      error: 'Something went wrong',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      next: 'Next',
      back: 'Back',
      submit: 'Submit',
      
      // Symptoms
      symptom_checker: 'AI Symptom Checker',
      describe_symptoms: 'Describe your symptoms',
      symptom_placeholder: 'Tell me what you are experiencing...',
      analyze: 'Analyze Symptoms',
      severity_low: 'Low Priority',
      severity_medium: 'Medium Priority', 
      severity_high: 'High Priority',
      severity_emergency: 'Emergency',
      
      // Doctors
      available_doctors: 'Available Doctors',
      book_consultation: 'Book Consultation',
      video_call: 'Video Call',
      rating: 'Rating',
      experience: 'Experience',
      
      // Emergency
      emergency_services: 'Emergency Services',
      call_ambulance: 'Call Ambulance',
      nearest_hospital: 'Nearest Hospital',
      emergency_contacts: 'Emergency Contacts'
    }
  },
  hi: {
    translation: {
      // Navigation
      home: 'होम',
      symptoms: 'लक्षण जाँच',
      doctors: 'डॉक्टर खोजें',
      records: 'स्वास्थ्य रिकॉर्ड',
      emergency: 'आपातकाल',
      profile: 'प्रोफाइल',
      logout: 'लॉग आउट',
      logout_success: 'सफलतापूर्वक लॉग आउट हो गया!',
      
      // Common
      welcome: 'रूरल हेल्थकेयर में आपका स्वागत है',
      loading: 'लोड हो रहा है...',
      error: 'कुछ गलत हुआ',
      retry: 'पुनः प्रयास करें',
      cancel: 'रद्द करें',
      save: 'सेव करें',
      next: 'आगे',
      back: 'वापस',
      submit: 'जमा करें',
      
      // Symptoms
      symptom_checker: 'AI लक्षण जाँच',
      describe_symptoms: 'अपने लक्षणों का वर्णन करें',
      symptom_placeholder: 'बताएं कि आप क्या महसूस कर रहे हैं...',
      analyze: 'लक्षणों का विश्लेषण करें',
      severity_low: 'कम प्राथमिकता',
      severity_medium: 'मध्यम प्राथमिकता',
      severity_high: 'उच्च प्राथमिकता',
      severity_emergency: 'आपातकाल',
      
      // Doctors
      available_doctors: 'उपलब्ध डॉक्टर',
      book_consultation: 'परामर्श बुक करें',
      video_call: 'वीडियो कॉल',
      rating: 'रेटिंग',
      experience: 'अनुभव',
      
      // Emergency
      emergency_services: 'आपातकालीन सेवाएं',
      call_ambulance: 'एम्बुलेंस कॉल करें',
      nearest_hospital: 'निकटतम अस्पताल',
      emergency_contacts: 'आपातकालीन संपर्क'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;