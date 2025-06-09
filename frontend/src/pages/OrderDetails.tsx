import { useParams, useLocation } from "react-router-dom";
import { OrderInterface } from "../types";
import { useState } from 'react';

const OrderDetails = () => {
    
    const { id } = useParams();
    const { state } = useLocation();

    const [orderDetails, setOrderDetails] = useState<OrderInterface|null>(state.orderDetails);
    // setOrderDetails(state.orderDetails);

    // console.log(id);
    console.log(state);

    return (
        <div className="p-4">
            {orderDetails ? (
                <div className="flex flex-col gap-2">
                    <div className="">
                        <p className="text-gray-600 text-sm">
                            Order no: {orderDetails.order_number}
                        </p>
                        <div>
                            <p>
                                {orderDetails.address.house_number}
                            </p>
                            <p>
                                {orderDetails.address.street_address}, {orderDetails.address.city}
                            </p>
                            <p>
                                {orderDetails.address.state}, {orderDetails.address.zip_code}
                            </p>
                            <p>
                                {orderDetails.address.country}
                            </p>

                        </div>

                    </div>
                    <ul className="">
                        { orderDetails.order_items.map((item: any) => (
                            // book details
                            <ul className="" key={item.id}>
                                <img
                                    className="w-32 h-44 object-scale-down"
                                    src={item.book.cover_image}
                                    alt={item.book.title}
                                />
                            </ul>
                        ))
                        }
                    </ul>
                </div>)
            :
                <div>
                    <p>No orders found</p>
                </div>
            }
        </div>
    );
}

export default OrderDetails;