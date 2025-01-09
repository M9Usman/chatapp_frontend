'use client';
// pages/index.js
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export default function Home() {
  useEffect(() => {
    // Connect to the WebSocket server
    const socket = io('http://localhost:4000', {
      query: {
        userId: '1', // Pass userId as query parameter
      },
    });

    // Listen for successful connection
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    // Test sending a message
    socket.emit('sendMessage', {
      senderId: 1,
      receiverId: 2,
      chatId: null,
      content: 'Hello from the frontend!',
      type: 'text',
    });

    // Handle incoming messages
    socket.on('newMessage', (message) => {
      console.log('Received new message:', message);
      // Display the message (for example, appending it to a list)
    });

    // Handle errors from the server
    socket.on('error', (error) => {
      console.log('Error:', error);
      alert(`An error occurred: ${error.message}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Cleanup the connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>WebSocket Test</h1>
    </div>
  );
}
