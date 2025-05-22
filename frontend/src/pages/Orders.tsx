import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import api from "../utils/api";
import { PurchaseInterface } from "../types";
import { useNavigate } from "react-router-dom";


const initialState: PurchaseInterface = {
    data: []
}

const Orders = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [orders, setOrders] = useState<PurchaseInterface>(initialState);
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
        .get('http://localhost:5555/cart/get-purchased-items')
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
        <div className="min-h-screen">
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
                        <ul className="list-none p-0 m-0 bg-white divide-y divide-gray-100 rounded-lg shadow-sm">
                            {orders.data.map((item)=> (
                                <li className="flex p-4 justify-between borer-b last:rder-b-0" key={item.id}>
                                    <img
                                        className="w-32 h-44 object-scale-down" 
                                        src={item.book.cover_image} 
                                        alt={item.book.title}
                                    />

                                    <div className="flx flx-col ml-4 space-y-1">
                                        <p className="font-semibold text-xl text-gray-900">
                                            {item.book.title}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            Order placed: {formatDate(item.purchase_date)}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            Shipped To: {item.address.street_address}, {item.address.city}
                                        </p>
                                        <div className="flex gap-4 mt-4 text-sm text-gray-900">
                                            <span className="">Quantity: {item.quantity}</span>
                                            <span className="">Price Per item: &#8377;{item.purchase_price}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col broder-2 ml-auto">
                                        <p className="ml-auto text-sm text-gray-700"> Total amount </p>
                                        <p className="ml-auto text-2xl font-semibold"> &#8377;{item.purchase_price * item.quantity} </p>
                                        
                                        <button 
                                            onClick={() => navigate(`/dashboard/review/${item.book.id}`)}
                                            className="mt-auto px-4 py-2 text-blue-600 text font-medum bg-blue-50 hover:bg-blue-100 transition-colors duration-200 rounded-md">
                                            Write a review
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