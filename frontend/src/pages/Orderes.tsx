import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import api from "../utils/api";
import { CartInterface } from "../types";

const initialState: CartInterface = {
    count: 0,
    data: []
}

const Orders = () => {

    const [ loading, setLoading ] = useState(false);
    const [ orders, setOrders ] = useState(initialState);


    useEffect(() => {

        const authToken = localStorage.getItem('authToken');
        const config = { headers: { Authorization: authToken } };

        setLoading(true);

        api
        .get('http://localhost:5555/cart/get-purchased-items', config)
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
        <div>
            { loading ? (
                <Spinner />
            )
            : 
            <div>
                {orders.count == 0 ?
                    <div>No Orders history</div>
                :
                    <div>
                        <div className="font-bold">Orders:</div>
                        <ul>
                            {orders.data.map((item)=> (
                                <li key={item.id}>
                                    <div className="flex justify-start items-center gap-x-4">
                                        { item.quantity } • { item.book_title }
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                }
            </div> }
        </div>
    );
}

export default Orders;