'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Menu, X } from 'lucide-react'

const users = [
  { id: 1, name: 'Alice Johnson', avatar: '/placeholder.svg?height=40&width=40' },
  { id: 2, name: 'Bob Smith', avatar: '/placeholder.svg?height=40&width=40' },
  { id: 3, name: 'Charlie Brown', avatar: '/placeholder.svg?height=40&width=40' },
]

const initialMessages: Message[] = [
  { id: 1, sender: 'Alice Johnson', content: 'Hey there! How are you?', timestamp: '10:00 AM' },
  { id: 2, sender: 'You', content: "I'm doing great, thanks for asking! How about you?", timestamp: '10:05 AM' },
  { id: 3, sender: 'Alice Johnson', content: "I'm good too. Just working on some projects. It's been a busy week with lots of meetings and deadlines, but I'm managing to stay on top of things. How's your week been going?", timestamp: '10:10 AM' },
]

type Message = {
  id: number
  sender: string
  content: string
  timestamp: string
}

export default function Dashboard() {
  const [selectedUser, setSelectedUser] = useState(users[0])
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: 'You',
        content: messageInput.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages([...messages, newMessage])
      setMessageInput('')
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Left sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0 flex flex-col border-r border-gray-800 absolute md:relative z-10 bg-gray-950`}>
        {/* User detail card */}
        <Card className="m-4 bg-gray-900 text-white">
          <CardContent className="p-4 flex items-center space-x-4">
            <div>
              <h2 className="font-semibold">Your Name</h2>
              <p className="text-sm text-gray-400">your.email@example.com</p>
            </div>
          </CardContent>
        </Card>
        
        {/* User list */}
        <ScrollArea className="flex-grow">
          {users.map(user => (
            <div
              key={user.id}
              className={`flex items-center space-x-4 p-4 hover:bg-gray-800 cursor-pointer ${selectedUser.id === user.id ? 'bg-gray-800' : ''}`}
              onClick={() => {
                setSelectedUser(user)
                setIsSidebarOpen(false)
              }}
            >
              <div className="flex-grow">
                <h3 className="font-medium">{user.name}</h3>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Right chat area */}
      <div className="flex-grow flex flex-col w-full">
        {/* Chat header */}
        <div className="p-4 border-b border-gray-800 flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={toggleSidebar}>
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h2 className="font-semibold">{selectedUser.name}</h2>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className={`inline-block p-3 rounded-lg ${message.sender === 'You' ? 'bg-blue-600' : 'bg-gray-800'} max-w-[70%]`}>
                  <p className="break-words whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{message.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message input */}
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
      </div>
    </div>
  )
}

