import { Search } from 'lucide-react';
import Input from '../ui/Input';

const CheckIcon = ({ className = "" }) => (
  <svg 
    viewBox="0 0 16 16" 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3.5 8.5L6.5 11.5L12 6" />
  </svg>
);

const CheckCheckIcon = ({ className = "" }) => (
  <svg 
    viewBox="0 0 16 16" 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M1.5 8.5L4.5 11.5L10 6" />
    <path d="M5.5 8.5L8.5 11.5L14 6" />
  </svg>
);

const ChatList = ({
  conversations = [],
  activeChatId,
  setActiveChatId,
  searchQuery,
  setSearchQuery,
}) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="w-full md:w-80 md:shrink-0 bg-slate-50/50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800/60 p-4 flex flex-col h-full overflow-hidden">
      {/* Search Header */}
      <div className="mb-4">
        <Input
          name="chat-search"
          placeholder="Search conversations..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Conversations Scrollable Feed */}
      <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
        {conversations.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">
            No conversations found
          </div>
        ) : (
          conversations.map((chat) => {
            const isActive = chat.id === activeChatId;
            const lastMsg = chat.messages[chat.messages.length - 1];
            
            return (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200
                  ${isActive 
                    ? 'bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-md dark:shadow-slate-950/20' 
                    : 'bg-transparent border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/30'
                  }
                `}
              >
                {/* Avatar Initials Circle */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-bold text-sm select-none">
                    {getInitials(chat.name)}
                  </div>
                  {/* Status indicator dot */}
                  <span className={`
                    absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900
                    ${chat.status === 'online' ? 'bg-emerald-500' : ''}
                    ${chat.status === 'typing' ? 'bg-indigo-400 animate-pulse' : ''}
                    ${chat.status === 'offline' ? 'bg-slate-600' : ''}
                  `} />
                </div>

                {/* Info Text Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{chat.name}</p>
                    {lastMsg && (
                      <span className="text-[10px] text-slate-500 font-medium shrink-0">
                        {lastMsg.timestamp}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1.5 mt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {lastMsg && lastMsg.senderId === 'me' && (
                        <span className="shrink-0 flex items-center">
                          {lastMsg.status === 'read' ? (
                            <CheckCheckIcon className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                          ) : (
                            <CheckIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          )}
                        </span>
                      )}
                      <p className={`
                        text-xs truncate flex-1
                        ${chat.status === 'typing' 
                          ? 'text-indigo-400 font-semibold italic' 
                          : 'text-slate-500 dark:text-slate-400'
                        }
                      `}>
                        {chat.status === 'typing'
                          ? 'typing...'
                          : lastMsg
                            ? lastMsg.type === 'image'
                              ? '📷 Photo'
                              : lastMsg.type === 'file'
                                ? `📄 ${lastMsg.fileName || 'File'}`
                                : lastMsg.text
                            : 'No messages yet'
                        }
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/30 animate-pulse">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
