import { useEffect, useState } from "react";
import { Category } from "../../types";
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";
import Spinner from "../../components/Spinner";
import { useNavigate } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import DeleteOverlay from "../../components/DeleteOverlay";


const Categories = () => {

    const [categories, setCategories] = useState<Category[] | null>([]);
    const [loading, setLoading] = useState<boolean>(false);
    // const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
    const [showCategoryToDelete, setShowCategoryToDelete] = useState<number|null>(null);
    const navigate = useNavigate();

    const fetchCategories = () => {
        
        setLoading(true);
        
        api.get('http://localhost:5555/category')
        .then((response) => {
            setCategories(response.data.data);
            setLoading(false);
        })
        .catch((error) => {
            setLoading(false);
            console.log(error);
            enqueueSnackbar('Error while fetching categories', { variant: 'error' });
        });
    
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const onClose = () => {
        setShowCategoryToDelete(null);
    }
    
    return (
        <div className="p-4">
            <div className="rounded-full text-white bg-purple-500 p-2 pl-8 font-bold">Book categories</div>
            
            <button
                className="p-4 m-4 border rounded-xl" 
                onClick={() => navigate('/dashboard/category/create')}
                >Create new category
            </button>

            {loading ? (
                <Spinner/>
            ) : (
                <div className="p-4 flex flex-col justify-between">
                    {
                        categories?.map((item) =>(
                            <div key={item.id}>
                                <div
                                    className="p-2 flex flex-row content-center items-start gap-x-4 border rounded-xl m-2"
                                >
                                    <div className="p-2">{item.title}</div>
                                
                                    <div className="p-2">
                                        <AiOutlineEdit 
                                            className='text-2x1 text-yellow-600'
                                            onClick={() => navigate(`/dashboard/category/edit/${item.id}`)}>
                                        </AiOutlineEdit>
                                    </div>
                                    
                                    <div className="p-2">
                                        <AiOutlineDelete 
                                            className='text-2x1 text-red-600'
                                            onClick={() => setShowCategoryToDelete(item.id)}>
                                        </AiOutlineDelete>
                                    </div>

                                    <DeleteOverlay
                                        itemName = 'category'
                                        deleteUrl={`http://localhost:5555/category/${item.id}`}
                                        isOpen = { showCategoryToDelete === item.id}
                                        onClose = {onClose}
                                        onDeleteSuccess={fetchCategories}
                                    />
                                    
                                    {item.sub_category.length > 0 && (
                                        <ul className="mt-2 pl-4 boerder-l">
                                            {item.sub_category.map((sub) => (
                                                <li key={sub.id}
                                                    className="p-2 pl-8 flex justify-between items-center border rounded m-2"
                                                >
                                                    {sub.title}
                                            
                                                    <div className="p-2">
                                                        <AiOutlineEdit 
                                                            className='text-2x1 text-yellow-600'
                                                            onClick={() => navigate(`/dashboard/category/edit/${sub.id}`)}>
                                                        </AiOutlineEdit>
                                                    </div>
                                                    
                                                    <div className="p-2">
                                                        <AiOutlineDelete 
                                                            className='text-2x1 text-red-600'
                                                            onClick={() => setShowCategoryToDelete(sub.id)}>
                                                        </AiOutlineDelete>
                                                    </div>

                                                    <DeleteOverlay
                                                        itemName = 'category'
                                                        deleteUrl={`http://localhost:5555/category/${sub.id}`}
                                                        isOpen = {showCategoryToDelete === sub.id}
                                                        onClose = {onClose}
                                                        onDeleteSuccess = {fetchCategories}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
}

export default Categories;