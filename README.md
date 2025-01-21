# Next.js Chat Application

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), featuring real-time chat capabilities and AI integration.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project follows a modular structure for scalability and maintainability:

```
src/
├── app/
│   ├── dashboard/        # Main chat screen
│   ├── otp-verification/ # OTP verification page
│   ├── testChat/         # Gateway connection testing
│   └── page.tsx          # Welcome page (registration/login)
├── component/            # ShadCN components
├── hooks/                # Custom hooks (e.g., useSocket)
├── lib/                  # ShadCN utilities
├── service/              # Server-side code, API calls
│   └── chatbot.ts        # AI chatbot integration
└── store/                # Redux store for session management
```

## Application Flow

### 1. Welcome Page
- Landing page for user registration or login
- Users can register with email and name
- Existing users can log in
- OTP sent to provided email upon submission

### 2. OTP Verification
- Users enter received OTP
- Session initiated upon successful verification

### 3. Dashboard
- Main chat interface displaying available users
- Start new conversations by clicking on users
- Real-time messaging capabilities
- Secure logout functionality

#### **Group Chat**
- Toggle between one-to-one chat and group chat using a button.
- **One-to-One Chat:**
  - Search users by name.
  - Send messages (text, emojis, or photos). Emoji support is implemented using `emoji-emitter`.
- **Group Chat:**
  - Create and delete groups.
  - Chat within groups, share photos, or send emojis.
- Includes loading animations for chats and typing indicators for a seamless user experience.

#### **AI Chatbot Integration**
- The chatbot suggests user responses based on the conversation context.
- Chatbot API integration implemented in `service/chatbot.ts`:

```typescript
import axios from "axios";

const BASE_URL = "http://localhost:4000/openai/chat";

export interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

export const getChatbotResponse = async (prompt: string, authToken: string): Promise<ChatMessage> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: { prompt },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('Getting Response from Chat bot:', response);
    return { role: "bot", content: response.data };
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    return { role: "bot", content: "Sorry, I encountered an error. Please try again later." };
  }
};
```

- The dashboard now integrates AI-powered suggestions for user responses based on incoming messages.

### 4. Test Environment
- TestChat page for gateway connection testing
- Message sending verification

## Technologies Used

- **Next.js**: React framework for the frontend
- **ShadCN**: UI components and design system
- **Socket.io**: Real-time messaging
- **Redux**: State and session management
- **Prisma**: PostgreSQL ORM
- **PostgreSQL**: Database for user and chat data
- **OpenAI**: AI-powered chatbot

## Development

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a custom font family from Vercel.

The page auto-updates as you edit `app/page.tsx`.

## Testing Flow

1. **User Authentication**
   - Register new account or log in.
   - Verify email with OTP.

2. **Chat Testing**
   - Access Dashboard.
   - Initiate conversations.
   - Test real-time messaging.
   - Test one-to-one chat, emoji support, and photo sharing.
   - Test group chat functionalities (creating, deleting, chatting).
   - Test AI chatbot integration and response suggestions.
   - Verify session management.

## Deployment

Deploy easily using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Visit the Vercel Platform.
2. Import your repository.
3. Follow the deployment prompts.

For more details, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Learn More

Explore these resources to learn more about Next.js:

- [Next.js Documentation](https://nextjs.org/docs) - Features and API reference
- [Learn Next.js](https://nextjs.org/learn) - Interactive tutorial

## Contributing

Contributions are welcome! Feel free to:
1. Fork the repository.
2. Create your feature branch.
3. Submit a pull request.

Your feedback and contributions help improve the project for everyone.
