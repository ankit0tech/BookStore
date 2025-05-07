import { useEffect, useState } from "react";
import { useHandleCartUpdate } from "../utils/cartUtils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../types";
import { useNavigate } from "react-router-dom";
import { CartInterface } from "../types";
import BackButton from '../components/BackButton'
import Spinner from "../components/Spinner";
import { BiMinus, BiPlus } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
// import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";
// import { enqueueSnackbar } from "notistack";


const Cart = () => {

    const navigate = useNavigate();
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    // const userinfo = useSelector((state: RootState) => state.userinfo);
    // const dispatch = useDispatch();
    // const authToken = userinfo.token;
    const { handleCartUpdate } = useHandleCartUpdate();

    const findSubTotal = (cartItems: CartInterface) => {
        const subTotal = cartItems.data.reduce((accumulator, current) => accumulator + (current.quantity * current.book.price), 0);
        return subTotal;
    }
    

    return(
        <div className="p-4 max-w-7xl mx-auto">
            {
                !cartItems.data.length ? (
                    <div className="p-4">Cart is Empty</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-semibold mb-6">Cart</h2>
                            <div className="bg-white rounded-lg shadow-sm">
                                {cartItems.data.map((item) => (
                                    <div className="flex items-center p-4 border-b last:border-b-0" key={item.book.id}>
                                        <div className="w-28 h-36 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.book.cover_image}
                                                alt={item.book.title}
                                                className="w-full h-full object-cover object-scale-down" 
                                            ></img>
                                        </div>

                                        <div className="ml-4 flex-grow">
                                            <p className="font-medium text-lg">{ item.book.title }</p>
                                            <p className="text-gray-600">{ item.book.author }</p>
                                            <p className="font-semibold mt-2"> &#8377;{ item.book.price * item.quantity }</p>
                                        </div>

                                        <div className="inline-flex items-center rounded-full border-2 border-purple-500 w-fit h-fit">
                                            <button 
                                                className="p-1 px-4"
                                                onClick={() => {handleCartUpdate(item.book.id, -1)}}    
                                            >
                                                {item.quantity === 1 ? <MdOutlineDelete className="text-xl" /> : <BiMinus className="text-xl" /> }
                                            </button>

                                            <p className="p-1">
                                                { item.quantity }
                                            </p>

                                            <button 
                                                className="p-1 px-4" 
                                                onClick={() => {handleCartUpdate(item.book.id, 1)}}
                                            >
                                                <BiPlus className="text-xl" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                        
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 p-6 bg-white h-min rounded-lg shadow-sm border-b">
                                <p className="text-xl font-semibold mb-4">Order Summary</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sub Total: </span> 
                                        <span className="font-medium"> &#8377;{findSubTotal(cartItems).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping charges: </span>
                                        <span className="font-medium">Free</span>
                                    </div>
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total:</span>
                                            <span className=""> &#8377;{findSubTotal(cartItems).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    type='button' 
                                    onClick={() => navigate('/dashboard/checkout')}  
                                    className="w-full mt-6 bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200"
                                    >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default Cart;