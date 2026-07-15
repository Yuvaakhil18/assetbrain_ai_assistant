import { useState, useEffect, useRef } from 'react';
import { 
  FileText, AlertTriangle, ShieldAlert, 
  Search, X, Menu, MessageSquare, Plus, Activity,
  BrainCircuit, FileClock, Send, Calculator,
  ChevronLeft, ChevronDown, Sun, Moon, HelpCircle, LogOut, Gift, Bell,
  BookOpen, Calendar, TrendingUp, Paperclip, Lock, ArrowRight
} from 'lucide-react';
// @ts-ignore
import ImpactCalculator from './components/ImpactCalculator';

const T = {
  canvas: 'var(--canvas)',
  panel: 'var(--panel)',
  sidebar: 'var(--sidebar)',
  text: 'var(--text)',
  dim: 'var(--dim)',
  brand: 'var(--brand)',
  brandText: 'var(--brand-text)',
  butter: 'var(--butter)',
  approval: 'var(--approval)',
  risk: 'var(--risk)',
  border: 'var(--border)',
  hover: 'var(--hover)',
  card: 'var(--card)'
};

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Inter, sans-serif";

const SOURCE_DETAIL: Record<string, {text: string, date: string, type: string}> = {
  'P&ID-204-Rev3': { text: '"...pump P-204 discharge pressure trip setpoint revised to 8.4 bar per vendor bulletin VB-2291..."', date: 'Rev 3, Mar 2025', type: 'Design Spec' },
  'WO-88213': { text: '"...bearing housing overheating, replaced DE bearing, verified alignment within 0.05mm..."', date: 'Closed, 14 Jan 2026', type: 'Work Order' },
  'Tribal note — R. Iyer': { text: '"...if it trips again within a week after bearing change, check the coupling grease — that\'s what actually got it last time, not the bearing."', date: 'Logged, 2 Feb 2026', type: 'Field Note' },
};

