import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import api from "../utils/api";
import { OrdersInterface } from "../types";
import { useNavigate } from "react-router-dom";
import { formatPrice, prettifyString } from "../utils/formatUtils";
import { FiPackage } from "react-icons/fi";
import { CiCalendar } from "react-icons/ci";
import { IoIosArrowForward } from "react-icons/io";


const initialState: OrdersInterface = {
    data: []
}

const Orders = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [orders, setOrders] = useState<OrdersInterface>(initialState);
    const navigate = useNavigate();

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return new Intl.DateTimeFormat('en-US', {
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
                    <div className="text-center py-12 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
                        <p className="mt-2 text-sm text-gray-500">You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <ul className="list-none p-0 m-0 bg-white min-w-max space-y-6">
                            {orders.data.map((item) => (
                                <li className="flex flex-col gap-4 justify-between border rounded-lg hover:shadow-md transition-shadow duration-200" key={item.id}>
                                    <div className="flex justify-between bg-black/1 p-4 border-b rounded-t-lg">

                                        <div className="flex flex-col justify-between gap-2">
                                            <div className="flex items-center gap-2"> 
                                                <div className="text-xl text-blue-600"> <FiPackage></FiPackage> </div>
                                                <p className="text-gray-900 text-lg font-medium">#{item.order_number}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-lg"><CiCalendar/></div>
                                                <p className="text-gray-600 text-sm">Placed on: {formatDate(item.purchase_date)}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex flex-col _items-start gap-1 text-xs">
                                                <p className="text-gray-600">Order status</p>
                                                <p className={`font-medium border text-xs py-1 px-2 ${item.order_status.toLowerCase() === 'delivered' ? "text-green-700 bg-green-50" : "text-blue-700 bg-blue-50"} _shadow-inner rounded-full`}>{prettifyString(item.order_status.toLowerCase())}</p>
                                            </div>
                                            <div className="flex flex-col gap-1 text-xs">
                                                <p className="text-gray-600">Payment status</p>
                                                <p className={`font-medium border text-xs py-1 px-2 ${item.payment_status.toLowerCase() === 'completed' ? "text-green-700 bg-green-50" : "text-blue-600 bg-blue-50"} _shadow-inner rounded-full`}>{prettifyString(item.payment_status.toLowerCase())}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between p-4 gap-6">

                                        <div className="flex-1">
                                            <div className="text-gray-500 text-sm font-semibold mb-2 tacking-wider uppercase">Items</div>
                                            <div className="space-y-2">
                                                {item.order_items.map((order_item) => (
                                                    <div className="flex justify-between bg-gray-50 hover:bg-gray-100 rounded-md px-4 py-2">
                                                        <div className="font-medium text-gray-800">{order_item.book.title}</div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-sm text-gray-600">Qty:</span>
                                                            <span className="text-sm text-gray-600">{order_item.quantity}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="py-2 flex flex-col gap-4">
                                                <div className="flex flex-col items-start">
                                                    <p className="text-sm text-gray-600">Total:</p>
                                                    <p className="text-xl font-semibold text-gray-900">{formatPrice(item.total_amount, item.currency)}</p>
                                                </div>
                                                
                                                <button 
                                                    className="relative px-6 py-2 rounded-md bg-blue-600 group hover:pointer hover:bg-blue-500"
                                                    onClick={() => navigate(`/dashboard/order/${item.id}`, { 
                                                        state: { orderDetails: item }
                                                    })}
                                                    >
                                                    <p className="font-medium text-white text-md mr-4">View Details</p>
                                                    <div className="absolute font-bold text-white top-3 right-4 group-hover:right-2.5 transition-all duration-300 ease-in-out"><IoIosArrowForward/></div>
                                                </button>
                                            </div>
                                        </div>
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