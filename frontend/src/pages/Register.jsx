import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../config/api'
import { Camera, Save } from 'lucide-react'

const Register = () => {
  const { token, updateProfile } = useAuth()
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
  const [error, setError] = useState('')

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let profilePicUrl = null
      
      // Upload profile picture if selected
      if (profilePic) {
        const uploadResult = await api.updateProfilePicture(token, profilePic)
        profilePicUrl = uploadResult.profilePic
      }

      // Create profile
      const profileData = {
        name: formData.name,
        age: parseInt(formData.age),
        city: formData.city,
        state: formData.state,
        country: formData.country,
        hobbies: formData.hobbies.split(',').map(h => h.trim()).filter(h => h),
        bio: formData.bio,
        ...(profilePicUrl && { profilePic: profilePicUrl })
      }

      const result = await api.createProfile(token, profileData)
      
      if (result.profile) {
        updateProfile(result.profile)
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Failed to create profile')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">Create Your Profile</h1>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

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
            <p className="text-sm text-gray-400">Add a profile picture</p>
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
            <span>{loading ? 'Creating Profile...' : 'Create Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register
