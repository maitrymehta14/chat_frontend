import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocial } from '../context/SocialContext';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  MessageSquare,
  Check,
  X,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Send,
  Inbox
} from 'lucide-react';

const FriendsPage = () => {
  const navigate = useNavigate();
  const {
    users,
    pendingRequests,
    acceptRequest,
    declineRequest,
    cancelRequest
  } = useSocial();

  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'requests'
  const [searchQuery, setSearchQuery] = useState('');

  // Accepted friends
  const friendsList = users.filter((u) => u.relation === 'accepted');
  const filteredFriends = friendsList.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pending requests: split into incoming vs sent
  const incomingRequests = pendingRequests.filter((r) => r.direction === 'received');
  const sentRequests = pendingRequests.filter((r) => r.direction === 'sent');

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
    navigate('/chat', { state: { selectUserId: userId } });
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 animate-fade-in">

        {/* Header Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-200">
              Connections Hub
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
              Manage your accepted friendships and real-time chat requests.
            </p>
          </div>

          {/* Tab Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-300/40 dark:border-slate-700/60 self-start sm:self-auto shadow-inner">
            <button
              onClick={() => setActiveTab('friends')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                ${activeTab === 'friends'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              <UserCheck className="w-4 h-4" />
              <span>Friends</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                {friendsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                ${activeTab === 'requests'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              <Clock className="w-4 h-4" />
              <span>Requests</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Friends View */}
        {activeTab === 'friends' && (
          <div className="space-y-5">
            {/* Search Bar */}
            <div className="w-full sm:w-72">
              <Input
                name="friend-search"
                placeholder="Search friends..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Friends Grid */}
            {filteredFriends.length === 0 ? (
              <div className="py-20 text-center bg-white/40 dark:bg-slate-900/30 rounded-3xl border border-slate-200/80 dark:border-slate-800/60 p-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-4 shadow-inner">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  {searchQuery ? 'No matching friends found' : 'No connected friends yet'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
                  {searchQuery
                    ? 'Try searching with a different name or email query.'
                    : 'Explore the Developers directory to discover peers and send your first connection request.'}
                </p>
                {!searchQuery && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-5 inline-flex items-center gap-2"
                    onClick={() => navigate('/users')}
                  >
                    <UserPlus className="w-4 h-4" />
                    Explore Developers
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredFriends.map((friend) => (
                  <Card key={friend.id} hoverable className="flex flex-col justify-between h-[190px] p-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar with live presence indicator */}
                      <div className="relative shrink-0 select-none">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700/70 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-base shadow-sm">
                          {getInitials(friend.name)}
                        </div>
                        <span className={`
                          absolute bottom-[-1.5px] right-[-1.5px] w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900
                          ${friend.status === 'online' || friend.status === 'typing' ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-500'}
                        `} />
                      </div>

                      {/* Info Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {friend.name}
                          </h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 truncate">{friend.email}</p>

                        <div className="mt-2 flex items-center gap-2">
                          <span className={`
                            inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider
                            ${friend.status === 'online' || friend.status === 'typing'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                            }
                          `}>
                            <span className={`w-1.5 h-1.5 rounded-full ${friend.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {friend.status === 'online' ? 'Online' : 'Offline'}
                          </span>

                          {friend.status === 'offline' && friend.lastSeen && (
                            <span className="text-[10px] text-slate-400 truncate">
                              {new Date(friend.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Friends
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigateToChat(friend.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Requests Manager View */}
        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Column 1: Incoming Requests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Incoming Requests ({incomingRequests.length})
                  </h2>
                </div>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="py-12 text-center bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 p-6">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-slate-500 font-medium">No incoming requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map((req) => (
                    <Card key={req._id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
                          {getInitials(req.sender?.user_name)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {req.sender?.user_name || 'Developer'}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Sent {new Date(req.createdAt).toLocaleDateString()} at{' '}
                            {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => acceptRequest(req.sender.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => declineRequest(req.sender.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Outgoing Sent Requests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Sent Requests ({sentRequests.length})
                  </h2>
                </div>
              </div>

              {sentRequests.length === 0 ? (
                <div className="py-12 text-center bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 p-6">
                  <Send className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-slate-500 font-medium">No outgoing pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((req) => (
                    <Card key={req._id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-100 dark:border-slate-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm shrink-0">
                          {getInitials(req.receiver?.user_name)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {req.receiver?.user_name || 'Developer'}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            <Clock className="w-3 h-3" /> Awaiting confirmation
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => cancelRequest(req.receiver?.id || req.receiver)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default FriendsPage;
