import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocial } from '../context/SocialContext';
import DashboardLayout from '../layouts/DashboardLayout';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage = () => {
  const { conversations, sendMessage, activeChatId, setActiveChatId } = useSocial();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  // Sync activeChatId with passed redirect selectUserId state, or fallback to first active conversation
  useEffect(() => {
    const selectUserId = location.state?.selectUserId;
    if (selectUserId) {
      const timer = setTimeout(() => {
        setActiveChatId(selectUserId);
        // Clean redirect state from React Router history to avoid sticky navigation locks
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
      return () => clearTimeout(timer);
    } else if (conversations.length > 0 && activeChatId === null) {
      const timer = setTimeout(() => {
        setActiveChatId(conversations[0].id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [location.state, conversations, activeChatId, navigate, location.pathname]);

  // Handle message sending by mapping to SocialContext dispatch action
  const handleSendMessage = (text, mediaPayload) => {
    if (activeChatId) {
      sendMessage(activeChatId, text, mediaPayload);
    }
  };

  // Filter conversations based on search criteria
  const filteredConversations = conversations.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChat = conversations.find((chat) => chat.id === activeChatId);

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">

        {/* Header Title */}
        <div className="shrink-0 flex items-center justify-between p-4 pb-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-200">Messages</h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
              Sync and chat with active developers in real-time.
            </p>
          </div>
        </div>

        {/* WhatsApp split screen panel container */}
        <div className="flex-1 flex border border-slate-200 dark:border-slate-800/60 overflow-hidden min-h-0 bg-white/20 dark:bg-slate-950/20">
          <ChatList
            conversations={filteredConversations}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <ChatWindow
            activeChat={activeChat}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
