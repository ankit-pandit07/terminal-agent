type Props={
    message:string;
    role:"user"|"assistant";
};

export function MessageItem({
    message,
    role,
}:Props){
    return (
        <div>
            {message}
        </div>
    )
}