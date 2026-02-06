import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X,
  ChevronRight,
  ArrowLeft,
  Info,
  Layers,
  Database
} from 'lucide-react';
import { LookupItem, LookupCategory } from '../types';

interface B3Props {
  categories: LookupCategory[];
  lookupData: LookupItem[];
}

const B3_InfoLookup: React.FC<B3Props> = ({ categories, lookupData }) => {
  const [currentView, setCurrentView] = useState<'categories' | 'list'>('categories');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const filteredItems = useMemo(() => {
    return lookupData.filter(item => {
      const matchesCategory = activeCategoryId ? item.categoryId === activeCategoryId : true;
      const query = searchQuery.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(query) || 
                            item.subtitle?.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategoryId, searchQuery, lookupData]);

  const handleBack = () => {
    setCurrentView('categories');
    setActiveCategoryId(null);
    setSearchQuery('');
  };

  if (currentView === 'categories') {
    return (
      <div className="p-4 space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategoryId(cat.id); setCurrentView('list'); }}
              className="group relative flex flex-col p-3 bg-white rounded-[2rem] border border-slate-200 shadow-sm active:scale-[0.98] transition-all text-left overflow-hidden"
            >
              <div className="absolute top-1/2 right-0 -translate-y-1/2 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Layers size={30} />
              </div>
              <h3 style={{ fontSize: '0.9rem' }} className="font-black text-slate-800 leading-tight pr-12">{cat.label}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
      <div className="sticky top-0 bg-slate-50 z-20 pt-4 px-4 space-y-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm active:scale-90 transition-all">
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h2 style={{ fontSize: '1.1rem' }} className="font-black text-slate-800 leading-none">{activeCategory?.label}</h2>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索关键词..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-inner focus:ring-4 focus:ring-blue-100 outline-none font-bold"
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="p-4 space-y-3 pb-24">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center">
            <Info className="mx-auto text-slate-200 mb-4" size={48} />
            <p style={{ fontSize: '0.85rem' }} className="text-slate-400 font-bold">没有找到匹配项</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white py-3 px-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between text-left active:bg-slate-50 transition-all group min-h-[4.5rem]"
            >
              <div className="flex-1 pr-4">
                <h4 style={{ fontSize: '0.85rem' }} className="font-black text-slate-800 group-active:text-blue-600 transition-colors">{item.title}</h4>
                {item.subtitle && <p style={{ fontSize: '0.65rem' }} className="text-slate-400 mt-1 font-bold uppercase tracking-wider">{item.subtitle}</p>}
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-slate-300 group-hover:text-blue-500 transition-colors">
                <ChevronRight size={18} />
              </div>
            </button>
          ))
        )}
      </div>

      {/* Modern Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full duration-500 ease-out">
            <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Database size={100} />
              </div>
              <h2 style={{ fontSize: '1.4rem' }} className="font-black leading-tight mb-1">{selectedItem.title}</h2>
              <p style={{ fontSize: '0.65rem' }} className="text-blue-400 font-black uppercase tracking-widest">{selectedItem.subtitle}</p>
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto bg-slate-50/50">
              {selectedItem.fields.map((field: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                  <span style={{ fontSize: '0.65rem' }} className="text-slate-400 font-black mb-2 uppercase tracking-widest block">{field.label}</span>
                  <p style={{ fontSize: '0.85rem' }} className="font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{field.value}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
               <button onClick={() => setSelectedItem(null)} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl active:scale-95 transition-transform tracking-widest uppercase" style={{ fontSize: '0.7rem' }}>
                 确定并关闭
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B3_InfoLookup;
