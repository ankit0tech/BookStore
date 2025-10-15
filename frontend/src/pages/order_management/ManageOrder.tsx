import { useParams, useLocation, useNavigate } from "react-router-dom";
import { OrderInterface } from "../../types";
import { useEffect, useState } from 'react';
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";
import { prettifyString } from "../../utils/formatUtils";

const ManageOrder = () => {
    
    const { id } = useParams();
    const { state } = useLocation();
    const [orderDetails, setOrderDetails] = useState<OrderInterface|null>(state?.orderDetails || null);
    // const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [deliveryStatus, setDeliveryStatus] = useState<string>(orderDetails?.order_status.toLowerCase() || '');
    const [paymentStatus, setPaymentStatus] = useState<string>(orderDetails?.payment_status.toLowerCase() || '');
    const [cancellationStatus, setCancellationStatus] = useState<string>(orderDetails?.cancellation_status.toLowerCase() || '');
    const [returnStatus, setReturnStatus] = useState<string>(orderDetails?.return_status.toLowerCase() || '');

    const paymentOptions = ['pending', 'completed', 'failed', 'refunded'];
    const deliveryOptions = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
    const cancellationOptions = ['requested', 'approved', 'rejected'];
    const returnOptions = ['requested', 'approved', 'rejected'];
    // const [shippingCarrier, setShippingCarrier] = useState<string>('');
    // const [trackingNumber, setTrackingNumber] = useState<string>('');
    // const navigate = useNavigate();

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

    useEffect(() => {
        if(orderDetails) {
            setDeliveryStatus(orderDetails.order_status.toLowerCase() || '');
            setCancellationStatus(orderDetails.cancellation_status.toLowerCase() || '');
            setPaymentStatus(orderDetails.payment_status.toLowerCase() || '');
            setReturnStatus(orderDetails.return_status.toLowerCase() || '');
        }
    }, [orderDetails]);


    // const validateForm = ():boolean => {
    //     const newErrors: Record<string, string> = {};
    //     if(!deliveryStatus.trim()) {
    //         newErrors.deliveryStatus = 'Delivery status is required'
    //     } 

    //     if(!paymentStatus.trim()) {
    //         newErrors.paymentStatus = 'Payment status is required'
    //     }

    //     setFormErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // }

    // const handleFormSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();

    //     // if(!validateForm()) {
    //     //     return;
    //     // }

    //     console.log('form submitted');
    // }


    const handleOrderUpdate = (optionName: string, optionValue: string) => {

        const data = {
            optionName: optionName,
            optionValue: optionValue
        }
        
        api.post(`http://localhost:5555/order-management/update/${id}`, data)
        .then((response)=> {
            fetchOrderDetails();
            enqueueSnackbar('Order updated successfully', {variant: 'success'});
        })
        .catch((error: any)=> {
            console.log(error);
            enqueueSnackbar('Order updated failed', {variant: 'error'});
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="col-span-2 flex flex-col justify-between gap-8 min-w-64 mt-4">
                            <div className="text-gray-800 sm:w-4/5 space-y-3 transition-all duration-200">
                                <p className="mb-2 font-semibold text-gray-900">Order Status:</p>
                                <div className="space-y-2">
                                    <p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Placed By: </span>
                                        <span className="font-medium">{orderDetails.user?.email}</span>
                                    </p> 
                                    <p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Placed: </span>
                                        <span className="font-medium">{formatDate(orderDetails.purchase_date)}</span>
                                    </p>
                                    <p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Order Status: </span>
                                        <span className="font-medium px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700">{prettifyString(orderDetails.order_status.toLowerCase())}</span>
                                    </p>
                                    <p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Payment: </span>
                                        <span className="font-medium px-2 py-1 rounded-md text-xs bg-green-50 text-green-700">{prettifyString(orderDetails.payment_status.toLowerCase())}</span>
                                    </p>
                                    {orderDetails.shipping_carrier && (<p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Shipping Carrier: </span>
                                        <span className="font-medium">{orderDetails.shipping_carrier}</span>
                                    </p>)}
                                    {orderDetails.tracking_number &&(
                                        <p className="flex flex-row justify-between text-sm items-center">
                                        <span className="text-gray-700">Tracking Number: </span>
                                        <span className="font-medium">{orderDetails.tracking_number}</span>
                                    </p>)}

                                    {orderDetails.order_status.toLowerCase() === 'pending' && orderDetails.expected_delivery_date && (
                                        <p className="flex flex-row justify-between text-sm items-center">
                                            <span className="text-gray-700">Expected Delivery: </span>
                                            <span className="font-medium">{formatDate(orderDetails.expected_delivery_date)}</span>
                                        </p>)
                                    }

                                    {(orderDetails.order_status.toLowerCase() === 'delivered' && orderDetails.actual_delivery_date) && (
                                        <p className="flex flex-row justify-between text-sm items-center">
                                            <span className="text-gray-700">Delivery Date: </span>
                                            <span className="font-medium">{formatDate(orderDetails.actual_delivery_date)}</span>
                                        </p>
                                    )}

                                    {(orderDetails.cancellation_status.toLowerCase() != 'none') && (
                                        <p className="flex flex-row justify-between text-sm items-center">
                                            <span className="text-gray-700">Cancellation Status: </span>
                                            <span className="font-medium">{orderDetails.cancellation_status.toLowerCase()}</span>
                                        </p>
                                    )}
                                    
                                    {(orderDetails.return_status.toLowerCase() != 'none') && (
                                        <p className="flex flex-row justify-between text-sm items-center">
                                            <span className="text-gray-700">Return Status: </span>
                                            <span className="font-medium">{orderDetails.return_status.toLowerCase()}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <form className="flex flex-col sm:w-4/5 gap-8">
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label 
                                            className="text-sm font-semibold text-gray-700" 
                                            htmlFor='delivery-status'
                                            >
                                                Delivery status:
                                        </label>
                                        <select
                                            className="text-sm px-2 py-2 rounded-lg text-gray-900 border border-gray-300 focus:outline-hidden focus:border-blue-400"
                                            value={deliveryStatus || ''}
                                            id='order-status'
                                            onChange={(e) => setDeliveryStatus(e.target.value)}
                                            >
                                            {deliveryOptions.map((item, index) => (
                                                <option key={index} value={item}>{prettifyString(item)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button 
                                        className="w-max px-3 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                                        type='button' 
                                        onClick={() => handleOrderUpdate('delivery', deliveryStatus)}
                                    >
                                        Save delivery status
                                    </button>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label 
                                            className="text-sm font-semibold text-gray-700" 
                                            htmlFor='payment-status'
                                        >
                                                payment status:
                                        </label>
                                        <select
                                            className="text-sm px-2 py-2 rounded-lg text-gray-900 border border-gray-300 focus:outline-hidden focus:border-blue-400"
                                            value={paymentStatus || ''}
                                            onChange={(e) => setPaymentStatus(e.target.value)}
                                            id='payment-status'
                                        >
                                            {paymentOptions.map((item, index) => (
                                                <option key={index} value={item}>{prettifyString(item)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button 
                                        className="w-max px-3 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                                        type='button' 
                                        onClick={() => handleOrderUpdate('payment', paymentStatus)}
                                    >
                                        Save payment status
                                    </button>
                                </div>

                                {(orderDetails.cancellation_status.toLowerCase() != 'none') && (
                                   <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-1">
                                            <label 
                                                className="text-sm font-semibold text-gray-700" 
                                                htmlFor='cancellation-status'
                                            >
                                                    Cancellation status:
                                            </label>
                                            <select
                                                className="text-sm px-2 py-2 rounded-lg text-gray-900 border border-gray-300 focus:outline-hidden focus:border-blue-400"
                                                value={cancellationStatus || ''}
                                                onChange={(e) => setCancellationStatus(e.target.value)}
                                                id='cancellation-status'
                                            >
                                                {cancellationOptions.map((item, index) => (
                                                    <option key={index} value={item}>{prettifyString(item)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            className="w-max px-3 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200" 
                                            type='button' 
                                            onClick={ () => handleOrderUpdate('cancellation', cancellationStatus) }
                                        >
                                            Save cancellation status
                                        </button>
                                    </div> 
                                )}

                                {(orderDetails.return_status.toLowerCase() != 'none') && (
                                   <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-1">
                                            <label 
                                                className="text-sm font-semibold text-gray-700" 
                                                htmlFor='return-status'
                                            >
                                                    Return status:
                                            </label>
                                            <select
                                                className="text-sm px-2 py-2 rounded-lg text-gray-900 border border-gray-300 focus:outline-hidden focus:border-blue-400"
                                                value={returnStatus || ''}
                                                onChange={(e) => setReturnStatus(e.target.value)}
                                                id='return-status'
                                            >
                                                {returnOptions.map((item, index) => (
                                                    <option key={index} value={item}>{prettifyString(item)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button 
                                            className="w-max px-3 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                                            type='button' 
                                            onClick={ () => handleOrderUpdate('return', returnStatus) }
                                        >
                                            Save return status
                                        </button>
                                    </div> 
                                )}

                                {/* <div>
                                    <label className="text-sm font-semibold text-gray-700" htmlFor="payment-status">Payment status:</label>
                                    <input id="payment-status" type="text"></input>
                                </div> */}

                                {/* <button 
                                    className=""
                                    type="submit"
                                >Submit</button> */}
                            </form>

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
                                                    src={item.book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'}
                                                    alt={item.book.title}
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                                                    }}
                                                />

                                                <div className="flex flex-col">
                                                    <p className="font-medium text-gray-900">{item.book.title}</p>
                                                    <p className="text-sm text-gray-700">{item.book.author}</p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm text-gray-700">Qty: {item.quantity}</p>
                                                        <p className="text-sm text-gray-700">Price: &#8377;{item.unit_price}</p>
                                                    </div>
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

export default ManageOrder;