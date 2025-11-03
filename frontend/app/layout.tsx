// Em: frontend/app/layout.tsx
'use client'; 

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css"; 
import { Providers } from "./providers"; 
import { Sidebar } from "@/components/sidebar";
import { useState } from "react"; 
import { Button } from "@/components/ui/button"; 
import { Menu, Hamburger } from "lucide-react"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="pt-br">
      <head>
        <title>Nola Analytics (Desafio)</title>
        <meta name="description" content="Dashboard analítico para o desafio God Level Coder" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body className={`${geistSans.variable} antialiased`}>
        <Providers>
          <div className="relative lg:flex">
            
            <Sidebar 
              isMobileOpen={isSidebarOpen} 
              setMobileOpen={setIsSidebarOpen} 
            />

  
            <div className="flex-1 flex flex-col lg:h-screen">
              
              <header className="lg:hidden sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
                <div className="flex items-center">
                  <Hamburger className="h-6 w-6 text-[#F25050] mr-2"/>
                  <h2 className="text-lg font-bold">Rest. da Maria</h2>
                </div>
                
                <Button 
                  onClick={() => setIsSidebarOpen(true)} 
                  variant="ghost" 
                  size="icon"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </header>

              <main className="flex-1 overflow-y-auto">
               {children}
              </main>

            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}