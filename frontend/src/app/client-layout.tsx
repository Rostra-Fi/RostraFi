"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import { ReduxProvider } from "@/providers/ReduxProvider"
import AppWalletProvider from "../components/AppWalletProvider"
import { Toaster } from "react-hot-toast"
import { Toaster as ToasterAll } from "@/components/ui/toaster"
import ClientSide from "@/components/ClientSide"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <>
      <style jsx global>{`
        /* Hide Spline watermark */
        #spline-watermark,
        [id*="spline"],
        [class*="spline-watermark"],
        div[style*="position: absolute"][style*="bottom: 16px"][style*="right: 16px"],
        div[style*="pointer-events: auto"][style*="position: absolute"][style*="right: 16px"][style*="bottom: 16px"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Ensure smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Make sure spline doesn't interfere with scrolling */
        .spline-background {
          pointer-events: none;
        }
        
        .spline-background canvas {
          pointer-events: none !important;
        }
      `}</style>

      <AppWalletProvider>
        <ReduxProvider>
          <ClientSide>
            {isHomePage && <Navbar />}
            {children}
          </ClientSide>
          <ToasterAll />
          <Toaster position="top-center" />
        </ReduxProvider>
      </AppWalletProvider>
    </>
  )
}