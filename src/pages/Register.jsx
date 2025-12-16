import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { GoogleIcon, AppleIcon, MailIcon, LockIcon, EyeIcon, UserIcon, ZentoLogo } from '../components/Icons'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // 1. Get CSRF Cookie
      await api.get('/sanctum/csrf-cookie')
      
      // 2. Register
      const response = await api.post('/register', formData)
      console.log('Registrazione avvenuta con successo!', response.data);

      // 3. Navigate to dashboard
      navigate('/dashboard') 
      
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors)
      } else {
        console.error('Registration failed:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card-login">
      <ZentoLogo />
      
      <div className="text-center mb-6">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Crea un account</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Inizia la tua esperienza su Zento
        </p>
      </div>

      <button className="btn-outline">
        <GoogleIcon />
        Iscriviti con Google
      </button>

      <div className="divider">Oppure con email</div>

      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <div className="input-group">
          <label className="input-label">Nome Completo</label>
          <div className="input-wrapper">
            <div className="input-icon"><UserIcon /></div>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              placeholder="Mario Rossi" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          {errors.name && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name[0]}</p>}
        </div>

        {/* Email Field */}
        <div className="input-group">
          <label className="input-label">Email</label>
          <div className="input-wrapper">
            <div className="input-icon"><MailIcon /></div>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              placeholder="nome@esempio.it" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {errors.email && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email[0]}</p>}
        </div>

        {/* Password Field */}
        <div className="input-group">
          <label className="input-label">Password</label>
          <div className="input-wrapper">
            <div className="input-icon"><LockIcon /></div>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {errors.password && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password[0]}</p>}
        </div>

        {/* Confirm Password Field */}
        <div className="input-group">
          <label className="input-label">Conferma Password</label>
          <div className="input-wrapper">
            <div className="input-icon"><LockIcon /></div>
            <input 
              type="password" 
              name="password_confirmation"
              className="form-input" 
              placeholder="••••••••" 
              value={formData.password_confirmation}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary mb-6" 
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? 'Registrazione...' : 'Registrati'}
        </button>

        <p className="text-center" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Hai già un account? <Link to="/" style={{ fontWeight: 600 }}>Accedi</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
