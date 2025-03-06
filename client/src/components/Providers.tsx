'use client'
import { ThemeProvider } from "@/context/ThemeContext"
import { SocketProvider } from "@/context/SocketContext"
import { ChatProvider } from "@/context/ChatContext"
import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <SocketProvider>
      <ChatProvider>
        <ThemeProvider>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </ThemeProvider>
      </ChatProvider>
    </SocketProvider>
  )
}