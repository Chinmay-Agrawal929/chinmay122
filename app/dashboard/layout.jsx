import React from "react";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LogOut, Home, User, FileText, Settings } from "lucide-react";

const bricolageGrotesque = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-bricolage-grotesque" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-space-grotesk" });

export default function DashboardLayout({ children }) {
  return (
    <div className={cn("min-h-screen bg-[#09090b] text-zinc-100 flex font-space", spaceGrotesk.variable, bricolageGrotesque.variable)}>
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Link href="/" className="text-xl font-bricolage font-bold text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-white to-zinc-400 flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-sm" />
            </div>
            Recruitment
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 text-white font-medium">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-colors">
            <User className="w-4 h-4" /> Profile
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-colors">
            <FileText className="w-4 h-4" /> Applications
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-zinc-800">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors text-left">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 flex md:hidden items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950">
          <Link href="/" className="text-lg font-bricolage font-bold text-white">Recruitment</Link>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
