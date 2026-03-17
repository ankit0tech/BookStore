import { useEffect, useState } from 'react';
import { Address, CartInterface, RootState } from '../types/index';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { getCartItems, useHandleCartUpdate } from '../utils/cartUtils';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";
import { enqueueSnackbar } from 'notistack';
import { BiMinus, BiPlus } from 'react-icons/bi';
import { MdOutlineDelete } from 'react-icons/md';
import { formatPrice, prettifyString } from '../utils/formatUtils';


const loadScript = (src: string) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        }
        script.onerror = () => {
            resolve(false);
        }

        document.body.appendChild(script);
    });
}

const deliveryMethods = ['STANDARD', 'EXPRESS', 'NEXT_DAY'];


const Checkout = () => {

    // Expect that checkout option will be availble only when cart is not empty
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    const [loading, setLoading] = useState<boolean>(true);
    const [defaultAddress, setDefaultAddress] = useState<Address|null>(null);
    const [allUserAddresses, setAllUserAddresses] = useState<Address[]>([]);
    const [showAllUserAddresses, setShowAllUserAddresses] = useState<boolean>(false);
    const [selectedAddress, setSelectedAddress] = useState<Address|null>(null);
    const [subTotal, setSubTotal] = useState<number>(0);
    const [deliveryCharges, setDeliveryCharges] = useState<number>(0);
    const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>('STANDARD');
    const { handleCartUpdate } = useHandleCartUpdate();

    const userData = useSelector((state: RootState) => state.userinfo);
    const authToken = userData.token;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const displayRazorpay = async () => {

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        
        if(!res) {
            alert('razorpay failed to load!!');
            return;
        }
        
        await handleBuyBooks();
    }


    const handleBuyBooks = async () => {
        try {
            if (!authToken) {
                navigate('/login');
                return;
            }

            const config = { headers: { Authorization: authToken }};
            const data = {
                delivery_address_id: selectedAddress?.id,
                delivery_method: selectedDeliveryMethod
            }
            
            api.post('/orders/checkout', data, config)
            .then((response) => {
                
                const razorpayOrder = response.data.razorpayOrder;
                const options = {
                    "key": import.meta.env.VITE_RAZORPAY_KEY_ID,
                    "amount": razorpayOrder.amount,
                    "currency": razorpayOrder.currency,
                    "name": "BookStore Corp",
                    "description": "Test Transaction",
                    "image": "https://example.com/your_logo",
                    "order_id": razorpayOrder.id,
                    "notes": {
                        "address": "Razorpay Corporate Office"
                    },
                    "theme": {
                        "color": "#3399cc"
                    },
                    handler: function (response: any) {

                        api.post('/orders/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, config)
                        .then((response) => {
                            getCartItems()
                            .then((response) => {
                                dispatch(setCartItemsSlice(response));
                            })
                            .catch((error) => {
                                enqueueSnackbar('Error while fetching cart:', {variant: 'error'});
                            });

                            enqueueSnackbar('Payment successful', {variant: 'success'});
                        })
                        .catch((error) => {
                            enqueueSnackbar('Payment verification failed', {variant: 'error'});
                        });
                    },
                };
                
                const paymentObject = new window.Razorpay(options);
                paymentObject.on('payment.failed', (response: any) => {
                    
                    enqueueSnackbar(response.error.description, {variant: 'error'});

                    api.post('/orders/payment-failure', {
                        'razorpay_order_id': razorpayOrder.id,
                        'error': response.error
                    }, config)
                    .then((response) => {
                        
                    })
                    .catch((error) => {
                        enqueueSnackbar('Error updating payment failure status', {variant: 'warning'});
                    });
                });

                paymentObject.open();

            })
            .catch((error) => {
                enqueueSnackbar('Error while checkout', {variant: 'error'});
            });

        } catch (error) {
            console.log('Error while checkout', error);
        }
    }

    const loadAllUserAddresses = () => {
        api.get('/addresses/')
        .then((response) => {
            setAllUserAddresses(response.data);
        })
        .catch((error:any) => {
            console.log(error);
        })
    }
    
    const handleChangeAddressClick = () => {
        if(showAllUserAddresses) {
            setShowAllUserAddresses(false);
        } else {
            loadAllUserAddresses();
            setShowAllUserAddresses(true); 
        }
    }
    
    useEffect(()=> {
        api.get(`/cart/cart-summary?delivery_method=${selectedDeliveryMethod}`)
        .then((response) => {
            setSubTotal(response.data.subTotal);
            setDeliveryCharges(response.data.deliveryCharges);
        })
        .catch(() => {
            enqueueSnackbar('Error fetching cart details', {variant: 'error'});
        });
    }, [selectedDeliveryMethod, cartItems.data]);

    useEffect(() => {
       getCartItems()
        .then((response) => {
            dispatch(setCartItemsSlice(response));
        })
        .catch(() => {
            enqueueSnackbar('Error fetching cart details', {variant: 'warning'});
        });
    }, [dispatch]);

    useEffect(() => {
        setLoading(true);

        if(!defaultAddress) {
            api.get('/addresses/default-address')
            .then((response) => {
                setDefaultAddress(response.data);
                setSelectedAddress(response.data);
            })
            .catch((error: any) => {
                console.log(error);
            })
        }

        setLoading(false);

    },[]);


    return (
        <div className='lg:p-4'>
            {loading ? (
                <Spinner />
            ):(
                <div className='w-full mx-auto rounded-lg'>
                        {cartItems.data.length === 0 ? (
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
                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl'>
                            <div className='lg:col-span-2'>
                                <ul className='flex flex-col gap-2'>
                                    {cartItems.data.map((item) => (
                                        <li key={item.book.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 py-4 border-b last:border-b-0">
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
                                {/* <div className='my-4 max-w-sm'>
                                    <div className='flex justify-between text-md text-gray-800'> <span>Sub Total:</span> <span> {formatPrice(subTotal, cartItems.data[0].book.currency)}</span> </div>
                                    <div className='flex justify-between text-md text-gray-800'> <span>Delivery Charges:</span> <span> {formatPrice(deliveryCharges, cartItems.data[0].book.currency)}</span> </div>
                                    <div className='flex justify-between font-semibold my-2 text-gray-950'> <span>Total Amount:</span> <span> {formatPrice(subTotal+deliveryCharges, cartItems.data[0].book.currency)}</span> </div>
                                </div> */}
                            </div>
                            <div className='flex flex-col gap-6'>
                                { selectedAddress && 
                                    (<div className='flex flex-col gap-4'>
                                        <div className='text-lg font-medium text-gray-800'> Delivery Address</div>
                                        <div className='flex flex-col py-2 px-4 border rounded-lg text-sm bg-gray-100'> 
                                            <div className='font-semibold'> {selectedAddress.house_number} </div>
                                            <div className='text-gray-700'>
                                                <span>{selectedAddress.zip_code},</span> <span>{selectedAddress.street_address}</span>
                                            </div>
                                        </div>
                                        
                                        <div className='flex flex-row gap-4 text-gray-800'>
                                            <button 
                                                onClick={handleChangeAddressClick}
                                                className='text-sm w-max py-1 px-2 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200'
                                            >
                                                {showAllUserAddresses ? 'Hide Addresses' : 'Change Address' }
                                            </button>
                                            { showAllUserAddresses && 
                                                <Link 
                                                    to='/dashboard/address/create' 
                                                    className='block text-sm w-max py-1 px-2 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200' 
                                                >
                                                    Add new address
                                                </Link>
                                            }
                                        </div>
                                    </div>)
                                }
                            
                                {(showAllUserAddresses && (allUserAddresses.length > 0)) && 
                                    <ul className='flex flex-col gap-2 text-sm font-medium'>
                                        {allUserAddresses.map((address) => (
                                            <li 
                                                key={address.id}
                                                className='text-gray-800 w-full hover:bg-gray-100 transition-colors duration-300 border rounded-lg'
                                            > 
                                                <label className='flex flex-row items-center gap-2 p-2'>
                                                    <input
                                                        type="radio"
                                                        className="shrink-0 appearance-none bg-white current-color rounded-full border-[1.5px] border-gray-800 h-[14px] w-[14px] grid place-items-center
                                                                    before:content-[''] before:h-[8px] before:w-[8px] before:rounded-full before:bg-amber-600 before:scale-0 
                                                                    checked:before:scale-100 before:inset-shadow-[8px_8px_0px_0px] before:inset-shadow-amber-600 before:transition-transform before:duration-200"
                                                        value={address.id}
                                                        checked={selectedAddress?.id.toString() === address.id.toString()}
                                                        onChange={() => setSelectedAddress(address)}
                                                    />
                                                     <div className='flex flex-col p-1 text-sm w-full'> 
                                                        <div className='font-semibold text-gray-800'> {address.house_number} </div>
                                                        <div className='text-gray-700'>
                                                            <span>{address.zip_code},</span> <span>{address.street_address}</span> 
                                                        </div>
                                                    </div>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                }

                                <div className='flex flex-col gap-2'>
                                    <div className='font-medium text-gray-950'>Select Delivery Method</div>
                                    <select 
                                        className='w-full p-2 rounded-md outline-none border'
                                        name = "deliveryMethod"
                                        value = {selectedDeliveryMethod}
                                        onChange = {(e) => {setSelectedDeliveryMethod(e.target.value)}}
                                    >
                                        {deliveryMethods.map((method) => (
                                            <option 
                                                className='_text-sm text-gray-700'
                                                key={method} 
                                                value={method}
                                            >
                                                {prettifyString(method.toLowerCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sticky top-4 flex flex-col gap-2 h-min _max-w-[320px] pb-6">
                                    <p className="font-medium text-gray-950">Order Summary</p>
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
                                        onClick={displayRazorpay} 
                                        className="w-fit self-end py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                        >
                                            Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default Checkout