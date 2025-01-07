import { useNavigate } from "react-router-dom";

const AdminPanel = () => {

    const navigate = useNavigate();

    return (
        <div className="p-4 ">
            <button
                className="m-2 p-2 border-2 rounded-xl" 
                onClick={() => navigate('/superadmin/register-admin')}
            >
                    Add new admin
            </button>
        </div>
    );

}

export default AdminPanel;