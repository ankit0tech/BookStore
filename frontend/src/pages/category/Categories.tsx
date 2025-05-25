import { useEffect, useMemo, useState } from "react";
import { Category } from "../../types";
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";
import Spinner from "../../components/Spinner";
import { useNavigate } from "react-router-dom";
import { AiOutlineEdit, AiOutlinePlus, AiOutlineSearch, AiOutlineSortAscending, AiOutlineSortDescending } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import DeleteOverlay from "../../components/DeleteOverlay";
import { Tooltip } from 'react-tooltip'


const Categories = () => {

    const [categories, setCategories] = useState<Category[] | null>([]);
    // const [displayCategories, setDisplayCategories] = useState<Category[] | null>([]);
    const [loading, setLoading] = useState<boolean>(false);
    // const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
    const [showCategoryToDelete, setShowCategoryToDelete] = useState<number|null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<string>('asc');
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

    // useEffect(() => {
    //     handleSearchChange(searchText);
    // }, [searchText]);

    const onClose = () => {
        setShowCategoryToDelete(null);
    }

    // const handleSearchChange = (searchString: string) => {
    //     if(searchString.length != 0 && categories) {

    //         const filteredCategories: Category[] = categories.filter((cat) => {
    //             const catMatch = cat.title.toLowerCase().includes(searchString.toLowerCase());

    //             const subMatch = cat.sub_category.some((sub) => {
    //                 if(sub.title.toLowerCase().includes(searchString.toLowerCase())) return sub;
    //             });
    //             return catMatch || subMatch;
    //         });
            
    //         setDisplayCategories(filteredCategories);
    //     } else {
    //         setDisplayCategories(categories);
    //     }
    // }

    const filteredCategories = useMemo(() => {
        if(searchQuery && categories) {
            const filteredCategories: Category[] = categories.filter((cat) => {
                const catMatch = cat.title.toLowerCase().includes(searchQuery.toLowerCase());
                const subCatMatch = cat.sub_category.some((sub) => sub.title.toLowerCase().includes(searchQuery.toLowerCase()));
                return catMatch || subCatMatch;
            });
            return filteredCategories;
        } else {
            return categories;
        }
    }, [searchQuery, categories]);

    const sortedCategories = useMemo(() => {
        return [...(filteredCategories || [])].sort((a, b) => {
            const comparison = a.title.localeCompare(b.title);
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [filteredCategories, sortOrder]);
    


    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center my-4">
                <h2 className="text-2xl font-semibold text-gray-800">Book categories</h2>
                <button
                    className="py-2 px-3 flex items-center gap-2 text-white bg-purple-500 border rounded-lg hover:bg-purple-600 transition-all duration-200" 
                    onClick={() => navigate('/dashboard/category/create')}
                    >
                        <AiOutlinePlus className="inline"/> 
                        Create new category
                </button>
            </div>
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input 
                        className="w-full pl-10 pr-4 border appearance-none focus:outline-none focus:shadow-sm rounded-lg py-2 px-3" 
                        type="text" 
                        placeholder='Search categories...'
                        value = {searchQuery}
                        onChange={(e) => {setSearchQuery(e.target.value)}}
                    />
                    <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                    className="flex items-center gap-2 py-2 px-3 text-sm text-gray-800 border rounded-lg whitespace-nowrap hover:bg-gray-100 transition-colors duration-200"
                    type='button'
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                    {sortOrder == 'asc' ? <AiOutlineSortAscending/> : <AiOutlineSortDescending/>} Sort
                </button>
            </div>
            

            {loading ? (
                <Spinner/>
            ) : (
                <div className="flex flex-col justify-between">
                    {
                        sortedCategories?.map((item) => (
                            <div className="my-2 hover:shadow transition-shadow duration-100 border rounded-lg truncate" key={item.id}>
                                <div className="p-4 flex flex-row items-center justify-between w-full">
                                    <div>
                                        <div className="font-semibold text-xl">{item.title}</div>
                                        <div className="text-sm text-gray-500">{item.sub_category.length} sub-categories</div>
                                    </div>
                                    
                                    <div className="flex flex-row">
                                        <div className="m-2 p-2">
                                            <AiOutlineEdit 
                                                className='text-xl text-yellow-600 hover:text-yellow-500 transition-colors duration-200'
                                                onClick={() => navigate(`/dashboard/category/edit/${item.id}`)}>
                                            </AiOutlineEdit>
                                        </div>
                                        
                                        <div className="m-2 p-2 pr-3">
                                            <MdOutlineDelete 
                                                className='text-xl text-red-600 hover:text-red-500 transition-colors duration-200'
                                                onClick={() => setShowCategoryToDelete(item.id)}>
                                            </MdOutlineDelete>
                                        </div>
                                    </div>
                                </div>

                                <DeleteOverlay
                                    itemName = 'category'
                                    deleteUrl={`http://localhost:5555/category/${item.id}`}
                                    isOpen = { showCategoryToDelete === item.id}
                                    onClose = {onClose}
                                    onDeleteSuccess={fetchCategories}
                                />
                                    
                                {item.sub_category.length > 0 && (
                                    <ul className="w-full">
                                        {item.sub_category.map((sub) => (
                                            <li key={sub.id}
                                                className="p-5 pl-8 py-2 flex justify-between items-center text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border-t border-gray-100"
                                            >
                                                {sub.title}
                                                <div className="flex flex-row">
                                                    <div className="m-2 p-2 ">
                                                        <AiOutlineEdit 
                                                            className='text-xl text-yellow-600 hover:text-yellow-500 transition-colors duration-200'
                                                            onClick={() => navigate(`/dashboard/category/edit/${sub.id}`)}>
                                                        </AiOutlineEdit>
                                                    </div>
                                                    
                                                    <div className="m-2 p-2">
                                                        <MdOutlineDelete 
                                                            className='text-xl text-red-600 hover:text-red-500 transition-colors duration-200'
                                                            onClick={() => setShowCategoryToDelete(sub.id)}>
                                                        </MdOutlineDelete>
                                                    </div>
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
                        ))
                    }
                </div>
            )}
        </div>
    );
}

export default Categories;