import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../config/api'
import { Camera, Save, Copy, Check } from 'lucide-react'

const Profile = () => {
  const { user, token, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    city: '',
    state: '',
    country: 'USA',
    hobbies: '',
    bio: ''
  })
  
  const [profilePic, setProfilePic] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || 'USA',
        hobbies: profile.hobbies?.join(', ') || '',
        bio: profile.bio || ''
      })
      setPreviewUrl(profile.profilePic)
    }
  }, [profile])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePic(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleCopyId = () => {
    if (profile?.uniqueId) {
      navigator.clipboard.writeText(profile.uniqueId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let profilePicUrl = previewUrl
      
      // Upload new profile picture if changed
      if (profilePic) {
        const uploadResult = await api.updateProfilePicture(token, profilePic)
        profilePicUrl = uploadResult.profilePic
      }

      // Update profile
      const profileData = {
        name: formData.name,
        age: parseInt(formData.age),
        city: formData.city,
        state: formData.state,
        country: formData.country,
        hobbies: formData.hobbies.split(',').map(h => h.trim()).filter(h => h),
        bio: formData.bio,
        profilePic: profilePicUrl
      }

      const result = await api.updateProfile(token, profileData)
      
      if (result.profile) {
        updateProfile(result.profile)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      alert('Failed to update profile')
    }

    setLoading(false)
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please create your profile first</h2>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary"
          >
            Create Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <img
                src={previewUrl || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=25D366&color=fff&size=128`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-primary"
              />
              <label className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer hover:bg-secondary transition-colors">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Unique ID */}
          <div className="bg-chat p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">Your Connect ID</label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-surface px-3 py-2 rounded text-primary font-mono">
                {profile.uniqueId}
              </code>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-2 bg-surface rounded-lg hover:bg-chat transition-colors"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Share this ID with others to let them find you</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className="input-field w-full"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium mb-2">Age *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="13"
              max="100"
              placeholder="Your age"
              className="input-field w-full"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Hobbies */}
          <div>
            <label className="block text-sm font-medium mb-2">Hobbies (comma separated)</label>
            <input
              type="text"
              name="hobbies"
              value={formData.hobbies}
              onChange={handleChange}
              placeholder="gaming, music, travel, reading"
              className="input-field w-full"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others about yourself..."
              rows="3"
              className="input-field w-full resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Save size={20} />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile
