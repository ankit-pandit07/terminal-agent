export interface StreamRequest{
    message:string;
    conversationId?:string;
}

export interface StreamEvent{
    type:string;
    [key:string]:unknown;
}

export async function streamChat(
    body:StreamRequest,
    onEvent:(event:StreamEvent)=>void,
){
    const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream`,
    {
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Accept:"text/event-stream",
        },

        body:JSON.stringify(body),
    }
);

if(!response.body){
    throw new Error("Stream not available");
}

const reader = response.body.getReader();
const decoder=new TextDecoder();

let buffer="";

while(true){
    const {done,value}=await reader.read();

    if(done) break;
    buffer +=decoder.decode(value,{
        stream:true,
    });

    const events=buffer.split("\n\n");

    buffer=events.pop() ?? "";

    for (const event of events){
        const dataLine=event.split("\n").find((line)=>line.startsWith("data"));

        if(!dataLine) continue;

        const json=JSON.parse(
            dataLine.replace("data:", "").trim(),
        );
        onEvent(json);
    }
}
}