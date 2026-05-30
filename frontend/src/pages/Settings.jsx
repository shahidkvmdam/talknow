import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../config/api'
import { Save, Palette, Globe } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    appName: 'Connect',
    themeColor: '#25D366',
    logoUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false) // In production, check admin role

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await api.getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.updateSettings(null, settings) // Token would be required in production
      alert('Settings updated successfully!')
    } catch (error) {
      alert('Failed to update settings')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">App Settings</h1>

        <div className="card mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <Globe className="text-primary mt-1" size={24} />
            <div>
              <h3 className="font-semibold">Customize App Name</h3>
              <p className="text-sm text-gray-400">Change the name of this application</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">App Name</label>
              <input
                type="text"
                name="appName"
                value={settings.appName}
                onChange={handleChange}
                placeholder="Connect"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Theme Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="themeColor"
                  value={settings.themeColor}
                  onChange={handleChange}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.themeColor}
                  onChange={handleChange}
                  className="input-field flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Logo URL (optional)</label>
              <input
                type="url"
                name="logoUrl"
                value={settings.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="input-field w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="card">
          <div className="flex items-start space-x-3 mb-4">
            <Palette className="text-primary mt-1" size={24} />
            <div>
              <h3 className="font-semibold">Preview</h3>
              <p className="text-sm text-gray-400">See how your app will look</p>
            </div>
          </div>
          
          <div className="bg-surface p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.themeColor }}
              >
                {settings.appName[0]}
              </div>
              <span className="text-xl font-bold" style={{ color: settings.themeColor }}>
                {settings.appName}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="h-10 rounded" style={{ backgroundColor: settings.themeColor + '20' }}></div>
              <div className="h-10 rounded" style={{ backgroundColor: settings.themeColor + '20' }}></div>
              <div className="h-10 rounded" style={{ backgroundColor: settings.themeColor + '20' }}></div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="card mt-6">
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-sm text-gray-400">
            Connect is a stranger chat application that allows you to meet new people,
            make friends, and share messages, images, and audio. All features are
            built with free-tier services to keep costs at $0.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Version: 1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
