import axios from "axios";
import api from '../utils/api';
import { CartInterface } from "../types";


const updateCart = async (book_id: string, quantity: number, authToken: string): Promise<void> => {
// async function updateCart (bookId: string): Promise<void> {
    const config = {headers: { Authorization: authToken }};    
    const data = {
        book_id: book_id,
        quantity: quantity,
    };

    try {
        console.log('UPDATING CART 1');
        const response = await api.post('http://localhost:5555/cart/update-cart', data, config);
        console.log('UPDATING CART 2');
        console.log("Response: ", response.data.message);

    }
    catch (error) {
        console.error("Error: ", error);
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
        console.error("Error: ", error);
        throw error;
    }
}


export { updateCart, getCartItems };