import React from "react";
import { useNavigate } from "react-router-dom";
import { CartInterface, RootState } from "../types/index";
import { useSelector } from "react-redux";
import { BiMinus, BiPlus } from "react-icons/bi";
import { useHandleCartUpdate } from "../utils/cartUtils";
import { MdOutlineDelete } from "react-icons/md";
import { FiShoppingBag } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { formatPrice } from "../utils/formatUtils";


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
                className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs z-50 font-normal text-gray-800 overflow-y-auto"
                onClick={handleOverlayClick}
            >
               <div className="bg-white p-6 rounded-lg border shadow-xl">
                    <div className="flex flex-row justify-between items-center mb-4">
                        <FiShoppingBag className="text-xl text-gray-700"/>
                        <h2 className="mr-auto mx-2 text-xl font-semibold text-gray-800">Your Cart</h2>
                        <button
                            className=""
                            onClick={() => onClose()}
                        >
                            <RxCross2 className="text-lg text-amber-600 hover:text-amber-700 hover:scale-105 transition-colors duration-200"/>
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
                                            <div className="flex flex-col">
                                                { item.book.title } 
                                                { item.special_offer && <div className="text-amber-600 text-xs"> {item.special_offer.discount_percentage}% OFF</div> }
                                            </div>
                                            <div className="flex flex-row items-center bg-white gap-2 border border-gray-200 rounded-full px-3 py-1 hover:shadow-xs _hover:shadow-sm">
                                                {item.quantity == 1 ?
                                                    <MdOutlineDelete
                                                        className="text-lg text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                                                        onClick={() => {handleCartUpdate(item.book.id, -1, item.special_offer ? item.special_offer.id : null)}}
                                                    />
                                                :
                                                    <BiMinus 
                                                    className="text-xl text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                                                    onClick={() => {handleCartUpdate(item.book.id, -1, item.special_offer ? item.special_offer.id : null)}} 
                                                    />
                                                }
                                                <div className="w-6 text-center font-medium">{ item.quantity }</div>
                                                <BiPlus 
                                                    className="text-xl text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                                                    onClick={() => {handleCartUpdate(item.book.id, 1, item.special_offer ? item.special_offer.id : null)}} 
                                                />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex flex-row justify-between align-center py-4 text-lg text-gray-800 font-medium border-t">
                        <span>Subtotal:</span>
                        { !cartItems?.data.length ? 
                            (<span className="text-gray-700">0</span>)
                        :
                            (<span className="text-gray-700">{formatPrice(findSubTotal(cartItems), cartItems.data[0].book.currency)}</span>)
                        }
                    </div>

                    <div className="flex flex-row gap-4 mt-6 justify-end">
                        <button 
                            type='button' 
                            onClick={onClose} 
                            className="py-2 px-4 font-medium text-gray-800 hover:text-gray-900 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        >
                            Continue shopping
                        </button>
                        
                        <button 
                            type='button' 
                            onClick={goToCheckout} 
                            disabled={!cartItems.data.length}
                            className={`py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out ${!cartItems.data.length && 'cursor-not-allowed'}`}
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