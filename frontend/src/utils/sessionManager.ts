// Utility to manage guest cart session ID
const SESSION_ID_KEY = 'guest_cart_session_id';

export const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    // Generate a unique session ID (UUID v4)
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
};

export const clearSessionId = (): void => {
  localStorage.removeItem(SESSION_ID_KEY);
};

export const getSessionId = (): string | null => {
  return localStorage.getItem(SESSION_ID_KEY);
};
