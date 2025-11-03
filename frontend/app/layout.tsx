'use client'; // Necessário para o estado de toggle da sidebar

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
  // Estado para controlar a sidebar no mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="pt-br">
      <head>
        {/* Adicionar <title> e <meta> manualmente */}
        <title>Nola Analytics (Desafio)</title>
        <meta name="description" content="Dashboard analítico para o desafio God Level Coder" />
        
        {/* ESSENCIAL para design mobile-friendly */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body className={`${geistSans.variable} antialiased`}>
        <Providers>
          {/* Layout responsivo */}
          <div className="relative min-h-screen lg:flex">
            
            {/* Sidebar agora recebe props para controle mobile */}
            <Sidebar 
              isMobileOpen={isSidebarOpen} 
              setMobileOpen={setIsSidebarOpen} 
            />

            {/* Conteúdo Principal */}
            <div className="flex-1 flex flex-col">
              
              {/* Header Mobile (só aparece em telas menores que 'lg') */}
              <header className="lg:hidden sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
                {/* Título do header mobile */}
                <div className="flex items-center">
                  <Hamburger className="h-6 w-6 text-[#F25050] mr-2"/>
                  <h2 className="text-lg font-bold">Rest. da Maria</h2>
                </div>
                
                {/* Botão Hamburger para abrir o menu */}
                <Button 
                  onClick={() => setIsSidebarOpen(true)} 
                  variant="ghost" 
                  size="icon"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </header>

              {/* O <main> original, mas agora dentro do layout responsivo */}
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