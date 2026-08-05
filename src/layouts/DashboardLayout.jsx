import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronRight,
  Settings
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
      
      {/* Sidebar for desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/80 p-6 flex flex-col justify-between
        transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-md bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent tracking-wide">
                  NEXUS
                </span>
                <span className="text-[9px] block text-slate-500 uppercase tracking-widest font-semibold">
                  Dashboard
                </span>
              </div>
            </div>
            
            {/* Mobile close button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }
                  `}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Info */}
        <div className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-indigo-400 font-bold text-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'JD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'John Doe'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'john.doe@example.com'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay backdrop for mobile when sidebar is toggled */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden cursor-pointer"
        />
      )}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Main Header / Top navbar */}
        <header className="h-16 shrink-0 px-6 bg-slate-900/40 border-b border-slate-900/60 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle for mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb representation */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Pages</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-indigo-400 font-semibold">Dashboard</span>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            {/* Mock Search Bar */}
            <div className="relative hidden md:flex items-center">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Quick search..."
                className="bg-slate-950 border border-slate-800/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all w-48 focus:w-60"
              />
            </div>

            {/* Notification alert icon */}
            <button className="p-2 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 rounded-xl transition-all relative cursor-pointer">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <Bell className="w-4.5 h-4.5" />
            </button>

            {/* Settings button */}
            <button className="p-2 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer">
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
