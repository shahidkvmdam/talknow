import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { api } from '../config/api'
import { MessageCircle, UserPlus, Search } from 'lucide-react'

const Home = () => {
  const { user, profile } = useAuth()
  const { onlineUsers } = useSocket()
  const navigate = useNavigate()
  
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    try {
      const data = await api.getConversations(user?.id)
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please create your profile first</h2>
          <button
            onClick={() => navigate('/profile')}
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
      
      <div className="max-w-4xl mx-auto p-4">
        {/* Welcome Section */}
        <div className="card mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome, {profile.name}!</h1>
          <p className="text-gray-400">Your ID: {profile.uniqueId}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => navigate('/search')}
            className="card hover:bg-chat transition-colors text-left"
          >
            <Search className="text-primary mb-2" size={32} />
            <h3 className="font-semibold">Find Strangers</h3>
            <p className="text-sm text-gray-400">Search by ID, hobby, location</p>
          </button>
          
          <button
            onClick={() => navigate('/friends')}
            className="card hover:bg-chat transition-colors text-left"
          >
            <UserPlus className="text-primary mb-2" size={32} />
            <h3 className="font-semibold">Friends</h3>
            <p className="text-sm text-gray-400">View and manage friends</p>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="card hover:bg-chat transition-colors text-left"
          >
            <MessageCircle className="text-primary mb-2" size={32} />
            <h3 className="font-semibold">Edit Profile</h3>
            <p className="text-sm text-gray-400">Update your information</p>
          </button>
        </div>

        {/* Recent Conversations */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Chats</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <button
                onClick={() => navigate('/search')}
                className="btn-primary mt-4"
              >
                Find People to Chat
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/chat/${conv._id}`)}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-chat cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <img
                      src={conv.profile?.profilePic || `https://ui-avatars.com/api/?name=${conv.profile?.name || 'User'}&background=25D366&color=fff`}
                      alt={conv.profile?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {onlineUsers.has(conv._id.toString()) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{conv.profile?.name || 'Unknown'}</h3>
                      <span className="text-xs text-gray-400">
                        {new Date(conv.lastMessageTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {conv.lastMessageType === 'image' ? '📷 Image' : 
                       conv.lastMessageType === 'audio' ? '🎙️ Audio' : 
                       conv.lastMessage}
                    </p>
                  </div>
                  
                  {conv.unreadCount > 0 && (
                    <div className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
