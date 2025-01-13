import { createSlice } from '@reduxjs/toolkit';


export interface UserState {
    userRole: string | null;
    isAuthenticated: boolean;
    token: string | null;
    email: string | null;
}

const initialState: UserState = {
    userRole: null,
    isAuthenticated: !!localStorage.getItem('authToken'),
    token: localStorage.getItem('authToken'),
    email: localStorage.getItem('email')
};

export const userSlice = createSlice({
    name: 'userinfo',
    initialState,
    reducers: {
        setUserRole: (state, action) => {
            state.userRole = action.payload.userRole
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
            state.userRole = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('email');
        }
    },
});

export const { setUserRole, loginSuccess, logoutSuccess} = userSlice.actions;
export default userSlice.reducer;