import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { api } from '../config/api'
import { Search as SearchIcon, UserPlus, MessageCircle, Filter } from 'lucide-react'

const Search = () => {
  const { user, token } = useAuth()
  const { onlineUsers } = useSocket()
  const navigate = useNavigate()
  
  const [searchType, setSearchType] = useState('id') // id, name, hobby, location
  const [query, setQuery] = useState('')
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      const data = await api.getSuggestions(token)
      setSuggestions(data.profiles || [])
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    }
  }

  const handleSearch = async () => {
    if (!query && !city && !state && !ageMin && !ageMax) {
      return
    }

    setLoading(true)
    try {
      const params = {}
      
      if (searchType === 'id') {
        const data = await api.getUserById(token, query)
        setResults(data.profile ? [data.profile] : [])
      } else {
        if (searchType === 'name') params.name = query
        if (searchType === 'hobby') params.hobby = query
        if (city) params.city = city
        if (state) params.state = state
        if (ageMin) params.ageMin = ageMin
        if (ageMax) params.ageMax = ageMax
        
        const data = await api.searchUsers(token, params)
        setResults(data.profiles || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const startChat = (userId) => {
    navigate(`/chat/${userId}`)
  }

  const sendFriendRequest = async (userId) => {
    try {
      await api.sendFriendRequest(token, userId)
      alert('Friend request sent!')
    } catch (error) {
      alert('Failed to send friend request')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Find Strangers</h1>

        {/* Search Type Selector */}
        <div className="flex space-x-2 mb-4">
          {['id', 'name', 'hobby', 'location'].map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                searchType === type ? 'bg-primary text-white' : 'bg-chat text-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="card mb-6">
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder={
                searchType === 'id' ? 'Enter Connect ID (e.g., CONNECT123)' :
                searchType === 'name' ? 'Search by name' :
                searchType === 'hobby' ? 'Search by hobby' :
                'Search...'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <SearchIcon size={20} />
              <span>Search</span>
            </button>
          </div>

          {/* Advanced Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4"
          >
            <Filter size={20} />
            <span>Advanced Filters</span>
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-chat rounded-lg">
              <div>
                <label className="block text-sm mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="input-field w-full"
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm mb-1">Age Min</label>
                  <input
                    type="number"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    placeholder="Min"
                    className="input-field w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1">Age Max</label>
                  <input
                    type="number"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    placeholder="Max"
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Search Results ({results.length})</h2>
            <div className="space-y-3">
              {results.map((profile) => (
                <div
                  key={profile._id}
                  className="flex items-center space-x-4 p-3 rounded-lg bg-chat"
                >
                  <div className="relative">
                    <img
                      src={profile.profilePic || `https://ui-avatars.com/api/?name=${profile.name}&background=25D366&color=fff`}
                      alt={profile.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {onlineUsers.has(profile.userId.toString()) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-chat"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{profile.name}</h3>
                    <p className="text-sm text-gray-400">ID: {profile.uniqueId}</p>
                    <p className="text-sm text-gray-400">
                      {profile.city && `${profile.city}, `}
                      {profile.state && `${profile.state}`}
                      {profile.age && ` • ${profile.age} years`}
                    </p>
                    {profile.hobbies && profile.hobbies.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {profile.hobbies.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startChat(profile.userId)}
                      className="p-2 bg-primary rounded-lg hover:bg-secondary transition-colors"
                      title="Start Chat"
                    >
                      <MessageCircle size={20} />
                    </button>
                    <button
                      onClick={() => sendFriendRequest(profile.userId)}
                      className="p-2 bg-surface rounded-lg hover:bg-chat transition-colors"
                      title="Add Friend"
                    >
                      <UserPlus size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && results.length === 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Suggested People</h2>
            <div className="space-y-3">
              {suggestions.map((profile) => (
                <div
                  key={profile._id}
                  className="flex items-center space-x-4 p-3 rounded-lg bg-chat"
                >
                  <div className="relative">
                    <img
                      src={profile.profilePic || `https://ui-avatars.com/api/?name=${profile.name}&background=25D366&color=fff`}
                      alt={profile.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {onlineUsers.has(profile.userId.toString()) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-chat"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{profile.name}</h3>
                    <p className="text-sm text-gray-400">ID: {profile.uniqueId}</p>
                  </div>
                  
                  <button
                    onClick={() => startChat(profile.userId)}
                    className="btn-primary"
                  >
                    Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
