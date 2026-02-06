import React, { useState, useRef } from 'react';
import { 
  Type, 
  Download, 
  Trash2, 
  Plus,
  X,
  Edit2,
  Database,
  CheckSquare,
  LayoutGrid,
  Upload
} from 'lucide-react';
import { Checklist, LookupItem, LookupCategory } from '../types';

interface SettingsProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  checklists: Checklist[];
  setChecklists: (lists: Checklist[]) => void;
  categories: LookupCategory[];
  setCategories: (cats: LookupCategory[]) => void;
  lookupData: LookupItem[];
  setLookupData: (data: LookupItem[]) => void;
  onResetData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  fontSize, 
  setFontSize, 
  checklists, 
  setChecklists,
  categories,
  setCategories,
  lookupData,
  setLookupData,
  onResetData
}) => {
  const [activeTab, setActiveTab] = useState<'system' | 'checklists' | 'lookup'>('system');
  const checklistInputRef = useRef<HTMLInputElement>(null);
  const lookupInputRef = useRef<HTMLInputElement>(null);

  const parseCSVLine = (text: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else { current += char; }
    }
    result.push(current.trim());
    return result;
  };

  const exportChecklistCSV = () => {
    let csvContent = "\ufeff确认单类别,检查项内容,状态\n";
    checklists.forEach(list => {
      list.items.forEach(item => {
        csvContent += `"${list.title.replace(/"/g, '""')}","${item.label.replace(/"/g, '""')}","${item.completed ? '已完成' : '未完成'}"\n`;
      });
    });
    downloadCSV(csvContent, "Checklists");
  };

  const exportLookupCSV = () => {
    let csvContent = "\ufeff档案类别,标题,副标题,字段名,内容\n";
    lookupData.forEach(item => {
      const catLabel = categories.find(c => c.id === item.categoryId)?.label || item.categoryId;
      item.fields.forEach(f => {
        csvContent += `"${catLabel.replace(/"/g, '""')}","${item.title.replace(/"/g, '""')}","${(item.subtitle || '').replace(/"/g, '""')}","${f.label.replace(/"/g, '""')}","${f.value.replace(/"/g, '""')}"\n`;
      });
    });
    downloadCSV(csvContent, "Lookup_Database");
  };

  const downloadCSV = (content: string, name: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SmartHub_${name}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportChecklists = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) return;
      const dataLines = lines.slice(1);
      const newLists: { [key: string]: Checklist } = {};
      dataLines.forEach(line => {
        const parts = parseCSVLine(line);
        if (parts.length < 2) return;
        const [cat, itemLabel, status] = parts;
        if (!newLists[cat]) { newLists[cat] = { id: `list-${Date.now()}-${cat}`, title: cat, items: [] }; }
        newLists[cat].items.push({ id: `item-${Date.now()}-${itemLabel}`, label: itemLabel, completed: status === '已完成' });
      });
      if (Object.values(newLists).length > 0) {
        setChecklists(Object.values(newLists));
        alert(`成功导入 ${Object.values(newLists).length} 个确认单分类`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const handleImportLookup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) return;
      const dataLines = lines.slice(1);
      const importedCats: { [key: string]: LookupCategory } = {};
      const importedItems: { [key: string]: LookupItem } = {};
      dataLines.forEach(line => {
        const parts = parseCSVLine(line);
        if (parts.length < 5) return;
        const [catLabel, title, subtitle, fieldLabel, fieldContent] = parts;
        if (!importedCats[catLabel]) {
          importedCats[catLabel] = { id: `cat-${catLabel}`, label: catLabel, color: 'bg-slate-50 text-slate-600 border-slate-200' };
        }
        const itemKey = `${catLabel}-${title}-${subtitle}`;
        if (!importedItems[itemKey]) {
          importedItems[itemKey] = { id: `item-${Date.now()}-${itemKey}`, categoryId: importedCats[catLabel].id, title, subtitle, fields: [] };
        }
        importedItems[itemKey].fields.push({ label: fieldLabel, value: fieldContent });
      });
      if (Object.values(importedCats).length > 0) {
        setCategories(Object.values(importedCats));
        setLookupData(Object.values(importedItems));
        alert(`成功导入 ${Object.values(importedCats).length} 个分类，共 ${Object.values(importedItems).length} 条技术档案`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const renderTabContent = () => {
    if (activeTab === 'checklists') {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="flex justify-between items-center px-1">
            <h3 style={{ fontSize: '0.9rem' }} className="font-bold text-slate-800">确认单管理</h3>
            <div className="flex gap-2">
               <button onClick={() => checklistInputRef.current?.click()} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 active:scale-95 transition-all" title="导入CSV">
                 <Upload size={18}/>
               </button>
               <button onClick={() => {
                const title = prompt("新分类名称:");
                if (title) setChecklists([...checklists, { id: `list-${Date.now()}`, title, items: [] }]);
              }} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all"><Plus size={18}/></button>
            </div>
          </div>
          {checklists.map(list => (
            <div key={list.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span style={{ fontSize: '0.85rem' }} className="font-bold text-blue-600">{list.title}</span>
                <button onClick={() => {
                  const label = prompt("新检查项:");
                  if (label) setChecklists(checklists.map(l => l.id === list.id ? {...l, items: [...l.items, {id: Date.now().toString(), label, completed: false}]} : l));
                }} style={{ fontSize: '0.65rem' }} className="text-blue-500 font-bold uppercase tracking-wider">+ 添加项</button>
              </div>
              <div className="space-y-2">
                {list.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg" style={{ fontSize: '0.75rem' }}>
                    <span className="flex-1 truncate pr-4">{item.label}</span>
                    <button onClick={() => setChecklists(checklists.map(l => l.id === list.id ? {...l, items: l.items.filter(i => i.id !== item.id)} : l))} className="text-red-400 p-1"><X size={14}/></button>
                  </div>
                ))}
              </div>
              <button onClick={() => {if(confirm("确定删除分类？")) setChecklists(checklists.filter(l => l.id !== list.id))}} style={{ fontSize: '0.65rem' }} className="w-full text-red-400 font-bold text-center mt-2">删除分类</button>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'lookup') {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="flex justify-between items-center px-1">
            <h3 style={{ fontSize: '0.9rem' }} className="font-bold text-slate-800">速查档案编辑</h3>
            <div className="flex gap-2">
              <button onClick={() => lookupInputRef.current?.click()} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 active:scale-95 transition-all" title="导入CSV">
                <Upload size={18}/>
              </button>
              <button onClick={() => {
                const label = prompt("输入分类名称:");
                if (label) setCategories([...categories, { id: `cat-${Date.now()}`, label, color: 'bg-slate-50 text-slate-600 border-slate-200' }]);
              }} className="flex items-center gap-1 bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold active:scale-95 transition-all" style={{ fontSize: '0.75rem' }}>
                <Plus size={14} /> 新增分类
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span style={{ fontSize: '0.85rem' }} className="font-bold text-slate-800">{cat.label}</span>
                  <div className="flex gap-2">
                     <button onClick={() => {
                       const title = prompt("档案标题:");
                       if (title) setLookupData([...lookupData, { id: `item-${Date.now()}`, categoryId: cat.id, title, subtitle: prompt("副标题:") || '', fields: [] }]);
                     }} style={{ fontSize: '0.65rem' }} className="text-blue-600 font-bold uppercase tracking-wider">+ 增档案</button>
                     <button onClick={() => {if(confirm("删除分类及所有档案？")) {setCategories(categories.filter(c => c.id !== cat.id)); setLookupData(lookupData.filter(i => i.categoryId !== cat.id));}}} className="text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="space-y-4">
                  {lookupData.filter(i => i.categoryId === cat.id).map(item => (
                    <div key={item.id} className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1"><p style={{ fontSize: '0.85rem' }} className="font-bold text-slate-700">{item.title}</p><p style={{ fontSize: '0.65rem' }} className="text-slate-400">{item.subtitle}</p></div>
                        <button onClick={() => setLookupData(lookupData.filter(i => i.id !== item.id))} className="text-red-400"><X size={14}/></button>
                      </div>
                      <div className="space-y-1.5">
                        {item.fields.map((f, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100" style={{ fontSize: '0.65rem' }}>
                             <span className="flex-1"><strong className="text-blue-600">{f.label}:</strong> {f.value}</span>
                             <button onClick={() => {
                               const newFields = [...item.fields];
                               newFields.splice(idx, 1);
                               setLookupData(lookupData.map(it => it.id === item.id ? {...it, fields: newFields} : it));
                             }} className="text-slate-300 hover:text-red-400 ml-2"><X size={12}/></button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => {
                        const label = prompt("字段名:");
                        if (label) {
                          const value = prompt("内容:");
                          setLookupData(lookupData.map(it => it.id === item.id ? {...it, fields: [...it.fields, {label, value: value || ''}]} : it));
                        }
                      }} className="w-full py-2 bg-white font-bold text-slate-500 rounded-lg border border-dashed border-slate-200" style={{ fontSize: '0.65rem' }}>+ 新增字段</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold"><Type className="text-blue-500" /><h3 style={{ fontSize: '0.9rem' }}>界面字体</h3></div>
          <div className="space-y-4">
            <input type="range" min="12" max="22" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none accent-blue-500"/>
            <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100 text-slate-600" style={{ fontSize: `${fontSize}px` }}>Preview Text: 工业助手字体预览</div>
          </div>
        </section>

        <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-bold"><Database className="text-blue-500" /><h3 style={{ fontSize: '0.9rem' }}>数据同步</h3></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <h4 style={{ fontSize: '0.65rem' }} className="font-bold text-slate-400 px-1 uppercase tracking-wider">确认单</h4>
              <button onClick={exportChecklistCSV} className="w-full flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all active:scale-95">
                <Download className="text-green-500" size={16} /><span style={{ fontSize: '0.75rem' }} className="font-bold">导出备份</span>
              </button>
              <button onClick={() => checklistInputRef.current?.click()} className="w-full flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all active:scale-95">
                <Upload className="text-blue-500" size={16} /><span style={{ fontSize: '0.75rem' }} className="font-bold">导入恢复</span>
              </button>
            </div>
            <div className="space-y-3">
              <h4 style={{ fontSize: '0.65rem' }} className="font-bold text-slate-400 px-1 uppercase tracking-wider">速查库</h4>
              <button onClick={exportLookupCSV} className="w-full flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all active:scale-95">
                <Download className="text-blue-500" size={16} /><span style={{ fontSize: '0.75rem' }} className="font-bold">导出备份</span>
              </button>
              <button onClick={() => lookupInputRef.current?.click()} className="w-full flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all active:scale-95">
                <Upload className="text-indigo-500" size={16} /><span style={{ fontSize: '0.75rem' }} className="font-bold">导入恢复</span>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white p-5 rounded-3xl border border-red-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-red-900 font-bold"><Trash2 className="text-red-500" /><h3 style={{ fontSize: '0.9rem' }}>重置数据</h3></div>
          <p style={{ fontSize: '0.75rem' }} className="text-slate-500">将所有确认单和速查库数据恢复到初始状态，此操作不可撤销。</p>
          <button onClick={() => {if(confirm('确定要重置所有数据到初始状态吗？此操作不可撤销！')) onResetData();}} className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-2xl border border-red-200 transition-all active:scale-95 text-red-600 font-bold">
            <Trash2 size={16} /><span style={{ fontSize: '0.85rem' }}>重置所有数据</span>
          </button>
        </section>
      </div>
    );
  };

  return (
    <div className="p-6 pb-24 space-y-6 bg-slate-50 min-h-full">
      <input type="file" ref={checklistInputRef} onChange={handleImportChecklists} accept=".csv" className="hidden" style={{ display: 'none' }} />
      <input type="file" ref={lookupInputRef} onChange={handleImportLookup} accept=".csv" className="hidden" style={{ display: 'none' }} />
      
      <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200">
        <button onClick={() => setActiveTab('system')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'system' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`} style={{ fontSize: '0.75rem' }}><Edit2 size={14}/> 系统</button>
        <button onClick={() => setActiveTab('checklists')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'checklists' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`} style={{ fontSize: '0.75rem' }}><CheckSquare size={14}/> 确认单</button>
        <button onClick={() => setActiveTab('lookup')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'lookup' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`} style={{ fontSize: '0.75rem' }}><LayoutGrid size={14}/> 速查库</button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Settings;
