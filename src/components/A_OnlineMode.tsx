
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Send, Sparkles, AlertCircle } from 'lucide-react';
import { analyzeIndustrialImage } from '../services/geminiService';

const A_OnlineMode: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('分析此图纸的关键尺寸及可能的生产难点。');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const result = await analyzeIndustrialImage(base64, prompt);
      setAnalysis(result || '未能生成分析报告');
    } catch (error) {
      console.error(error);
      setAnalysis('分析失败，请检查网络或API配置。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Sparkles className="text-blue-300" /> AI 工业助手
        </h2>
        <p className="text-blue-100 text-sm leading-relaxed">
          通过 Gemini 2.5/3.0 大模型进行深度图纸解析、缺陷识别及工艺路线优化。
        </p>
      </div>

      {/* Image Upload Area */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase">上传分析对象 (图纸/缺陷照片)</label>
        <div className={`relative border-2 border-dashed rounded-2xl transition-all h-48 flex flex-col items-center justify-center bg-slate-50 ${image ? 'border-blue-500' : 'border-slate-300'}`}>
          {image ? (
            <>
              <img src={image} className="h-full w-full object-contain rounded-2xl" alt="Preview" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
              >
                <AlertCircle size={16} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <ImageIcon size={48} className="opacity-20" />
              <p className="text-xs">点击下方按钮上传</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center justify-center gap-2 bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm text-slate-600 active:bg-slate-100 cursor-pointer">
            <ImageIcon size={18} /> 相册
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
          <label className="flex items-center justify-center gap-2 bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm text-slate-600 active:bg-slate-100 cursor-pointer">
            <Camera size={18} /> 拍照
            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      {/* Control Input */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase">分析指令</label>
        <div className="relative">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button 
            onClick={handleAnalyze}
            disabled={!image || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>

      {/* Analysis Output */}
      {analysis && (
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="font-bold text-slate-800">分析结果</h3>
          </div>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
};

export default A_OnlineMode;
