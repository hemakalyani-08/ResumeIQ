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

export const extractErrorMessage = (error) => {
  // If the error itself is null or undefined
  if (!error) {
    return "An unknown error occurred. Please try again.";
  }

  // If the error is already a string
  if (typeof error === "string") {
    return error;
  }

  // Handle Axios response errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Check specific HTTP status codes first for helpful fallback messages
    let statusFallback = "";
    if (status === 400) statusFallback = "Invalid request. Please check the uploaded data.";
    else if (status === 401) statusFallback = "Unauthorized. Please authenticate and try again.";
    else if (status === 403) statusFallback = "Access denied. You do not have permission for this resource.";
    else if (status === 404) statusFallback = "Requested resource was not found on the server.";
    else if (status === 413) statusFallback = "File is too large. Max allowed size is 5MB.";
    else if (status === 429) statusFallback = "Rate limit exceeded. Please wait a moment before trying again.";
    else if (status >= 500) statusFallback = "Internal server error. Our AI service is temporarily down.";

    if (data) {
      // 1. If data is a string
      if (typeof data === "string" && data.trim().length > 0) {
        return data;
      }
      // 2. error.response.data.message
      if (data.message && typeof data.message === "string" && data.message.trim().length > 0) {
        return data.message;
      }
      // 3. error.response.data.error
      if (data.error) {
        if (typeof data.error === "string" && data.error.trim().length > 0) {
          return data.error;
        }
        if (data.error.message && typeof data.error.message === "string" && data.error.message.trim().length > 0) {
          return data.error.message;
        }
      }
      // 4. error.response.data.detail
      if (data.detail && typeof data.detail === "string" && data.detail.trim().length > 0) {
        return data.detail;
      }
      // 5. Nested objects or empty objects in response data
      if (typeof data === "object" && Object.keys(data).length > 0) {
        // Try searching for any value inside the object that is a string
        for (const key of Object.keys(data)) {
          if (typeof data[key] === "string" && data[key].trim().length > 0) {
            return data[key];
          }
          if (data[key] && typeof data[key] === "object") {
            const nested = data[key];
            if (nested.message && typeof nested.message === "string") return nested.message;
            if (nested.error && typeof nested.error === "string") return nested.error;
          }
        }
      }
    }

    // Return status fallback if defined, else generic message
    return statusFallback || `Request failed with status code ${status}.`;
  }

  // Handle standard Error instances or custom objects with message properties
  if (error.message && typeof error.message === "string" && error.message.trim().length > 0) {
    if (error.message === "[object Object]" || error.message === "{}") {
      return "Resume scan failed. Please try again.";
    }
    return error.message;
  }

  // Handle Firebase or custom error code/description properties
  if (error.code && typeof error.code === "string") {
    return `Error code: ${error.code}`;
  }

  // Network/Connection errors (Axios throws these when server is offline or unreachable)
  if (error.request) {
    return "Unable to connect to the server. Please verify the backend is running.";
  }

  // Final generic fallback
  return "Resume scan failed. Please try again.";
};

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
    const readableMessage = extractErrorMessage(error);
    return Promise.reject(new Error(readableMessage));
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
