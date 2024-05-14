import { createSlice } from '@reduxjs/toolkit';


export interface UserState {
    isAdmin: boolean;
    isAuthenticated: boolean;
    token: string | null;
    email: string | null;
}

const initialState: UserState = {
    isAdmin: (localStorage.getItem('isAdmin') == 'true') || false,
    isAuthenticated: !!localStorage.getItem('authToken'),
    token: localStorage.getItem('authToken'),
    email: localStorage.getItem('email')
};

export const userSlice = createSlice({
    name: 'userinfo',
    initialState,
    reducers: {
        setIsAdmin: (state, action) => {
            if (action.payload.isAdmin == true) {
                state.isAdmin = true;
                localStorage.setItem('isAdmin', 'true');
            }
            else {
                state.isAdmin = false;
                localStorage.setItem('isAdmin', 'false');
            }
        },
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.email = action.payload.email;
            state.token = action.payload.token;
            localStorage.setItem('authToken', action.payload.token);
            localStorage.setItem('email', action.payload.email);
        },
        logoutSuccess: (state) => {
            state.isAuthenticated = false;
            state.email = null;
            state.token = null;
            state.isAdmin = false;
            localStorage.removeItem('authToken');
            localStorage.removeItem('email');
            localStorage.removeItem('isAdmin');
        }
    },
});

export const { setIsAdmin, loginSuccess, logoutSuccess} = userSlice.actions;
export default userSlice.reducer;