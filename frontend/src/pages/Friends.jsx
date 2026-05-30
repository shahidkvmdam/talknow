import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { api } from '../config/api'
import { UserPlus, UserCheck, UserX, MessageCircle, Users } from 'lucide-react'

const Friends = () => {
  const { user, token } = useAuth()
  const { onlineUsers } = useSocket()
  const navigate = useNavigate()
  
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [activeTab, setActiveTab] = useState('friends') // friends, requests
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'friends') {
        const data = await api.getFriends(token)
        setFriends(data.friends || [])
      } else {
        const data = await api.getPendingRequests(token)
        setPendingRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (friendshipId) => {
    try {
      await api.acceptFriendRequest(token, friendshipId)
      loadData()
    } catch (error) {
      alert('Failed to accept request')
    }
  }

  const handleRejectRequest = async (friendshipId) => {
    try {
      await api.rejectFriendRequest(token, friendshipId)
      loadData()
    } catch (error) {
      alert('Failed to reject request')
    }
  }

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return
    
    try {
      await api.removeFriend(token, friendId)
      loadData()
    } catch (error) {
      alert('Failed to remove friend')
    }
  }

  const startChat = (userId) => {
    navigate(`/chat/${userId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'friends' ? 'bg-primary text-white' : 'bg-chat text-gray-300'
            }`}
          >
            <Users size={20} />
            <span>My Friends</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${
              activeTab === 'requests' ? 'bg-primary text-white' : 'bg-chat text-gray-300'
            }`}
          >
            <UserPlus size={20} />
            <span>Requests</span>
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : activeTab === 'friends' ? (
          <div className="card">
            {friends.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No friends yet</p>
                <button
                  onClick={() => navigate('/search')}
                  className="btn-primary mt-4"
                >
                  Find People
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-chat"
                  >
                    <div className="relative">
                      <img
                        src={friend.profilePic || `https://ui-avatars.com/api/?name=${friend.name}&background=25D366&color=fff`}
                        alt={friend.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {onlineUsers.has(friend.userId.toString()) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-chat"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{friend.name}</h3>
                      <p className="text-sm text-gray-400">
                        {friend.city && `${friend.city}, `}
                        {friend.state && `${friend.state}`}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startChat(friend.userId)}
                        className="p-2 bg-primary rounded-lg hover:bg-secondary transition-colors"
                        title="Chat"
                      >
                        <MessageCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.userId)}
                        className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        title="Remove Friend"
                      >
                        <UserX size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
                <p>No pending friend requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-chat"
                  >
                    <img
                      src={request.profile?.profilePic || `https://ui-avatars.com/api/?name=${request.profile?.name || 'User'}&background=25D366&color=fff`}
                      alt={request.profile?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{request.profile?.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-400">
                        Wants to be your friend
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request._id)}
                        className="p-2 bg-primary rounded-lg hover:bg-secondary transition-colors"
                        title="Accept"
                      >
                        <UserCheck size={20} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        title="Reject"
                      >
                        <UserX size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Friends
