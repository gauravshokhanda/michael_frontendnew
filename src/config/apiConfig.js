import axios from "axios";
const baseURL = "http://localhost:5000/api";
// const baseURL = "https://associatedincometax.iamdeveloper.in/api";

const API = axios.create({
  // baseURL: "https://associatedincometax.iamdeveloper.in/api",
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export { API, baseURL };
