import axios from "axios";
import api from '../utils/api';
import { CartInterface } from "../types";
import { enqueueSnackbar } from "notistack";


const updateCart = async (book_id: number, quantity: number, authToken: string): Promise<void> => {
// async function updateCart (bookId: string): Promise<void> {
    const config = {headers: { Authorization: authToken }};    
    const data = {
        book_id: book_id,
        quantity: quantity,
    };

    try {
        await api.post('http://localhost:5555/cart/update-cart', data, config);
    }
    catch (error) {
        enqueueSnackbar("Error occurred while updating cart", {variant: 'error'})
    }
    
}

const getCartItems = async (authToken: string): Promise<CartInterface> => {
    const config = {headers: { Authorization: authToken }};
    
    try {
        const response = await axios.get('http://localhost:5555/cart/get-cart-items', config);
        // console.log("Response: ", response.data);
        return response.data;
    }
    catch (error) {
        enqueueSnackbar("Error while fetching cart items", {variant: 'error'});
        throw error;
    }
}


export { updateCart, getCartItems };