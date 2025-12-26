import { useEffect } from 'react';
import { CartInterface, RootState } from '../types';
import { setCartItems } from '../redux/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getCartItems } from '../utils/cartUtils';


const useSyncCart = () => {
    const dispatch = useDispatch();
    const userToken = useSelector((state: RootState) => state.userinfo.token);

    useEffect(() => {

        const handleStorageChange = (e: StorageEvent) => {
            if(e.key === 'cart' && e.newValue) {
                try {
                    const cartData: CartInterface = JSON.parse(e.newValue);
                    dispatch(setCartItems(cartData));
                } catch(err) {
                    console.error('Error syncing cart page', err);
                    if(userToken) {
                        getCartItems()
                            .then((response) => {
                                dispatch(setCartItems(response));
                            }).catch(() => {
                                localStorage.removeItem('cart');
                                dispatch(setCartItems({data: []}));
                            });
                    } else {
                        localStorage.removeItem('cart');
                        dispatch(setCartItems({data: []}));
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [dispatch, userToken]);
};

export default useSyncCart;