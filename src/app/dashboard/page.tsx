'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Menu, X, LogOut, MessageSquare } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { clearToken } from '@/store/authSlice'
import { logout, getAllUsers } from '../../service/api'
import { useSocket } from '@/hooks/useSocket'
import { fetchUserMessagesServices } from '@/service/fetchUsersMessages'

type User = {
  id: number
  name: string
  email: string
}
type Message = {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;  // Assuming `timestamp` is the correct property name
  createdAt: string;   // Add this if it's missing
  updatedAt: string;
}

export default function Dashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const dispatch = useDispatch()
  const authState = useSelector((state: any) => state.auth)
  const socket = useSocket(authState.user?.userId)

  useEffect(() => {
    // console.log('Loged in user : ',authState.user?.userId);
    if (!authState.token || !authState.user) {
      router.push('/')
    } else {
      fetchUsers()
    }
  }, [authState.token, authState.user, router])

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message: Message) => {
        if (message.senderId === selectedUser?.id || message.senderId === authState.user?.userId) {
          setMessages((prevMessages) => [...prevMessages, message])
        }
      })

      socket.on('error', (error: any) => {
        console.error('Socket error:', error)
      })

      return () => {
        socket.off('newMessage')
        socket.off('error')
      }
    }
  }, [socket, selectedUser, authState.user])

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers()
      setUsers(fetchedUsers.filter((user: User) => user.id !== authState.user?.userId))
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setIsLoading(false)
    }
    
  }

  // const fetchMessages = async (userId:any) => {
  //   if (socket && authState.user) {
  //     socket.emit('fetchMessages', { userId: authState.user.userId, chatWith: userId });
  //     socket.on('messageHistory', (fetchedMessages) => {
  //       setMessages(fetchedMessages);
  //     });
  //   }
  // };
  

  // useEffect(() => {
  //   if (selectedUser) {
  //     fetchMessages(selectedUser.id)
  //   }
  // }, [selectedUser])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim() && selectedUser && socket && authState.user) {
      const newMessage = {
        senderId: authState.user.userId,
        receiverId: selectedUser.id,
        content: messageInput.trim(),
      }
      socket.emit('sendMessage', newMessage)
      setMessageInput('')
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = async () => {
    try {
      if (authState.user) {
        await logout(authState.user.userId)
      }
      dispatch(clearToken())
      sessionStorage.clear()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const selectUserChat = async (user: any) => {
    try {
      // Fetching User Id
      const userId = authState.user?.userId;
      const otherUserId = user.id;
  
      if (!userId || !otherUserId) {
        console.error('User IDs are missing!');
        return;
      }
  
      // Fetch Chat between Users using the controller's fetchMessagesServices
      const responseUserChat = await fetchUserMessagesServices(userId, otherUserId);
  
      if (responseUserChat && responseUserChat.data && responseUserChat.data.messages) {
        const fetchedMessages = responseUserChat.data.messages;
  
        // Clear messages before setting new ones
        setMessages([]);
  
        // Ensure messages are sorted by most recent
        const sortedMessages = fetchedMessages.sort((a:any, b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
        setMessages(sortedMessages);
        scrollToBottom();
      } else {
        // If no messages exist, clear the messages area
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching user chat:', error);
    }
  };
  
  
  

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-950 text-white">Loading...</div>
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
        <ScrollArea className="flex-grow">
        {users
          .map((user) => (
            <div
              key={user.id}
              className={`flex items-center space-x-4 p-4 hover:bg-gray-800 cursor-pointer ${selectedUser?.id === user.id ? 'bg-gray-800' : ''}`}
              onClick={() => {
                setSelectedUser(user)
                setIsSidebarOpen(false)
                selectUserChat(user);
              }}
            >
              <div className="flex-grow">
                <h3 className="font-medium">{user.name}</h3>
              </div>
            </div>
          ))}


        </ScrollArea>
        <Button
          variant="ghost"
          className="m-4 w-auto justify-start text-red-500 hover:text-red-400 hover:bg-gray-800"
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
          <h2 className="font-semibold">{selectedUser ? selectedUser.name : 'Select a user to chat'}</h2>
        </div>
        <ScrollArea className="flex-grow p-4">
        {selectedUser ? (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-500 text-lg">No messages with this user yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.senderId === authState.user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`inline-block p-3 rounded-lg ${message.senderId === authState.user?.id ? 'bg-blue-600' : 'bg-gray-800'} max-w-[70%]`}>
                  <p className="break-words whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(message.createdAt).toLocaleTimeString()}</p>
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
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-grow bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                    <Button type="submit">
                      <Send className="h-5 w-5" />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )
        }
