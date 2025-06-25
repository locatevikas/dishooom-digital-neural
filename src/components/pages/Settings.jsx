import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import settingsService from '@/services/api/settingsService';
import { toast } from 'react-toastify';
import { useTheme } from '@/context/ThemeContext';

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({});
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'data', label: 'Data & Backup', icon: 'Database' },
    { id: 'security', label: 'Security', icon: 'Shield' },
    { id: 'appearance', label: 'Appearance', icon: 'Palette' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setFormData(data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section = activeTab) => {
    try {
      setSaving(true);
      const updatedSettings = await settingsService.updateSettings(section, formData[section]);
      setSettings(updatedSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (section = activeTab) => {
    if (!confirm(`Reset ${section} settings to default values?`)) return;
    
    try {
      const resetSettings = await settingsService.resetSettings(section);
      setSettings(resetSettings);
      setFormData(resetSettings);
      toast.success(`${section} settings reset successfully`);
    } catch (error) {
      toast.error('Failed to reset settings');
    }
  };

  const handleExport = async () => {
    try {
      await settingsService.exportSettings();
      toast.success('Settings exported successfully');
    } catch (error) {
      toast.error('Failed to export settings');
    } finally {
      // No need to set saving to false here, as it's a separate action
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importedSettings = await settingsService.importSettings(file);
      setSettings(importedSettings);
      setFormData(importedSettings);
      toast.success('Settings imported successfully');
    } catch (error) {
      toast.error('Failed to import settings');
    }
  };

  const updateFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedFormData = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/more')}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your app preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Tabs Navigation */}
        <div className="lg:w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <ApperIcon name={tab.icon} size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <Card className="p-6 dark:bg-gray-800">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Profile Information</h2>
                  <p className="text-gray-600 dark:text-gray-400">Update your personal and business information</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                      <Input
                        value={formData.profile?.firstName || ''}
                        onChange={(e) => updateFormData('profile', 'firstName', e.target.value)}
                        placeholder="Enter first name"
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                      <Input
                        value={formData.profile?.lastName || ''}
                        onChange={(e) => updateFormData('profile', 'lastName', e.target.value)}
                        placeholder="Enter last name"
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <Input
                        type="email"
                        value={formData.profile?.email || ''}
                        onChange={(e) => updateFormData('profile', 'email', e.target.value)}
                        placeholder="Enter email"
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                      <Input
                        type="tel"
                        value={formData.profile?.phone || ''}
                        onChange={(e) => updateFormData('profile', 'phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-gray-700" />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Business Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Name</label>
                          <Input
                            value={formData.profile?.businessName || ''}
                            onChange={(e) => updateFormData('profile', 'businessName', e.target.value)}
                            placeholder="Enter business name"
                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Type</label>
                          <Input
                            value={formData.profile?.businessType || ''}
                            onChange={(e) => updateFormData('profile', 'businessType', e.target.value)}
                            placeholder="Enter business type"
                            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Address</label>
                        <Input
                          value={formData.profile?.businessAddress || ''}
                          onChange={(e) => updateFormData('profile', 'businessAddress', e.target.value)}
                          placeholder="Enter business address"
                          className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax ID</label>
                        <Input
                          value={formData.profile?.taxId || ''}
                          onChange={(e) => updateFormData('profile', 'taxId', e.target.value)}
                          placeholder="Enter tax ID"
                          className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo (max 1MB)</label>
                    {formData.profile?.logo && (
                      <div className="mb-2">
                        <img
                          src={formData.profile.logo}
                          alt="Logo Preview"
                          className="h-20 w-20 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 1 * 1024 * 1024) {
                          toast.error('File size should be less than 1MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          updateFormData('profile', 'logo', ev.target.result);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-primary/20 dark:file:text-primary dark:hover:file:bg-primary/30"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <Card className="p-6 dark:bg-gray-800">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Notification Preferences</h2>
                  <p className="text-gray-600 dark:text-gray-400">Configure how you want to receive notifications</p>
                </div>

                <div className="space-y-8">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ApperIcon name="Mail" size={20} />
                      Email Notifications
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                      {Object.entries(formData.notifications?.email || {}).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize dark:text-gray-300">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateNestedFormData('notifications', 'email', key, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:checked:bg-blue-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ApperIcon name="Smartphone" size={20} />
                      Push Notifications
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                      {Object.entries(formData.notifications?.push || {}).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize dark:text-gray-300">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateNestedFormData('notifications', 'push', key, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:checked:bg-blue-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* System Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ApperIcon name="Settings" size={20} />
                      System Settings
                    </h3>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sound Enabled</span>
                        <input
                          type="checkbox"
                          checked={formData.notifications?.system?.soundEnabled || false}
                          onChange={(e) => updateNestedFormData('notifications', 'system', 'soundEnabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:checked:bg-blue-600"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Desktop Notifications</span>
                        <input
                          type="checkbox"
                          checked={formData.notifications?.system?.desktopNotifications || false}
                          onChange={(e) => updateNestedFormData('notifications', 'system', 'desktopNotifications', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:checked:bg-blue-600"
                        />
                      </label>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Email Digest Frequency</label>
                        <Select
                          value={formData.notifications?.system?.emailDigest || 'weekly'}
                          onChange={(e) => updateNestedFormData('notifications', 'system', 'emailDigest', e.target.value)}
                          className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="never">Never</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Data & Backup Settings */}
            {activeTab === 'data' && (
              <Card className="p-6 dark:bg-gray-800">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Data & Backup</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your data backup and export settings</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Last Backup: {settings.data?.lastBackup || 'Never'}</span>
                    <Button onClick={() => handleSave('data')} disabled={saving} className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                      {saving ? 'Backing Up...' : 'Backup Now'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Export all data to CSV</span>
                    <Button onClick={handleExport} className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Export Data</Button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Import Data from CSV</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImport}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <Card className="p-6 dark:bg-gray-800">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Security Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your account security and privacy</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                    <Input
                      type="password"
                      value={formData.security?.currentPassword || ''}
                      onChange={(e) => updateFormData('security', 'currentPassword', e.target.value)}
                      placeholder="Enter current password"
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <Input
                      type="password"
                      value={formData.security?.newPassword || ''}
                      onChange={(e) => updateFormData('security', 'newPassword', e.target.value)}
                      placeholder="Enter new password"
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                    <Input
                      type="password"
                      value={formData.security?.confirmNewPassword || ''}
                      onChange={(e) => updateFormData('security', 'confirmNewPassword', e.target.value)}
                      placeholder="Confirm new password"
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Two-Factor Authentication</span>
                    <input
                      type="checkbox"
                      checked={formData.security?.twoFactorAuth || false}
                      onChange={(e) => updateFormData('security', 'twoFactorAuth', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:checked:bg-blue-600"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <Card className="p-6 dark:bg-gray-800">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Appearance Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Customize the look and feel of your app</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                    <label htmlFor="darkModeToggle" className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="darkModeToggle"
                        className="sr-only peer"
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{theme === 'dark' ? 'On' : 'Off'}</span>
                    </label>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                    <Select
                      value={formData.appearance?.language || 'en'}
                      onChange={(e) => updateFormData('appearance', 'language', e.target.value)}
                      className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </Select>
                  </div>

                  {/* Timezone Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                    <Select
                      value={formData.appearance?.timezone || 'America/New_York'}
                      onChange={(e) => updateFormData('appearance', 'timezone', e.target.value)}
                      className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </Select>
                  </div>

                  {/* Date Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
                    <Select
                      value={formData.appearance?.dateFormat || 'MM/DD/YYYY'}
                      onChange={(e) => updateFormData('appearance', 'dateFormat', e.target.value)}
                      className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </Select>
                  </div>

                  {/* Currency Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                    <Select
                      value={formData.appearance?.currency || 'USD'}
                      onChange={(e) => updateFormData('appearance', 'currency', e.target.value)}
                      className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </Select>
                  </div>

                  {/* Compact Mode Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compact Mode</span>
                    <label htmlFor="compactModeToggle" className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="compactModeToggle"
                        className="sr-only peer"
                        checked={formData.appearance?.compactMode || false}
                        onChange={(e) => updateFormData('appearance', 'compactMode', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{formData.appearance?.compactMode ? 'On' : 'Off'}</span>
                    </label>
                  </div>

                  {/* Show Animations Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Animations</span>
                    <label htmlFor="showAnimationsToggle" className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="showAnimationsToggle"
                        className="sr-only peer"
                        checked={formData.appearance?.showAnimations || false}
                        onChange={(e) => updateFormData('appearance', 'showAnimations', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{formData.appearance?.showAnimations ? 'On' : 'Off'}</span>
                    </label>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => handleReset()}
                disabled={saving}
                className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
              >
                Reset to Default
              </Button>
              <Button
                onClick={() => handleSave()}
                disabled={saving}
                className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;