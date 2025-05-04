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
    

    return(
        <div className="p-4">
           {/* <BackButton /> */}
            {
                !cartItems.data.length ? (
                    <div className="p-4">Cart is Empty</div>
                ) : (
                    <div className="overflow-x-auto">
                        <h2 className="text-2xl font-semibold mb-6">Cart Items</h2>
                        <ul>
                            {cartItems.data.map((item) => (
                                <li className="overflow-x-auto flex justify-between max-w-full sm:max-w-[80vw] border-b my-4 py-4" key={item.book.id}>
                                    <div className="flex justify-between">
                                        <div className="w-36 h-48 rounded-lg overflow-hidden flex justify-center items-center">
                                            <img
                                                src={item.book.cover_image}
                                                alt="book cover"
                                                className="w-full h-full object-cover object-scale-down" 
                                            ></img>
                                        </div>
                                        <div className="flex flex-col p-4 gap-2">
                                            <p>{ item.book.title }</p>
                                            <p>{ item.book.author }</p>
                                            <p className="">
                                                Total: { item.book.price * item.quantity }
                                            </p>

                                            <div className="inline-flex items-center rounded-full border-2 border-purple-500 w-fit">
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
                                                    <BiPlus className="text-xl"  />
                                                </button>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <button 
                            type='button' 
                            onClick={() => navigate('/dashboard/checkout')}  
                            className="m-4 bg-blue-500 text-white px-3 py-2 rounded-md font-bold hover:bg-blue-600 transition-all duration-200"
                        >
                            Checkout
                        </button>

                    </div>
                )
            }
        </div>
    );
}

export default Cart;