function GlassBtn({ children, onClick, active, activeBg, activeColor }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
        border: 'none', background: active ? (activeBg || T.hover) : 'transparent',
        color: active ? (activeColor || T.text) : T.text,
        fontSize: '14px', fontWeight: 500, fontFamily: FONT,
        transition: 'all 0.15s ease',
        width: '100%', textAlign: 'left',
      }}
      onMouseOver={(e) => { if (!active) e.currentTarget.style.background = T.hover; }}
      onMouseOut={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

const PROFILES = [
  { id: '1', name: 'R. Iyer', role: 'Field Technician', initials: 'R' },
  { id: '2', name: 'S. Patel', role: 'Maintenance Engineer', initials: 'S' },
  { id: '3', name: 'A. Sharma', role: 'Plant Manager', initials: 'A' },
];

interface Conversation {
  id: string;
  title: string;
  messages: any[];
}

export default function App() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState(PROFILES[0]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('asset_brain_theme') || 'light');
  
  useEffect(() => {
    localStorage.setItem('asset_brain_theme', theme);
  }, [theme]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'calc'
  
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('asset_brain_conversations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [approvedOrders, setApprovedOrders] = useState<Record<number, boolean>>({});
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (overrideQuery?: any) => {
    const userMsg = typeof overrideQuery === 'string' ? overrideQuery : inputValue;
    if ((!userMsg.trim() && !selectedImage) || isLoading) return;
    
    const userMsgObj = { type: 'user', text: userMsg, image: selectedImage };
    const newMessages = [...messages, userMsgObj];
    setMessages(newMessages);
    setInputValue('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);
    setActiveCitation(null);
    if (activeTab !== 'chat') setActiveTab('chat');
    if (isMobile) setIsSidebarOpen(false);

    let convId = currentConvId;
    let newConversations = [...conversations];
    if (!convId) {
      convId = Date.now().toString();
      setCurrentConvId(convId);
      newConversations.unshift({ id: convId, title: userMsg, messages: newMessages });
    } else {
      const idx = newConversations.findIndex(c => c.id === convId);
      if (idx !== -1) {
        newConversations[idx].messages = newMessages;
      }
    }
    setConversations(newConversations);
    localStorage.setItem('asset_brain_conversations', JSON.stringify(newConversations));
    
    try {
      const apiUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8000');
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, image: imageToSend })
      });
      
      const data = await response.json();
      
      let botMsgObj: any;
      if (data.confidence === 0.0) {
        botMsgObj = { type: 'bot', text: data.answer };
      } else {
        botMsgObj = { 
          type: 'bot', 
          text: data.answer,
          citations: data.citations,
          recommendation: data.recommendation,
          compliance_alerts: data.compliance_alerts
        };
      }

      const finalMessages = [...newMessages, botMsgObj];
      setMessages(finalMessages);
      
      const finalConversations = [...newConversations];
      const finalIdx = finalConversations.findIndex(c => c.id === convId);
      if (finalIdx !== -1) {
        finalConversations[finalIdx].messages = finalMessages;
      }
      setConversations(finalConversations);
      localStorage.setItem('asset_brain_conversations', JSON.stringify(finalConversations));
      
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Error connecting to the reasoning layer.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-theme={theme} style={{
      width: '100vw', height: '100vh', display: 'flex', 
      background: T.canvas, fontFamily: FONT, color: T.text, overflow: 'hidden'
    }}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        style={{
          width: 260, background: T.sidebar, borderRight: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column', padding: '20px 16px',
          position: isMobile ? 'absolute' : 'relative',
          height: '100%', zIndex: 50, transition: 'transform 0.25s ease',
          transform: (isMobile && !isSidebarOpen) ? 'translateX(-100%)' : 'translateX(0)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.3px', color: T.brand }}>
            <BrainCircuit size={20} /> Asset Brain
          </div>
          <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: `1px solid ${T.border}`, cursor: 'pointer', color: T.dim, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ChevronLeft size={16} />
          </button>
        </div>

        <button 
          onClick={() => { setMessages([]); setCurrentConvId(null); setActiveCitation(null); setActiveTab('chat'); if (isMobile) setIsSidebarOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
            padding: '10px 16px', background: T.brand, color: T.brandText, 
            borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '14px', marginBottom: '24px',
            transition: 'opacity 0.15s ease'
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={16} /> New conversation
        </button>

        <div style={{ fontSize: '12px', fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '8px' }}>
          Explore
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
          <GlassBtn active={activeTab === 'chat'} activeBg={`${T.brand}1A`} activeColor={T.brand} onClick={() => { setActiveTab('chat'); if (isMobile) setIsSidebarOpen(false); }}>
            <Search size={16} /> Ask anything
          </GlassBtn>
          <GlassBtn active={activeTab === 'calc'} activeBg={`${T.brand}1A`} activeColor={T.brand} onClick={() => { setActiveTab('calc'); if (isMobile) setIsSidebarOpen(false); }}>
            <Calculator size={16} /> Impact Model
          </GlassBtn>
          <GlassBtn onClick={() => handleSend("What are the pending maintenance recommendations?")}>
            <Activity size={16} /> Recommendations
          </GlassBtn>
          <GlassBtn onClick={() => handleSend("Check compliance gaps for our standard procedures")}>
            <ShieldAlert size={16} /> Compliance
          </GlassBtn>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingLeft: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recent
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: T.brand }}>See all</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '8px', color: T.dim, fontSize: '13px' }}>No recent conversations</div>
          ) : (
            conversations.map(conv => (
              <GlassBtn 
                key={conv.id} 
                active={currentConvId === conv.id} 
                activeBg={`${T.brand}1A`} 
                activeColor={T.brand}
                onClick={() => {
                  setCurrentConvId(conv.id);
                  setMessages(conv.messages);
                  setActiveCitation(null);
                  setActiveTab('chat');
                  if (isMobile) setIsSidebarOpen(false);
                }}
              >
                <MessageSquare size={14} style={{ flexShrink: 0 }} /> 
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {conv.title}
                </span>
              </GlassBtn>
            ))
          )}
        </div>

        <div style={{ position: 'relative', marginTop: 'auto' }}>
          {showProfileMenu && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0, width: '100%',
              background: T.panel, border: `1px solid ${T.border}`, borderRadius: '12px',
              padding: '8px', marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 100
            }}>
              {PROFILES.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setCurrentUser(p); setShowProfileMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                    padding: '8px', background: currentUser.id === p.id ? T.hover : 'transparent', 
                    border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseOver={e => { if (currentUser.id !== p.id) e.currentTarget.style.background = T.hover; }}
                  onMouseOut={e => { if (currentUser.id !== p.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 14, background: T.brand, color: T.brandText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12px', flexShrink: 0 }}>
                    {p.initials}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: T.text }}>{p.name}</span>
                    <span style={{ fontSize: '11px', color: T.dim }}>{p.role}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent',
              border: 'none', cursor: 'pointer', padding: '16px 8px 16px 8px',
              textAlign: 'left', justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: T.brand, color: T.brandText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px', flexShrink: 0 }}>
                {currentUser.initials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: T.text }}>{currentUser.name}</span>
                <span style={{ fontSize: '12px', color: T.dim }}>{currentUser.role}</span>
              </div>
            </div>
            <ChevronDown size={16} color={T.dim} />
          </button>
        </div>

        <div style={{ paddingTop: '16px', borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <GlassBtn onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} 
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
              </div>
              <div style={{ width: 32, height: 18, background: T.brand, borderRadius: 9, position: 'relative', transition: 'all 0.2s ease' }}>
                <div style={{ width: 14, height: 14, background: T.brandText, borderRadius: 7, position: 'absolute', top: 2, left: theme === 'dark' ? 16 : 2, transition: 'all 0.2s ease' }}></div>
              </div>
            </div>
          </GlassBtn>
          <GlassBtn><HelpCircle size={16} /> Help & feedback</GlassBtn>
          <GlassBtn><LogOut size={16} /> Sign out</GlassBtn>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
        
        {/* Mobile Header */}
        {isMobile && (
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', 
            background: T.canvas, borderBottom: `1px solid ${T.border}`, zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: T.text }}>
                <Menu size={20} />
              </button>
              <div style={{ fontWeight: 600 }}>Asset Brain</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ background: T.panel, border: `1px solid ${T.border}`, padding: '8px', borderRadius: '50%', color: T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Top Right Navigation */}
        {!isMobile && (
          <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: '12px', zIndex: 10 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: T.panel, border: `1px solid ${T.border}`, padding: '8px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: T.text, cursor: 'pointer' }}>
              <Gift size={14} /> What's new
            </button>
            <button style={{ background: T.panel, border: `1px solid ${T.border}`, padding: '8px', borderRadius: '50%', color: T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} />
            </button>
          </div>
        )}

        {activeTab === 'calc' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <ImpactCalculator onBack={() => setActiveTab('chat')} />
          </div>
        ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingTop: isMobile ? '24px' : '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', color: T.dim, marginTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, border: `1px solid ${T.border}`, background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <BrainCircuit size={40} color={T.brand} />
                  </div>
                  <h2 style={{ margin: '0 0 8px 0', color: T.brand, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                    Hello, {currentUser.name}! 👋
                  </h2>
                  <h2 style={{ margin: '0 0 16px 0', color: T.text, fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                    How can I help you today?
                  </h2>
                  <p style={{ margin: 0, fontSize: '16px', maxWidth: '420px', lineHeight: 1.5 }}>
                    Ask questions about asset manuals, compliance records, 
                    or previous maintenance work orders.
                  </p>
                </div>
                
                <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 700, color: T.text }}>
                  Popular tasks
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                  
                  <button onClick={() => handleSend("Show me the asset manual and guides.")} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: T.brand, marginBottom: '16px' }}><BookOpen size={24} /></div>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: '15px', marginBottom: '8px' }}>Asset Manuals</div>
                    <div style={{ color: T.dim, fontSize: '13px', lineHeight: 1.4, marginBottom: '16px' }}>Get information from asset manuals and guides</div>
                    <div style={{ marginTop: 'auto', alignSelf: 'flex-end', background: T.card, border: `1px solid ${T.border}`, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={14} color={T.text} />
                    </div>
                  </button>

                  <button onClick={() => handleSend("Check compliance status and requirements")} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: T.brand, marginBottom: '16px' }}><ShieldAlert size={24} /></div>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: '15px', marginBottom: '8px' }}>Compliance Records</div>
                    <div style={{ color: T.dim, fontSize: '13px', lineHeight: 1.4, marginBottom: '16px' }}>Check compliance status and requirements</div>
                    <div style={{ marginTop: 'auto', alignSelf: 'flex-end', background: T.card, border: `1px solid ${T.border}`, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={14} color={T.text} />
                    </div>
                  </button>

                  <button onClick={() => handleSend("View past maintenance and work orders")} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: T.brand, marginBottom: '16px' }}><Calendar size={24} /></div>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: '15px', marginBottom: '8px' }}>Maintenance History</div>
                    <div style={{ color: T.dim, fontSize: '13px', lineHeight: 1.4, marginBottom: '16px' }}>View past maintenance and work orders</div>
                    <div style={{ marginTop: 'auto', alignSelf: 'flex-end', background: T.card, border: `1px solid ${T.border}`, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={14} color={T.text} />
                    </div>
                  </button>

                  <button onClick={() => setActiveTab('calc')} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: T.brand, marginBottom: '16px' }}><TrendingUp size={24} /></div>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: '15px', marginBottom: '8px' }}>Impact Analysis</div>
                    <div style={{ color: T.dim, fontSize: '13px', lineHeight: 1.4, marginBottom: '16px' }}>Analyze asset impact and performance</div>
                    <div style={{ marginTop: 'auto', alignSelf: 'flex-end', background: T.card, border: `1px solid ${T.border}`, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={14} color={T.text} />
                    </div>
                  </button>
                  
                </div>

                <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 700, color: T.text }}>
                  Try asking
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <button onClick={() => handleSend("Show me the manual for FT-200 pump")} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: T.panel, border: `1px solid ${T.border}`, borderRadius: '20px', fontSize: '13px', fontWeight: 500, color: T.text, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <BookOpen size={14} color={T.dim} /> Show me the manual for FT-200 pump
                  </button>
                  <button onClick={() => handleSend("When was the last maintenance done?")} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: T.panel, border: `1px solid ${T.border}`, borderRadius: '20px', fontSize: '13px', fontWeight: 500, color: T.text, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <Calendar size={14} color={T.dim} /> When was the last maintenance done?
                  </button>
                  <button onClick={() => handleSend("Check compliance for pressure vessels")} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: T.panel, border: `1px solid ${T.border}`, borderRadius: '20px', fontSize: '13px', fontWeight: 500, color: T.text, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <ShieldAlert size={14} color={T.dim} /> Check compliance for pressure vessels
                  </button>
                  <button onClick={() => handleSend("Show high impact assets")} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: T.panel, border: `1px solid ${T.border}`, borderRadius: '20px', fontSize: '13px', fontWeight: 500, color: T.text, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <TrendingUp size={14} color={T.dim} /> Show high impact assets
                  </button>
                </div>

              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', gap: '16px', 
                  flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                }}>
                  {/* Avatar */}
                  {msg.type === 'bot' && (
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: T.brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BrainCircuit size={18} />
                    </div>
                  )}

                  <div style={{ 
                    maxWidth: isMobile ? '100%' : '85%', display: 'flex', flexDirection: 'column', gap: '12px',
                    alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    {/* Message Bubble */}
                    <div style={{
                      padding: '12px 16px',
                      background: msg.type === 'user' ? T.brand : T.panel,
                      color: msg.type === 'user' ? '#fff' : T.text,
                      borderRadius: '12px',
                      border: msg.type === 'user' ? 'none' : `1px solid ${T.border}`,
                      fontSize: '15px', lineHeight: 1.6,
                      borderTopRightRadius: msg.type === 'user' ? 4 : 12,
                      borderTopLeftRadius: msg.type === 'bot' ? 4 : 12,
                    }}>
                      {msg.image && (
                        <div style={{ marginBottom: msg.text ? '12px' : '0' }}>
                          <img src={msg.image} alt="Uploaded content" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' }} />
                        </div>
                      )}
                      {msg.text}
                    </div>

                    {/* Inline Components */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {msg.citations.map((doc: string) => (
                          <button 
                            key={doc}
                            onClick={() => setActiveCitation(activeCitation === doc ? null : doc)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '6px 12px', borderRadius: '16px', cursor: 'pointer',
                              background: activeCitation === doc ? T.brand : T.panel,
                              color: activeCitation === doc ? '#fff' : T.text,
                              border: `1px solid ${activeCitation === doc ? T.brand : T.border}`,
                              fontSize: '13px', fontWeight: 500, fontFamily: 'ui-monospace, monospace',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <FileText size={14} /> {doc}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.recommendation && (
                      <div style={{
                        padding: '16px', borderRadius: '12px', background: T.panel,
                        border: `1px solid ${T.approval}`, width: '100%', maxWidth: '500px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: T.approval, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <AlertTriangle size={16} /> Recommended Action
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: 1.5, color: T.text, marginBottom: '16px' }}>
                          {msg.recommendation.description}
                        </div>
                        <button style={{
                          padding: '8px 16px', 
                          background: approvedOrders[idx] ? '#e6f4ea' : T.brand, 
                          color: approvedOrders[idx] ? '#1e8e3e' : T.brandText, 
                          border: approvedOrders[idx] ? '1px solid #1e8e3e' : 'none', 
                          borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s ease',
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                        onClick={() => setApprovedOrders(prev => ({ ...prev, [idx]: true }))}
                        onMouseOver={e => { if(!approvedOrders[idx]) e.currentTarget.style.opacity = '0.9' }}
                        onMouseOut={e => { if(!approvedOrders[idx]) e.currentTarget.style.opacity = '1' }}
                        >
                          {approvedOrders[idx] ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              Approved
                            </>
                          ) : 'Approve Work Order'}
                        </button>
                      </div>
                    )}

                    {msg.compliance_alerts && msg.compliance_alerts.map((alert: any, aIdx: number) => (
                      <div key={aIdx} style={{
                        padding: '12px 16px', borderRadius: '12px', background: T.panel,
                        border: `1px solid ${T.risk}`, width: '100%', maxWidth: '500px',
                        display: 'flex', alignItems: 'flex-start', gap: '12px'
                      }}>
                        <ShieldAlert size={18} color={T.risk} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '14px', color: T.text, lineHeight: 1.4 }}>{alert.description}</div>
                          <div style={{ fontSize: '12px', color: T.risk, fontWeight: 600, marginTop: '4px' }}>{alert.regulation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div style={{ display: 'flex', gap: '16px' }}>
                 <div style={{ width: 32, height: 32, borderRadius: 8, background: T.brand, color: T.brandText, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BrainCircuit size={18} />
                 </div>
                 <div style={{
                    padding: '12px 16px', background: T.panel, borderRadius: '12px',
                    border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '8px',
                    borderTopLeftRadius: 4,
                 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.dim, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.dim, animation: 'pulse 1.5s infinite 0.2s' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.dim, animation: 'pulse 1.5s infinite 0.4s' }} />
                 </div>
              </div>
            )}
            
            <div ref={endOfMessagesRef} />
          </div>
        </div>
        
        {/* Input Area */}
        <div style={{ padding: '24px', background: `linear-gradient(to top, ${T.canvas} 70%, transparent)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            width: '100%', maxWidth: '800px', background: T.panel, 
            borderRadius: '32px', border: `1px solid ${T.border}`,
            padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px',
            boxShadow: '0 4px 12px rgba(28,27,24,0.05)', transition: 'border-color 0.2s ease'
          }}>
            {selectedImage && (
              <div style={{ position: 'relative', width: 'fit-content' }}>
                <img src={selectedImage} alt="Upload preview" style={{ height: '64px', borderRadius: '8px', border: `1px solid ${T.border}` }} />
                <button 
                  onClick={() => setSelectedImage(null)}
                  style={{ position: 'absolute', top: -6, right: -6, background: T.card, border: `1px solid ${T.border}`, borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text, padding: 0 }}
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', width: '100%' }}>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }} 
              />
              <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: T.dim, flexShrink: 0 }}>
                <Paperclip size={20} />
              </button>
              <textarea
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: '15px', color: T.text, fontFamily: FONT, resize: 'none',
                  minHeight: '24px', maxHeight: '120px', padding: '4px 0'
                }}
                placeholder="Message Asset Brain..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
              />
              <button 
                onClick={() => handleSend()}
                disabled={(!inputValue.trim() && !selectedImage) || isLoading}
                style={{ 
                  background: (inputValue.trim() || selectedImage) ? T.brand : T.hover, border: 'none', 
                  cursor: (inputValue.trim() || selectedImage) ? 'pointer' : 'default', 
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: (inputValue.trim() || selectedImage) ? T.brandText : T.dim, flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: T.dim, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} /> Asset Brain may make mistakes. Verify critical information.
          </div>
        </div>
        </>
        )}
      </div>

      {/* Right Source Panel */}
      <div 
        style={{
          width: activeCitation ? (isMobile ? '100%' : 320) : 0,
          background: T.panel, borderLeft: activeCitation && !isMobile ? `1px solid ${T.border}` : 'none',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          position: isMobile ? 'absolute' : 'relative',
          right: 0, height: '100%', zIndex: 45,
          boxShadow: isMobile && activeCitation ? '-10px 0 30px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        {activeCitation && (
          <div style={{ width: isMobile ? '100vw' : 320, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Source Detail
              </div>
              <button onClick={() => setActiveCitation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.dim, padding: '4px', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.background = T.hover} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <X size={16} />
              </button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: T.text, lineHeight: 1.3 }}>
                {activeCitation}
              </div>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: T.canvas, borderRadius: '6px', border: `1px solid ${T.border}`, fontSize: '12px', color: T.dim, marginBottom: '16px' }}>
                <FileClock size={12} /> {SOURCE_DETAIL[activeCitation]?.type || "Document"}
              </div>

              <div style={{ 
                fontSize: '14px', lineHeight: 1.6, color: T.text, 
                padding: '16px', background: T.card, borderRadius: '8px', 
                border: `1px solid ${T.border}`, fontStyle: 'italic', marginBottom: '12px'
              }}>
                {SOURCE_DETAIL[activeCitation]?.text || "Source excerpt unavailable."}
              </div>
              
              <div style={{ fontSize: '13px', color: T.dim }}>
                Last updated: {SOURCE_DETAIL[activeCitation]?.date || "Unknown"}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          :root {
            --canvas: #F7F2E7;
            --panel: #FBF8F0;
            --sidebar: #EFE7D6;
            --text: #1C1B18;
            --dim: #6E6A61;
            --brand: #013E37;
            --brand-text: #ffffff;
            --butter: #FFEFB3;
            --approval: #9C7222;
            --risk: #A8503B;
            --border: rgba(28,27,24,0.12);
            --hover: rgba(28,27,24,0.06);
            --card: #ffffff;
          }
          [data-theme="dark"] {
            --canvas: #121212;
            --panel: #1C1C1C;
            --sidebar: #181818;
            --text: #F0F0F0;
            --dim: #A0A0A0;
            --brand: #4FD1C5;
            --brand-text: #000000;
            --butter: #4A4222;
            --approval: #E6B95C;
            --risk: #F2785C;
            --border: rgba(255,255,255,0.08);
            --hover: rgba(255,255,255,0.05);
            --card: #252525;
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
