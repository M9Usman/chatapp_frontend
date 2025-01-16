'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Menu, X, LogOut, MessageSquare, Smile, Users, UserPlus, RefreshCcw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { clearToken } from '@/store/authSlice';
import { logout, getAllUsers } from '../../service/api';
import { useSocket } from '@/hooks/useSocket';
import { fetchUserMessagesServices } from '@/service/fetchUsersMessages';
import { FileInput } from "../../components/FileInput";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Picker from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';

type User = {
  id: number;
  name: string;
  email: string;
};

type Message = {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  image?: object | null;
};

interface ChatData {
  chatId: number;
}

export default function Dashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [loadingMsg,setLoadingMsg]=useState(true);
  const dispatch = useDispatch();
  const [typingTimeout, setTypingTimeout] = useState<any>(null);
  const authState = useSelector((state: any) => state.auth);
  const socket = useSocket(authState.user?.userId);
  const [chatId, setChatId] = useState(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('single');

  useEffect(() => {
    if (authState.token) {
      fetchUsers();
    } else {
      router.push('/');
    }
  }, [authState.token, authState.user, router]);

  useEffect(() => {
    console.log('Chat ID updates : ', chatId);
  }, [chatId]);

  useEffect(() => {
    if (socket) {
      console.log('Socket connected:', socket.id);

      socket.on('newMessage', (message: Message) => {
        if (message.senderId === selectedUser?.id || message.senderId === authState.user?.userId) {
          setMessages((prevMessages) => [...prevMessages, message]);
          console.log('newMessage : ', message);
        }
      });

      socket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });

      const handleTyping = (data: { userId: number; typing: boolean }) => {
        console.log(`${data.userId} is ${data.typing ? 'typing...' : 'not typing.'}`);
        setTypingUsers((prevTypingUsers) => {
          if (data.typing) {
            return { ...prevTypingUsers, [data.userId]: true };
          } else {
            const { [data.userId]: _, ...rest } = prevTypingUsers;
            return rest;
          }
        });
      };

      socket.on('recievetyping', handleTyping);

      return () => {
        socket.off('recievetyping', handleTyping);
        socket.off('newMessage');
        socket.off('error');
      };
    }
  }, [socket, chatId, authState.user?.userId, selectedUser?.id]);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers();
      const filteredFetchedUsers = fetchedUsers.filter((user: User) => user.id !== authState.user?.userId);
      setUsers(filteredFetchedUsers);
      setFilteredUsers(filteredFetchedUsers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      if (authState.user) {
        await logout();
      }
      dispatch(clearToken());
      sessionStorage.clear();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((messageInput.trim() || selectedFile) && selectedUser && socket && authState.user) {
      let base64Image: string | null = null;

      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = () => {
          base64Image = reader.result?.toString().split(',')[1] || null;
          const newMessage = {
            senderId: authState.user.userId,
            receiverId: selectedUser.id,
            content: messageInput.trim(),
            image: base64Image,
            createdAt: new Date().toISOString(),
          };

          socket.emit('sendMessage', newMessage);
          console.log('NEW MESSAGE: ', newMessage);
          setMessages((prevMessages: any) => [...prevMessages, newMessage]);
          setMessageInput('');
          setSelectedFile(null);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        const newMessage = {
          senderId: authState.user.userId,
          receiverId: selectedUser.id,
          content: messageInput.trim(),
          image: base64Image,
          createdAt: new Date().toISOString(),
        };

        socket.emit('sendMessage', newMessage);

        setMessages((prevMessages: any) => [...prevMessages, newMessage]);
        setMessageInput('');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

  useEffect(() => {
    if (socket) {
      let typingTimeout: NodeJS.Timeout;
      console.log(messageInput.trim());
      if (messageInput.trim() !== '') {
        typingTimeout = setTimeout(() => {
          socket!.emit('typing', {
            userId: authState.user?.userId,
            chatId: chatId,
            typingFlag: true,
            receiverId: selectedUser?.id,
          });
          console.log('Start typing socket hit');
        }, 300);
      } else {
        console.log('Stopping the typing!');
        socket!.emit('typing', {
          userId: authState.user?.userId,
          chatId: chatId,
          typingFlag: false,
          receiverId: selectedUser?.id,
        });
      }

      return () => {
        clearTimeout(typingTimeout);
      };
    }
  }, [messageInput, socket, authState.user?.userId, chatId, selectedUser?.id]);

  useEffect(() => {
    console.log('Current typing users:', typingUsers);
  }, [typingUsers]);

  const selectUserChat = async (user: User) => {
    try {
      const otherUserId = user.id;
      setLoadingMsg(true); //Restarting loading
      if (!authState.user?.userId || !otherUserId) {
        console.error('User IDs are missing!');
        return;
      }

      const responseUserChat = await fetchUserMessagesServices(otherUserId);
      const data = responseUserChat.data;

      if (responseUserChat?.data && responseUserChat?.data?.messages?.chatId && responseUserChat?.data?.messages && responseUserChat?.data?.messages?.messages) {
        console.log('It has chat Id!');
        setChatId(data.messages.chatId);
        const newMessagesArray = data.messages.messages;
        setLoadingMsg(false);
        setMessages(newMessagesArray);

        newMessagesArray.map((message: any) => {
          if (message.image) {
            console.log('Image after Reloading : ', message.image, ' Image after Reloading Type : ', typeof message.image);
          }
          return message;
        });

        scrollToBottom();
      } else {
        setChatId(null);
        console.log('no Chat Id');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching user chat:', error);
    }
  };

  useEffect(() => {
    console.log('Messages Updated : ', messages);
  }, [messages]);

  const handleEmojiSelect = (emoji: { native: string }) => {
    setMessageInput((prev) => prev + emoji.native);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowercasedQuery = query.toLowerCase();
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredUsers(filtered);
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-950 text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0 flex flex-col border-r border-gray-800 absolute md:relative z-10 bg-gray-950`}>
        <Card className="m-4 bg-gray-900 text-white">
          <CardContent className="p-4 flex items-center space-x-4">
            <div>
              <h2 className="font-semibold">{authState.user?.name}</h2>
              <p className="text-sm text-gray-400">{authState.user?.email}</p>
            </div>
          </CardContent>
        </Card>
        <div className="px-4 mb-4">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <Tabs defaultValue="single" className="w-full px-4 mb-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger 
              value="single" 
              onClick={() => setActiveTab('single')}
              className="data-[state=active]:bg-slate-300 data-[state=active]:text-black"
            >
              Chats
            </TabsTrigger>
            <TabsTrigger 
              value="group" 
              onClick={() => setActiveTab('group')}
              className="data-[state=active]:bg-slate-300 data-[state=active]:text-black"
            >
              Groups
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex justify-between items-center px-4 mb-4">
          <Button
            variant="outline"
            onClick={() => {/* Add group creation logic */}}
            className="flex-grow text-white bg-gray-600 hover:bg-gray-200 hover:shadow-lg hover:shadow-gray-500 transition-all duration-300 transform hover:scale-105"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          {activeTab === 'single' ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center m-3 rounded-xl space-x-4 p-4 hover:bg-gray-800 cursor-pointer ${selectedUser?.id === user.id ? 'border-2 bg-slate-700' : ''}`}
                onClick={() => {
                  setSelectedUser(user);
                  setIsSidebarOpen(false);
                  selectUserChat(user);
                }}
              >
                <div className="flex-grow">
                  <h3 className="font-medium">{user.name}</h3>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 mt-4">
              No groups available
            </div>
          )}
        </ScrollArea>
        <Button
          variant="ghost"
          className="m-4 bg-gray-900 w-auto justify-start text-red-500 hover:text-gray-200 transition hover:border-2 hover:bg-[#ff3232]"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="flex-grow flex flex-col w-full">
        <div className="p-4 border-b border-gray-800 flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={toggleSidebar}>
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {isSidebarOpen && (
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
          <h2 className="font-semibold">{selectedUser ? selectedUser.name : 'Select a user to chat'}</h2>
        </div>

        <ScrollArea className="flex-grow p-4">
          {selectedUser ? (
            <div className="space-y-4">
              {
              loadingMsg ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-300 mb-4"></div>
                  <p className="text-gray-500 text-lg">Loading messages...</p>
                </div>
              ) :messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500 text-lg">There are no Chat with this user Do Firtst Msg to start Chat.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === authState.user?.userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-2 rounded-lg max-w-xs ${
                        message.senderId === authState.user?.userId ? 'bg-gray-200 text-black' : 'bg-gray-800 text-white'
                      }`}
                    >
                      {message.content && <p>{message.content}</p>}
                      {message.image ? (
                        <img
                          src={`data:image/png;base64,${message.image}`}
                          alt="Attachment"
                          className="max-w-full h-auto rounded-md mt-2"
                        />
                      ) : <></>}
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-500 text-lg">Select a user to start chatting</p>
            </div>
          )}
        </ScrollArea>

        {selectedUser && (
          <div className='flex flex-col gap-1 p-1 pl-2 '>
            {typingUsers[selectedUser.id] && (
              <div className="bg-gray-800 text-white text-sm italic p-3 w-max rounded-md ml-2 animate-bounce">
                Typing....
              </div>
            )}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex items-center space-x-4">
              <FileInput onFileSelect={setSelectedFile} />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-transparent border-none">
                  <Picker
                    data={emojiData}
                    onEmojiSelect={handleEmojiSelect}
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={handleInputChange}
                className="flex-1"
              />
              {selectedFile && (
                <Button className="text-sm text-gray-200 p-2 rounded-md bg-slate-800 hover:bg-red-600 transition hover:cursor-pointer" onClick={handleCancelFile}>
                  {selectedFile.name}
                </Button>
              )}
              <Button type="submit" className="flex-shrink-0 bg-blue-500 hover:bg-blue-600">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

