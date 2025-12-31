import { useState, useEffect, useRef } from "react";
import { OrdersInterface, order_statuses, payment_statuses, OrderStatus, PaymentStatus, OrderInterface } from "../../types";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import api from "../../utils/api";
import { formatDate, formatPrice, prettifyString } from "../../utils/formatUtils";
import { BiSearch } from "react-icons/bi";
import { CiCalendar } from "react-icons/ci";
import { FiPackage } from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import { enqueueSnackbar } from "notistack";
import { AxiosResponse } from "axios";


const OrderManagement = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [nextCursor, setNextCursor] = useState<number|null>(null);
    const [orders, setOrders] = useState<OrderInterface[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchOrderStatus, setSearchOrderStatus] = useState<OrderStatus|''>('');
    const [searchPaymentStatus, setSearchPaymentStatus] = useState<PaymentStatus|''>('');
    const [dateOrder, setDateOrder] = useState<'desc'|'asc'>('desc');

    const observeRef = useRef(null);
    const navigate = useNavigate();

    const loadOrders = (prevOrders: OrderInterface[], nextCursor: number|null) => {
        setLoading(true);

        const params = new URLSearchParams();

        if(searchQuery) params.append('query', searchQuery);
        if(searchOrderStatus) params.append('orderStatus', searchOrderStatus);
        if(searchPaymentStatus) params.append('paymentStatus', searchPaymentStatus);
        params.append('dateOrder', dateOrder);
        if(nextCursor) params.append('nextCursor', String(nextCursor));
                
        api
        .get(`/order-management?${params.toString()}`)
        .then((response: AxiosResponse) => {
            
            setOrders(() => {
                const prevOrderIds = new Set(prevOrders.map((order) => order.id));
                const newOrders = response.data.data.filter((order:OrderInterface) => !prevOrderIds.has(order.id));
                return [...prevOrders, ...newOrders];
            });
            // setOrders(response.data.data);       // update this in the backend also
            setNextCursor(response.data.nextCursor);
            // console.log(response.data);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
            setLoading(false);
            enqueueSnackbar('Error occurred while loading orders', {variant: 'error'});
        });
    }

    useEffect(() => {
        setLoading(true);
        loadOrders([], null);
    }, [searchOrderStatus, searchPaymentStatus, dateOrder]);

    useEffect(() => {
        if(!nextCursor || !observeRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
                if(entries[0].isIntersecting) {
                    loadOrders(orders, nextCursor);
                }
            },
            { threshold: 1}
        );

        if(observeRef.current) observer.observe(observeRef.current);

        return () => {
            if(observeRef.current) observer.unobserve(observeRef.current);
            observer.disconnect();
        }
    }, [orders.length, nextCursor]);

    return (
        <div className="min-h-screen max-w-5xl px-2 md:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900">Order Management</h1>
                <p className="mt-2 text-sm text-gray-600">View and manage orders here</p>
            </div>

            { loading ? (
                <div className="flex justify-center items-center h-32">
                    <Spinner />
                </div>
            ) : (
            <div className="space-y-6">
                <form 
                    className="flex items-center gap-2"
                    onSubmit={(e) => {e.preventDefault(); loadOrders([], null);}}
                >
                    <div className="relative flex items-center w-full">
                        <BiSearch className="absolute mt-0.5 mx-3 text-gray-400"></BiSearch>
                        <input
                            className="flex py-2 pl-9 outline-hidden border rounded-md w-full"
                            placeholder="Enter user name/email, order number, book title, or author name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search orders"
                        ></input>
                    </div>


                    <div className="py-2 px-4 outline-hidden border rounded-md">
                        <select
                            value={searchOrderStatus}
                            onChange={(e) => setSearchOrderStatus(e.target.value as OrderStatus || '')}
                            aria-label="Order status"
                        >
                            <option value="">All Orders</option>
                            {order_statuses.map((order_status) => (
                                <option key={order_status} value={order_status}>{prettifyString(order_status)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="p-2 outline-hidden border rounded-md">
                        <select
                            value={searchPaymentStatus}
                            onChange={(e) => setSearchPaymentStatus(e.target.value as PaymentStatus || '')}
                            aria-label="Payment status"
                        >
                            <option value="">All Orders</option>
                            {payment_statuses.map((payment_status) => (
                                <option key={payment_status} value={payment_status}>{prettifyString(payment_status)}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="p-2 outline-hidden border rounded-md">
                        <select
                            
                            value={dateOrder}
                            onChange={(e) => setDateOrder(e.target.value as 'desc'|'asc')}
                            aria-label="Sort by date"
                        >
                            <option value='desc'>Newest First</option>
                            <option value='asc'>Oldest First</option>
                        </select>
                    </div>
                </form>

                {orders.length === 0 ? (
                    <div className="text-center py-12 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
                        <p className="mt-2 text-sm text-gray-500">Users haven't placed any orders yet.</p>
                    </div>
                ) : ( 
                    <div className="space-y-6">
                        <ul className="list-none p-0 m-0 bg-white min-w-max space-y-6">
                            {orders.map((item) =>(
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
                                                    <div className="flex justify-between bg-gray-50 hover:bg-gray-100 rounded-md px-4 py-2" key={order_item.id}>
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
                                                    onClick={() => navigate(`/admin-dashboard/manage-order/${item.id}`, { 
                                                        state: { orderDetails: item }
                                                    })}
                                                    >
                                                    <p className="text-white text-md mr-4">Manage</p>
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
            </div>
            )}
            {nextCursor && <div id="loadNextPage" ref={observeRef} className="h-10 w-full"></div>}
        </div>
    );
}

export default OrderManagement;