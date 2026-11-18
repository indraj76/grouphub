import React from 'react';import ReactDOM from 'react-dom/client';import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx';import { AuthProvider } from './context/AuthContext.jsx';import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(<BrowserRouter><AuthProvider><AppRoutes/></AuthProvider></BrowserRouter>)
