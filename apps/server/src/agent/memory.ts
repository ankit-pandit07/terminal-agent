export interface Message{
    role:"user"|"assistant";
    content:string;
}

export class ConversationMemory{
    private message:Message[]=[];

    add(role:Message["role"],content:string){
        this.message.push({
            role,
            content
        })

        if(this.message.length>20){
            this.message.shift();
        }
    }
    getHistory(){
        return this.message;
    }
    clear(){
        this.message=[];
    }
}