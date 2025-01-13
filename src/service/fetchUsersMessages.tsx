import axios from 'axios';
import { store } from '../store/store'; // Adjust the path to your store file

export const fetchUserMessagesServices = async (userId: number, otherUserId: number) => {
//   console.log('In fetching Users Chat');
    try {
    // Retrieve the token from Redux store
    const state = store.getState();
    const token = state.auth.token;
    console.log('authToken : ',state.auth.token);
    if (!token) {
      throw new Error('Authentication token is missing.');
    }

    // console.log(userId, otherUserId);

    // Make the request with the token in the headers
    const response = await axios.get(
        `http://localhost:4000/chat/messages/${userId}/${otherUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure the token is included here
          },
        }
      );

    return response;
  } catch (error) {
    console.error('Getting Message Error:', error);
    throw error; // Optional, you can choose to handle errors differently
  }
};
