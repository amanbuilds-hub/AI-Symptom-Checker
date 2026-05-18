import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Menu, Globe, Sun, Moon } from 'lucide-react';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-300">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="dark:text-gray-200">
            <Menu size={24} />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rural HealthCare
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Medical Assistant</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="dark:text-gray-200">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="dark:text-gray-200">
            <Globe size={20} />
            <span className="ml-2 text-sm font-medium">
              {i18n.language === 'en' ? 'हिं' : 'EN'}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;