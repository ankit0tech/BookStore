import React from "react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../types/index";
import { useSelector } from "react-redux";
import { BiMinus, BiPlus } from "react-icons/bi";
import { useHandleCartUpdate } from "../utils/cartUtils";


interface CartOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartOverlay: React.FC<CartOverlayProps> = ({ isOpen, onClose }) => {

    const navigate = useNavigate();
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    const { handleCartUpdate } = useHandleCartUpdate();

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
    const goToCheckout = () => {
        onClose();
        navigate('/checkout');
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
                                                { item.quantity } • { item.book.title } <div className="text-red-500"> {item.special_offers && `${item.special_offers.discount_percentage} %` } </div>
                                                <BiMinus onClick={() => {handleCartUpdate(item.book.id, -1, item.special_offers ? item.special_offers.id : null)}} />
                                                <BiPlus onClick={() => {handleCartUpdate(item.book.id, 1, item.special_offers ? item.special_offers.id : null)}} />
                                            </div>
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