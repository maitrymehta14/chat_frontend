import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocial } from '../context/SocialContext';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { Search, UserPlus, Clock, MessageSquare, Check, X } from 'lucide-react';

const UsersPage = () => {
  const navigate = useNavigate();
  const { users, sendRequest, acceptRequest, declineRequest, cancelRequest } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out ourselves or other users by search query
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleNavigateToChat = (userId) => {
    // Navigate to Chat page and pass selection state
    navigate('/chat', { state: { selectUserId: userId } });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 animate-fade-in">

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-200">Explore Developers</h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
              Find, connect, and sync sockets with peer developers.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              name="user-search"
              placeholder="Search by name or email..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Developers Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 font-medium text-sm">
              No developers found matching "{searchQuery}"
            </div>
          ) : (
            filteredUsers.map((dev) => (
              <Card key={dev.id} hoverable className="flex flex-col justify-between h-[180px] p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar Sphere */}
                  <div className="relative shrink-0 select-none">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-bold text-base">
                      {getInitials(dev.name)}
                    </div>
                    {/* Active Activity indicator dot */}
                    <span className={`
                      absolute bottom-[-1.5px] right-[-1.5px] w-3 h-3 rounded-full border-2 border-white dark:border-slate-900
                      ${dev.status === 'online' || dev.status === 'typing' ? 'bg-emerald-500' : ''}
                      ${dev.status === 'offline' ? 'bg-slate-600' : ''}
                    `} />
                  </div>

                  {/* Profile data details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{dev.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{dev.email}</p>
                    {dev.status === 'offline' && dev.lastSeen && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        Last seen {new Date(dev.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    <span className={`
                      inline-block mt-1.5 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded
                      ${dev.relation === 'accepted' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/10' : ''}
                      ${dev.relation === 'pending_sent' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/10' : ''}
                      ${dev.relation === 'pending_received' ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/10' : ''}
                      ${dev.relation === 'none' ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800/40' : ''}
                    `}>
                      {dev.relation === 'accepted' && 'Connected'}
                      {dev.relation === 'pending_sent' && 'Request Sent'}
                      {dev.relation === 'pending_received' && 'Pending Invitation'}
                      {dev.relation === 'none' && 'Not Connected'}
                    </span>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/60">
                  {dev.relation === 'none' && (
                    <Button
                      onClick={() => sendRequest(dev.id)}
                      className="w-full text-xs font-semibold"
                      variant="outline"
                      size="sm"
                      icon={UserPlus}
                    >
                      Connect
                    </Button>
                  )}

                  {dev.relation === 'pending_sent' && (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 text-xs font-semibold pointer-events-none cursor-default"
                        variant="secondary"
                        size="sm"
                        disabled
                        icon={Clock}
                      >
                        Pending
                      </Button>
                      <Button
                        onClick={() => cancelRequest(dev.id)}
                        className="flex-1 text-xs font-semibold hover:bg-red-500/10 hover:text-red-400 border border-slate-300 dark:border-slate-700/80"
                        variant="outline"
                        size="sm"
                        icon={X}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {dev.relation === 'pending_received' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => acceptRequest(dev.id)}
                        className="flex-1 text-xs font-semibold"
                        variant="primary"
                        size="sm"
                        icon={Check}
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => declineRequest(dev.id)}
                        className="flex-1 text-xs font-semibold"
                        variant="outline"
                        size="sm"
                        icon={X}
                      >
                        Decline
                      </Button>
                    </div>
                  )}

                  {dev.relation === 'accepted' && (
                    <Button
                      onClick={() => handleNavigateToChat(dev.id)}
                      className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 border border-transparent"
                      size="sm"
                      icon={MessageSquare}
                    >
                      Send Message
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default UsersPage;
