import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-indigo-500/30 transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Abstract Background Decoration - Opacity refined for Light/Dark transitions */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/[0.08] blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/[0.08] blur-[100px] rounded-full -z-10 pointer-events-none" />

        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="p-6 md:p-10">
            <Outlet />
          </div>
        </main>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-[var(--bg-primary)]/60 backdrop-blur-sm z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </div>
    </div>
  );
}
