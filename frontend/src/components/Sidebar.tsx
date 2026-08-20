"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Binary, 
  TrendingUp, 
  Bookmark, 
  Briefcase, 
  Bell, 
  FileSpreadsheet, 
  Coins, 
  Globe, 
  Users, 
  History, 
  Settings, 
  ShieldAlert,
  Zap
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Scanner", href: "/scanner", icon: Binary },
    { name: "Hidden Divergence", href: "/hidden-divergence", icon: TrendingUp },
    { name: "Watchlist", href: "/watchlist", icon: Bookmark },
    { name: "Portfolio", href: "/portfolio", icon: Briefcase },
    { name: "Alerts", href: "/alerts", icon: Bell },
    { name: "Financial", href: "/financial", icon: FileSpreadsheet },
    { name: "Dividend", href: "/dividend", icon: Coins },
    { name: "Foreign Flow", href: "/foreign-flow", icon: Globe },
    { name: "Broker Summary", href: "/broker-summary", icon: Users },
    { name: "Backtest", href: "/backtest", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Admin", href: "/admin", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 fixed inset-y-0 left-0 glass-panel border-r border-border flex flex-col z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center pulse-indicator-cyan">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            SINYAL AI
          </span>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? "bg-gradient-to-r from-accent-purple/20 to-accent-cyan/10 text-accent-cyan border-l-2 border-accent-cyan shadow-md shadow-accent-purple/5" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? "text-accent-cyan" : "text-gray-400 group-hover:text-white"
              }`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer */}
      <div className="p-4 border-t border-border bg-black/20 text-center">
        <p className="text-[10px] text-gray-500">Sinyal Saham AI BEI v1.0.0</p>
      </div>
    </aside>
  );
}
