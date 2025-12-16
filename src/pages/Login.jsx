import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleIcon, AppleIcon, MailIcon, LockIcon, EyeIcon, ZentoLogo } from '../components/Icons'
import api from '../lib/axios'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

// Login.jsx

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsLoading(true)
  setError('')

  try {
    // 1. Get CSRF Cookie
    await api.get('/sanctum/csrf-cookie')
    
    // 2. Login
    // 🚨 CORREZIONE QUI: AGGIUNGI IL PREFISSO /api 🚨
    await api.post('/api/login', { 
      email, 
      password,
      remember: rememberMe 
    })

    // 3. Navigate to dashboard
    console.log('Login effettuato!');
    navigate('/dashboard')
    
  } catch (error) {
    // ... (gestione errore)
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="card-login">
      <ZentoLogo />
      
      <div className="text-center mb-6">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bentornato su Zento</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Accedi per continuare la conversazione
        </p>
      </div>

      <button className="btn-outline">
        <GoogleIcon />
        Continua con Google
      </button>
      
      <button className="btn-outline">
        <AppleIcon />
        Continua con Apple
      </button>

      <div className="divider">Oppure con email</div>

      <form onSubmit={handleSubmit}>
        {error && (
            <div style={{ 
                backgroundColor: '#fee2e2', 
                color: '#b91c1c', 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                marginBottom: '1rem',
                fontSize: '0.9rem',
                textAlign: 'center'
            }}>
                {error}
            </div>
        )}

        <div className="input-group">
          <label className="input-label">Email</label>
          <div className="input-wrapper">
            <div className="input-icon"><MailIcon /></div>
            <input 
              type="email" 
              className="form-input" 
              placeholder="nome@esempio.it" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <div className="input-wrapper">
            <div className="input-icon"><LockIcon /></div>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              style={{ 
                position: 'absolute', 
                right: '0.75rem', 
                color: 'var(--color-text-muted)',
                background: 'none'
              }}
            >
              <EyeIcon />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
            />
            Ricordami
          </label>
          <a href="#" style={{ fontSize: '0.9rem' }}>Password dimenticata?</a>
        </div>

        <button 
          type="submit" 
          className="btn-primary mb-6"
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? 'Accesso in corso...' : 'Accedi'}
        </button>

        <p className="text-center" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Non hai un account? <Link to="/register" style={{ fontWeight: 600 }}>Registrati</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
