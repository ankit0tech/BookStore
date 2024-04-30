import { configureStore } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // Defaults to localStorage for web

import userReducer from './userSlice';
// import { checkTokenExpiry } from "./authMiddleware";
// import { Middleware } from "redux";

// type MiddlewareArray = ReadonlyArray

// const persistConfig = {
//     key: 'root', // Key for storing in localStorage
//     storage, // Storage engine (localStorage by default)
//     whitelist: ['userinfo'], // List of reducers to persist (e.g., 'user')
//   };

// const persistedReducer = persistReducer(persistConfig, userReducer);

const store = configureStore({
    reducer:{
        userinfo: userReducer,
    },
    // reducer: persistedReducer,

    // reducer: userReducer,
    // middleware: (gDM) => gDM().concat(checkTokenExpiry),
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(checkTokenExpiry),
});

// export const persistor = persistStore(store);
export default store;