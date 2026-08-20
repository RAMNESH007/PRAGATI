import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Sidebar } from '../common/Sidebar';
import { ToastContainer } from '../common/ToastContainer';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col font-sans">
      {/* Top Bar */}
      <Header 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen} 
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex">
        {/* Fixed Navigation Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onCloseMobile={() => setIsSidebarOpen(false)} 
        />

        {/* Dynamic Content Canvas */}
        <main className="flex-1 lg:ml-64 p-3 sm:p-5 lg:p-6 min-w-0 transition-[margin]">
          <div className="max-w-7xl mx-auto space-y-5">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Interactive Notification Toasts */}
      <ToastContainer />
    </div>
  );
};
