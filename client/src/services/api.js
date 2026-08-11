import axios from "axios";
import { auth } from "./firebase";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 
    (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:5000"
      : "")
});

// Axios Request Interceptor: Automatically fetch and attach Firebase ID Token
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        console.error("Axios interceptor - failed to retrieve token:", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor: Format errors cleanly
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log("API response success:", response.config?.url, response.data);
    }
    return response.data;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error("API response error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    const message = error.response?.data?.error || "An API connection error occurred.";
    return Promise.reject(new Error(message));
  }
);

export const api = {
  get(url) {
    return apiClient.get(url);
  },
  post(url, data) {
    return apiClient.post(url, data);
  },
  upload(url, file) {
    const formData = new FormData();
    formData.append("resume", file);
    return apiClient.post(url, formData);
  },
  delete(url) {
    return apiClient.delete(url);
  }
};
