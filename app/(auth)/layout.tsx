import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-svh flex-col bg-muted/30">
            <header className="flex h-16 items-center px-6 md:px-10 border-b bg-background">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GalleryVerticalEnd className="size-5" />
                    </div>
                    Internflow
                </Link>
            </header>
            <main className="flex flex-1 items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </main>
        </div>
    )
}
