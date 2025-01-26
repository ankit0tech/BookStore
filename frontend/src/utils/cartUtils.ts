import axios from "axios";
import api from '../utils/api';
import { CartInterface, RootState } from "../types";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCartItems as setCartItemsSlice} from "../redux/cartSlice";


const updateCart = async (book_id: number, quantity: number, authToken: string): Promise<void> => {

    const config = {headers: { Authorization: authToken }};
    const data = {
        book_id: book_id,
        quantity: quantity,
    };

    try {
        await api.post('http://localhost:5555/cart/update-cart', data, config);
    }
    catch (error) {
        enqueueSnackbar("Error occurred while updating cart", {variant: 'error'});
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

const useHandleCartUpdate = () => {

    const navigate = useNavigate();
    const userData = useSelector((state: RootState) => state.userinfo);
    const dispatch = useDispatch();
    
    const handleCartUpdate = async (bookId: number, count: number) => {
        const authToken = userData?.token;

        try {
            if (!authToken) {
                navigate('/login');
            }
            else {
                await updateCart(bookId, count, authToken);
                const items = await getCartItems(authToken);
                dispatch(setCartItemsSlice(items));
                enqueueSnackbar('Cart updated', {variant: 'success'});
            }
        } catch(error) {
            console.log(error);
            enqueueSnackbar('Error while loading books', {variant: 'error'});
        }
    }

    return { handleCartUpdate };
}



export { updateCart, getCartItems, useHandleCartUpdate };