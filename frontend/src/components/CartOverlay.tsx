import React from "react";
// import { CartInterface } from "../types";
import { useNavigate } from "react-router-dom";
import { RootState } from "../types/index";
import { useSelector } from "react-redux";
import { FcMinus, FcPlus } from "react-icons/fc";
import { BiMinus, BiPlus } from "react-icons/bi";
import { getCartItems, updateCart } from "../utils/cartUtils";
import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";
import { useDispatch } from "react-redux";


interface CartOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    // cartItems: null|CartInterface;
}

const CartOverlay: React.FC<CartOverlayProps> = ({ isOpen, onClose }) => {

    const navigate = useNavigate();
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    const userData = useSelector((state: RootState) => state.userinfo);
    const authToken = userData.token;
    const dispatch = useDispatch();

    // console.log(cartItems);
    // console.log(typeof cartItems);
    // cartItems.map((items) => {
    //     console.log(items)
    // })

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
    const goToCheckout = () => {
        onClose();
        navigate('/checkout');
    }

    const handleUpdateCart = async (bookId: string, count: number) => {
        if (!authToken) {
            navigate('/login');
        }
        else {
            await updateCart(bookId, count, authToken);
            const items = await getCartItems(authToken);
            dispatch(setCartItemsSlice(items))
        }
    }

    return (
        <>
        {isOpen ? (
            <div 
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-black font-normal"
                onClick={handleOverlayClick}
            >
               <div className="bg-white p-6 rounded-[18px] border border-b-2 border-black">
                    <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
                    {/* <div className="">List of cart items</div> */}
                    
                    {/* Cart Overlay
                    <button type='button' onClick={onClose}>close</button> */}
                    <div className="">
                        {!cartItems? 
                        ("Cart it empty")
                        :
                        (
                            <div>
                                <ul>
                                    {cartItems.data.map((item) => (
                                        <li key={item.id}>
                                            <div className="flex justify-start items-center gap-x-4">
                                                { item.quantity } • { item.book_title }
                                                <BiMinus onClick={() => {handleUpdateCart(item.book_id, -1)}} />
                                                <BiPlus onClick={() => {handleUpdateCart(item.book_id, 1)}} />
                                            </div>
                                            {/* <FcPlus onClick={() => {handleAddToCart(book.id)}} /> */}
                                            {/* <h3 className="text-lg ">{item.bookTitle}</h3>
                                            <span className="ml-2 text-gray-500"> {item.quantity}</span>  */}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <button type='button' onClick={goToCheckout}  className="mx-2 mt-4 bg-purple-500 text-white px-3 py-2 rounded-full font-bold hover:bg-purple-700">Checkout</button>
                    <button type='button' onClick={onClose} className="mx-2 mt-4 bg-purple-500 text-white px-3 py-2 rounded-full font-bold hover:bg-purple-700">Close</button>

                </div>
            </div>
        ): null }
        </>
    );
}

export default CartOverlay;