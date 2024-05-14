import axios from "axios";
import { Cart } from "../types";


const updateCart = async (bookId: string, quantity: number, authToken: string): Promise<void> => {
// async function updateCart (bookId: string): Promise<void> {
    const config = {headers: { Authorization: authToken }};    
    const data = {
        bookId: bookId,
        quantity: quantity,
    };

    try {
        const response = await axios.post('http://localhost:5555/cart/update-cart', data, config);
        console.log("Response: ", response.data.message);
    }
    catch (error) {
        console.error("Error: ", error);
    }
    
}

const getCartItems = async (authToken: string): Promise<Cart> => {
    const config = {headers: { Authorization: authToken }};
    console.log(config);
    
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