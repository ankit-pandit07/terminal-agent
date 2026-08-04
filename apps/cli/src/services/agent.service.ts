import axios from "axios";

export interface ChatResponse {
    success:boolean;
    output:string;
    conversationId: string;
}

export class AgentService {
    private readonly api= axios.create({
        baseURL:"http://localhost:5000",
        timeout:30000,
    });

    async chat(message:string){
        const response=await this.api.post("/chat",{
            message,
        })
 console.log("SERVER RESPONSE:");
  console.log(response.data);
        return response.data;
    }
    
}