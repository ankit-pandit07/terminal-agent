export default function DashboardLayout({
    children,
}:{
    children:React.ReactNode;
}){
    return (
        <div className="flex h-screen">
            <aside className="w-64 border-r">
                Sidebar
            </aside>
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}