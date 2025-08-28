const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const authAPI = {
  login: async (email, password) => {
    console.log("Environment variables:", import.meta.env);
    console.log("API_URL:", import.meta.env.VITE_API_URL);
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (username, email, password) => {
    console.log("Environment variables:", import.meta.env);
    console.log("API_URL:", import.meta.env.VITE_API_URL);
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    return response.json();
  },
};
