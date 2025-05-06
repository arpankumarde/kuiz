import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_BASE,
  headers: {},
});

if (typeof window !== "undefined") {
  const token = localStorage.getItem("__session_token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

export default api;
