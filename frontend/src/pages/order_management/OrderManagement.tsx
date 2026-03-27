import { useState, useEffect, useRef } from "react";
import { OrdersInterface, order_statuses, payment_statuses, OrderStatus, PaymentStatus, OrderInterface, DateOrderStatus } from "../../types";
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
import DropDownMenu from "../../components/DropDownMenu";


const OrderManagement = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [nextCursor, setNextCursor] = useState<number|null>(null);
    const [orders, setOrders] = useState<OrderInterface[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchOrderStatus, setSearchOrderStatus] = useState<OrderStatus|''>('');
    const [searchPaymentStatus, setSearchPaymentStatus] = useState<PaymentStatus|''>('');
    const [dateOrder, setDateOrder] = useState<DateOrderStatus>('desc');

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
        }).catch((error) => {
            console.log(error);
            setLoading(false);
            enqueueSnackbar('Error occurred while loading orders', {variant: 'error'});
        });
    }

    useEffect(() => {
        setNextCursor(null);
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
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );

        if (observeRef.current) observer.observe(observeRef.current);

        return () => {
            if(observeRef.current) observer.unobserve(observeRef.current);
            observer.disconnect();
        }
    }, [orders.length, nextCursor]);

    return (
        <div className="min-h-screen max-w-7xl p-2 md:p-4 min-w-[320px] sm:min-w-[32rem]">
            <div className="flex flex-col mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Order Management</h1>
                <p className="text-sm text-gray-600">View and manage orders here</p>
            </div>

            { loading ? (
                <div className="flex justify-center items-center h-32">
                    <Spinner />
                </div>
            ) : (
            <div className="flex flex-col gap-6">
                <form 
                    className="flex items-center gap-2 flex-col lg:flex-row"
                    onSubmit={(e) => {e.preventDefault()}}
                >
                    <div className="relative flex items-center w-full">
                        <BiSearch className="absolute mt-0.5 mx-3 text-gray-400"></BiSearch>
                        <input
                            className="flex py-2 pl-9 outline-hidden border w-full border-gray-300 hover:border-gray-400 rounded-sm text-gray-800"
                            placeholder="Enter user name, email, order number, book title, or author name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search orders"
                        ></input>
                    </div>

                    <div className="flex flex-col xs:flex-row gap-2 items-stretch xs:items-start w-full">
                        <DropDownMenu
                            title="Select Status"
                            defaultValue="All Orders"
                            selectedOptionStatus={searchOrderStatus} 
                            setSelectedOptionStatus={setSearchOrderStatus}
                            options={order_statuses}
                            getLabel={(status) => prettifyString(status)}
                        />
                        <DropDownMenu
                            title="Payment Status"
                            defaultValue="All Orders"
                            selectedOptionStatus={searchPaymentStatus}
                            setSelectedOptionStatus={setSearchPaymentStatus}
                            options={payment_statuses}
                            getLabel={(status) => prettifyString(status)}
                        />

                        <DropDownMenu 
                            title="Sort By Date"
                            selectedOptionStatus={dateOrder}
                            setSelectedOptionStatus={setDateOrder}
                            options={['desc', 'asc']}
                            getLabel={(status) => (status === 'desc' ? 'Newest First' : 'Oldest First')}
                        />
                    </div>
                </form>

                {orders.length === 0 ? (
                    <div className="text-center py-12 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
                        <p className="mt-2 text-sm text-gray-500">Users haven't placed any orders yet.</p>
                    </div>
                ) : ( 
                    <div className="flex flex-col gap-">
                        <ul className="list-none flex flex-col gap-6">
                            {orders.map((item) =>(
                                <li className="flex flex-col gap-4 justify-between border rounded-lg hover:shadow-xs transition-shadow duration-200" key={item.id}> 
                                    
                                    <div className="flex flex-col sm:flex-row justify-between gap-4 bg-black/1 p-4 border-b rounded-t-lg">
                                        <div className="flex flex-col justify-between gap-2">
                                            <div className="flex items-center gap-2"> 
                                                <div className="text-xl"><FiPackage></FiPackage></div>
                                                <p className="text-gray-900 text-lg font-semibold"><span className="text-xl text-orange-500">#</span>{item.order_number}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-lg"><CiCalendar/></div>
                                                <p className="text-gray-600 text-sm">Placed on: {formatDate(item.purchase_date)}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <p className="text-gray-600">Order status</p>
                                                <p className={`mx-auto font-medium border text-xs py-1 px-2 ${item.order_status.toLowerCase() === 'delivered' ? "text-green-700 bg-green-50" : "text-sky-500 bg-sky-50"} rounded-full`}>{prettifyString(item.order_status.toLowerCase())}</p>
                                            </div>
                                            <div className="flex flex-col gap-1 text-xs">
                                                <p className="text-gray-600">Payment status</p>
                                                <p className={`mx-auto font-medium border text-xs py-1 px-2 ${item.payment_status.toLowerCase() === 'completed' ? "text-green-700 bg-green-50" : "text-sky-500 bg-sky-50"} rounded-full`}>{prettifyString(item.payment_status.toLowerCase())}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row justify-between p-4 gap-6">

                                        <div className="flex-1">
                                            <div className="text-gray-600 text-sm font-semibold mb-2 tacking-wider uppercase">Items</div>
                                            <div className="flex flex-col gap-2">
                                                {item.order_items.map((order_item) => (
                                                    <div className="flex gap-2 justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors duration-200" key={order_item.id}>
                                                        <div className="text-gray-900 truncate">{order_item.book.title}</div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-sm text-gray-600">Qty:</span>
                                                            <span className="text-sm text-gray-600">{order_item.quantity}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>


                                        <div>
                                            <div className="py-2 size-full flex flex-col gap-2 justify-between">
                                                <div className="flex flex-col items-start">
                                                    <p className="text-sm text-gray-600">Total:</p>
                                                    <p className="text-lg font-semibold text-gray-900">{formatPrice(item.total_amount, item.currency)}</p>
                                                </div>
                                                
                                                <button 
                                                    className="relative px-4 py-2 group flex flex-row gap-2 items-center rounded-sm font-medium text-white border border-orange-700 bg-orange-500 hover:bg-orange-600/90 tansistion-color duration-200 ease-in-out"                                                    
                                                    onClick={() => navigate(`/admin-dashboard/manage-order/${item.id}`, { 
                                                        state: { orderDetails: item }
                                                    })}
                                                >
                                                    <p className="text-white text-md"> Manage </p>
                                                    <div className="relative font-bold text-white group-hover:translate-x-1 transition-transform duration-300 ease-in-out"><IoIosArrowForward/></div> 
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