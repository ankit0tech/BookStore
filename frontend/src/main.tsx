import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

// Need to decide background color later.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <SnackbarProvider>
      {/* <div style={{ backgroundColor: '#d1d5db', minHeight: '100vh'}}> */}
      {/* <div className="bg-stone-300">   */}
        <App />
      {/* </div> */}
    </SnackbarProvider>
  </BrowserRouter>,
)
