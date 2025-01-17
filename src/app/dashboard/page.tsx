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
import { logout, getAllUsers, getChatGroups, getChatById } from '../../service/api';
import { useSocket } from '@/hooks/useSocket';
import { fetchUserMessagesServices } from '@/service/fetchUsersMessages';
import { FileInput } from "../../components/FileInput";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Picker from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';
import { CreateGroupPopup } from '../../components/CreateGroupPopup';

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
  chatId:number;
};

// Participant type
type Participant = {
  id: number;
  name: string;
  email: string;
  verified: boolean;
};

// Group type
type Group = {
  id: number;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
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
  const authState = useSelector((state: any) => state.auth);
  const socket = useSocket(authState.user?.userId);
  const [chatId, setChatId] = useState<number|null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('single');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]); 
  const [selectedGroup,setSelectedGroup]=useState<Group>(); 

  useEffect(() => {
    if (authState.token) {
      fetchUsers();
      console.log('User:',users);
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

      socket.on('newMessage', (message: Message,group:boolean) => {
        console.log('Message Here : ',message);
        if(message){
          console.log(' Chat ID : ',message.chatId,' Curr Chat Id: ',chatId);
        }
        if (message.chatId === chatId) {
          setMessages((prevMessages) => [...prevMessages, message]);
          console.log('newMessage : ', message);
          console.log('Group : ',group)
        }
      });

      

      socket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });

      socket.on('groupCreated', (newGroup) => {
        // console.log('New group created:', newGroup);
        // Update groups array with the newly created group
        setGroups((prevGroups) => [...prevGroups, newGroup]);
    
        // Optionally, fetch updated groups to refresh the UI
        fetchChatGroups();
      });
      
      // Listen for acknowledgment from backend
      socket.on('groupCreatedAck', (group) => {
        console.log('Group created successfully:', group);
      });

      // Listen for errors during group creation
      socket.on('groupCreationError', (error) => {
        console.error('Error creating group:', error);
      });

      socket.on('chatDeleted', ({ chatId }) => {
        console.log('Chat deleted with ID:', chatId);
        fetchChatGroups(); //fetch groups.
      });
  
      socket.on('chatDeletedAck', ({ chatId }) => {
        console.log('Chat deletion acknowledged for ID:', chatId);
      });
  
      socket.on('chatDeletionError', ({ error }) => {
        console.error('Error deleting chat:', error);
      });
  

      // Typing indicator handler
      const handleTyping = (data: { userId: number; chatId: number; typing: boolean; group: boolean }) => {
        console.log(`${data.userId} is ${data.typing ? 'typing...' : 'not typing.'} in chat ${data.chatId}`);
        
        if (data?.chatId === chatId) {
          const typingUser = users.find((user) => user.id === data.userId);

          console.log('Typing User:', typingUser);
          setTypingUsers((prevTypingUsers) => {
            if (data.typing) {
              return { ...prevTypingUsers, [data.userId]: true };
            } else {
              const { [data.userId]: _, ...rest } = prevTypingUsers;
              return rest;
            }
          });
        }
      };

      // Listening for typing events
      socket.on('recievetyping', handleTyping);

      return () => {
        socket.off('recievetyping', handleTyping);
        socket.off('newMessage');
        socket.off('error');
        socket.off('chatDeleted');
        socket.off('chatDeletedAck');
        socket.off('chatDeletionError');
      };
    }
  }, [socket, chatId, authState.user?.userId, selectedUser?.id]);

  // For Testing Only
  // useEffect(()=>{
  //   console.log('Groups Effect : ',groups);
  // },[groups]);

  // useEffect(()=>{
  //   console.log('User Effect : ',users);
  // },[users]);

  const fetchUsers = async () => {
    try {
      setGroups([]); // Clear groups when fetching users
      const fetchedUsers = await getAllUsers();
      const filteredFetchedUsers = fetchedUsers.filter((user: User) => user.id !== authState.user?.userId);
      setUsers(filteredFetchedUsers);
      setFilteredUsers(filteredFetchedUsers);
      setIsLoading(false);
      console.log('in fetching user');
    } catch (error) {
      console.error('Error fetching users:', error);
      setIsLoading(false);
    }
  };
  
  // Fetch chat groups function
  const fetchChatGroups = async () => {
    try {
      const fetchedGroups = await getChatGroups();
      setGroups(fetchedGroups.groups);
      console.log('Fetched Groups : ', fetchedGroups.groups);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching chat groups:', error);
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
    console.log('In Message!');
    if (!(messageInput.trim() || selectedFile) || !socket || !authState.user) {
      return;
    }
  
    const createMessage = (overrides: Record<string, any> = {}) => ({
      senderId: authState.user.userId,
      content: messageInput.trim(),
      image: null,
      createdAt: new Date().toISOString(),
      ...overrides,
    });
  
    const sendMessage = (newMessage: any) => {
      socket.emit('sendMessage', newMessage);
      setMessages((prevMessages: any) => [...prevMessages, newMessage]);
      setMessageInput('');
      setSelectedFile(null);
    };
  
    const handleGroupMessage = (base64Image: string | null) => {
      const newMessage = createMessage({
        image: base64Image,
        msgType: "Group",
        chatId: selectedGroup?.id,
        participants: selectedGroup?.participants,
      });
      console.log('For Group Message!', newMessage);
      sendMessage(newMessage);
    };
  
    const handleOneOnOneMessage = (base64Image: string | null) => {
      const newMessage = createMessage({
        image: base64Image,
        msgType: "Notgroups",
        chatId: chatId,
        receiverId: selectedUser!.id ,
      });
      console.log('For One-on-One Message!', newMessage);
      sendMessage(newMessage);
    };
  
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result?.toString().split(',')[1] || null;
        groups.length > 0 ? handleGroupMessage(base64Image) : handleOneOnOneMessage(base64Image);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      groups.length > 0 ? handleGroupMessage(null) : handleOneOnOneMessage(null);
    }
  };

  const handleCreateGroup = (group: { name: string; participants: number[] }) => {
    // Add the authenticated user's ID to the participants array
    const participantsWithUser = [...group.participants, authState.user?.userId];
  
    // Emit 'createGroup' event to the backend with updated participants
    socket!.emit('createGroup', { name: group.name, participants: participantsWithUser });
  
    console.log('Creating group:', { name: group.name, participants: participantsWithUser });
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

  // useEffect(() => {
  //   if (socket) {
  //     let typingTimeout: NodeJS.Timeout;
  //     console.log(messageInput.trim());
  //     if (messageInput.trim() !== '') {
  //       typingTimeout = setTimeout(() => {
  //         socket!.emit('typing', {
  //           userId: authState.user?.userId,
  //           chatId: chatId,
  //           typingFlag: true,
  //           receiverId: selectedUser?.id,
  //         });
  //         console.log('Start typing socket hit');
  //       }, 300);
  //     } else {
  //       console.log('Stopping the typing!');
  //       socket!.emit('typing', {
  //         userId: authState.user?.userId,
  //         chatId: chatId,
  //         typingFlag: false,
  //         receiverId: selectedUser?.id,
  //       });
  //     }

  //     return () => {
  //       clearTimeout(typingTimeout);
  //     };
  //   }
  // }, [messageInput, socket, authState.user?.userId, chatId, selectedUser?.id]);

  useEffect(() => {
    if (socket) {
      let typingTimeout: NodeJS.Timeout;
  
      const emitTyping = (isTyping: boolean) => {
        const commonPayload = {
          userId: authState.user?.userId,
          chatId: chatId,
          typing: isTyping,
        };
  
        if (groups.length > 0) {
          // Emit for group chat
          socket.emit('typing', {
            ...commonPayload,
            participants: selectedGroup?.participants || [],
          });
          console.log(`Typing ${isTyping ? 'started' : 'stopped'} in group chat`);
        } else {
          // Emit for one-on-one chat
          socket.emit('typing', {
            ...commonPayload,
            receiverId: selectedUser?.id,
          });
          console.log(`Typing ${isTyping ? 'started' : 'stopped'} in one-on-one chat`);
        }
      };
  
      if (messageInput.trim() !== '') {
        // Start typing after a delay
        typingTimeout = setTimeout(() => {
          emitTyping(true);
        }, 300);
      } else {
        // Stop typing immediately
        emitTyping(false);
      }
  
      return () => {
        clearTimeout(typingTimeout); // Cleanup typing timeout
      };
    }
  }, [messageInput, socket, authState.user?.userId, chatId, selectedUser?.id, selectedGroup?.participants, groups]);
  
  useEffect(() => {
    console.log('Current typing users:', typingUsers);
  }, [typingUsers]);

  // Selecting messages for group
  // Fetch Group Chat
  useEffect(()=>{
    // Changing Chat Id
    if(selectedGroup){
      setChatId(selectedGroup.id);
    }
      console.log('Selected Group Chat Updated : ',selectedGroup)
  },[selectedGroup]);
  const fetchGroupChat = async (chatId: number) => {
    try {
      setLoadingMsg(true);
      const chatData = await getChatById(chatId);

      if (chatData && chatData.participants && chatData.messages) {
        setSelectedGroup(chatData);
        console.log('Fetched group chat data:', selectedGroup, ' CHat Data ', chatData);
        

        // Collecting Participants 
        setMessages(chatData.messages);
        setLoadingMsg(false);
      } else {
        setLoadingMsg(false);
        console.error('No valid chat data received');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching group chat data:', error);
    }
  };
useEffect(()=>{console.warn('Messages Are Update: ',messages)},[messages])
  // Selecting Message for one on one
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
        setLoadingMsg(false);
        setChatId(null);
        console.log('no Chat Id');
        setMessages([]);
      }
    } catch (error) {
      setLoadingMsg(false);
      console.error('Error fetching user chat:', error);
    }
  };

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
  const handleDeleteChat = (id:number) => {
    console.log('ID of chat to delete: ',id);
    if (!id) {
      alert('Please enter a valid chat ID');
      return;
    }
    if(socket){
      socket.emit('deleteChat', id, (response:any) => {
        console.log('Delete request sent for chat ID:', chatId, 'Response:', response);
      });
    }
  };

  // UI STARTED

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
                onClick={() => {
                  setActiveTab('single');
                  fetchUsers(); // Call fetchUsers when "Chats" tab is clicked
                }}
                className="data-[state=active]:bg-slate-300 data-[state=active]:text-black"
              >
                Chats
              </TabsTrigger>
              <TabsTrigger
                value="group"
                onClick={() => {
                  setActiveTab('group');
                  fetchChatGroups(); // Call fetchChatGroups when "Groups" tab is clicked
                }}
                className="data-[state=active]:bg-slate-300 data-[state=active]:text-black"
              >
                Groups
              </TabsTrigger>
            </TabsList>
          </Tabs>
        <div className="flex justify-between items-center px-4 mb-4">
          <Button
            variant="outline"
            onClick={() => setShowCreateGroup(true)}
            className="flex-grow text-white bg-gray-600 hover:bg-gray-200 hover:shadow-lg hover:shadow-gray-500 transition-all duration-300 transform hover:scale-105"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
        <ScrollArea className="flex-grow h-[50%]  relative">
          <div className='absolute w-full h-[15 %] bottom-0 ' 
          style={{
                  background: "linear-gradient(to bottom,rgba(31, 41, 55, 0), rgb(3 7 18))",
                }}
          ></div>
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
            groups?.length >= 0 ? (
              groups?.map((group) => (
                <div className='flex flex-row p-2 justify-between items-center pr-4 '>
                  <div
                    key={group.id}
                    className={`flex flex-col m-3 rounded-xl space-y-2 p-4 hover:bg-gray-800 cursor-pointer`}
                    onClick={() => {
                      // Handle group selection here
                      setIsSidebarOpen(false);
                      fetchGroupChat(group.id);
                      console.log('Selected group:', group);
                    }}
                  >
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-400">
                      {group.participants.length} participants
                    </p>
                  
                  </div>
                  <button
                    onClick={()=>{handleDeleteChat(group.id);}}
                    className="group relative flex h-14 w-14 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-red-800 bg-red-400 hover:bg-red-600"
                  >
                    <svg
                      viewBox="0 0 1.625 1.625"
                      className="absolute -top-7 fill-white delay-100 group-hover:top-6 group-hover:animate-[spin_1.4s] group-hover:duration-1000"
                      height="15"
                      width="15"
                    >
                      <path
                        d="M.471 1.024v-.52a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099h-.39c-.107 0-.195 0-.195-.195"
                      ></path>
                      <path
                        d="M1.219.601h-.163A.1.1 0 0 1 .959.504V.341A.033.033 0 0 0 .926.309h-.26a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099v-.39a.033.033 0 0 0-.032-.033"
                      ></path>
                      <path
                        d="m1.245.465-.15-.15a.02.02 0 0 0-.016-.006.023.023 0 0 0-.023.022v.108c0 .036.029.065.065.065h.107a.023.023 0 0 0 .023-.023.02.02 0 0 0-.007-.016"
                      ></path>
                    </svg>
                    <svg
                      width="16"
                      fill="none"
                      viewBox="0 0 39 7"
                      className="origin-right duration-500 group-hover:rotate-90"
                    >
                      <line stroke-width="4" stroke="white" y2="5" x2="39" y1="5"></line>
                      <line
                        stroke-width="3"
                        stroke="white"
                        y2="1.5"
                        x2="26.0357"
                        y1="1.5"
                        x1="12"
                      ></line>
                    </svg>
                    <svg width="16" fill="none" viewBox="0 0 33 39" className="">
                      <mask fill="white" id="path-1-inside-1_8_19">
                        <path
                          d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
                        ></path>
                      </mask>
                      <path
                        mask="url(#path-1-inside-1_8_19)"
                        fill="white"
                        d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                      ></path>
                      <path stroke-width="4" stroke="white" d="M12 6L12 29"></path>
                      <path stroke-width="4" stroke="white" d="M21 6V29"></path>
                    </svg>
                  </button>

                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 mt-4">No groups available!</div>
            )
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
          <h2 className="font-semibold">{ (groups.length>0)? selectedGroup?.name : selectedUser ? selectedUser.name : 'Select a user to chat'}</h2>
        </div>

        <ScrollArea className="flex-grow p-4">
          {(selectedUser||selectedGroup) ? (
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
                      {message.senderId !== authState.user?.userId && (
                          <span className="text-xs text-gray-400 border-b border-gray-300  mb-5">
                            {users.find((user) => user.id === message.senderId)?.name || 'Unknown User'}
                          </span>
                        )}
                    
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

        {(selectedUser || selectedGroup) && (
            <div className="flex flex-col gap-1 p-1 pl-2">
              {selectedUser && typingUsers[selectedUser.id] ? (
                <div className="bg-gray-800 text-white text-sm italic p-3 w-max rounded-md ml-2 animate-bounce">
                  {selectedUser.name} is typing...
                </div>
              ) : selectedGroup && (
                <>
                  {selectedGroup.participants.map(
                    (participant) =>
                      typingUsers[participant.id] && (
                        <div
                          key={participant.id}
                          className="bg-gray-800 text-white text-sm italic p-3 w-max rounded-md ml-2 animate-bounce"
                        >
                          {participant.name} is typing...
                        </div>
                      )
                  )}
                </>
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
      {showCreateGroup && (
        <CreateGroupPopup
          users={users}
          onClose={() => setShowCreateGroup(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  );
}

