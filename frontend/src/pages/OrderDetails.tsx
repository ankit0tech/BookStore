import { useParams, useLocation, useNavigate } from "react-router-dom";
import { OrderInterface } from "../types";
import { useEffect, useState } from 'react';
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";

const OrderDetails = () => {
    
    const { id } = useParams();
    const { state } = useLocation();
    const [orderDetails, setOrderDetails] = useState<OrderInterface|null>(state?.orderDetails || null);
    const navigate = useNavigate();
    
    const formatDate = (date: Date) => {
        const d = new Date(date);
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(d);
    }
    
    const fetchOrderDetails = () => {
        api.get(`http://localhost:5555/orders/order-details/${id}`)
        .then((response)=> {
            setOrderDetails(response.data.data);
        })
        .catch((error) => {
            enqueueSnackbar('Error while fetching order details', {variant: 'error'});
            console.log(error);
        });
    }

    useEffect(()=> {
        fetchOrderDetails();
    }, [id]);


    const handleRequestCancelOrReturn = (requestName: string) => {
        if(requestName.toLowerCase() != 'cancel' && requestName.toLocaleLowerCase() != 'return') {
            return;
        }

        const endpointString = requestName === 'cancel' ? 'request-cancellation' : 'request-return';

        api.post(`http://localhost:5555/orders/${endpointString}/${id}`)
        .then((response)=> {
            console.log(`${requestName} done`);
            console.log(response);
            enqueueSnackbar(`Request to ${requestName} added`, {variant: 'success'});
            fetchOrderDetails();
        })
        .catch((error: any)=> {
            console.log(`${requestName} failed`);
            console.log(error);
            enqueueSnackbar(`Request to ${requestName} failed`, {variant: 'error'})
        });
    }



    return (
        <div className="p-4 max-w-4xl">
            {orderDetails ? (
                <div>
                    <div className="space-y-1 mb-4">
                        <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
                        <p className="text-gray-700 font-medium">
                            #{orderDetails.order_number}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-2 flex flex-col justify-between gap-6 min-w-64 mt-4">
                            <div className="text-gray-800 w-4/5 space-y-3">
                                <p className="mb-2 font-semibold text-gray-900">Order Status:</p>
                                <div className="space-y-2">
                                    <p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Placed: </span>
                                        <span className="font-medium">{formatDate(orderDetails.purchase_date)}</span>
                                    </p>
                                    <p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Order Status: </span>
                                        <span className="font-medium px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700">{orderDetails.order_status.toLocaleLowerCase()}</span>
                                    </p>
                                    <p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Payment: </span>
                                        <span className="font-medium px-2 py-1 rounded-md text-xs bg-green-50 text-green-700">{orderDetails.payment_status.toLocaleLowerCase()}</span>
                                    </p>
                                    {orderDetails.order_status.toLowerCase() != 'delivered' && (
                                        <>
                                            {orderDetails.shipping_carrier && (<p className="flex flex-row justify-between text-sm items-center">
                                                <span className="text-gray-700">Shipping Carrier: </span>
                                                <span className="font-medium">{orderDetails.shipping_carrier}</span>
                                            </p>)}
                                            {orderDetails.tracking_number &&(
                                            <p className="flex flex-row justify-between text-sm items-center">
                                                <span className="text-gray-700">Tracking Number: </span>
                                                <span className="font-medium">{orderDetails.tracking_number}</span>
                                            </p>)}
                                            {orderDetails.expected_delivery_date && (
                                            <p className="flex flex-row justify-between text-sm items-center">
                                                <span className="text-gray-700">Expected Delivery: </span>
                                                <span className="font-medium">{formatDate(orderDetails.expected_delivery_date)}</span>
                                            </p>)}
                                            
                                            {orderDetails.cancellation_status.toLowerCase() === 'none' ? (
                                            <form>
                                                <button 
                                                    className="text-sm font-medium text-red-600 bg-red-100 px-4 py-2 rounded-md boder border-red-300 hover:bg-red-200 tansition-colors duration-200"
                                                    type='button' 
                                                    onClick={() => handleRequestCancelOrReturn('cancel')}
                                                >
                                                    Request cancellation
                                                </button>
                                            </form>
                                            ) : (
                                                <p className="flex flex-row justify-between text-sm items-center">
                                                    <span className="text-gray-700">Cancellation Status:</span>
                                                    <span className="font-medium">{orderDetails.cancellation_status.toLowerCase()}</span>
                                                </p>
                                            )}
                                        </>
                                    )}

                                    {(orderDetails.order_status.toLowerCase() === 'delivered' && orderDetails.actual_delivery_date) && (
                                        <>
                                            <p className="flex flex-row justify-between text-sm items-center">
                                                <span className="text-gray-700">Delivery Date: </span>
                                                <span className="font-medium">{formatDate(orderDetails.actual_delivery_date)}</span>
                                            </p>

                                            {orderDetails.return_status.toLowerCase() === 'none' ? (
                                                <form>
                                                    <button 
                                                        className="text-sm font-medium text-red-600 bg-red-100 px-4 py-2 rounded-md boder border-red-300 hover:bg-red-200 tansition-colors duration-200"
                                                        type='button' 
                                                        onClick={() => handleRequestCancelOrReturn('return')}
                                                        >
                                                        Request return
                                                    </button>
                                                </form> 
                                            ) : (
                                                <p className="flex flex-row justify-between text-sm items-center">
                                                    <span className="text-gray-700">Return Status:</span>
                                                    <span className="font-medium">{orderDetails.return_status.toLowerCase()}</span>
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="font-medium text-xl pb-2 border-b border-gray-100">
                                    Items ({orderDetails.order_items.length})
                                </div>
                                <ul className="w-full space-y-6 mt-4">
                                    { orderDetails.order_items.map((item: any) => (
                                        // book details
                                        <li className="flex flex-row gap-6 pb-6 border-b border-gray-100 last:border-b-0" key={item.id}>
                                            <div className="flex flex-row gap-6">
                                                <img
                                                    className="w-32 h-44 object-scale-down rounded-md"
                                                    src={item.book.cover_image}
                                                    alt={item.book.title}
                                                />

                                                <div className="flex flex-col">
                                                    <p className="font-medium text-gray-900">{item.book.title}</p>
                                                    <p className="text-sm text-gray-700">{item.book.author}</p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm text-gray-700">Qty: {item.quantity}</p>
                                                        <p className="text-sm text-gray-700">Price: &#8377;{item.unit_price}</p>
                                                    </div>
                                                
                                                    <button 
                                                        onClick={() => navigate(`/dashboard/review/${item.book.id}`)}
                                                        className="w-max mt-4 px-4 py-2 text-sm text-blue-600 font-medium bg-blue-100 hover:bg-blue-200 transition-colors duration-200 rounded-md">
                                                        Write a review
                                                    </button>
                                                </div>

                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 max-w-64 mt-4">
                            <div>
                                <p className="font-semibold text-gray-900 mb-3">Delivery address:</p>
                                <div className="text-sm text-gray-700 space-y-1">
                                    <p> {orderDetails.address.house_number} </p>
                                    <p> {orderDetails.address.street_address}, {orderDetails.address.city} </p>
                                    <p> {orderDetails.address.state}, {orderDetails.address.zip_code} </p>
                                    <p> {orderDetails.address.country} </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-2 w-full">
                                <p className="font-semibold text-gray-900 mb-2">Price Summary:</p>
                                <p className="flex flex-row justify-between w-full text-gray-700 text-sm">
                                    <span>Subtotal: </span>
                                    <span className="font-medium">&#8377;{orderDetails.subtotal.toFixed(2)}</span>
                                </p>
                                <p className="flex flex-row justify-between w-full text-gray-700 text-sm">
                                    <span>Delivery charges:</span>
                                    <span className="font-medium">&#8377;{(orderDetails.delivery_charges || 0).toFixed(2)}</span>
                                </p>
                                <p className="flex flex-row justify-between w-full text-gray-900 font-semibold border-t border-gray-100 pt-2 mt-2">
                                    <span>Total cost:</span>&#8377;{(orderDetails.subtotal + (orderDetails.delivery_charges || 0)).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                )
            :
                <div>
                    <p>No orders found</p>
                </div>
            }
        </div>
    );
}

export default OrderDetails;