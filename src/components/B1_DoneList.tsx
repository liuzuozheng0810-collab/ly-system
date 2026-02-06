
import React, { useState } from 'react';
import { Checklist } from '../types';
import { ChevronDown, ChevronRight, Square, CheckSquare } from 'lucide-react';

interface B1Props {
  checklists: Checklist[];
  setChecklists: React.Dispatch<React.SetStateAction<Checklist[]>>;
}

const B1_DoneList: React.FC<B1Props> = ({ checklists, setChecklists }) => {
  // 默认不展开任何项
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleItem = (listId: string, itemId: string) => {
    setChecklists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      return {
        ...list,
        items: list.items.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
      };
    }));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        {checklists.map(list => {
          const isExpanded = expandedId === list.id;
          const completedCount = list.items.filter(i => i.completed).length;
          const progress = list.items.length > 0 ? (completedCount / list.items.length) * 100 : 0;

          return (
            <div key={list.id} className={`bg-white rounded-[2rem] border transition-all duration-300 ${isExpanded ? 'border-blue-200 shadow-lg ring-4 ring-blue-50/50' : 'border-slate-200 shadow-sm'}`}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : list.id)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-black uppercase px-2 py-0.5 rounded-full ${completedCount === list.items.length && list.items.length > 0 ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`} style={{ fontSize: '0.65rem' }}>
                      {completedCount === list.items.length && list.items.length > 0 ? '已完成' : '待核对'}
                    </span>
                    <h3 className={`font-bold ${isExpanded ? 'text-blue-600' : 'text-slate-700'}`} style={{ fontSize: '0.75rem' }}>{list.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ${completedCount === list.items.length && list.items.length > 0 ? 'bg-green-500' : 'bg-blue-500'}`} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <span className="font-black text-slate-400 min-w-[30px]" style={{ fontSize: '0.6rem' }}>{completedCount}/{list.items.length}</span>
                  </div>
                </div>
                {isExpanded ? <ChevronDown size={20} className="text-blue-500 ml-4" /> : <ChevronRight size={20} className="text-slate-300 ml-4" />}
              </button>

              {isExpanded && (
                <div className="px-2 pb-2 bg-slate-50/50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="divide-y divide-slate-100">
                    {list.items.length === 0 && (
                      <div className="p-8 text-center text-slate-400 font-bold" style={{ fontSize: '0.7rem' }}>暂无检查项</div>
                    )}
                    {list.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(list.id, item.id)}
                        className="w-full flex items-center gap-4 p-5 text-left active:bg-white rounded-2xl transition-all group"
                      >
                        {item.completed ? (
                          <CheckSquare className="text-blue-600 flex-shrink-0" size={22} />
                        ) : (
                          <Square className="text-slate-200 flex-shrink-0 group-active:text-blue-300" size={22} />
                        )}
                        <span className={`font-bold transition-all ${item.completed ? 'text-slate-300 line-through' : 'text-slate-600'}`} style={{ fontSize: '0.85rem' }}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default B1_DoneList;
