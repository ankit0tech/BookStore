import { useNavigate } from "react-router-dom";

const SuperAdminPanel = () => {

    const navigate = useNavigate();

    return (
        <div className="p-4 ">
            <button
                className="m-2 p-4 border-2 rounded-lg"
                onClick={() => navigate('/superadmin/register-admin')}
            >
                    Add new admin
            </button>
        </div>
    );

}

export default SuperAdminPanel;