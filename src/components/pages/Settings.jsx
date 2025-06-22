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

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({});

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
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
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Manage your app preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Tabs Navigation */}
        <div className="lg:w-64 bg-white border-r border-gray-200">
          <div className="p-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
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
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Information</h2>
                  <p className="text-gray-600">Update your personal and business information</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <Input
                        value={formData.profile?.firstName || ''}
                        onChange={(e) => updateFormData('profile', 'firstName', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <Input
                        value={formData.profile?.lastName || ''}
                        onChange={(e) => updateFormData('profile', 'lastName', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        type="email"
                        value={formData.profile?.email || ''}
                        onChange={(e) => updateFormData('profile', 'email', e.target.value)}
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input
                        type="tel"
                        value={formData.profile?.phone || ''}
                        onChange={(e) => updateFormData('profile', 'phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                          <Input
                            value={formData.profile?.businessName || ''}
                            onChange={(e) => updateFormData('profile', 'businessName', e.target.value)}
                            placeholder="Enter business name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                          <Input
                            value={formData.profile?.businessType || ''}
                            onChange={(e) => updateFormData('profile', 'businessType', e.target.value)}
                            placeholder="Enter business type"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                        <Input
                          value={formData.profile?.businessAddress || ''}
                          onChange={(e) => updateFormData('profile', 'businessAddress', e.target.value)}
                          placeholder="Enter business address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                        <Input
                          value={formData.profile?.taxId || ''}
                          onChange={(e) => updateFormData('profile', 'taxId', e.target.value)}
                          placeholder="Enter tax ID"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Notification Preferences</h2>
                  <p className="text-gray-600">Configure how you want to receive notifications</p>
                </div>

                <div className="space-y-8">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <ApperIcon name="Mail" size={20} />
                      Email Notifications
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      {Object.entries(formData.notifications?.email || {}).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateNestedFormData('notifications', 'email', key, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <ApperIcon name="Smartphone" size={20} />
                      Push Notifications
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      {Object.entries(formData.notifications?.push || {}).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateNestedFormData('notifications', 'push', key, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* System Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <ApperIcon name="Settings" size={20} />
                      System Settings
                    </h3>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Sound Enabled</span>
                        <input
                          type="checkbox"
                          checked={formData.notifications?.system?.soundEnabled || false}
                          onChange={(e) => updateNestedFormData('notifications', 'system', 'soundEnabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Desktop Notifications</span>
                        <input
                          type="checkbox"
                          checked={formData.notifications?.system?.desktopNotifications || false}
                          onChange={(e) => updateNestedFormData('notifications', 'system', 'desktopNotifications', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Email Digest Frequency</label>
                        <Select
                          value={formData.notifications?.system?.emailDigest || 'weekly'}
                          onChange={(e) => updateNestedFormData('notifications', 'system', 'emailDigest', e.target.value)}
                          className="w-full"
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
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Data & Backup</h2>
                  <p className="text-gray-600">Manage your data backup and export settings</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Settings</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Auto Backup</span>
                        <input
                          type="checkbox"
                          checked={formData.data?.autoBackup || false}
                          onChange={(e) => updateFormData('data', 'autoBackup', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Backup Frequency</label>
                        <Select
                          value={formData.data?.backupFrequency || 'weekly'}
                          onChange={(e) => updateFormData('data', 'backupFrequency', e.target.value)}
                          className="w-full"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Data Retention</label>
                        <Select
                          value={formData.data?.dataRetention || '1year'}
                          onChange={(e) => updateFormData('data', 'dataRetention', e.target.value)}
                          className="w-full"
                        >
                          <option value="6months">6 Months</option>
                          <option value="1year">1 Year</option>
                          <option value="2years">2 Years</option>
                          <option value="forever">Forever</option>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Import/Export</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Default Export Format</label>
                        <Select
                          value={formData.data?.exportFormat || 'csv'}
                          onChange={(e) => updateFormData('data', 'exportFormat', e.target.value)}
                          className="w-full"
                        >
                          <option value="csv">CSV</option>
                          <option value="pdf">PDF</option>
                          <option value="excel">Excel</option>
                        </Select>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={handleExport} className="flex-1">
                          <ApperIcon name="Download" size={16} />
                          Export Settings
                        </Button>
                        <label className="flex-1">
                          <Button variant="outline" className="w-full cursor-pointer">
                            <ApperIcon name="Upload" size={16} />
                            Import Settings
                          </Button>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Security Settings</h2>
                  <p className="text-gray-600">Configure security and authentication preferences</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                          <p className="text-xs text-gray-500">Add an extra layer of security</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.security?.twoFactorEnabled || false}
                          onChange={(e) => updateFormData('security', 'twoFactorEnabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Session Timeout (minutes)</label>
                        <Select
                          value={formData.security?.sessionTimeout || 30}
                          onChange={(e) => updateFormData('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={0}>Never</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Password Expiry (days)</label>
                        <Select
                          value={formData.security?.passwordExpiry || 90}
                          onChange={(e) => updateFormData('security', 'passwordExpiry', parseInt(e.target.value))}
                          className="w-full"
                        >
                          <option value={30}>30 days</option>
                          <option value={60}>60 days</option>
                          <option value={90}>90 days</option>
                          <option value={180}>180 days</option>
                          <option value={0}>Never</option>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Access Control</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Login Notifications</span>
                          <p className="text-xs text-gray-500">Get notified of login attempts</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.security?.loginNotifications || false}
                          onChange={(e) => updateFormData('security', 'loginNotifications', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">IP Whitelist</span>
                          <p className="text-xs text-gray-500">Restrict access to specific IP addresses</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.security?.ipWhitelist || false}
                          onChange={(e) => updateFormData('security', 'ipWhitelist', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Appearance</h2>
                  <p className="text-gray-600">Customize the look and feel of the application</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <Select
                        value={formData.appearance?.theme || 'light'}
                        onChange={(e) => updateFormData('appearance', 'theme', e.target.value)}
                        className="w-full"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <Select
                        value={formData.appearance?.language || 'en'}
                        onChange={(e) => updateFormData('appearance', 'language', e.target.value)}
                        className="w-full"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <Select
                        value={formData.appearance?.timezone || 'America/New_York'}
                        onChange={(e) => updateFormData('appearance', 'timezone', e.target.value)}
                        className="w-full"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="UTC">UTC</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <Select
                        value={formData.appearance?.dateFormat || 'MM/DD/YYYY'}
                        onChange={(e) => updateFormData('appearance', 'dateFormat', e.target.value)}
                        className="w-full"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <Select
                        value={formData.appearance?.currency || 'USD'}
                        onChange={(e) => updateFormData('appearance', 'currency', e.target.value)}
                        className="w-full"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="CAD">CAD ($)</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">Display Options</h3>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Compact Mode</span>
                        <p className="text-xs text-gray-500">Reduce spacing and padding</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.appearance?.compactMode || false}
                        onChange={(e) => updateFormData('appearance', 'compactMode', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Show Animations</span>
                        <p className="text-xs text-gray-500">Enable page transitions and animations</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.appearance?.showAnimations !== false}
                        onChange={(e) => updateFormData('appearance', 'showAnimations', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                onClick={() => handleSave()}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Save" size={16} />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReset()}
                className="flex-1"
              >
                <ApperIcon name="RotateCcw" size={16} />
                Reset to Default
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;