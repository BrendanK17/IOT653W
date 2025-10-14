import { ReactNode } from "react"
import { Header } from "./Header"
import { ViewType } from "../../types"

interface MainLayoutProps {
  children: ReactNode
  className?: string
  isLoggedIn: boolean
  onNavigate: (view: ViewType) => void
}

export function MainLayout({
  children,
  className = "",
  isLoggedIn,
  onNavigate
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header
        isLoggedIn={isLoggedIn}
        onNavigate={onNavigate}
      />
      <main className={`pt-16 ${className}`}>
        {children}
      </main>
    </div>
  )
}