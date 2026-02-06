import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, Trash2, Clock, Plus, Save } from 'lucide-react';
import { Memo } from '../types';

const B4_QuickMemos: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [memos, setMemos] = useState<Memo[]>(() => {
    const saved = localStorage.getItem('LUYA_MEMOS');
    return saved ? JSON.parse(saved) : [];
  });
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('LUYA_MEMOS', JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setTranscript(fullTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const saveMemo = (content: string) => {
    if (!content.trim()) return;
    const newMemo: Memo = {
      id: Date.now().toString(),
      text: content.trim(),
      timestamp: Date.now()
    };
    setMemos(prev => [newMemo, ...prev]);
    setTranscript('');
    setManualText('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制');
  };

  const deleteMemo = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="p-4 flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="px-2">
        <h2 style={{ fontSize: '1.5rem' }} className="font-black text-slate-800 flex items-center gap-2">现场速记</h2>
        <p style={{ fontSize: '0.7rem' }} className="text-slate-500 font-medium">语音自动转换或文字手工记录</p>
      </div>

      {/* Recording Shell */}
      <div className="bg-slate-900 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-8 shadow-2xl relative overflow-hidden">
        {isRecording && (
          <div className="absolute inset-0 bg-blue-600/10 animate-pulse pointer-events-none" />
        )}
        
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30 scale-150"></div>
          )}
          <button 
            onClick={toggleRecording}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] rotate-90' : 'bg-blue-600 shadow-xl'}`}
          >
            {isRecording ? <MicOff size={36} className="text-white" /> : <Mic size={36} className="text-white" />}
          </button>
        </div>
        
        <div className="space-y-2">
          <p style={{ fontSize: '1.1rem' }} className="text-white font-black uppercase tracking-widest">{isRecording ? '正在记录' : '点击开启语音'}</p>
          <p style={{ fontSize: '0.65rem' }} className="text-slate-400 font-bold">建议在嘈杂环境靠近麦克风</p>
        </div>

        {isRecording && transcript && (
          <div className="w-full bg-slate-800/50 backdrop-blur p-6 rounded-[2rem] border border-slate-700 max-h-40 overflow-y-auto animate-in zoom-in duration-300">
            <p style={{ fontSize: '0.85rem' }} className="text-blue-300 font-bold leading-relaxed">{transcript}</p>
            <button 
              onClick={() => saveMemo(transcript)}
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg"
              style={{ fontSize: '0.7rem' }}
            >
              <Save size={14} /> 保存当前记录
            </button>
          </div>
        )}
      </div>

      {/* Manual Entry Toggle */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Plus size={16} />
          <span style={{ fontSize: '0.65rem' }} className="font-black uppercase tracking-widest">文本输入</span>
        </div>
        <textarea 
          value={manualText}
          onChange={e => setManualText(e.target.value)}
          placeholder="或者在这里输入文字记录..."
          className="w-full bg-slate-50 rounded-2xl p-4 font-bold outline-none border border-slate-100 focus:border-blue-200 transition-all min-h-[100px]"
          style={{ fontSize: '0.85rem' }}
        />
        {manualText && (
          <button 
            onClick={() => saveMemo(manualText)}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-transform"
            style={{ fontSize: '0.7rem' }}
          >
            立即保存记录
          </button>
        )}
      </div>

      {/* History List */}
      <div className="space-y-4 pb-24">
        <h3 style={{ fontSize: '0.65rem' }} className="font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
          <Clock size={14} /> 历史记录 ({memos.length})
        </h3>
        
        {memos.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <p style={{ fontSize: '0.85rem' }} className="text-slate-300 font-bold">暂无记录档案</p>
          </div>
        ) : (
          <div className="space-y-3">
            {memos.map(memo => (
              <div key={memo.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow animate-in slide-in-from-bottom-2 duration-300">
                <p style={{ fontSize: '0.85rem' }} className="text-slate-800 leading-relaxed font-bold">{memo.text}</p>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-50">
                  <span style={{ fontSize: '0.65rem' }} className="text-slate-400 font-black">
                    {new Date(memo.timestamp).toLocaleString()}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => copyToClipboard(memo.text)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Copy size={18} /></button>
                    <button onClick={() => deleteMemo(memo.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default B4_QuickMemos;
