
import React from 'react';
import { AppMode, OfflineModule } from '../types';
import { 
  Globe, 
  CheckSquare, 
  Calculator, 
  Search, 
  Mic,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  activeModule: OfflineModule;
  setActiveModule: (module: OfflineModule) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeMode, 
  setActiveMode, 
  activeModule, 
  setActiveModule
}) => {
  return (
    <div 
      className="min-h-screen flex flex-col max-w-[440px] mx-auto bg-slate-50 shadow-2xl relative overflow-hidden font-sans text-slate-900 border-x border-slate-200"
    >
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white p-4 shadow-xl" style={{ fontSize: '0.9rem' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-inner">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none uppercase" style={{ fontSize: '1rem' }}>陆压系统</h1>
              <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase" style={{ fontSize: '0.7rem' }}>Info Base V2.5</span>
            </div>
          </div>
          
          <div className="flex bg-slate-800 rounded-full p-1 border border-slate-700">
            <button 
              onClick={() => setActiveMode(AppMode.ONLINE)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${activeMode === AppMode.ONLINE ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500'}`}
              style={{ fontSize: '0.7rem' }}
            >
              联网
            </button>
            <button 
              onClick={() => setActiveMode(AppMode.OFFLINE)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${activeMode === AppMode.OFFLINE ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500'}`}
              style={{ fontSize: '0.7rem' }}
            >
              离线
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-32 scroll-smooth">
        {children}
      </main>

      {/* Navigation - Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] safe-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-40" style={{ fontSize: '0.8rem' }}>
        <NavButton 
          active={activeModule === OfflineModule.DONELIST} 
          onClick={() => setActiveModule(OfflineModule.DONELIST)}
          icon={<CheckSquare size={20} />}
          label="确认单"
        />
        <NavButton 
          active={activeModule === OfflineModule.CALC} 
          onClick={() => setActiveModule(OfflineModule.CALC)}
          icon={<Calculator size={20} />}
          label="计算器"
        />
        <NavButton 
          active={activeModule === OfflineModule.LOOKUP} 
          onClick={() => setActiveModule(OfflineModule.LOOKUP)}
          icon={<Search size={20} />}
          label="速查"
        />
        <NavButton 
          active={activeModule === OfflineModule.MEMO} 
          onClick={() => setActiveModule(OfflineModule.MEMO)}
          icon={<Mic size={20} />}
          label="速记"
        />
        <NavButton 
          active={activeModule === OfflineModule.SETTINGS} 
          onClick={() => setActiveModule(OfflineModule.SETTINGS)}
          icon={<SettingsIcon size={20} />}
          label="设置"
        />
      </nav>

      {activeMode === AppMode.ONLINE && (
        <div className="fixed bottom-24 right-6 bg-blue-600 text-white p-3 rounded-full shadow-2xl animate-bounce z-50 pointer-events-none ring-4 ring-blue-500/20">
          <Globe size={20} />
        </div>
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-16 transition-all duration-300 ${active ? 'text-blue-600 scale-110' : 'text-slate-400 opacity-70'}`}
    style={{ fontSize: '0.7rem' }}
  >
    <div className={`p-1 rounded-xl transition-colors ${active ? 'bg-blue-50' : 'bg-transparent'}`}>
      {icon}
    </div>
    <span className="text-[10px] font-black tracking-tighter" style={{ fontSize: '0.65rem' }}>{label}</span>
  </button>
);

export default Layout;
