const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = {
  // Auth
  login: async (token) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  getMe: async (token) => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  // Profile
  createProfile: async (token, data) => {
    const response = await fetch(`${API_URL}/api/profile/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  updateProfile: async (token, data) => {
    const response = await fetch(`${API_URL}/api/profile/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  getProfile: async (token, userId) => {
    const response = await fetch(`${API_URL}/api/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  updateOnlineStatus: async (token, isOnline) => {
    const response = await fetch(`${API_URL}/api/profile/online`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isOnline })
    })
    return response.json()
  },

  // Search
  searchUsers: async (token, params) => {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`${API_URL}/api/search?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  getUserById: async (token, uniqueId) => {
    const response = await fetch(`${API_URL}/api/search/id/${uniqueId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  getSuggestions: async (token, limit = 10) => {
    const response = await fetch(`${API_URL}/api/search/suggestions?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  // Messages
  getConversation: async (token, userId, page = 1, limit = 50) => {
    const response = await fetch(`${API_URL}/api/messages/conversation/${userId}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  getConversations: async (token) => {
    const response = await fetch(`${API_URL}/api/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  deleteMessage: async (token, messageId) => {
    const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  // Friends
  sendFriendRequest: async (token, userId) => {
    const response = await fetch(`${API_URL}/api/friends/request/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  acceptFriendRequest: async (token, friendshipId) => {
    const response = await fetch(`${API_URL}/api/friends/accept/${friendshipId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  rejectFriendRequest: async (token, friendshipId) => {
    const response = await fetch(`${API_URL}/api/friends/reject/${friendshipId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  getPendingRequests: async (token) => {
    const response = await fetch(`${API_URL}/api/friends/requests/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  getFriends: async (token) => {
    const response = await fetch(`${API_URL}/api/friends`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  removeFriend: async (token, friendId) => {
    const response = await fetch(`${API_URL}/api/friends/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  // Upload
  uploadImage: async (token, file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch(`${API_URL}/api/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    return response.json()
  },

  uploadAudio: async (token, file) => {
    const formData = new FormData()
    formData.append('audio', file)
    
    const response = await fetch(`${API_URL}/api/upload/audio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    return response.json()
  },

  updateProfilePicture: async (token, file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch(`${API_URL}/api/upload/profile-picture`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    return response.json()
  },

  // Settings
  getSettings: async () => {
    const response = await fetch(`${API_URL}/api/settings`)
    return response.json()
  },

  updateSettings: async (token, data) => {
    const response = await fetch(`${API_URL}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}
