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

const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
)

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
)

const BookmarkIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path>
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
)

// --- Componente Dashboard ---
function Dashboard() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef(null)
  
  // STATI AGGIUNTI PER IL CARICAMENTO INIZIALE DEI DATI E L'ERRORE 404
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState(null)
  const [userData, setUserData] = useState(null)
  
  // STATI PER IL FALLBACK INTELLIGENTE
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentSuggestions, setCurrentSuggestions] = useState([])
  const inactivityTimerRef = useRef(null)

  // STATI PER LA CRONOLOGIA E SIDEBAR
  const [conversations, setConversations] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState(null)
  const [isCooldown, setIsCooldown] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // EFFECT 1: Gestisce lo scroll ai messaggi più recenti
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // EFFECT 2: Caricamento Dati Dashboard
  useEffect(() => {
    // ... (omitted for brevity in matches if possible, but I'll keep the logic)
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/dashboard'); 
        setUserData(response.data); 
      } catch (error) {
        setDashboardError("Impossibile caricare i dati.");
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchDashboardData();

    // Carica anche la cronologia
    fetchConversations();
  }, [])

  const fetchConversations = async () => {
    setLoadingHistory(true);
    try {
      setHistoryError(null);
      const response = await api.get('/api/chat/history');
      console.log("History API Response:", response.data);
      
      let data = null;
      
      // Tentativi di estrazione dati in ordine di probabilità
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && typeof response.data === 'object') {
        const possibleKeys = ['conversations', 'history', 'data', 'items', 'list'];
        for (const key of possibleKeys) {
          if (Array.isArray(response.data[key])) {
            data = response.data[key];
            break;
          }
        }
        
        if (!data) {
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              data = response.data[key];
              break;
            }
          }
        }
      }
      
      if (data) {
        setConversations(data);
      } else {
        console.warn("Nessun array di conversazioni trovato nella risposta");
        // Se la risposta è comunque un successo ma non troviamo array, resettiamo se sembra vuota
        const isEmptyResponse = response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0;
        if (isEmptyResponse) {
          setConversations([]);
        }
      }
    } catch (error) {
      console.error("Errore caricamento cronologia:", error);
      setHistoryError("Errore nel caricamento della cronologia. Verifica l'endpoint /api/chat/history.");
    } finally {
      setLoadingHistory(false);
    }
  }

  // LOGICA FALLBACK: Timer di inattività
  const startInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    inactivityTimerRef.current = setTimeout(() => {
      if (messages.length > 0 && !isTyping) {
        handleSmartFallback("inactivity")
      }
    }, 60000) // 1 minuto di inattività
  }

  useEffect(() => {
    startInactivityTimer()
    return () => { if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current) }
  }, [messages, isTyping])

  const handleSmartFallback = (type) => {
    const fallbackSuggestions = {
      vague: [
        "Puoi farmi un esempio?",
        "Spiegamelo come se avessi 5 anni",
        "Cosa intendi con questa frase?",
        "Parliamo di un altro argomento"
      ],
      inactivity: [
        "Parlami delle potenzialità di Zento",
        "Cosa puoi fare per aiutarmi oggi?",
        "Raccontami una curiosità",
        "Pianifica la mia giornata"
      ]
    }

    setShowSuggestions(true)
    setCurrentSuggestions(fallbackSuggestions[type] || [])
  }

  const suggestedPrompts = [
    "Spiegami come funziona l'intelligenza artificiale",
    "Aiutami a scrivere un'email professionale",
    "Dammi idee per un progetto creativo",
    "Riassumi le ultime notizie di tecnologia"
  ]

  // --- Funzione Principale di Invio Messaggio (Logica API) ---
  const handleSendMessage = async (text) => {
    if (!text.trim() || isTyping) return

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    const isNewConversation = messages.length === 0;

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setShowSuggestions(false)
    setIsTyping(true)

    try {
        const response = await api.post('/api/chat', { 
            message: text.trim(),
            conversation_id: activeConversationId 
        });
        
        const aiResponseData = response.data;
        const aiResponseText = aiResponseData.reply || "Risposta AI non ricevuta."; 

        // Se riceviamo un titolo dal backend (nuovo o aggiornato), aggiorniamo la lista locale
        if (aiResponseData.title) {
            setConversations(prev => {
                const existing = prev.find(c => c.id === (activeConversationId || aiResponseData.conversation_id));
                if (existing) {
                    return prev.map(c => c.id === existing.id ? { ...c, title: aiResponseData.title } : c);
                } else {
                    // Se è una nuova chat che non era ancora in lista
                    return [{
                        id: aiResponseData.conversation_id,
                        title: aiResponseData.title,
                        created_at: new Date().toISOString()
                    }, ...prev];
                }
            });
        }

        // Se è una nuova conversazione, salviamo l'ID
        if (!activeConversationId && aiResponseData.conversation_id) {
            setActiveConversationId(aiResponseData.conversation_id);
        }

        const aiMessage = {
            id: Date.now() + 1,
            text: aiResponseText, 
            sender: 'ai',
            timestamp: new Date()
        }
        
        setMessages(prev => [...prev, aiMessage])

        // Controllo "Vaga o non pertinente"
        const vaguePatterns = ["non ho capito", "puoi ripetere", "non sono sicuro", "spiegati meglio", "scusa, ma"]
        const lowerText = aiResponseText.toLowerCase()
        const isVague = vaguePatterns.some(p => lowerText.includes(p)) || aiResponseText.length < 10

        if (isVague) {
          setTimeout(() => handleSmartFallback("vague"), 800)
        }

        // Non è più necessario chiamare fetchConversations() qui perché abbiamo aggiornato lo stato locale sopra

    } catch (error) {
        let errorMessage = "Errore di connessione.";
        
        // Estraiamo il messaggio di errore specifico dal backend se disponibile
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.status === 429) {
          errorMessage = "Troppe richieste. Per favore attendi qualche secondo prima di riprovare.";
          // Attiviamo il cooldown di 5 secondi
          setIsCooldown(true);
          setCooldownSeconds(5);
          const timer = setInterval(() => {
            setCooldownSeconds(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                setIsCooldown(false);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else if (error.response?.status === 404) {
          errorMessage = "Endpoint non trovato (404). Verifica le rotte backend.";
        }

        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: errorMessage,
            sender: 'error',
            timestamp: new Date()
        }])
    } finally {
        setIsTyping(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isTyping || !inputValue.trim()) return
    handleSendMessage(inputValue)
    inputRef.current?.focus()
  }

  const handlePromptClick = (prompt) => {
    handleSendMessage(prompt)
    setTimeout(() => inputRef.current?.focus(), 0)
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


  const handleNewChat = () => {
    setMessages([])
    setInputValue('')
    setActiveConversationId(null)
    inputRef.current?.focus()
  }

  const loadConversation = async (id) => {
    try {
        // Chiudi la sidebar su mobile quando si seleziona una chat
        if (window.innerWidth <= 1024) {
            setIsSidebarOpen(false);
        }
        setLoadingDashboard(true);
        const response = await api.get(`/api/chat/history/${id}`);
        setMessages(response.data.messages || []);
        setActiveConversationId(id);
    } catch (error) {
        console.error("Errore caricamento conversazione:", error);
    } finally {
        setLoadingDashboard(false);
    }
  }

  const handleSaveMessage = async (messageId) => {
    try {
        await api.post(`/api/chat/save-message`, { message_id: messageId });
        // Feedback visivo (potrebbe essere uno stato per il singolo messaggio)
        setMessages(prev => prev.map(m => 
            m.id === messageId ? { ...m, isSaved: true } : m
        ));
    } catch (error) {
        console.error("Errore salvataggio messaggio:", error);
    }
  }

  const handleClearHistory = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare tutta la cronologia? Questa azione è irreversibile.")) return;

    try {
        await api.delete('/api/chat/history');
        setMessages([]);
        setConversations([]);
        setActiveConversationId(null);
        alert("Cronologia eliminata correttamente.");
    } catch (error) {
        console.error("Errore eliminazione cronologia:", error);
        alert("Si è verificato un errore durante l'eliminazione della cronologia.");
    }
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Overlay per chiudere la sidebar su mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="sidebar-title" style={{ margin: 0 }}>Cronologia</h2>
                <button className="btn-close-sidebar" onClick={() => setIsSidebarOpen(false)}>
                    <CloseIcon />
                </button>
            </div>
            <button className="btn-new-chat-sidebar" onClick={handleNewChat}>
                + Nuova Chat
            </button>
        </div>
        <div className="sidebar-content">
            {loadingHistory ? (
                <div className="sidebar-loading">
                    <div className="skeleton-item"></div>
                    <div className="skeleton-item"></div>
                    <div className="skeleton-item"></div>
                </div>
            ) : historyError ? (
                <p className="sidebar-empty" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{historyError}</p>
            ) : conversations.length === 0 ? (
                <p className="sidebar-empty">Nessuna conversazione recente</p>
            ) : (
                conversations.map((conv, index) => (
                    <button 
                        key={conv.id || index} 
                        className={`sidebar-item ${activeConversationId === conv.id ? 'active' : ''}`}
                        onClick={() => loadConversation(conv.id)}
                    >
                        <HistoryIcon />
                        <span className="sidebar-item-text">
                            {conv.title || conv.subject || conv.first_message || `Chat #${conv.id || index + 1}`}
                        </span>
                    </button>
                ))
            )}
        </div>
        <div className="sidebar-footer">
            <button className="btn-clear-history" onClick={handleClearHistory} title="Svuota Cronologia">
                <TrashIcon />
                <span>Svuota Cronologia</span>
            </button>
            {userData && <p className="user-email">{userData.email || 'utente@zento.it'}</p>}
        </div>
      </aside>

      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
            <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="btn-sidebar-toggle" onClick={toggleSidebar}>
                    <MenuIcon />
                </button>
                <div className="logo-container-small">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                </div>
                <h1 className="dashboard-title">Zento</h1>
                {userData && <span className="welcome-tag">Benvenuto, {userData.name || 'Utente'}</span>}
            </div>
            <button className="btn-secondary" onClick={handleNewChat}>Nuova Chat</button>
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
                        disabled={isTyping}
                        style={{ opacity: isTyping ? 0.6 : 1, cursor: isTyping ? 'default' : 'pointer' }}
                    >
                        {prompt}
                    </button>
                    ))}
                </div>
                </div>
            ) : (
                <>
                {messages.map((message, index) => (
                    <div
                    key={message.id || index}
                    className={`message ${message.sender === 'user' ? 'message-user' : message.sender === 'error' ? 'message-error' : 'message-ai'}`}
                    >
                        <div className="message-content">
                            {message.text}
                            {message.sender === 'ai' && (
                                <button 
                                    className={`btn-save-message ${message.isSaved ? 'saved' : ''}`}
                                    onClick={() => handleSaveMessage(message.id)}
                                    title="Salva risposta"
                                >
                                    <BookmarkIcon filled={message.isSaved} />
                                </button>
                            )}
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

            {/* Suggerimenti Smart Fallback */}
            {showSuggestions && currentSuggestions.length > 0 && (
                <div className="smart-fallback-container">
                <p className="fallback-label">Potresti provare a chiedere:</p>
                <div className="fallback-chips">
                    {currentSuggestions.map((suggestion, i) => (
                    <button key={i} className="fallback-chip" onClick={() => handlePromptClick(suggestion)}>
                        {suggestion}
                    </button>
                    ))}
                </div>
                </div>
            )}
            </div>

            {/* Input Area */}
            <div className="chat-input-container">
            <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder={isCooldown ? `Cooldown (${cooldownSeconds}s)...` : (isTyping ? "L'assistente sta scrivendo..." : "Scrivi un messaggio...")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping || isCooldown}
                autoFocus
                />
                <button
                type="submit"
                className="btn-send"
                disabled={!inputValue.trim() || isTyping || isCooldown}
                >
                <SendIcon />
                </button>
            </form>
            </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard