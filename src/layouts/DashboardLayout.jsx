import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MessageSquare,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Settings,
  Users,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useTheme } from '../context/ThemeContext';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const { logout, user } = useAuth();
  const { 
    notifications, 
    pendingRequests,
    acceptRequest, 
    declineRequest, 
    clearNotification,
    myStatus,
    changeMyStatus
  } = useSocial();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const incomingCount = pendingRequests?.filter((r) => r.direction === 'received')?.length || 0;

  const navItems = [
    { name: 'Developers', path: '/users', icon: Users },
    { name: 'Friends', path: '/friends', icon: UserCheck, badge: incomingCount },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
  ];

  // Derive active path label
  const getActiveLabel = () => {
    if (window.location.pathname.startsWith('/users')) return 'Developers';
    if (window.location.pathname.startsWith('/friends')) return 'Friends & Requests';
    if (window.location.pathname.startsWith('/chat')) return 'Chat';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 flex font-sans overflow-hidden">

      {/* Sidebar for desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 p-6 flex flex-col justify-between
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
                  Workspace
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 md:hidden cursor-pointer"
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
                    flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border-l-3 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/5'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 border-l-3 border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Info */}
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-bold text-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'JD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'John Doe'}</p>
              <div className="flex items-center gap-1.5 mt-0.5 select-none">
                <span className={`w-1.5 h-1.5 rounded-full ${myStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                <button
                  onClick={() => changeMyStatus(myStatus === 'active' ? 'away' : 'active')}
                  className="text-[9px] font-extrabold tracking-widest text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 uppercase transition-all duration-150 cursor-pointer"
                >
                  {myStatus}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer"
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

      {/* Close dropdowns on clicking outside */}
      {isNotificationsOpen && (
        <div
          onClick={() => setIsNotificationsOpen(false)}
          className="fixed inset-0 z-10 bg-transparent"
        />
      )}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Main Header / Top navbar */}
        <header className="h-16 shrink-0 px-6 bg-white/65 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-900/60 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle for mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb representation */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Pages</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{getActiveLabel()}</span>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3 relative">
            {/* Mock Search Bar */}
            <div className="relative hidden md:flex items-center">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Quick search..."
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-all w-48 focus:w-60 focus:bg-white dark:focus:bg-slate-950"
              />
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notification alert icon button */}
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-all relative cursor-pointer"
            >
              {notifications.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[9px] font-black animate-pulse">
                  {notifications.length}
                </span>
              )}
              <Bell className="w-4.5 h-4.5" />
            </button>

            {/* Notification Dropdown Panel */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-800 dark:text-slate-300">Requests & Alerts</span>
                  <span className="text-[10px] text-slate-500">{notifications.length} pending</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2.5 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 font-medium select-none">
                      No new requests or alerts
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-950 rounded-xl flex flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-slate-700 dark:text-slate-300 leading-normal">{n.message}</p>
                          <span className="text-[9px] text-slate-500 dark:text-slate-600 shrink-0 font-medium">{n.timestamp}</span>
                        </div>

                        {/* Request Accept/Decline action buttons */}
                        {n.type === 'incoming_request' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                acceptRequest(n.userId);
                                setIsNotificationsOpen(false);
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => declineRequest(n.userId)}
                              className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {/* Invitation accepted action buttons */}
                        {n.type === 'request_accepted' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                clearNotification(n.id);
                                navigate('/chat', { state: { selectUserId: n.userId } });
                                setIsNotificationsOpen(false);
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              Chat Now
                            </button>
                            <button
                              onClick={() => clearNotification(n.id)}
                              className="px-2.5 py-1 text-[10px] font-bold border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        )}

                        {/* Normal system notifications clear */}
                        {n.type === 'alert' && (
                          <button
                            onClick={() => clearNotification(n.id)}
                            className="text-[9px] font-bold border border-slate-800 hover:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md self-start transition-colors cursor-pointer"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Settings button */}
            <button className="p-2 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer">
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
          {children}
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
