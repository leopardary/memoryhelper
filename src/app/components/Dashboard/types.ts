export interface SubscriptionObj {
  userId: string;
  memoryPieceId: string;
  status: 'new' | 'learning' | 'learned' | 'lapsed';
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