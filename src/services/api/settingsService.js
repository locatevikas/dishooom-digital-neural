const STORAGE_KEY = 'dishooom_settings';

const defaultSettings = {
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@dishooom.com',
    phone: '+1 (555) 123-4567',
    businessName: 'Dishooom',
    businessType: 'Chemical Product Manufacturing',
    businessAddress: '123 Business St, City, State 12345',
    taxId: 'TX123456789'
  },
  notifications: {
    email: {
      orderUpdates: true,
      lowStock: true,
      weeklyReports: false,
      customerMessages: true,
      systemAlerts: true
    },
    push: {
      orderUpdates: false,
      lowStock: true,
      customerMessages: false,
      systemAlerts: true
    },
    system: {
      soundEnabled: true,
      desktopNotifications: false,
      emailDigest: 'weekly'
    }
  },
  data: {
    autoBackup: true,
    backupFrequency: 'weekly',
    dataRetention: '1year',
    exportFormat: 'csv',
    syncEnabled: false
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    ipWhitelist: false
  },
  appearance: {
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    compactMode: false,
    showAnimations: true
  }
};

const settingsService = {
  async getSettings() {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const settings = stored ? JSON.parse(stored) : defaultSettings;
          resolve({ ...defaultSettings, ...settings });
        } catch (error) {
          resolve(defaultSettings);
        }
      }, 200);
    });
  },

  async updateSettings(section, data) {
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const currentSettings = await this.getSettings();
          const updatedSettings = {
            ...currentSettings,
            [section]: { ...currentSettings[section], ...data }
          };
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
          resolve(updatedSettings);
        } catch (error) {
          reject(new Error('Failed to update settings'));
        }
      }, 300);
    });
  },

  async resetSettings(section = null) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          if (section) {
            const currentSettings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const updatedSettings = {
              ...currentSettings,
              [section]: defaultSettings[section]
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
            resolve(updatedSettings);
          } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
            resolve(defaultSettings);
          }
        } catch (error) {
          resolve(defaultSettings);
        }
      }, 200);
    });
  },

  async exportSettings() {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        try {
          const settings = await this.getSettings();
          const dataStr = JSON.stringify(settings, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          
          const link = document.createElement('a');
          link.href = URL.createObjectURL(dataBlob);
          link.download = `dishooom-settings-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          
          resolve({ success: true });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  },

  async importSettings(file) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const importedSettings = JSON.parse(e.target.result);
              const validatedSettings = { ...defaultSettings, ...importedSettings };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedSettings));
              resolve(validatedSettings);
            } catch (error) {
              reject(new Error('Invalid settings file format'));
            }
          };
          reader.readAsText(file);
        } catch (error) {
          reject(new Error('Failed to import settings'));
        }
      }, 500);
    });
  }
};

export default settingsService;