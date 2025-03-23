import { useEffect, useState } from 'react';
import { Address, RootState } from '../types/index';
import { useSelector } from 'react-redux';
import { Book } from '../types/index';
// import axios from 'axios';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { getCartItems } from '../utils/cartUtils';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";


const Checkout = () => {

    // Expect that checkout option will be availble only when cart is not empty
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [defaultAddress, setDefaultAddress] = useState<Address|null>(null);
    const [allUserAddresses, setAllUserAddresses] = useState<Address[]>([]);
    const [showAllUserAddresses, setShowAllUserAddresses] = useState<boolean>(false);
    const [selectedAddress, setSelectedAddress] = useState<number|null>(null);

    const userData = useSelector((state: RootState) => state.userinfo);
    const authToken = userData.token;
    const navigate = useNavigate();
    const dispatch = useDispatch();


    useEffect(() => {
        setLoading(true);

        const total = cartItems.data.reduce((acc, item) => 
            acc + (item.quantity * (item.book.price * (item.special_offers ? (100 - item.special_offers.discount_percentage) : 100) / 100)), 0);
        
        setTotalAmount(total);
        

        api.get('http://localhost:5555/address/default-address')
        .then((response) => {
            console.log(response);
            setDefaultAddress(response.data);
            setSelectedAddress(response.data.id);
        })
        .catch((error: any) => {
            console.log(error);
        }) 


        setLoading(false);

    },[cartItems.data]);

    const handleBuyBooks = async () => {
        try {
            if (!authToken) {
                navigate('/login');
            } else {

                const config = { headers: { Authorization: authToken }};
                const data = {
                    delivery_address_id: selectedAddress
                }
                const response = await api.post('http://localhost:5555/cart/checkout', data, config);

                // Update the cart items
                const items = await getCartItems(authToken);
                dispatch(setCartItemsSlice(items));

            }
        } catch (error) {
            console.log('Error while checkout', error);
        }

    }

    const loadAllUserAddresses = () => {
        setShowAllUserAddresses(true); 

        api.get('http://localhost:5555/address/')
        .then((response) => {
            console.log(response.data);
            setAllUserAddresses(response.data);
            if (defaultAddress && response.data.some((addr: Address) => addr.id === defaultAddress.id)) {
                setSelectedAddress(defaultAddress.id);
            }
        })
        .catch((error:any) => {
            console.log(error);
        })
    }

    return (
        <div className='p-4'>
            {loading ? (
                <Spinner />
            ):(
                <div className='w-full mx-auto max-w-[1000px] rounded-lg'>
                        {cartItems.data.length === 0 ? (
                            <p>Cart is empty...</p>
                        ) : (
                        <div className='flex flex-col items-start'>
                            <ul>
                                { cartItems.data.map((item) => (
                                    <li className='flex gap-x-4' key={item.book.id}>
                                        {item.book.title} - price: {item.book.price} - qty: {item.quantity}  
                                        <div className="text-red-500"> 
                                            {item.special_offers && `${item.special_offers.discount_percentage} %` } 
                                        </div>
                                    </li>
                                )) }
                            </ul>
                   
                            <p>Total Amount: {totalAmount}</p>
                            { defaultAddress && <div className='py-2'>
                                Delivery Address:
                                <div> {defaultAddress.house_number}, {defaultAddress.zip_code}, {defaultAddress.street_address} </div>
                                
                                <button 
                                    onClick={() => {
                                        loadAllUserAddresses()
                                    }}
                                >
                                    change address
                                </button>
                            
                            </div>}
                            
                            <ul>
                            {(showAllUserAddresses && (allUserAddresses.length > 0)) && 
                            allUserAddresses.map((address) => (
                                <li 
                                    key={address.id}
                                > 
                                    <label>
                                        <input
                                            type="radio"
                                            value={address.id}
                                            checked={selectedAddress?.toString() === address.id.toString()}
                                            onChange={(e) => setSelectedAddress(Number(e.target.value))}
                                        />
                                    {address.house_number}, {address.zip_code}, {address.street_address} 
                                    </label>
                                </li>
                            ))}
                            </ul>

                            { showAllUserAddresses && 
                                <Link className='py-2' to='/address/create' >Add new address</Link>
                            }

                            <button 
                                type='button' 
                                onClick={handleBuyBooks} 
                                className="mx-2 mt-4 bg-purple-500 text-white px-3 py-2 rounded-full font-bold hover:bg-purple-700" 
                                >
                                    Buy now
                            </button>
                        </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default Checkout