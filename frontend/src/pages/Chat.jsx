import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { api } from '../config/api'
import { Send, Image, Mic, Phone, MoreVertical, ArrowLeft } from 'lucide-react'

const Chat = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user, token, profile } = useAuth()
  const { socket } = useSocket()
  
  const [messages, setMessages] = useState([])
  const [otherProfile, setOtherProfile] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [showCallUI, setShowCallUI] = useState(false)
  
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadMessages()
    loadOtherProfile()
    
    // Join room
    const roomUsers = [user?.id, userId].sort()
    const roomId = `chat_${roomUsers[0]}_${roomUsers[1]}`
    socket?.emit('join_room', roomId)

    // Socket listeners
    socket?.on('receive_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    socket?.on('user_typing', ({ senderId, isTyping }) => {
      if (senderId === userId) {
        setIsTyping(isTyping)
      }
    })

    return () => {
      socket?.emit('leave_room', roomId)
      socket?.off('receive_message')
      socket?.off('user_typing')
    }
  }, [userId, user, socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const data = await api.getConversation(token, userId)
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOtherProfile = async () => {
    try {
      const data = await api.getProfile(token, userId)
      setOtherProfile(data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const roomUsers = [user?.id, userId].sort()
    const roomId = `chat_${roomUsers[0]}_${roomUsers[1]}`

    socket?.emit('send_message', {
      senderId: user?.id,
      receiverId: userId,
      content: newMessage,
      type: 'text'
    })

    setNewMessage('')
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const uploadResult = await api.uploadImage(token, file)
      
      const roomUsers = [user?.id, userId].sort()
      const roomId = `chat_${roomUsers[0]}_${roomUsers[1]}`

      socket?.emit('send_message', {
        senderId: user?.id,
        receiverId: userId,
        type: 'image',
        mediaUrl: uploadResult.url
      })
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
  }

  const handleAudioRecord = async () => {
    // This would implement audio recording
    alert('Audio recording feature - to be implemented with MediaRecorder API')
  }

  const handleStartCall = () => {
    setShowCallUI(true)
    // WebRTC call setup would go here
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <div className="bg-surface border-b border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-chat rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          
          <img
            src={otherProfile?.profilePic || `https://ui-avatars.com/api/?name=${otherProfile?.name || 'User'}&background=25D366&color=fff`}
            alt={otherProfile?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          
          <div className="flex-1">
            <h2 className="font-semibold">{otherProfile?.name || 'Unknown'}</h2>
            <p className="text-xs text-gray-400">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
          
          <button
            onClick={handleStartCall}
            className="p-2 hover:bg-chat rounded-lg transition-colors text-primary"
          >
            <Phone size={24} />
          </button>
          
          <button className="p-2 hover:bg-chat rounded-lg transition-colors">
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSent = msg.senderId === user?.id
              return (
                <div
                  key={msg._id}
                  className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`message-bubble ${
                      isSent ? 'message-sent' : 'message-received'
                    }`}
                  >
                    {msg.type === 'text' && (
                      <p>{msg.content}</p>
                    )}
                    {msg.type === 'image' && (
                      <img
                        src={msg.mediaUrl}
                        alt="Shared image"
                        className="max-w-full rounded-lg"
                      />
                    )}
                    {msg.type === 'audio' && (
                      <audio controls src={msg.mediaUrl} className="max-w-full" />
                    )}
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-surface border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-chat rounded-lg transition-colors text-gray-400"
            >
              <Image size={24} />
            </button>
            
            <button
              type="button"
              onClick={handleAudioRecord}
              className="p-2 hover:bg-chat rounded-lg transition-colors text-gray-400"
            >
              <Mic size={24} />
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="input-field flex-1"
            />
            
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="btn-primary p-2"
            >
              <Send size={24} />
            </button>
          </form>
        </div>
      </div>

      {/* Call UI (placeholder) */}
      {showCallUI && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">{otherProfile?.name?.[0] || '?'}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{otherProfile?.name}</h2>
            <p className="text-gray-400 mb-8">Calling...</p>
            <button
              onClick={() => setShowCallUI(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
