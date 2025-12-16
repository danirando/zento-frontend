import { useState, useRef, useEffect } from 'react'
import { ZentoLogo } from '../components/Icons'
import api from '../lib/axios' // Il tuo modulo Axios

// --- Icone ---
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
)

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6"></path>
  </svg>
)

// --- Componente Dashboard ---
function Dashboard() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  // STATI AGGIUNTI PER IL CARICAMENTO INIZIALE DEI DATI E L'ERRORE 404
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState(null)
  const [userData, setUserData] = useState(null) // Per memorizzare i dati utente
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // EFFECT 1: Gestisce lo scroll ai messaggi più recenti
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // EFFECT 2: Caricamento Dati Dashboard (Risoluzione Errore 404)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Chiamata all'endpoint API CORRETTO su Laravel
        // Questo risolve l'errore GET /dashboard 404
        const response = await api.get('/api/dashboard'); 
        
        setUserData(response.data); 
      } catch (error) {
        console.error("Errore nel caricamento dati iniziali:", error);
        setDashboardError("Impossibile caricare i dati. Errore: " + (error.response?.status || 'Network Error'));
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [])

  const suggestedPrompts = [
    "Spiegami come funziona l'intelligenza artificiale",
    "Aiutami a scrivere un'email professionale",
    "Dammi idee per un progetto creativo",
    "Riassumi le ultime notizie di tecnologia"
  ]

  // --- Funzione Principale di Invio Messaggio (Logica API) ---
  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
        // Chiamata all'endpoint Laravel /api/chat
        const response = await api.post('/api/chat', {
            message: text.trim(),
        });
        
        const aiResponseData = response.data;
        
        // Cerchiamo il testo della risposta nel campo 'reply' (come definito nel AiController corretto)
        const aiResponseText = aiResponseData.reply || aiResponseData.message_text || "Risposta AI non formattata."; 

        const aiMessage = {
            id: Date.now() + 1,
            text: aiResponseText, 
            sender: 'ai',
            timestamp: new Date()
        }
        
        setMessages(prev => [...prev, aiMessage])

    } catch (error) {
        console.error("Errore durante l'invio del messaggio AI:", error);
        
        const errorMessage = {
            id: Date.now() + 1,
            text: `Errore: Impossibile ottenere una risposta dal server. Stato: ${error.response?.status || 'Network Error'}`,
            sender: 'error',
            timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        
    } finally {
        setIsTyping(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const handlePromptClick = (prompt) => {
    handleSendMessage(prompt)
  }

  // Visualizzazione di Caricamento e Errore Iniziale
  if (loadingDashboard) {
    return (
      <div className="dashboard-loading">
        <ZentoLogo />
        <p>Caricamento dashboard...</p>
      </div>
    );
  }

  if (dashboardError) {
     return (
      <div className="dashboard-error">
        <h1>Errore di Connessione</h1>
        <p>{dashboardError}</p>
        <p>Riprova il login o verifica che il backend Laravel sia attivo.</p>
      </div>
    );
  }


  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="logo-container-small">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h1 className="dashboard-title">Zento</h1>
            {/* Visualizzazione dati utente di prova */}
            {userData && <span style={{marginLeft: '10px', fontSize: '0.8rem', color: 'var(--color-text-secondary)'}}>Benvenuto, {userData.name || 'Utente'}</span>}
          </div>
          <button className="btn-secondary">Nuova Chat</button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <SparklesIcon />
              </div>
              <h2 className="welcome-title">Benvenuto su Zento</h2>
              <p className="welcome-subtitle">
                La tua assistente AI personale. Come posso aiutarti oggi?
              </p>
              
              <div className="suggested-prompts">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="prompt-card"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender === 'user' ? 'message-user' : message.sender === 'error' ? 'message-error' : 'message-ai'}`}
                >
                  <div className="message-content">
                    {message.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message message-ai">
                  <div className="message-content typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              className="chat-input"
              placeholder="Scrivi un messaggio..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />
            <button
              type="submit"
              className="btn-send"
              disabled={!inputValue.trim() || isTyping}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Dashboard