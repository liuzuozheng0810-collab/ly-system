
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { AppMode, OfflineModule, Checklist, LookupCategory, LookupItem } from './types';
import A_OnlineMode from './components/A_OnlineMode';
import B1_DoneList from './components/B1_DoneList';
import B2_Calculators from './components/B2_Calculators';
import B3_InfoLookup from './components/B3_InfoLookup';
import B4_QuickMemos from './components/B4_QuickMemos';
import Settings from './components/Settings';
import { searchDatabase, inspectionTemplates } from './data/data';

const APP_VERSION = '1.0.0';

const INITIAL_CHECKLISTS: Checklist[] = inspectionTemplates.map((t, idx) => ({
  id: `list-${idx}`,
  title: t.category,
  items: t.items.map((item, iIdx) => ({ 
    id: `${idx}-${iIdx}`, 
    label: item.content, 
    completed: item.status === '已完成' 
  }))
}));

const INITIAL_CATEGORIES: LookupCategory[] = searchDatabase.map((cat, idx) => ({ 
  id: `cat-${idx}`, 
  label: cat.category,
  color: 'bg-slate-50 text-slate-600 border-slate-200'
}));

const INITIAL_LOOKUP_DATA: LookupItem[] = searchDatabase.flatMap((cat, idx) => 
  cat.items.map((item, iIdx) => ({
    id: `item-${idx}-${iIdx}`,
    categoryId: `cat-${idx}`,
    title: item.title,
    subtitle: item.subtitle,
    fields: item.fields
  }))
);

const syncChecklists = (savedData: any, initialData: Checklist[]): Checklist[] => {
  if (!savedData) return initialData;
  
  try {
    const parsed = JSON.parse(savedData);
    if (!Array.isArray(parsed)) return initialData;
    
    return initialData.map(initialList => {
      const savedList = parsed.find((s: Checklist) => s.id === initialList.id);
      if (!savedList) return initialList;
      
      return {
        ...initialList,
        items: initialList.items.map(initialItem => {
          const savedItem = savedList.items.find((s: any) => s.id === initialItem.id);
          return {
            ...initialItem,
            completed: savedItem?.completed ?? initialItem.completed
          };
        })
      };
    });
  } catch (error) {
    console.error('Failed to sync checklists:', error);
    return initialData;
  }
};

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.OFFLINE);
  const [activeModule, setActiveModule] = useState<OfflineModule>(OfflineModule.DONELIST);
  
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('LUYA_FONT_SIZE');
    return saved ? parseInt(saved) : 14;
  });

  const [checklists, setChecklists] = useState<Checklist[]>(() => {
    const savedVersion = localStorage.getItem('LUYA_APP_VERSION');
    if (savedVersion !== APP_VERSION) {
      localStorage.clear();
      localStorage.setItem('LUYA_APP_VERSION', APP_VERSION);
      return INITIAL_CHECKLISTS;
    }
    const saved = localStorage.getItem('LUYA_CHECKLIST_STATE');
    return syncChecklists(saved, INITIAL_CHECKLISTS);
  });

  const [categories, setCategories] = useState<LookupCategory[]>(() => {
    const savedVersion = localStorage.getItem('LUYA_APP_VERSION');
    if (savedVersion !== APP_VERSION) {
      return INITIAL_CATEGORIES;
    }
    const saved = localStorage.getItem('LUYA_CATEGORIES');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [lookupData, setLookupData] = useState<LookupItem[]>(() => {
    const savedVersion = localStorage.getItem('LUYA_APP_VERSION');
    if (savedVersion !== APP_VERSION) {
      return INITIAL_LOOKUP_DATA;
    }
    const saved = localStorage.getItem('LUYA_LOOKUP_DATA');
    return saved ? JSON.parse(saved) : INITIAL_LOOKUP_DATA;
  });

  useEffect(() => {
    localStorage.setItem('LUYA_FONT_SIZE', fontSize.toString());
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('LUYA_CHECKLIST_STATE', JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    localStorage.setItem('LUYA_CATEGORIES', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('LUYA_LOOKUP_DATA', JSON.stringify(lookupData));
  }, [lookupData]);

  const resetToInitialData = () => {
    localStorage.removeItem('LUYA_CHECKLIST_STATE');
    localStorage.removeItem('LUYA_CATEGORIES');
    localStorage.removeItem('LUYA_LOOKUP_DATA');
    setChecklists(INITIAL_CHECKLISTS);
    setCategories(INITIAL_CATEGORIES);
    setLookupData(INITIAL_LOOKUP_DATA);
  };

  const renderContent = () => {
    if (activeMode === AppMode.ONLINE) return <A_OnlineMode />;
    
    switch (activeModule) {
      case OfflineModule.DONELIST:
        return <B1_DoneList checklists={checklists} setChecklists={setChecklists} />;
      case OfflineModule.CALC:
        return <B2_Calculators />;
      case OfflineModule.LOOKUP:
        return <B3_InfoLookup categories={categories} lookupData={lookupData} />;
      case OfflineModule.MEMO:
        return <B4_QuickMemos />;
      case OfflineModule.SETTINGS:
        return (
          <Settings 
            fontSize={fontSize} 
            setFontSize={setFontSize} 
            checklists={checklists}
            setChecklists={setChecklists}
            categories={categories}
            setCategories={setCategories}
            lookupData={lookupData}
            setLookupData={setLookupData}
            onResetData={resetToInitialData}
          />
        );
      default:
        return <B1_DoneList checklists={checklists} setChecklists={setChecklists} />;
    }
  };

  return (
    <Layout 
      activeMode={activeMode} 
      setActiveMode={setActiveMode}
      activeModule={activeModule}
      setActiveModule={setActiveModule}
    >
      <div className="h-full bg-slate-50 transition-colors duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
