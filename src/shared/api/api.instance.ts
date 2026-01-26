import axios from "axios";

export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true
});

let retryCount = 0;

apiInstance.interceptors.response.use(
  (config) => config,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 ||
      (error.config && !error.config._isRetry && retryCount < 2)
    ) {
      originalRequest._isRetry = true;
      retryCount += 1;
      try {
        // return instance.get("tokens");
      } catch (error: unknown) {
        console.log(error);
      }
    }

    throw error;
  }
);
