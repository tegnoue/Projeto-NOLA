
import type { Metadata } from "next";
import { Geist } from "next/font/google"; 
import "./globals.css"; 
import { Providers } from "./providers"; 
import { Sidebar } from "@/components/sidebar";
import { GlobalFilters } from "@/components/global-filters";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nola Analytics (Desafio)",
  description: "Dashboard analítico para o desafio God Level Coder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 h-screen overflow-y-auto">
              <GlobalFilters />
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}