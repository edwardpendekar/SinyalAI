import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Sinyal Saham AI - IDX Stock Scanner",
  description: "AI Stock Scanner & Divergence Detector for Indonesia Stock Exchange (IDX)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <div className="flex">
          {/* Fixed Navigation Sidebar */}
          <Sidebar />
          
          {/* Main Layout Area */}
          <div className="flex-1 pl-64 min-h-screen flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-border px-8 flex items-center justify-between sticky top-0 glass-panel z-10">
              <div className="flex items-center gap-4">
                <h1 className="font-semibold text-lg text-white">Console</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald pulse-indicator-cyan"></span>
                  <span className="text-xs text-gray-400">Database Connected</span>
                </div>
                <div className="w-[1px] h-4 bg-border"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/30">
                    <span className="text-xs font-semibold text-accent-purple">AD</span>
                  </div>
                  <span className="text-xs font-medium text-gray-300">Admin Quant</span>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <main className="flex-grow p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
