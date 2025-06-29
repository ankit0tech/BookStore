import { useState, useEffect } from "react";
import { OrdersInterface } from "../../types";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import api from "../../utils/api";

const initailState: OrdersInterface = {
    data: []
};

const OrderManagement = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [orders, setOrders] = useState<OrdersInterface>(initailState);
    const navigate = useNavigate();

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(d);
    }


    useEffect(() => {
        setLoading(true);

        api
        .get('http://localhost:5555/order-management')
        .then((response) => {
            setOrders(response.data);
            // console.log(response.data);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
            setLoading(false);
        });

    }, []);

    return (
        <div className="min-h-screen max-w-4xl px-2 md:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="mt-2 text-sm text-gray-600">View and manage orders here</p>
            </div>

            { loading ? (
                <div className="flex justify-center items-center h-32">
                    <Spinner />
                </div>
            ) : (
            <div className="space-y-6">
                {orders.data.length === 0 ? (
                    <div>
                        No orders available
                    </div>
                ) : ( 
                    <div className="space-y-6">
                        <ul className="list-none p-0 m-0 bg-white divide-y divide-gray-100 min-w-max">
                            {orders.data.map((item) =>(
                                <li className="flex flex-col gap-4 py-8 justify-between" key={item.id}>
                                    <div className="space-y-1">
                                        <div className="flex flex-row justify-between">
                                            <p className="mr-2 text-gray-900 text-lg font-semibold">Order #{item.order_number}</p>
                                            <p className="ml-2 flex flex-row items-center justify-between text-sm">
                                                <span className="text-gray-700">Order status: </span>
                                                <span className="text-blue-700 font-medium text-xs mx-2 py-1 px-2 bg-blue-50 rounded-lg">{item.order_status.toLocaleLowerCase()}</span>
                                            </p>
                                        </div>
                                        <div className="flex flex-row justify-between">
                                            <p className="text-gray-600 text-sm">Placed on: {formatDate(item.purchase_date)}</p>
                                            <p className="flex flex-row items-center justify-between text-sm">
                                                <span className="text-gray-700">Payment status:</span>
                                                <span className="text-green-700 font-medium text-xs mx-2 py-1 px-2 bg-green-50 rounded-lg">{item.payment_status.toLocaleLowerCase()}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-between max-w-3xl">
                                        <div>
                                            <p className="text-sm text-gray-600">Items</p>
                                            <p className="text-lg font-semibold text-gray-900">{item.order_items.length}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">SubTotal</p>
                                            <p className="text-lg font-semibold text-gray-900">&#8377;{item.subtotal.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Total</p>
                                            <p className="text-lg font-semibold text-gray-900">&#8377;{item.total_amount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="">
                                        <button 
                                            className="px-6 py-2 rounded-md font-medium text-blue-600 text-sm bg-blue-50 hover:pointer hover:bg-blue-100"
                                            onClick={() => navigate(`/dashboard/manage-order/${item.id}`, { 
                                                state: { orderDetails: item }
                                            })}
                                            >
                                            Manage
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}
        </div>
    );
}

export default OrderManagement;