import axios from 'axios';

export const API_URL = "https://prodcutionreadywebbackend-2.onrender.com";
// change api

export const api = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});