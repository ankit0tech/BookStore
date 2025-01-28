import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../types";


const Profile = () => {

    const navigate = useNavigate();
    const userRole = useSelector((state: RootState) => state.userinfo.userRole);
    const handleNavigate = (url: string) => {
        navigate(url);
    }

    return (
        <div className="p-4">
            <button 
                className="m-2 p-4 border-2 rounded-lg" 
                onClick={() => handleNavigate('/addresses')}
            >
                Addresses
            </button>
            
            <button 
                className="m-2 p-4 border-2 rounded-lg" 
                onClick={() => handleNavigate('/cart')}
            >
                Cart
            </button>
            
            <button 
                className="m-2 p-4 border-2 rounded-lg" 
                onClick={() => handleNavigate('/orders')}
            >
                Orders
            </button>

            <button
                className="m-2 p-4 border-2 rounded-lg" 
                onClick={() => handleNavigate('/wishlist')}
            >
                Wishlist
            </button>

            <button
                className="m-2 p-4 border-2 rounded-lg" 
                onClick={() => handleNavigate('/recently-viewed')}
            >
                Recently Viewed
            </button>

            {userRole == 'superadmin' ? 
                <button className="m-2 p-4 border-2 rounded-lg" onClick={() => handleNavigate('/superadmin-panel')}>Superadmin Panel</button>
            :
                null
            }
        </div>
    );
}

export default Profile;