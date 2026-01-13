
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, MessageSquare, Settings as SettingsIcon, Home, Users, Send,
  Loader2, Copy, User, Download, Crown, Zap, ChevronRight, Package,
  HardDrive, ShieldCheck, Cpu, Clock, Activity, Flame, ZapIcon, Sparkles, UserPlus,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType, ServerInfo, PlayerSettings, ChatMessage } from './types';
import { getAssistantResponse } from './services/geminiService';

// =========================================================
// CONFIGURAÇÃO DO DONO (MUDE APENAS O QUE ESTÁ ENTRE AS ASPAS)
// =========================================================
const SERVER_IP = "151.242.227.230"; // O IP da sua VPS
const SERVER_PORT = 7777;           // A porta do seu SAMP
const LINK_DO_SEU_APK = "https://drive.google.com/file/d/1TBU8V4vaOSvF5EIectH-6zHZoSsdmbGx/view?usp=drive_link"; // Link direto do seu APK no Mediafire/GoogleDrive/VPS
const NOME_DO_SERVIDOR = "IMPÉRIO RJ";
const LAUNCHER_VERSION = "2.0.0-PRO";
const DISCORD_URL = "https://discord.gg/wVJteFwdkp";
// =========================================================

const DiscordIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057 13.1163-.892.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
  </svg>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [settings, setSettings] = useState<PlayerSettings>({
    nickname: localStorage.getItem('imp_nickname') || ''
  });
  const [serverInfo, setServerInfo] = useState<ServerInfo>({
    ip: SERVER_IP,
    port: SERVER_PORT,
    players: 0,
    maxPlayers: 500,
    status: 'online',
    version: '0.3.7'
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [simulatedPing, setSimulatedPing] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSubtext, setDownloadSubtext] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0 MB/s');
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [tempNickname, setTempNickname] = useState(settings.nickname);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simula contagem de players ativa na VPS
    setServerInfo(prev => ({ ...prev, players: Math.floor(Math.random() * 40) + 120 }));
    const interval = setInterval(() => {
      setServerInfo(prev => ({ ...prev, players: Math.floor(Math.random() * 10) + prev.players - 5 }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSaveNickname = (name: string) => {
    const sanitized = name.trim().replace(/\s/g, '_'); 
    if (sanitized.length < 3) {
      alert("Mano, esse nome tá muito curto. Bota um Nome_Sobrenome aí!");
      return;
    }
    setSettings({ nickname: sanitized });
    localStorage.setItem('imp_nickname', sanitized);
    setIsNicknameModalOpen(false);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(LINK_DO_SEU_APK).then(() => {
      alert("Link do APK copiado para a área de transferência! Manda pros cria! 🔥");
    }).catch(() => {
      alert("Erro ao copiar link. Tenta de novo, Imperador!");
    });
  };

  const handleLaunchGame = () => {
    if (!settings.nickname) {
      setIsNicknameModalOpen(true);
      return;
    }
    
    setIsLaunching(true);
    setConnectionLogs([]);
    setSimulatedPing(Math.floor(Math.random() * 15) + 20);

    const steps = [
      { log: `[SYSTEM] Verificando conexão com a VPS: ${SERVER_IP}`, delay: 0 },
      { log: `[STORAGE] Verificando arquivos do GTA San Andreas...`, delay: 800 },
      { log: `[CONFIG] Engine Imperial v2.0 otimizada.`, delay: 1500 },
      { log: `[AUTH] Perfil carregado: ${settings.nickname}`, delay: 2500 },
      { log: `[SUCCESS] Conectando ao servidor...`, delay: 3500 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setConnectionLogs(prev => [...prev, step.log]);
        if (index === steps.length - 1) {
          setTimeout(() => {
            window.location.href = `samp://${SERVER_IP}:${SERVER_PORT}`;
            setTimeout(() => setIsLaunching(false), 3000);
          }, 800);
        }
      }, step.delay);
    });
  };

  const handleDownloadAPK = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    
    const totalSizeMB = 1200; 
    let currentMB = 0;
    
    const interval = setInterval(() => {
      const speed = Math.floor(Math.random() * 20) + 15; 
      currentMB += speed;
      const progress = Math.min((currentMB / totalSizeMB) * 100, 100);
      
      setDownloadProgress(progress);
      setDownloadSpeed(`${speed} MB/s`);
      
      const remainingMB = totalSizeMB - currentMB;
      const remainingSeconds = Math.max(Math.ceil(remainingMB / speed), 0);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      setTimeRemaining(`${minutes}m ${seconds}s`);

      if (progress > 90) setDownloadSubtext('Finalizando instalação...');
      else if (progress > 50) setDownloadSubtext('Baixando Pacote Imperial...');
      else setDownloadSubtext('Conectando ao servidor de arquivos...');
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDownloading(false);
          window.open(LINK_DO_SEU_APK, '_blank');
          alert("Tudo pronto! O download do seu APK começou.");
        }, 1000);
      }
    }, 500);
  };

  const handleSendMessage = async (customMessage?: string) => {
    const text = customMessage || inputMessage;
    if (!text.trim() || isTyping) return;
    
    const userMessage: ChatMessage = { role: 'user', text: text };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      const historyParts = [...chatMessages, userMessage].map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const response = await getAssistantResponse(historyParts);
      setChatMessages(prev => [...prev, { role: 'model', text: response || "Coé, deu erro aqui. Tenta de novo!" }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Visão: O sistema tá fora do ar. Chama no Discord!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* Sidebar - Menu Lateral */}
      <nav className="hidden md:flex w-72 bg-[#080808] border-r border-white/5 flex-col p-6 z-20">
        <div className="mb-10 flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-yellow-500 flex items-center justify-center shadow-2xl shadow-yellow-500/20">
            <Crown size={42} className="text-black" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-black tracking-widest uppercase text-yellow-500">{NOME_DO_SERVIDOR}</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Versão {LAUNCHER_VERSION}</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20} />} label="Início" />
          <NavItem active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} icon={<MessageSquare size={20} />} label="Chat Carioca" />
          <NavItem active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} icon={<Package size={20} />} label="Tudo Incluso" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20} />} label="Opções" />
        </div>

        <div className="mt-auto space-y-4">
          <a href={DISCORD_URL} target="_blank" className="flex items-center gap-3 p-4 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/20 transition-all">
            <DiscordIcon size={20} />
            <span className="font-black text-[10px] uppercase tracking-widest">Discord Oficial</span>
          </a>
          <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                <User size={16} />
             </div>
             <p className="font-bold truncate text-xs">{settings.nickname || 'Sem Nick'}</p>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative flex flex-col h-full bg-[#050505] overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#2a0a3d_0%,_#050505_100%)] pointer-events-none opacity-30" />
        
        {/* Header Superior */}
        <header className="p-4 md:p-6 flex items-center justify-between z-10 sticky top-0 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3 md:hidden">
             <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-black shadow-lg">
                <Crown size={20} />
             </div>
             <span className="font-black uppercase text-yellow-500">IMPÉRIO <span className="text-white">RJ</span></span>
          </div>
          <div className="hidden md:block" />
          
          <div className="flex items-center gap-2 bg-white/5 border border-yellow-500/10 rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase">Servidor Online</span>
            <div className="w-px h-3 bg-white/10 mx-1" />
            <div className="flex items-center gap-1">
              <Users size={12} className="text-yellow-500" />
              <span className="text-[10px] font-black">{serverInfo.players} / {serverInfo.maxPlayers}</span>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0d0d0d] border border-yellow-500/10 p-8 md:p-16 shadow-2xl text-center">
                  <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-2xl mb-8 mx-auto">
                    <Crown size={48} className="animate-bounce" />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase leading-none tracking-tighter mb-4">
                    CIDADE MARAVILHOSA <br />
                    <span className="text-yellow-500">TE ESPERA</span>
                  </h2>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-10">Tudo o que você precisa em um só lugar</p>
                  
                  <div className="max-w-md mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleDownloadAPK} disabled={isDownloading} className="flex flex-col items-center justify-center gap-1 py-5 rounded-2xl font-black text-xs transition-all bg-white text-black hover:scale-105 active:scale-95 disabled:opacity-80">
                      <div className="flex items-center gap-2">
                        {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <HardDrive size={18} />}
                        {isDownloading ? `${Math.floor(downloadProgress)}%` : "BAIXAR GTA + APK"}
                      </div>
                    </button>
                    <div className="flex gap-2">
                      <button onClick={handleLaunchGame} className="flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs transition-all bg-yellow-500 text-black shadow-xl hover:scale-105 active:scale-95">
                        <Play fill="currentColor" size={18} /> JOGAR AGORA
                      </button>
                      <button onClick={() => { setTempNickname(settings.nickname); setIsNicknameModalOpen(true); }} className="w-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-90 transition-all">
                        <User size={20} />
                      </button>
                      <button onClick={handleShareLink} className="w-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-yellow-500/10 active:scale-90 transition-all group">
                        <Share2 size={20} className="group-hover:text-yellow-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                  
                  {isDownloading && (
                    <div className="mt-8 max-w-sm mx-auto space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase text-yellow-500">
                        <span>{downloadSubtext}</span>
                        <span>{Math.floor(downloadProgress)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-yellow-500" animate={{ width: `${downloadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <QuickInfo label="IP DA VPS" value={SERVER_IP} />
                   <QuickInfo label="STATUS" value="ONLINE" />
                   <QuickInfo label="ROLEPLAY" value="ATIVO" />
                   <QuickInfo label="DISCORD" value="COMUNIDADE" />
                </div>
              </motion.div>
            )}

            {activeTab === 'assistant' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[70vh] glass rounded-[2rem] overflow-hidden border border-yellow-500/10 shadow-2xl">
                 <div className="p-4 border-b border-white/5 bg-yellow-500/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-black">
                       <User size={20} />
                    </div>
                    <div>
                       <h3 className="font-bold text-sm text-yellow-500">Carioca Inteligente</h3>
                       <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">Online p/ te ajudar</span>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
                    {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                         <MessageSquare size={48} className="text-yellow-500 mb-4" />
                         <p className="text-xs font-bold uppercase tracking-widest">Qual foi, Imperador? Manda a dúvida!</p>
                      </div>
                    )}
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`p-4 rounded-2xl max-w-[85%] text-sm ${m.role === 'user' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#1a1a1a] text-gray-200 border border-white/5'}`}>
                            {m.text}
                         </div>
                      </div>
                    ))}
                    {isTyping && (
                       <div className="flex justify-start">
                         <div className="bg-[#1a1a1a] px-5 py-3 rounded-2xl border border-white/5 flex gap-1">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce delay-100" />
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce delay-200" />
                         </div>
                       </div>
                    )}
                    <div ref={chatEndRef} />
                 </div>

                 <div className="p-4 bg-black/60 border-t border-white/5 flex gap-2">
                    <input className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-yellow-500/50 outline-none" placeholder="Pergunta pro cria..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                    <button onClick={() => handleSendMessage()} className="bg-yellow-500 text-black p-4 rounded-2xl active:scale-95 transition-all">
                      <Send size={20} />
                    </button>
                 </div>
              </motion.div>
            )}

            {activeTab === 'guide' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-black text-yellow-500 uppercase italic">Tudo Incluso</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <BenefitCard icon={<Flame className="text-orange-500" />} title="GTA OFICIAL" desc="Versão mobile v2.10 inclusa no instalador." />
                  <BenefitCard icon={<ZapIcon className="text-yellow-500" />} title="OTIMIZAÇÃO" desc="Texturas leves para rodar em qualquer celular." />
                  <BenefitCard icon={<ShieldCheck className="text-green-500" />} title="CONEXÃO" desc="Handshake direto com nossa VPS Pro." />
                </div>
                <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl text-center">
                   <h3 className="font-black text-sm uppercase mb-2">Pronto para a ação?</h3>
                   <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest">Clique no botão abaixo para baixar o instalador All-in-One.</p>
                   <button onClick={handleDownloadAPK} className="bg-yellow-500 text-black px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-yellow-500/20 active:scale-95 transition-all">
                      BAIXAR APK AGORA
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
                 <div className="glass p-10 rounded-[3rem] border border-yellow-500/10 shadow-2xl text-center">
                    <h2 className="text-2xl font-black italic mb-8 uppercase text-yellow-500">Opções</h2>
                    <div className="space-y-4">
                       <SettingsToggle label="Vibração Mobile" active={true} />
                       <SettingsToggle label="Texturas Rio" active={true} />
                       <button onClick={() => { navigator.clipboard.writeText(`${SERVER_IP}:${SERVER_PORT}`); alert('IP Copiado!'); }} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-yellow-500/10 transition-all group">
                          <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-yellow-500">Copiar IP do Servidor</span>
                          <Copy size={18} className="text-yellow-500" />
                       </button>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navbar Mobile (Somente celular) */}
        <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] glass border border-yellow-500/10 rounded-full p-2 z-50 flex items-center justify-between shadow-2xl">
          <MobileNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} />
          <MobileNavItem active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} icon={<MessageSquare size={22} />} />
          <MobileNavItem active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} icon={<Package size={22} />} />
          <MobileNavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={22} />} />
        </nav>

        {/* Modal de Nickname */}
        <AnimatePresence>
          {isNicknameModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNicknameModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-sm glass border border-yellow-500/20 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center text-black">
                    <UserPlus size={32} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black uppercase italic text-yellow-500">Sua Identidade</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Insira seu Nome_Sobrenome</p>
                  </div>
                  <div className="w-full space-y-4">
                    <input type="text" value={tempNickname} onChange={(e) => setTempNickname(e.target.value)} placeholder="Ex: Gabriel_Souza" className="w-full bg-black/40 border border-yellow-500/20 rounded-2xl p-5 text-center font-bold outline-none focus:border-yellow-500" />
                    <button onClick={() => handleSaveNickname(tempNickname)} className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95 transition-all">CONFIRMAR</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Overlay de Conexão */}
        <AnimatePresence>
          {isLaunching && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center p-6 text-center">
               <Zap className="text-yellow-500 mb-6 animate-pulse" size={64} />
               <h3 className="text-3xl font-black italic uppercase text-yellow-500 mb-8">IMPÉRIO RJ</h3>
               <div className="w-full max-w-xs bg-black/60 border border-yellow-500/20 rounded-2xl p-4 text-left font-mono text-[10px] space-y-2 h-40 overflow-y-auto">
                  {connectionLogs.map((log, i) => <div key={i} className="text-gray-400">> {log}</div>)}
                  <div ref={logsEndRef} />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-500 hover:bg-yellow-500/5 hover:text-white'}`}>
    <div className="shrink-0">{icon}</div>
    <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode }> = ({ active, onClick, icon }) => (
  <button onClick={onClick} className={`flex-1 flex justify-center p-4 rounded-full transition-all ${active ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>
    {icon}
  </button>
);

const QuickInfo: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="bg-[#0d0d0d] border border-yellow-500/5 p-4 rounded-2xl text-center">
    <h4 className="text-[8px] font-black text-gray-600 uppercase mb-1">{label}</h4>
    <p className="text-[10px] font-black text-white truncate">{value}</p>
  </div>
);

const BenefitCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col items-center text-center gap-2">
    <div className="mb-2">{icon}</div>
    <h4 className="font-black text-[10px] uppercase text-white">{title}</h4>
    <p className="text-[9px] font-bold text-gray-500 uppercase">{desc}</p>
  </div>
);

const SettingsToggle: React.FC<{ label: string, active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
     <span className="text-[10px] font-black uppercase text-gray-300">{label}</span>
     <div className={`w-10 h-5 rounded-full relative p-0.5 transition-colors ${active ? 'bg-yellow-500' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 bg-black rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
     </div>
  </div>
);

export default App;
