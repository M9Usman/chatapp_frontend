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
    console.log('Getting Response from Chat bot : ',response);
    return { role:"bot", content:response.data };
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    return { role: "bot", content: "Sorry, I encountered an error. Please try again later." };
  }
};
