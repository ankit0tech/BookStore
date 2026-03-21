import { useEffect, useState } from "react";
import { useHandleCartUpdate } from "../utils/cartUtils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../types";
import { Link, useNavigate } from "react-router-dom";
import { CartInterface } from "../types";
import BackButton from '../components/BackButton'
import Spinner from "../components/Spinner";
import { BiMinus, BiPlus } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import { formatPrice } from "../utils/formatUtils";
// import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";
// import { enqueueSnackbar } from "notistack";


const Cart = () => {

    const navigate = useNavigate();
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    const [subTotal, setSubTotal] = useState<number>(0);
    const [deliveryCharges, setDeliveryCharges] = useState<number>(0);
    // const userinfo = useSelector((state: RootState) => state.userinfo);
    // const authToken = userinfo.token;
    const { handleCartUpdate } = useHandleCartUpdate();
    // console.log(cartItems);


    useEffect(() => {
        // setSubTotal(findSubTotal(cartItems));
        api.get(`/cart/cart-summary`)
            .then((response) => {
                setSubTotal(response.data.subTotal);
                setDeliveryCharges(response.data.deliveryCharges);
            })
            .catch(() => {
                enqueueSnackbar('Error fetching cart details', {variant: 'error'});
            });
    }, [cartItems]);
    

    return(
        <div className="lg:p-4 max-w-7xl">
            {
                !cartItems.data.length ? (
                    <div className='flex flex-row items-center gap-2 w-fit'>
                        <p className='text-gray-700'>Cart is empty</p>
                        <button 
                            type='button' 
                            onClick={() => navigate('/')}  
                            className='text-amber-600 hover:underline hover:text-amber-700'
                        >
                            Home
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <ul className="flex flex-col gap-2">
                                {cartItems.data.map((item) => (
                                    <li key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 py-4 border-b last:border-b-0">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/books/details/${item.book.id}`}>
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
                                            </Link>

                                            <div className="flex flex-col min-w-0">
                                                <Link to={`/books/details/${item.book.id}`} className="font-medium line-clamp-2">{ item.book.title }</Link>
                                                <p className="text-gray-600 text-sm line-clamp-1">{ item.book.author }</p>
                                                <div className="font-semibold mt-2"> 
                                                    {item.special_offer ? 
                                                        <p className="flex flex-col gap-1 _text-nowrap">
                                                            <div className="flex flex-col items-baseline lg:flex-row lg:gap-1 lg:items-end">
                                                                <p className="text-base font-medium"> {formatPrice(item.book.price * (100 - item.special_offer.discount_percentage)/100, item.book.currency)} </p>
                                                                <p className="font-semibold text-sm text-amber-600 truncate min-w-0"> 
                                                                    {item.special_offer.discount_percentage}% OFF
                                                                </p>
                                                            </div>
                                                            <p className="block font-normal text-sm text-gray-500 line-through"> 
                                                                M.R.P. {formatPrice(item.book.price, item.book.currency)} 
                                                            </p>
                                                        </p> 
                                                        : 
                                                        <p className="font-medium"> {formatPrice(item.book.price, item.book.currency)} </p>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="justify-self-end bg-white py-1.5 px-4 hover:shadow-xs flex flex-row gap-4 items-center rounded-full w-fit h-fit transition-shadow duration-200 border">
                                            <button 
                                                onClick={() => {handleCartUpdate(item.book.id, -1, item.special_offer?.id)}}    
                                            >
                                                {item.quantity === 1 ? <MdOutlineDelete className="text-xl" /> : <BiMinus className="text-xl" /> }
                                            </button>

                                            <p className=""> {item.quantity} </p>
                                            
                                            <button 
                                                onClick={() => {handleCartUpdate(item.book.id, 1, item.special_offer?.id)}}
                                            >
                                                <BiPlus className="text-xl" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 p-2 flex flex-col gap-4 h-min pb-6">
                                <p className="text-lg font-medium">Cart Summary</p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-1 text-sm text-gray-800">
                                        <div className="flex justify-between gap-2">
                                            <span className="text-gray-600">Sub Total: </span> 
                                            <span className=""> {formatPrice(subTotal, cartItems.data[0].book.currency)}</span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <span className="text-gray-600">Delivery charges: </span>
                                            <span className="">{formatPrice(deliveryCharges)}</span>
                                        </div>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between gap-2 font-medium">
                                            <span>Total:</span>
                                            <span className=""> {formatPrice(subTotal, cartItems.data[0].book.currency)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    type='button' 
                                    onClick={() => navigate('/dashboard/checkout')}  
                                    className="w-fit self-end py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                >
                                    Checkout
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