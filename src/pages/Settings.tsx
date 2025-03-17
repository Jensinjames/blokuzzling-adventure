
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Volume2, Tablet, Moon, Bell } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState([50]);
  
  // Check if dark mode is already enabled on component mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);

  // Toggle dark mode when the switch is changed
  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const handleSave = () => {
    toast.success("Settings saved successfully!");
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 dark:text-white px-4 py-6">
      <div className="max-w-lg mx-auto">
        <header className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </header>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel dark:bg-gray-800/80 dark:border-gray-700/50 space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                <span className="font-medium">Sound Effects</span>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                <span className="font-medium">Dark Mode</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                <span className="font-medium">Notifications</span>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Tablet className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
              <span className="font-medium">Animation Speed</span>
            </div>
            <Slider
              value={animationSpeed}
              onValueChange={setAnimationSpeed}
              max={100}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
          
          <div className="pt-4 flex justify-center">
            <Button onClick={handleSave} className="w-full">
              Save Settings
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
