import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Paperclip, FileText, Image as ImageIcon, X, ChevronUp, Download } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useSocial } from '../../context/SocialContext';

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

const ChatWindow = ({ activeChat, onSendMessage }) => {
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { sendTypingStatus, loadMoreMessages } = useSocial();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const firstUnreadIndex = activeChat?.messages
    ? activeChat.messages.findIndex((msg) => msg.senderId !== 'me' && msg.status !== 'read')
    : -1;

  // Auto-scroll message list to the bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current && !loadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages?.length, activeChat?.status]);

  // Manage typing indicator status reset on switching active chats
  useEffect(() => {
    setSelectedFile(null);
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && activeChat?.id) {
        sendTypingStatus(activeChat.id, false);
      }
      isTypingRef.current = false;
    };
  }, [activeChat?.id]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setMessageText(text);

    if (!activeChat?.id) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingStatus(activeChat.id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingStatus(activeChat.id, false);
    }, 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectedFile({
        type: isImage ? 'image' : 'file',
        fileUrl: evt.target.result,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB'
      });
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be chosen again if needed
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasText = messageText.trim().length > 0;
    if (!hasText && !selectedFile) return;

    const mediaPayload = selectedFile ? {
      type: selectedFile.type,
      fileUrl: selectedFile.fileUrl,
      fileName: selectedFile.fileName,
      fileSize: selectedFile.fileSize
    } : {};

    const textToSend = hasText ? messageText.trim() : (selectedFile ? (selectedFile.type === 'image' ? '[Photo]' : `[File] ${selectedFile.fileName}`) : '');

    onSendMessage(textToSend, mediaPayload);
    setMessageText('');
    setSelectedFile(null);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (activeChat?.id) {
      isTypingRef.current = false;
      sendTypingStatus(activeChat.id, false);
    }
  };

  const handleLoadMore = async () => {
    if (!activeChat?.messages || activeChat.messages.length === 0 || loadingMore) return;
    const oldestMsg = activeChat.messages[0];
    if (!oldestMsg.createdAt) return;

    setLoadingMore(true);
    await loadMoreMessages(activeChat.id, oldestMsg.createdAt);
    setLoadingMore(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'offline';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffMinutes < 1) return 'offline • last seen just now';
    if (diffMinutes < 60) return `offline • last seen ${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `offline • last seen ${diffHours}h ago`;
    return `offline • last seen ${date.toLocaleDateString()}`;
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-transparent dark:bg-slate-950/20 p-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-450 dark:text-slate-700 mb-4 shadow-inner">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Select a Conversation</h3>
        <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
          Choose a user from the sidebar feed to view chat history and start syncing real-time events.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-transparent dark:bg-slate-950/20 h-full overflow-hidden relative">

      {/* Header Panel */}
      <div className="h-16 px-6 bg-slate-50/40 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative select-none">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-bold text-sm">
              {getInitials(activeChat.name)}
            </div>
            <span className={`
              absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-950
              ${activeChat.status === 'online' ? 'bg-emerald-500' : ''}
              ${activeChat.status === 'typing' ? 'bg-indigo-400 animate-pulse' : ''}
              ${activeChat.status === 'offline' ? 'bg-slate-600' : ''}
            `} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activeChat.name}</h4>
            <p className="text-[10px] text-slate-500 font-medium capitalize">
              {activeChat.status === 'typing'
                ? 'typing...'
                : activeChat.status === 'online'
                  ? 'online'
                  : formatLastSeen(activeChat.lastSeen)
              }
            </p>
          </div>
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {/* Pagination Trigger */}
        {activeChat.messages && activeChat.messages.length >= 20 && (
          <div className="flex justify-center my-2">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>{loadingMore ? 'Loading history...' : 'Load older messages'}</span>
            </button>
          </div>
        )}

        {activeChat.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-600 select-none">
            No messages yet. Send a greeting to start the conversation!
          </div>
        ) : (
          activeChat.messages.map((msg, index) => {
            const isMe = msg.senderId === 'me';
            return (
              <div key={msg.id || index} className="w-full flex flex-col">
                {index === firstUnreadIndex && (
                  <div className="flex items-center w-full my-4 select-none">
                    <div className="flex-grow border-t border-white/10 dark:border-white/5" />
                    <span className="mx-4 text-[10px] tracking-wider uppercase font-bold text-white bg-white/10 dark:bg-white/5 px-2.5 py-1 rounded-full shadow-sm">
                      New Messages
                    </span>
                    <div className="flex-grow border-t border-white/10 dark:border-white/5" />
                  </div>
                )}
                <div
                  className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[70%] px-4 py-2.5 shadow-md flex flex-col gap-1.5
                    ${isMe
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-none'
                      : 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none'
                    }
                  `}>

                    {/* Image Attachment Rendering */}
                    {msg.type === 'image' && msg.fileUrl && (
                      <div className="rounded-xl overflow-hidden cursor-pointer border border-black/10 dark:border-white/10 my-1 max-w-sm">
                        <img
                          src={msg.fileUrl}
                          alt={msg.fileName || 'Attachment photo'}
                          className="w-full max-h-60 object-cover hover:scale-105 transition-transform duration-200"
                          onClick={() => setPreviewImageModal(msg.fileUrl)}
                        />
                      </div>
                    )}

                    {/* File Attachment Rendering */}
                    {msg.type === 'file' && msg.fileUrl && (
                      <div className={`
                        flex items-center gap-3 p-2.5 rounded-xl border my-1
                        ${isMe
                          ? 'bg-indigo-700/40 border-indigo-400/30 text-white'
                          : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }
                      `}>
                        <FileText className="w-6 h-6 shrink-0 opacity-80" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{msg.fileName || 'Document'}</p>
                          {msg.fileSize && <p className="text-[9px] opacity-70">{msg.fileSize}</p>}
                        </div>
                        <a
                          href={msg.fileUrl}
                          download={msg.fileName || 'file'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {/* Text Message Content */}
                    {msg.text && (
                      <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                    )}

                    <div className="flex items-center gap-1 self-end select-none mt-0.5">
                      <span className={`
                        text-[9px] font-semibold
                        ${isMe ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}
                      `}>
                        {msg.timestamp}
                      </span>
                      {isMe && (
                        <span className="shrink-0 flex items-center">
                          {msg.status === 'read' ? (
                            <CheckCheckIcon className="w-3.5 h-3.5 text-sky-300" />
                          ) : (
                            <CheckIcon className="w-3.5 h-3.5 text-indigo-200/80" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Lightbox Modal */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageModal}
              alt="Full view"
              className="w-full h-full object-contain max-h-[85vh] rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Form Input Bar */}
      <div className="p-4 bg-slate-50/40 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-900/60 shrink-0 relative">
        {/* Typing indicator */}
        {activeChat.status === 'typing' && (
          <div className="absolute top-[-27px] left-6 flex items-center gap-1.5 text-[13px] text-slate-550 dark:text-slate-400 select-none animate-fade-in mb-2">
            <span className="font-semibold italic">typing</span>
            <div className="flex gap-0.5 items-center pt-0.5">
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Selected Attachment Chip Preview */}
        {selectedFile && (
          <div className="mb-2.5 flex items-center gap-2 p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-600 dark:text-indigo-300 w-fit animate-fade-in">
            {selectedFile.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span className="font-semibold max-w-xs truncate">{selectedFile.fileName}</span>
            <span className="text-[10px] opacity-75">({selectedFile.fileSize})</span>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-indigo-500/20 rounded-md text-indigo-400 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 items-center" noValidate>
          {/* File input trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Attach image or document"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <Input
              name="message"
              type="text"
              placeholder={selectedFile ? "Add a caption (optional)..." : "Type a message..."}
              value={messageText}
              onChange={handleInputChange}
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            className="h-[42px] px-5 rounded-xl shrink-0"
            icon={Send}
          >
            Send
          </Button>
        </form>
      </div>

    </div>
  );
};

export default ChatWindow;
