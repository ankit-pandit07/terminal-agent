import axios from "axios";

export interface ChatResponse {
    success:boolean;
    output:string;
    conversationId: string;
}

export class AgentService {
    private readonly api= axios.create({
        baseURL: process.env.API_URL || "http://localhost:5000",
        timeout:30000,
    });

    async chat(message:string){
        const response=await this.api.post("/chat",{
            message,
        })

        return response.data;
    }
    
}