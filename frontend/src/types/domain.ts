export type ReadingStatus = 'reading' | 'completed' | 'on-hold' | 'dropped' | 'planning';

export interface Manhwa {
  _id: string;
  userId: string;
  title: string;
  cover?: string;
  totalChapters?: number;
  status: ReadingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  _id: string;
  userId: string;
  manhwaId: string;
  currentChapter: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRecord {
  _id: string;
  userId: string;
  manhwaId: string;
  latestChapter: number;
  unread: number;
  lastChecked: string;
}
