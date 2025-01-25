import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import store from './redux/store.tsx';
import { Provider } from 'react-redux';

// import { PersistGate } from 'redux-persist/integration/react';
// import { persistor } from './redux/store'; // Import Redux store and persistor


// import { UserState } from './redux/userSlice.tsx';

// Need to decide background color later.

// export interface RootState { 
//   user: UserState;
// }


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider>
        {/* <div style={{ backgroundColor: '#d1d5db', minHeight: '100vh'}}> */}
        {/* <div className="bg-stone-300">   */}
          <Provider store={store}>
            {/* <PersistGate loading={null} persistor={persistor} > */}
              <App />
            {/* </PersistGate> */}
          </Provider>
        {/* </div> */}
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
