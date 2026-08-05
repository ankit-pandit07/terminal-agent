export interface HistoryItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  success: boolean;
  history: HistoryItem[];
}