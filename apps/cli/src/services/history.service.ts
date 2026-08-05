import { HistoryResponse } from "../types/history.types.js";

export interface HistoryItem{
    id:string;
    title:string;
    createdAt:string;
    updatedAt:string
}

export class HistoryService {
    private readonly baseUrl = "http://localhost:5000";

    async getHistory(): Promise<HistoryItem[]>{
        const response=await fetch(`${this.baseUrl}/chat/history`);

        if(!response.ok){
            throw new Error("Unable to fetch conversation history.")
        }

        const result = (await response.json()) as HistoryResponse;

        return result.history;
    }
}