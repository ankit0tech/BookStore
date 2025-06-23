import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import api from "../utils/api";
import { OrdersInterface } from "../types";
import { useNavigate } from "react-router-dom";


const initialState: OrdersInterface = {
    data: []
}

const Orders = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [orders, setOrders] = useState<OrdersInterface>(initialState);
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
        .get('http://localhost:5555/orders/get-purchased-items')
        .then((response) => {
            setOrders(response.data);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
            setLoading(false);
        })
    }, []);

    return (
        <div className="min-h-screen max-w-5xl px-2 md:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                <p className="mt-2 text-sm text-gray-600">View and manage your past orders</p>
            </div>
            
            { loading ? (
                <div className="flex justify-center items-center h-32">
                    <Spinner />
                </div>
            )
            : 
            <div className="space-y-6">
                {orders.data.length === 0 ? (
                    <div className="text-center py-12 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
                        <p className="mt-2 text-sm text-gray-500">You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <ul className="list-none p-0 m-0 bg-white divide-y divide-gray-100 roundd-lg shaow-sm min-w-max">
                            {orders.data.map((item) => (
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
                                            onClick={() => navigate(`/dashboard/order/${item.id}`, { 
                                                state: { orderDetails: item }
                                            })}
                                            >
                                            View Details
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div> }
        </div>
    );
}

export default Orders;