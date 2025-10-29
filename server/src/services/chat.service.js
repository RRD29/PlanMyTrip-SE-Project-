// This is a placeholder file.
// A real-time chat service would be built using WebSockets (e.g., Socket.io)
// and would not follow this request/response pattern.

/**
 * (Placeholder) Fetches messages for a given chat room (bookingId).
 * @param {string} bookingId
 */
export const getChatMessages = async (bookingId) => {
  // In a real app, this would fetch from a 'ChatMessage' collection in the DB
  return [
    { _id: 'msg_1', sender: 'user_123', text: 'Hi!' },
    { _id: 'msg_2', sender: 'guide_456', text: 'Hello, how can I help?' },
  ];
};

/**
 * (Placeholder) Saves a new chat message.
 * @param {string} bookingId
 * @param {string} senderId
 * @param {string} text
 */
export const saveChatMessage = async (bookingId, senderId, text) => {
  // 1. Save to DB
  // 2. Emit message via WebSocket to the other user
  return { _id: 'msg_3', sender: senderId, text: text };
};