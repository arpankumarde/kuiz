"use client";

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_BASE,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("__session_token")}`,
  },
});

export default api;
