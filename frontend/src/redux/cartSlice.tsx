import { createSlice } from "@reduxjs/toolkit";
import { CartInterface } from "../types";

// export interface CartState {
//     data: {
//         userId: string;
//         bookId: string;
//         bookName: string;
//         quantity: number;
//     } []
// }

const initialState: CartInterface = {
    data: []
}

export const cartSlice = createSlice({
    name: 'cartinfo',
    initialState,
    reducers: {
        setCartItems: (state, action) => {
            state.data = action.payload.data
        },
    }
});

export const { setCartItems } = cartSlice.actions;
export default cartSlice.reducer;