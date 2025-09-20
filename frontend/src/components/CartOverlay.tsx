import React from "react";
import { useNavigate } from "react-router-dom";
import { CartInterface, RootState } from "../types/index";
import { useSelector } from "react-redux";
import { BiMinus, BiPlus } from "react-icons/bi";
import { useHandleCartUpdate } from "../utils/cartUtils";
import { MdOutlineDelete } from "react-icons/md";
import { FiShoppingBag } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";


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
        navigate('/dashboard/checkout');
    }

    const findSubTotal = (cartItems: CartInterface) => {
        const subTotal = cartItems.data.reduce((accumulator, current) => {
            const { book, quantity, special_offer } = current;
            const discount = special_offer?.discount_percentage || 0;
            const discountedPrice = book.price * (100 - discount) / 100;
            return accumulator + (quantity * discountedPrice);
        }, 0);
        return subTotal;
    }

    
    return (
        <>
        {isOpen ? (
            <div 
                className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs z-50 font-normal text-gray-800"
                onClick={handleOverlayClick}
            >
               <div className="bg-white p-6 rounded-xl border shadow-xl">
                    <div className="flex flex-row justify-between items-center mb-4">
                        <FiShoppingBag className="text-xl text-blue-500"/>
                        <h2 className="mr-auto mx-2 text-xl font-semibold text-gray-800">Your Cart</h2>
                        <button
                            className="font-semibold"
                            onClick={() => onClose()}
                        >
                            <RxCross2 className="text-gray-500 hover:text-gray-700 transition-colors"/>
                        </button>
                    </div>
                    
                    <div className="py-4">
                        {!cartItems?.data.length ? 
                        (
                            <div className="text-center py-8">
                                <FiShoppingBag className="text-gray-300 text-5xl mx-auto mb-3" />
                                <p className="text-gray-500">Your cart is empty</p>
                            </div>
                        )
                        :
                        (
                            <ul className="space-y-4">
                                {cartItems.data.map((item) => (
                                    <li key={item.id}>
                                        <div className="flex justify-between items-center gap-x-4 font-medium text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            <div className="flex flex-col gap-2">
                                                { item.book.title } 
                                                { item.special_offer && <div className="text-red-500 text-sm"> {item.special_offer.discount_percentage}% OFF</div> }
                                            </div>
                                            <div className="flex flex-row items-center bg-white gap-2 border border-gray-200 rounded-full px-3 py-1 hover:shadow-xs">
                                                {item.quantity == 1 ?
                                                    <MdOutlineDelete
                                                        className="text-lg text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                                                        onClick={() => {handleCartUpdate(item.book.id, -1, item.special_offer ? item.special_offer.id : null)}}
                                                    />
                                                :
                                                    <BiMinus 
                                                    className="text-xl hover:text-gray-800 cursor-pointer transition-colors"
                                                    onClick={() => {handleCartUpdate(item.book.id, -1, item.special_offer ? item.special_offer.id : null)}} 
                                                    />
                                                }
                                                <div className="w-6 text-center font-medium">{ item.quantity }</div>
                                                <BiPlus 
                                                    className="text-xl hover:text-gray-800 cursor-pointer transition-colors"
                                                    onClick={() => {handleCartUpdate(item.book.id, 1, item.special_offer ? item.special_offer.id : null)}} 
                                                />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex flex-row justify-between align-center py-4 text-lg font-semibold border-t">
                        <span>Subtotal:</span>
                        <span className="text-blue-700">&#8377;{findSubTotal(cartItems).toFixed(2)}</span>
                    </div>

                    <div className="flex flex-row gap-4 mt-6 justify-end">
                        <button 
                            type='button' 
                            onClick={onClose} 
                            className="bg-white text-gray-700 bg-gray-50 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            Continue Shopping
                        </button>
                        <button 
                            type='button' 
                            onClick={goToCheckout} 
                            disabled={!cartItems.data.length}
                            className={`px-6 py-2.5 border border-gray-300 rounded-lg transition-all duration-200 ${
                                cartItems?.data.length
                                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-xs hover:shadow-md'
                                : 'bg-gray-30 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        ): null }
        </>
    );
}

export default CartOverlay;