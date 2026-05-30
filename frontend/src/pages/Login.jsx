import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../config/firebase'
import { RecaptchaVerifier } from 'firebase/auth'
import { Phone, Mail } from 'lucide-react'

const Login = () => {
  const [method, setMethod] = useState('google') // 'google' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { loginWithGoogle, loginWithPhone, verifyPhoneCode } = useAuth()
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const result = await loginWithGoogle()
    
    if (result.success) {
      if (result.hasProfile) {
        navigate('/')
      } else {
        navigate('/register')
      }
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handlePhoneLogin = async () => {
    if (!phoneNumber) {
      setError('Please enter phone number')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Initialize recaptcha verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      })
      
      const result = await loginWithPhone(phoneNumber, recaptchaVerifier)
      
      if (result.success) {
        setConfirmationResult(result.confirmationResult)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Phone login error:', error)
      setError(error.message || 'Failed to send OTP')
    }
    
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) {
      setError('Please enter OTP')
      return
    }

    setLoading(true)
    setError('')
    
    const result = await verifyPhoneCode(confirmationResult, otp)
    
    if (result.success) {
      if (result.hasProfile) {
        navigate('/')
      } else {
        navigate('/register')
      }
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">Connect</h1>
        <p className="text-gray-400 text-center mb-8">Chat with strangers around the world</p>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setMethod('google')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              method === 'google' ? 'bg-primary text-white' : 'bg-chat text-gray-300'
            }`}
          >
            <Mail size={20} className="mx-auto" />
          </button>
          <button
            onClick={() => setMethod('phone')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              method === 'phone' ? 'bg-primary text-white' : 'bg-chat text-gray-300'
            }`}
          >
            <Phone size={20} className="mx-auto" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {method === 'google' ? (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        ) : (
          <>
            {!confirmationResult ? (
              <div className="space-y-4">
                <input
                  type="tel"
                  placeholder="Phone number (+1234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input-field w-full"
                />
                <div id="recaptcha-container"></div>
                <button
                  onClick={handlePhoneLogin}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field w-full"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Login
