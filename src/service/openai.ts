import axios from "axios";

const BASE_URL = "http://localhost:4000/openai";

export interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

// Function to get chatbot response
export const getChatbotResponse = async (prompt: string, authToken: string): Promise<ChatMessage> => {
  try {
    const response = await axios.get(`${BASE_URL}/chat`, {
      params: { prompt },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("Getting Response from Chatbot:", response);
    return { role: "bot", content: response.data };
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    return { role: "bot", content: "Sorry, I encountered an error. Please try again later." };
  }
};

// Function to get suggested message
export const getSuggestedMessage = async (message: string, authToken: string): Promise<string> => {
  try {
    const response = await axios.get(`${BASE_URL}/suggest`, {
      params: { message },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("Getting Suggested Message:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching suggested message:", error);
    return "Sorry, I encountered an error. Please try again later.";
  }
};
