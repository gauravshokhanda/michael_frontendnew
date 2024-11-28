import axios from "axios";

const API = axios.create({
  //   baseURL: "https://associatedincometax.iamdeveloper.in/api",
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
