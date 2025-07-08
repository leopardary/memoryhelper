export type SubscriptionStatus = 'new' | 'learning' | 'learned' | 'lapsed';

export interface SubscriptionObj {
  userId: string;
  memoryPieceId: string;
  status: SubscriptionStatus;
  easeFactor: number;
  currentInterval: number;
  nextTestDate: string;
}

export interface MemoryPieceObj {
  id: string;
  content: string;
  imageUrls: string[];
  description: string;
  labels: string[];
}

export interface MemoryCheckObj {
  id: string;
  subscriptionId: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionOverallRecord {
  subscription: SubscriptionObj;
  memoryPiece: MemoryPieceObj;
  memoryChecks: MemoryCheckObj[];
}

export interface TestResult {
  id: string;
  memoryPieceId: string;
  score: number;
  maxScore: number;
  testDate: string;
}

export interface MemoryPieceStat {
  memoryPiece: MemoryPieceObj;
  status: SubscriptionStatus;
  results: TestResult[];
  avgScore: number;
  lastScore: number;
  trend: 'up' | 'down' | 'stable';
  totalTests: number;
}
