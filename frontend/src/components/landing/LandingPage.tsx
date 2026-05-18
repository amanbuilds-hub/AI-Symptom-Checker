import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Stethoscope, 
  Users, 
  Shield, 
  Globe, 
  Smartphone,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import LoginForm from '../auth/LoginForm';
import SignupForm from '../auth/SignupForm';
import { useTheme } from '../../contexts/ThemeContext';

const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: Stethoscope,
      title: 'AI Symptom Checker',
      description: 'Advanced AI-powered symptom analysis with instant health recommendations'
    },
    {
      icon: Users,
      title: 'Remote Consultations',
      description: 'Connect with qualified doctors through video calls from anywhere'
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Available in Hindi, English, and regional languages'
    },
    {
      icon: Shield,
      title: 'Emergency Services',
      description: '24/7 emergency support with instant access to ambulance services'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Works seamlessly on low-end devices with poor internet connectivity'
    },
    {
      icon: Heart,
      title: 'Health Records',
      description: 'Secure digital health records accessible anytime, anywhere'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Rajasthan',
      rating: 5,
      text: 'This app helped me get medical advice when no doctor was available in our village. The AI diagnosis was accurate and the doctor consultation was very helpful.'
    },
    {
      name: 'Rajesh Kumar',
      location: 'Bihar',
      rating: 5,
      text: 'As a farmer, I cannot always travel to the city for medical consultation. This app brings healthcare to my doorstep.'
    },
    {
      name: 'Dr. Sunita Patel',
      location: 'Gujarat',
      rating: 5,
      text: 'As a doctor, I can now reach patients in remote areas. The platform is user-friendly and helps me provide quality care remotely.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Patients Served' },
    { number: '500+', label: 'Qualified Doctors' },
    { number: '1,000+', label: 'Villages Covered' },
    { number: '24/7', label: 'Emergency Support' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Rural HealthCare</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Testimonials</a>
              
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="dark:text-gray-200">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </Button>

              <Button 
                variant="ghost" 
                className="dark:text-gray-200"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="dark:text-gray-200">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                <a href="#features" className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Features</a>
                <a href="#how-it-works" className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">How it Works</a>
                <a href="#testimonials" className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Testimonials</a>
                <div className="px-3 py-2 space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full dark:text-gray-200"
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Healthcare for
                <span className="text-blue-600 dark:text-blue-400"> Rural India</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                AI-powered healthcare platform connecting rural communities with qualified doctors. 
                Get instant medical advice, symptom analysis, and emergency support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                >
                  Start Free Consultation
                  <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button variant="ghost" size="lg" className="dark:text-gray-200 dark:hover:bg-gray-800">
                  <Play className="mr-2" size={20} />
                  Watch Demo
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border dark:border-gray-700">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mr-4">
                    <Stethoscope className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI Health Assistant</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Patient:</p>
                    <p className="text-gray-900 dark:text-white">"I have fever and headache for 2 days"</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">AI Assistant:</p>
                    <p className="text-gray-900 dark:text-white">"Based on your symptoms, I recommend consulting a doctor. Would you like me to connect you with an available physician?"</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-y dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our platform combines AI technology with human expertise to deliver 
              accessible healthcare services to rural communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-8 h-full" hover>
                    <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="text-blue-600 dark:text-blue-400" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Simple steps to get the healthcare you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Describe Symptoms',
                description: 'Tell our AI assistant about your health concerns in your preferred language'
              },
              {
                step: '2',
                title: 'Get AI Analysis',
                description: 'Receive instant symptom analysis and health recommendations'
              },
              {
                step: '3',
                title: 'Connect with Doctor',
                description: 'Book a video consultation with qualified doctors if needed'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Real stories from people we've helped
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-8 h-full">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={20} />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of people who are already using our platform to access quality healthcare.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
            >
              Start Your Free Consultation
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Heart className="text-white" size={20} />
                </div>
                <span className="text-lg font-bold">Rural HealthCare</span>
              </div>
              <p className="text-gray-400">
                Bringing quality healthcare to rural India through AI and technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI Symptom Checker</li>
                <li>Doctor Consultations</li>
                <li>Emergency Services</li>
                <li>Health Records</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Emergency</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Ambulance: 108</li>
                <li>Police: 100</li>
                <li>Fire: 101</li>
                <li>Women Helpline: 1091</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Rural HealthCare. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title=""
        size="md"
      >
        {authMode === 'login' ? (
          <LoginForm
            onToggleMode={() => setAuthMode('signup')}
            onClose={() => setShowAuthModal(false)}
          />
        ) : (
          <SignupForm
            onToggleMode={() => setAuthMode('login')}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default LandingPage;
