import {useState} from "react"

export function useChat(){
    const [loading, setLoading]=useState(false);

    async function send(message:string){

    }

    return {
        loading,
        send,
    }
}