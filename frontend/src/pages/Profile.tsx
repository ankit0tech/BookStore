import { useNavigate } from "react-router-dom";

const Profile = () => {

    const navigate = useNavigate();

    const handleNavigate = (url: string) => {
        navigate(url);
    }

    return (
        <div className="p-4">
            <button className="m-2 p-4 border-2 rounded-lg" onClick={() => handleNavigate('/addresses')}>Addresses</button>
            <button className="m-2 p-4 border-2 rounded-lg" onClick={() => handleNavigate('/cart')}>Cart</button>
            <button className="m-2 p-4 border-2 rounded-lg" onClick={() => handleNavigate('/orders')}>Orders</button>
        </div>
    );
}

export default Profile;