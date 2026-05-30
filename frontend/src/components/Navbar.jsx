import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, Search, Users, Settings, LogOut, User } from 'lucide-react'

const Navbar = () => {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/friends', icon: Users, label: 'Friends' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="bg-surface border-b border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          Connect
        </Link>

        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-chat'
                }`}
              >
                <Icon size={20} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center space-x-4">
          {profile && (
            <div className="flex items-center space-x-2">
              <img
                src={profile.profilePic || `https://ui-avatars.com/api/?name=${profile.name}&background=25D366&color=fff`}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="hidden sm:inline text-sm">{profile.name}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-chat rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
