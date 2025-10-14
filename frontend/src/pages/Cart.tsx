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
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
// import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";
// import { enqueueSnackbar } from "notistack";


const Cart = () => {

    const navigate = useNavigate();
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    const [subTotal, setSubTotal] = useState<number>(0);
    const [deliveryCharges, setDeliveryCharges] = useState<number>(0);
    // const userinfo = useSelector((state: RootState) => state.userinfo);
    // const dispatch = useDispatch();
    // const authToken = userinfo.token;
    const { handleCartUpdate } = useHandleCartUpdate();
    // console.log(cartItems);

    const findSubTotal = (cartItems: CartInterface) => {
        const subTotal = cartItems.data.reduce((accumulator, current) => {
            const { book, quantity, special_offer } = current;
            const discount = special_offer?.discount_percentage || 0;
            const discountedPrice = book.price * (100 - discount) / 100;
            return accumulator + (quantity * discountedPrice);
        }, 0);
        return subTotal;
    }

    useEffect(() => {
        // setSubTotal(findSubTotal(cartItems));
        api.get(`http://localhost:5555/cart/cart-summary`)
            .then((response) => {
                setSubTotal(response.data.subTotal);
                setDeliveryCharges(response.data.deliveryCharges);
            })
            .catch(() => {
                enqueueSnackbar('Error fetching cart details', {variant: 'error'});
            });
    }, [cartItems]);
    

    return(
        <div className="p-4 max-w-7xl mx-auto">
            {
                !cartItems.data.length ? (
                    <div className="p-4">Cart is Empty</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-semibold mb-6">Cart</h2>
                            <div className="bg-white rounded-lg shadow-xs">
                                {cartItems.data.map((item) => (
                                    <div className="flex items-center p-4 border-b last:border-b-0" key={item.id}>
                                        <div className="w-28 h-36 rounded-lg overflow-hidden shrink-0">
                                            <img
                                                src={item.book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'}
                                                alt={item.book.title}
                                                className="w-full h-full object-cover object-scale-down" 
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                                                }}
                                            ></img>
                                        </div>

                                        <div className="ml-4 grow">
                                            <p className="font-medium text-lg">{ item.book.title }</p>
                                            <p className="text-gray-600">{ item.book.author }</p>
                                            <div className="font-semibold mt-2"> 
                                                {item.special_offer ? 
                                                    <p> 
                                                        &#8377;{ (item.book.price * (100 - item.special_offer.discount_percentage) / 100).toFixed(2)} 
                                                        <span className="m-1 p-1 font-normal rounded-sm text-white bg-red-500"> 
                                                            {item.special_offer.discount_percentage}% 
                                                        </span>
                                                        <span className="block py-1 font-normal text-sm text-gray-500 line-through"> 
                                                            M.R.P. &#8377;{ item.book.price.toFixed(2)} 
                                                        </span>
                                                    </p> 
                                                    : 
                                                    <p> &#8377;{ item.book.price.toFixed(2)} </p>
                                                }
                                            </div>
                                        </div>

                                        <div className="inline-flex items-center rounded-full border-2 border-purple-500 w-fit h-fit">
                                            <button 
                                                className="p-1 px-4"
                                                onClick={() => {handleCartUpdate(item.book.id, -1, item.special_offer?.id)}}    
                                            >
                                                {item.quantity === 1 ? <MdOutlineDelete className="text-xl" /> : <BiMinus className="text-xl" /> }
                                            </button>

                                            <p className="p-1">
                                                { item.quantity }
                                            </p>

                                            <button 
                                                className="p-1 px-4" 
                                                onClick={() => {handleCartUpdate(item.book.id, 1, item.special_offer?.id)}}
                                            >
                                                <BiPlus className="text-xl" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                        
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 p-6 bg-white h-min rounded-lg shadow-xs border-b">
                                <p className="text-xl font-semibold mb-4">Order Summary</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sub Total: </span> 
                                        <span className="font-medium"> &#8377;{subTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery charges: </span>
                                        <span className="font-medium">{deliveryCharges}</span>
                                    </div>
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total:</span>
                                            <span className=""> &#8377;{subTotal.toFixed(2)}</span>
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