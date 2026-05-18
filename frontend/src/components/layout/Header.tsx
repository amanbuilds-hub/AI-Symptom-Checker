import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Globe, Sun, Moon, User, LogOut, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onProfileClick: () => void;
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, onHomeClick }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-300">
      <div className="px-6 py-3 flex items-center justify-between">
        
        {/* Left Side Logo (Clickable to go home) */}
        <div 
          onClick={onHomeClick}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200">
            <Heart className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              Rural HealthCare
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">AI-Powered Medical Assistant</p>
          </div>
        </div>

        {/* Right Side Settings & User Profile Dropdown */}
        <div className="flex items-center space-x-3">
          
          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="dark:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>

          {/* Language Selector */}
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="dark:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Globe size={20} />
            <span className="ml-1.5 text-xs font-semibold uppercase">
              {i18n.language === 'en' ? 'हिं' : 'EN'}
            </span>
          </Button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Profile Dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[120px] truncate">{user.name}</p>
                  <p className="text-[9px] text-gray-500 capitalize">{user.role}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] text-gray-400 font-medium">Signed in as</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onProfileClick();
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <User size={15} className="text-gray-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-150 border-t border-gray-50 dark:border-gray-700"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;