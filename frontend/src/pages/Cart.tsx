import { useEffect, useState } from "react";
import { getCartItems } from "../utils/cartUtils";
import { useSelector } from "react-redux";
import { RootState } from "../types";
import { useNavigate } from "react-router-dom";
import { CartInterface } from "../types";
import BackButton from '../components/BackButton'
import Spinner from "../components/Spinner";


const Cart = () => {
    const [cartItems, setCartItems] = useState<CartInterface>();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const userinfo = useSelector((state: RootState) => state.userinfo);
    
    useEffect(() => {
        setLoading(true);
        const authToken = userinfo.token;
        const fetchCartItems = async () => {

            if (!authToken) {
                navigate('/login');
            }
            else {
                const items = await getCartItems(authToken);
                // console.log("Items: ", items);
                setCartItems(items);
                console.log('now will set loading = false');
                setLoading(false);
                // console.log("state: ", cartItems);
            }

            // navigate('/cart');
        }

        fetchCartItems();

    }, [])

    return(
        <div className="p-4">
           <BackButton />

            {loading ? (
                    <Spinner />
                ) : (
                    !cartItems ? (
                        "Cart is Empty"
                    ) : (
                        <div>
                            <h2>Cart Items</h2>
                            <ul>
                                {cartItems.data.map((item) => (
                                    <li key={item._id}>
                                        <div>Book: { item.bookTitle } Quantity: { item.quantity }</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                )
            }

           {/* <h1 className="text-3xl my-4">Cart</h1> */}
        </div>
    );
}

export default Cart;