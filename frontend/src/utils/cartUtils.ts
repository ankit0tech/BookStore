import axios from "axios";
import api from '../utils/api';
import { CartInterface, RootState } from "../types";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCartItems as setCartItemsSlice} from "../redux/cartSlice";


const updateCart = async (book_id: number, quantity: number, authToken: string, selectedOfferId?: number|null, ): Promise<void> => {

    const config = {headers: { Authorization: authToken }};
    const data = {
        book_id: book_id,
        quantity: quantity,
        selected_offer_id: selectedOfferId
    };

    await api.post('http://localhost:5555/cart/update-cart', data, config);
}

const getCartItems = async (): Promise<CartInterface> => {
    
    try {
        const response = await api.get('http://localhost:5555/cart/get-cart-items');        
        return response.data;
    } catch (error) {
        enqueueSnackbar("Error while fetching cart items", {variant: 'error'});
        throw error;
    }
}

const useHandleCartUpdate = () => {

    const navigate = useNavigate();
    const userData = useSelector((state: RootState) => state.userinfo);
    const dispatch = useDispatch();
    
    const handleCartUpdate = async (bookId: number, count: number, selectedOfferId?: number|null) => {
        const authToken = userData?.token;

        try {
            if (!authToken) {
                navigate('/login');
            }
            else {
                await updateCart(bookId, count, authToken, selectedOfferId);
                const items = await getCartItems();
                dispatch(setCartItemsSlice(items));
                enqueueSnackbar('Cart updated', {variant: 'success'});
            }
        } catch(error) {
            console.log(error);
            enqueueSnackbar('Error while updating cart', {variant: 'error'});
        }
    }

    return { handleCartUpdate };
}



export { updateCart, getCartItems, useHandleCartUpdate };