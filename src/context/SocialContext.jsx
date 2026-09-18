/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import {
  getUsers,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getMessages,
  sendMessageApi,
  getConversations
} from '../services/api';

const SocialContext = createContext(null);

export const SocialProvider = ({ children }) => {
  const { token, user } = useAuth();
  
  const socketRef = useRef(null);
  const [myStatus, setMyStatus] = useState('active');
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // Avoid stale closures in socket events
  const activeChatIdRef = useRef(null);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Helper mapper for relationship status states
  const mapRelation = (status, direction) => {
    if (status === 'friends') return 'accepted';
    if (status === 'pending') {
      return direction === 'sent' ? 'pending_sent' : 'pending_received';
    }
    return 'none';
  };

  // Fetch initial REST data for developers list, conversations sidebar feed & friend requests
  useEffect(() => {
    if (!token) {
      setUsers([]);
      setNotifications([]);
      setPendingRequests([]);
      return;
    }

    const loadInitialData = async () => {
      try {
        const [usersRes, requestsRes, convsRes, friendsRes] = await Promise.all([
          getUsers().catch(() => ({ success: false })),
          getFriendRequests().catch(() => ({ success: false })),
          getConversations().catch(() => ({ success: false })),
          getFriends().catch(() => ({ success: false }))
        ]);

        const convsMap = new Map();
        if (convsRes.success && Array.isArray(convsRes.conversations)) {
          convsRes.conversations.forEach((c) => {
            if (c.friend && c.friend.id) {
              convsMap.set(String(c.friend.id), c);
            }
          });
        }

        if (usersRes.success && Array.isArray(usersRes.users)) {
          const mappedUsers = usersRes.users.map((u) => {
            const conv = convsMap.get(String(u.id));
            const seededMessages = conv && conv.lastMessage ? [
              {
                id: conv.conversationKey || `seed_${u.id}`,
                senderId: conv.friend?.id === u.id ? u.id : 'me',
                text: conv.lastMessage,
                type: conv.lastMessageType || 'text',
                timestamp: conv.lastMessageAt
                  ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '',
                createdAt: conv.lastMessageAt || new Date().toISOString(),
                status: 'delivered'
              }
            ] : [];

            return {
              id: u.id,
              name: u.user_name,
              email: u.email,
              status: u.isActive ? 'online' : 'offline',
              lastSeen: u.lastSeen || null,
              relation: mapRelation(u.requestStatus, u.requestDirection),
              unreadCount: conv ? (conv.unreadCount || 0) : (u.unreadCount || 0),
              messages: seededMessages
            };
          });
          setUsers(mappedUsers);
        }

        if (requestsRes.success && Array.isArray(requestsRes.requests)) {
          setPendingRequests(requestsRes.requests);

          // Build incoming requests notification array
          const incomingNotifs = requestsRes.requests
            .filter((r) => r.direction === 'received')
            .map((r) => ({
              id: r._id,
              type: 'incoming_request',
              userId: r.sender.id,
              userName: r.sender.user_name,
              message: `${r.sender.user_name} sent you a chat request.`,
              timestamp: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
            }));
          setNotifications(incomingNotifs);
        }
      } catch (err) {
        console.error('Error loading initial social data:', err);
      }
    };

    loadInitialData();
  }, [token]);

  // Establish Socket.IO real-time event listeners
  useEffect(() => {
    if (!token) {
      socketRef.current = null;
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: { token },
      headers: { Authorization: `Bearer ${token}` },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    newSocket.on('auth-success', (data) => {
      console.log('Socket authenticated successfully:', data);
    });

    newSocket.on('auth-error', (err) => {
      console.error('Socket authentication failed:', err.message || err);
    });

    newSocket.on('user-online', (data) => {
      console.log('User online event received:', data);
      if (user && String(data.userId) === String(user.id)) return;
      setUsers((prevUsers) => {
        const userIdStr = String(data.userId);
        const exists = prevUsers.some((u) => String(u.id) === userIdStr);
        if (exists) {
          return prevUsers.map((u) =>
            String(u.id) === userIdStr ? { ...u, status: 'online' } : u
          );
        } else {
          return [
            ...prevUsers,
            {
              id: data.userId,
              name: data.username,
              email: `${data.username.toLowerCase()}@example.com`,
              status: 'online',
              relation: 'none',
              unreadCount: 0,
              messages: [],
            },
          ];
        }
      });
    });

    newSocket.on('user-offline', (data) => {
      console.log('User offline event received:', data);
      if (user && String(data.userId) === String(user.id)) return;
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          String(u.id) === String(data.userId) ? { ...u, status: 'offline' } : u
        )
      );
    });

    newSocket.on('user-status-update', (data) => {
      console.log('User status update event received:', data);
      if (user && String(data.userId) === String(user.id)) return;
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          String(u.id) === String(data.userId) ? { ...u, status: data.isActive ? 'online' : 'offline' } : u
        )
      );
    });

    newSocket.on('friend-request:received', (data) => {
      console.log('Friend request received event:', data);
      const req = data.request;
      
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          String(u.id) === String(req.sender.id) ? { ...u, relation: 'pending_received' } : u
        )
      );

      setPendingRequests((prev) => {
        const exists = prev.some((r) => r._id === req._id);
        if (exists) return prev;
        return [
          {
            _id: req._id,
            status: req.status,
            direction: 'received',
            sender: { id: req.sender.id, user_name: req.sender.user_name },
            receiver: { id: user?.id, user_name: user?.name },
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
      });

      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === req._id);
        if (exists) return prev;
        return [
          {
            id: req._id,
            type: 'incoming_request',
            userId: req.sender.id,
            userName: req.sender.user_name,
            message: `${req.sender.user_name} sent you a chat request.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
          },
          ...prev,
        ];
      });
    });

    newSocket.on('friend-request:accepted', (data) => {
      console.log('Friend request accepted event:', data);
      const req = data.request;
      const otherId = String(req.senderId) === String(user?.id) ? String(req.receiverId) : String(req.senderId);

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          String(u.id) === otherId ? { ...u, relation: 'accepted' } : u
        )
      );

      setPendingRequests((prev) => prev.filter((r) => r._id !== req._id));
      
      setNotifications((prev) => prev.filter((n) => !(n.id === req._id && n.type === 'incoming_request')));

      setUsers((prevUsers) => {
        const otherUserObj = prevUsers.find((u) => String(u.id) === otherId);
        setNotifications((prev) => [
          {
            id: req._id,
            type: 'request_accepted',
            userId: otherId,
            userName: otherUserObj?.name || 'A developer',
            message: `${otherUserObj?.name || 'A developer'} accepted your chat request.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
          },
          ...prev,
        ]);
        return prevUsers;
      });
    });

    newSocket.on('friend-request:rejected', (data) => {
      console.log('Friend request rejected event:', data);
      const req = data.request;
      const otherId = String(req.senderId) === String(user?.id) ? String(req.receiverId) : String(req.senderId);

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          String(u.id) === otherId ? { ...u, relation: 'none' } : u
        )
      );

      setPendingRequests((prev) => prev.filter((r) => r._id !== req._id));
      setNotifications((prev) => prev.filter((n) => n.id !== req._id && !(n.userId === otherId && n.type === 'incoming_request')));
    });

    newSocket.on('friend-request:cancelled', (data) => {
      console.log('Friend request cancelled event:', data);
      const req = data.request;
      const otherId = String(req.senderId) === String(user?.id) ? String(req.receiverId) : String(req.senderId);

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          String(u.id) === otherId ? { ...u, relation: 'none' } : u
        )
      );

      setPendingRequests((prev) => prev.filter((r) => r._id !== req._id));
      setNotifications((prev) => prev.filter((n) => n.id !== req._id && !(n.userId === otherId && n.type === 'incoming_request')));
    });

    newSocket.on('chat:unread', (data) => {
      console.log('Socket chat:unread event received:', data);
      const senderId = data.from?.id;
      if (!senderId) return;
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (String(u.id) === String(senderId)) {
            return {
              ...u,
              unreadCount: data.unreadCount
            };
          }
          return u;
        })
      );
    });

    newSocket.on('message:received', (data) => {
      console.log('Socket message received event:', data);
      const msg = data.message;
      const senderId = msg.sender.id;
      
      const formattedMsg = {
        id: msg._id,
        senderId: senderId,
        text: msg.content,
        type: msg.type || 'text',
        fileUrl: msg.fileUrl || null,
        fileName: msg.fileName || null,
        fileSize: msg.fileSize || null,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: msg.createdAt,
        status: msg.status || 'delivered'
      };
      
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (String(u.id) === String(senderId)) {
            const isChatActive = activeChatIdRef.current && String(activeChatIdRef.current) === String(senderId);
            return {
              ...u,
              messages: [...u.messages, formattedMsg],
              status: u.status === 'typing' ? 'online' : u.status,
              unreadCount: isChatActive ? 0 : (u.unreadCount || 0) + 1
            };
          }
          return u;
        })
      );

      if (activeChatIdRef.current && String(activeChatIdRef.current) === String(senderId)) {
        newSocket.emit('message:read', {
          senderId: senderId,
          messageIds: [msg._id]
        });
      }
    });

    newSocket.on('message:read', (data) => {
      console.log('Socket message read receipt:', data);
      const readerId = data.by;
      const readMsgIds = data.messageIds;

      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          // Case 1: The other user read our messages
          if (String(u.id) === String(readerId)) {
            const updatedMessages = u.messages.map((msg) => {
              if (readMsgIds.includes(msg.id)) {
                return { ...msg, status: 'read' };
              }
              return msg;
            });
            return { ...u, messages: updatedMessages };
          }
          
          // Case 2: We read their messages (e.g. read confirmation sync from server)
          const myId = user?.id || user?._id;
          if (myId && String(readerId) === String(myId)) {
            const hasReadMessage = u.messages.some((msg) => readMsgIds.includes(msg.id));
            if (hasReadMessage) {
              const updatedMessages = u.messages.map((msg) => {
                if (readMsgIds.includes(msg.id)) {
                  return { ...msg, status: 'read' };
                }
                return msg;
              });
              return { ...u, messages: updatedMessages, unreadCount: 0 };
            }
          }
          return u;
        })
      );
    });

    newSocket.on('user:typing', (data) => {
      console.log('Socket typing status event:', data);
      const fromId = data.from.id;
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (String(u.id) === String(fromId)) {
            return {
              ...u,
              status: data.isTyping ? 'typing' : (u.status === 'typing' ? 'online' : u.status)
            };
          }
          return u;
        })
      );
    });

    socketRef.current = newSocket;

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [token, user?.id, user?.name]);

  // Fetch complete or paginated chat history for a specific conversation
  const fetchMessageHistory = async (friendId, before = '') => {
    try {
      const res = await getMessages(friendId, 50, before);
      if (res.success) {
        const formattedMessages = res.messages.map((msg) => ({
          id: msg._id,
          senderId: msg.sender.id === user?.id ? 'me' : msg.sender.id,
          text: msg.content,
          type: msg.type || 'text',
          fileUrl: msg.fileUrl || null,
          fileName: msg.fileName || null,
          fileSize: msg.fileSize || null,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: msg.createdAt,
          status: msg.status
        }));

        setUsers((prev) =>
          prev.map((u) => {
            if (String(u.id) === String(friendId)) {
              let updatedMsgs = formattedMessages;
              if (before) {
                // Prepend older messages avoiding duplicates
                const existingIds = new Set(u.messages.map((m) => m.id));
                const filteredNew = formattedMessages.filter((m) => !existingIds.has(m.id));
                updatedMsgs = [...filteredNew, ...u.messages];
              }
              return {
                ...u,
                messages: updatedMsgs,
                unreadCount: before ? u.unreadCount : 0
              };
            }
            return u;
          })
        );

        // Emit read confirmation if new history was fetched for open chat
        if (!before) {
          const unreadMsgIds = res.messages
            .filter((m) => m.sender.id === friendId && m.status !== 'read')
            .map((m) => m._id);

          if (unreadMsgIds.length > 0 && socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('message:read', {
              senderId: friendId,
              messageIds: unreadMsgIds
            });
          }
        }

        return { count: formattedMessages.length, hasMore: formattedMessages.length >= 50 };
      }
    } catch (err) {
      console.error('Error fetching message history via REST:', err);
    }
    return { count: 0, hasMore: false };
  };

  // Helper function to trigger loading older messages
  const loadMoreMessages = async (friendId, oldestTimestamp) => {
    return fetchMessageHistory(friendId, oldestTimestamp);
  };

  // Synchronously fetch message history whenever the active chat changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessageHistory(activeChatId);
      
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('chat:open', { with: activeChatId });
      }
    }

    return () => {
      if (activeChatId && socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('chat:close', { with: activeChatId });
      }
    };
  }, [activeChatId]);

  // Send request from 'me' to another user (Socket first with REST fallback)
  const sendRequest = async (userId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('friend-request:send', { to: userId }, (res) => {
        if (res && res.success) {
          setUsers((prev) =>
            prev.map((u) => (String(u.id) === String(userId) ? { ...u, relation: 'pending_sent' } : u))
          );
          setPendingRequests((prev) => [
            ...prev.filter((r) => r._id !== res.request._id),
            {
              _id: res.request._id,
              status: 'pending',
              direction: 'sent',
              sender: { id: user?.id, user_name: user?.name },
              receiver: { id: userId, user_name: users.find((u) => String(u.id) === String(userId))?.name || '' },
              createdAt: new Date().toISOString(),
            }
          ]);
        }
      });
      return;
    }

    try {
      const res = await sendFriendRequest(userId);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (String(u.id) === String(userId) ? { ...u, relation: 'pending_sent' } : u))
        );
        
        setPendingRequests((prev) => [
          ...prev.filter((r) => r._id !== res.request._id),
          {
            _id: res.request._id,
            status: 'pending',
            direction: 'sent',
            sender: { id: user?.id, user_name: user?.name },
            receiver: { id: userId, user_name: users.find((u) => String(u.id) === String(userId))?.name || '' },
            createdAt: new Date().toISOString(),
          }
        ]);
      }
    } catch (err) {
      console.error('Error sending chat request:', err);
    }
  };

  // Accept incoming request (Socket first with REST fallback)
  const acceptRequest = async (userId) => {
    const req = pendingRequests.find((r) => r.direction === 'received' && String(r.sender.id) === String(userId));
    if (!req) return;

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('friend-request:accept', { requestId: req._id }, (res) => {
        if (res && res.success) {
          setUsers((prev) =>
            prev.map((u) => (String(u.id) === String(userId) ? { ...u, relation: 'accepted' } : u))
          );
          setPendingRequests((prev) => prev.filter((r) => r._id !== req._id));
          setNotifications((prev) => prev.filter((n) => n.id !== req._id));
        }
      });
      return;
    }

    try {
      await acceptFriendRequest(req._id);
      setUsers((prev) =>
        prev.map((u) => (String(u.id) === String(userId) ? { ...u, relation: 'accepted' } : u))
      );
      setPendingRequests((prev) => prev.filter((r) => r._id !== req._id));
      setNotifications((prev) => prev.filter((n) => n.id !== req._id));
    } catch (err) {
      console.error('Error accepting chat request:', err);
    }
  };

  // Decline incoming request (Socket first with REST fallback)
  const declineRequest = async (userId) => {
    const req = pendingRequests.find((r) => r.direction === 'received' && String(r.sender.id) === String(userId));
    if (!req) return;

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('friend-request:reject', { requestId: req._id }, (res) => {
        if (res && res.success) {
          setUsers((prev) =>
            prev.map((u) => (String(u.id) === String(userId) ? { ...u, relation: 'none' } : u))
          );
          setPendingRequests((prev) => prev.filter((r) => r._id !== req._id));
          setNotifications((prev) => prev.filter((n) => n.id !== req._id));
        }
      });
      return;
    }

    try {
      await rejectFriendRequest(req._id);
      setUsers((prev) =>
        prev.map((u) => (String(u.id) === String(userId) ? { ...u, relation: 'none' } : u))
      );
      setPendingRequests((prev) => prev.filter((r) => r._id !== req._id));
      setNotifications((prev) => prev.filter((n) => n.id !== req._id));
    } catch (err) {
      console.error('Error declining chat request:', err);
    }
  };

  // Cancel sent request (Socket first with REST fallback)
  const cancelRequest = async (userId) => {
    const req = pendingRequests.find((r) => r.direction === 'sent' && String(r.receiver.id) === String(userId));
    if (!req) return;

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('friend-request:cancel', { requestId: req._id }, (res) => {
        if (res && res.success) {
          setUsers((prev) =>
            prev.map((u) => (String(u.id) === String(userId) ? { ...u, relation: 'none' } : u))
          );
          setPendingRequests((prev) => prev.filter((r) => r._id !== req._id));
        }
      });
      return;
    }

    try {
      await cancelFriendRequest(req._id);
      setUsers((prev) =>
        prev.map((u) => (String(u.id) === String(userId) ? { ...u, relation: 'none' } : u))
      );
      setPendingRequests((prev) => prev.filter((r) => r._id !== req._id));
    } catch (err) {
      console.error('Error canceling chat request:', err);
    }
  };

  // Send message inside conversation with optional media attachments
  const sendMessage = (userId, text, mediaPayload = {}) => {
    const payload = {
      to: userId,
      content: text,
      ...mediaPayload
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('message:send', payload, (res) => {
        if (res && res.success) {
          const formattedMsg = {
            id: res.message._id,
            senderId: 'me',
            text: res.message.content,
            type: res.message.type || mediaPayload.type || 'text',
            fileUrl: res.message.fileUrl || mediaPayload.fileUrl || null,
            fileName: res.message.fileName || mediaPayload.fileName || null,
            fileSize: res.message.fileSize || mediaPayload.fileSize || null,
            duration: res.message.duration || mediaPayload.duration || null,
            thumbnail: res.message.thumbnail || mediaPayload.thumbnail || null,
            timestamp: new Date(res.message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: res.message.createdAt,
            status: res.message.status || 'sent'
          };

          setUsers((prev) =>
            prev.map((u) => {
              if (String(u.id) === String(userId)) {
                return {
                  ...u,
                  messages: [...u.messages, formattedMsg]
                };
              }
              return u;
            })
          );
        }
      });
    } else {
      // API Fallback
      sendMessageApi(userId, text, mediaPayload)
        .then((res) => {
          if (res && res.success) {
            const formattedMsg = {
              id: res.message._id,
              senderId: 'me',
              text: res.message.content,
              type: res.message.type || mediaPayload.type || 'text',
              fileUrl: res.message.fileUrl || mediaPayload.fileUrl || null,
              fileName: res.message.fileName || mediaPayload.fileName || null,
              fileSize: res.message.fileSize || mediaPayload.fileSize || null,
              duration: res.message.duration || mediaPayload.duration || null,
              thumbnail: res.message.thumbnail || mediaPayload.thumbnail || null,
              timestamp: new Date(res.message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              createdAt: res.message.createdAt,
              status: res.message.status || 'sent'
            };

            setUsers((prev) =>
              prev.map((u) => {
                if (String(u.id) === String(userId)) {
                  return {
                    ...u,
                    messages: [...u.messages, formattedMsg]
                  };
                }
                return u;
              })
            );
          }
        })
        .catch((err) => console.error('REST fallback send message failed:', err));
    }
  };

  // Clear single notification alert
  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Emit status change to socket server
  const changeMyStatus = (status) => {
    setMyStatus(status);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('user-status-update', { isActive: status === 'active' });
    }
  };

  // Emit typing indicator status
  const sendTypingStatus = (friendId, isTyping) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('message:typing', { to: friendId, isTyping });
    }
  };

  // Derived state: accepted chat conversations / friends
  const conversations = users.filter((u) => u.relation === 'accepted');

  const value = {
    users,
    conversations,
    friends: conversations,
    pendingRequests,
    notifications,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    sendMessage,
    clearNotification,
    myStatus,
    changeMyStatus,
    activeChatId,
    setActiveChatId,
    sendTypingStatus,
    loadMoreMessages
  };

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
