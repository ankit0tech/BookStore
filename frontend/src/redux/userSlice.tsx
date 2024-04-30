import { createSlice } from '@reduxjs/toolkit';


export interface UserState {
    isAdmin: boolean;
    isAuthenticated: boolean;
    token: string | null;
}

const initialState: UserState= {
    isAdmin: (localStorage.getItem('isAdmin') == 'true') || false,
    isAuthenticated: !!localStorage.getItem('authToken'),
    token: localStorage.getItem('authToken')
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
            state.token = action.payload.token;
            localStorage.setItem('authToken', action.payload.token);
        },
        logoutSuccess: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            localStorage.removeItem('authToken');
        }
    },
});

export const { setIsAdmin, loginSuccess, logoutSuccess} = userSlice.actions;
export default userSlice.reducer;