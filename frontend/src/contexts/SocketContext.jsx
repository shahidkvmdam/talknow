import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')
      
      newSocket.on('connect', () => {
        console.log('Socket connected')
        newSocket.emit('user_join', user.id)
      })

      newSocket.on('user_online', ({ userId }) => {
        setOnlineUsers(prev => new Set([...prev, userId.toString()]))
      })

      newSocket.on('user_offline', ({ userId }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId.toString())
          return newSet
        })
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [user])

  const value = {
    socket,
    onlineUsers
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
