
export enum AppMode {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export enum OfflineModule {
  DONELIST = 'DONELIST',
  CALC = 'CALC',
  LOOKUP = 'LOOKUP',
  MEMO = 'MEMO',
  SETTINGS = 'SETTINGS'
}

export interface CheckItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: CheckItem[];
}

export interface Memo {
  id: string;
  text: string;
  timestamp: number;
  category?: string;
}

export interface LookupField {
  label: string;
  value: string;
}

export interface LookupItem {
  id: string;
  categoryId: string;
  title: string;
  subtitle?: string;
  fields: LookupField[];
}

export interface LookupCategory {
  id: string;
  label: string;
  color?: string;
}
