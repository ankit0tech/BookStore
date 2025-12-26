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
            
            api.post('http://localhost:5555/orders/checkout', data, config)
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

                        api.post('http://localhost:5555/orders/verify-payment', {
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

                    api.post('http://localhost:5555/orders/payment-failure', {
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
        api.get('http://localhost:5555/addresses/')
        .then((response) => {
            setAllUserAddresses(response.data);
            // if (defaultAddress && response.data.some((addr: Address) => addr.id === defaultAddress.id)) {
            //     setSelectedAddress(defaultAddress);
            // }
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
        api.get(`http://localhost:5555/cart/cart-summary?delivery_method=${selectedDeliveryMethod}`)
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
            api.get('http://localhost:5555/addresses/default-address')
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
        <div className='p-4'>
            {loading ? (
                <Spinner />
            ):(
                <div className='w-full mx-auto max-w-[1000px] rounded-lg'>
                        {cartItems.data.length === 0 ? (
                            <p>Cart is empty...</p>
                        ) : (
                        
                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                            <div className='lg:col-span-2'>
                                <ul className='flex flex-col gap-4'>
                                    {cartItems.data.map((item) => (
                                        <li className='flex gap-4' key={item.book.id}>
                                            <Link to={`/books/details/${item.book.id}`}>
                                                <div className='w-24 h-32 bg-gray-100 shadow-xs rounded-sm overflow-hidden flex justify-center items-center'>
                                                    <img 
                                                        src={item.book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'} 
                                                        alt={item.book.title} 
                                                        className='w-full h-full object-contain'
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                                                        }}
                                                    />
                                                </div>
                                            </Link>
                                            <div className="ml-4 grow">
                                                <p className="font-medium text-lg">{ item.book.title }</p>
                                                <p className="text-gray-600">{ item.book.author }</p>
                                                <div className="font-semibold mt-2"> 
                                                    {item.special_offer ? 
                                                        <p> 
                                                            {formatPrice(item.book.price * (100 - item.special_offer.discount_percentage) / 100, item.book.currency)} 
                                                            <span className="m-1 p-1 font-normal rounded-sm text-white bg-red-500"> 
                                                                {item.special_offer.discount_percentage}% 
                                                            </span>
                                                            <span className="block py-1 font-normal text-sm text-gray-500 line-through"> 
                                                                M.R.P. {formatPrice(item.book.price, item.book.currency)} 
                                                            </span>
                                                        </p> 
                                                        : 
                                                        <p> {formatPrice(item.book.price, item.book.currency)} </p>
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

                                        </li>
                                    ))}
                                </ul>
                                <div className='my-4 max-w-sm'>
                                    <div className='flex justify-between text-md text-gray-800'> <span>Sub Total:</span> <span> {formatPrice(subTotal, cartItems.data[0].book.currency)}</span> </div>
                                    <div className='flex justify-between text-md text-gray-800'> <span>Delivery Charges:</span> <span> {formatPrice(deliveryCharges, cartItems.data[0].book.currency)}</span> </div>
                                    <div className='flex justify-between font-semibold my-2 text-gray-950'> <span>Total Amount:</span> <span> {formatPrice(subTotal+deliveryCharges, cartItems.data[0].book.currency)}</span> </div>
                                </div>
                            </div>
                            <div className='flex flex-col gap-4'>
                                { selectedAddress && 
                                (<div className='flex flex-col gap-4'>
                                    <div className='text-lg font-medium text-gray-950'> Delivery Address: </div>
                                    <div className='flex flex-col py-2 px-4 border rounded-lg text-sm bg-gray-100'> 
                                        <div className='font-semibold'> {selectedAddress.house_number} </div>
                                        <div className='text-gray-700 '> {selectedAddress.zip_code} </div>
                                        <div className='text-gray-700'> {selectedAddress.street_address} </div>
                                    </div>
                                    
                                    <div className='flex flex-row gap-4'>
                                        <button 
                                            onClick={handleChangeAddressClick}
                                            className='text-left w-max py-1 px-2 border rounded-lg bg-gray-50 hover:bg-gray-100'
                                            >
                                            {showAllUserAddresses ? 'Hide Addresses' : 'Change Address' }
                                        </button>
                                        { showAllUserAddresses && 
                                            <Link className='block text-left w-max py-1 px-2 border rounded-lg bg-gray-50 hover:bg-gray-100' to='/dashboard/address/create' >Add new address</Link>
                                        }
                                    </div>
                                
                                </div>)}
                            
                                {(showAllUserAddresses && (allUserAddresses.length > 0)) && 
                                    <ul className='flex flex-col gap-1 text-sm font-medium'>
                                        {allUserAddresses.map((address) => (
                                            <li 
                                                key={address.id}
                                                className='text-gray-800 w-full'
                                            > 
                                                <label className='flex flex-row gap-2 p-2 border rounded-lg'>
                                                    <input
                                                        type="radio"
                                                        value={address.id}
                                                        checked={selectedAddress?.id.toString() === address.id.toString()}
                                                        onChange={() => setSelectedAddress(address)}
                                                    />
                                                     <div className='flex flex-col gap-1 p-1 text-sm w-full'> 
                                                        <div className='font-semibold'> {address.house_number} </div>
                                                        <div className='text-gray-700 '> {address.zip_code}, {address.street_address} </div>
                                                    </div>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                }

                                <div className='my-4'>
                                    <div className='text-lg font-medium text-gray-950 my-2'>Select Delivery Method</div>
                                    <select 
                                        className='w-full p-2 rounded-md outline-none border'
                                        name = "deliveryMethod"
                                        value = {selectedDeliveryMethod}
                                        onChange = {(e) => {setSelectedDeliveryMethod(e.target.value)}}
                                    >
                                        {deliveryMethods.map((method) => (
                                            <option 
                                                className='text-gray-700'
                                                key={method} 
                                                value={method}
                                            >
                                                {prettifyString(method.toLowerCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button 
                                    type='button' 
                                    onClick={displayRazorpay} 
                                    className="bg-blue-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-600" 
                                    >
                                        Buy Now
                                </button>
                            </div>
                        </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default Checkout