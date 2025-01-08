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
import { enqueueSnackbar } from "notistack";


const Cart = () => {

    const navigate = useNavigate();
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const dispatch = useDispatch();
    const authToken = userinfo.token;
    
    const handleUpdateCart = async (bookId: number, count: number) => {
        try {
            if (!authToken) {
                navigate('/login');
            }
            else {
                await updateCart(bookId, count, authToken);
                const items = await getCartItems(authToken);
                dispatch(setCartItemsSlice(items))
            }
            
        } catch(error: any) {
            enqueueSnackbar("Error while updating cart", {variant: 'error'});
        }
    }
    

    return(
        <div className="p-4">
           <BackButton />
            {
                !cartItems.data.length ? (
                    <div className="p-4">Cart is Empty</div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold my-4">Cart Items</h2>
                        <ul>
                            {cartItems.data.map((item) => (
                                <li className="flex justify-between max-w-full sm:max-w-[80vw] border rounded-lg m-4 p-4 border-2 rounded-lg px-4 relative hover:shadow-xl" key={item.book.id}>
                                    <div className="flex justify-between">
                                        <div className="w-36 h-48 bg-gray-100 rounded-lg shadow-md overflow-hidden flex justify-center items-center">
                                            <img
                                                src={item.book.cover_image}
                                                alt="book cover"
                                                className="w-full h-full object-cover object-scale-down" 
                                            ></img>
                                        </div>
                                        <div className="p-2">
                                            { item.book.title }
                                        </div>
                                    </div>
                                    <div className="">
                                        <div className="border rounded-lg">
                                            <div className="p-2">
                                                Qty: { item.quantity }
                                            </div>
                                            <div className="p-2">
                                                Total: { item.book.price * item.quantity }
                                            </div>
                                            <div className="p-2 flex justify-around">
                                                <BiMinus onClick={() => {handleUpdateCart(item.book.id, -1)}} />
                                                <BiPlus onClick={() => {handleUpdateCart(item.book.id, 1)}} />
                                            </div>
                                        </div>
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