import { useEffect, useState } from "react";
import { getCartItems, updateCart } from "../utils/cartUtils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../types";
import { useNavigate } from "react-router-dom";
import { CartInterface } from "../types";
import BackButton from '../components/BackButton'
import Spinner from "../components/Spinner";
import { BiMinus, BiPlus } from "react-icons/bi";
import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";


const Cart = () => {

    const navigate = useNavigate();
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const dispatch = useDispatch();
    const authToken = userinfo.token;

    const handleUpdateCart = async (bookId: number, count: number) => {
        if (!authToken) {
            navigate('/login');
        }
        else {
            await updateCart(bookId, count, authToken);
            const items = await getCartItems(authToken);
            dispatch(setCartItemsSlice(items))
        }
    }
    

    return(
        <div className="p-4">
           <BackButton />
            {
                !cartItems ? (
                    "Cart is Empty"
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold my-4">Cart Items</h2>
                        <ul>
                            {cartItems.data.map((item) => (
                                <li key={item.book.id}>
                                    <div className="flex justify-start items-center gap-x-4">
                                        { item.quantity } • { item.book.title }
                                        <BiMinus onClick={() => {handleUpdateCart(item.book.id, -1)}} />
                                        <BiPlus onClick={() => {handleUpdateCart(item.book.id, 1)}} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button type='button' onClick={() => navigate('/checkout')}  className="mx-2 mt-4 bg-purple-500 text-white px-3 py-2 rounded-full font-bold hover:bg-purple-700">Checkout</button>

                    </div>
                )
            }

           {/* <h1 className="text-3xl my-4">Cart</h1> */}
        </div>
    );
}

export default Cart;