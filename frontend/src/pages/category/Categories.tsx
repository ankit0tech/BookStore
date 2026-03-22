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
        
        api.get('/categories')
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
        <div className="p-2 md:p-4 flex flex-col gap-4 min-w-[320px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">Book categories</h2>
                <button
                    className="w-fit py-2 px-4 flex flex-row items-center gap-2 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                    onClick={() => navigate('/admin-dashboard/category/create')}
                    >
                        <AiOutlinePlus className="inline font-semibold"/> 
                        Create new category
                </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                    <input 
                        className="w-full flex py-2 pl-9 outline-hidden border border-gray-300 hover:border-gray-400 rounded-sm text-gray-800"
                        type="text" 
                        placeholder='Search categories...'
                        value = {searchQuery}
                        onChange={(e) => {setSearchQuery(e.target.value)}}
                    />
                    <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                    className="w-fit flex items-center gap-2 py-2 px-3 text-sm text-gray-800 border border-gray-300 hover:border-gray-400 rounded-sm whitespace-nowrap hover:bg-gray-50 transition-colors duration-100"
                    type='button'
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                    {sortOrder == 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />} Sort
                </button>
            </div>
            

            {loading ? (
                <Spinner/>
            ) : (
                <div className="flex flex-col justify-between">
                    {
                        sortedCategories?.map((item) => (
                            <div className="my-2 hover:shadow-sm transition-shadow duration-100 border rounded-lg truncate" key={item.id}>
                                <div className="p-4 flex flex-col gap-4 md:flex-row items-start md:items-center justify-between w-full">
                                    <div>
                                        <div className="font-medium text-xl">{item.title}</div>
                                        <div className="text-sm text-gray-500">{item.sub_category.length} sub-categories</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-4 pr-1">
                                        <button 
                                            className="whitespace-nowrap w-fit py-1.5 px-3 font-medium text-gray-800 hover:text-orange-700 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[0.5px] active:translate-y-[0.5px] shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[0.5px_0.5px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                            onClick={() => navigate(`/admin-dashboard/category/edit/${item.id}`)}
                                        >
                                            <AiOutlineEdit></AiOutlineEdit>
                                        </button>
                                        
                                        <button 
                                            className="whitespace-nowrap w-fit py-1.5 px-3 font-medium text-gray-800 hover:text-red-600 hover:bg-red-50 rounded-sm border border-orange-800 active:translate-x-[0.5px] active:translate-y-[0.5px] shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[0.5px_0.5px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                            onClick={() => setShowCategoryToDelete(item.id)}
                                        >
                                            <MdOutlineDelete></MdOutlineDelete>
                                        </button>
                                    </div>
                                </div>

                                <DeleteOverlay
                                    itemName = 'category'
                                    deleteUrl={`/categories/${item.id}`}
                                    isOpen = { showCategoryToDelete === item.id}
                                    onClose = {onClose}
                                    onDeleteSuccess={fetchCategories}
                                />
                                    
                                {item.sub_category.length > 0 && (
                                    <ul className="w-full">
                                        {item.sub_category.map((sub) => (
                                            <li 
                                                key={sub.id}
                                                className="p-4 md:pl-8 py-2 flex flex-col md:flex-row gap-2 justify-between items-start md:items-center text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border-t border-gray-100"
                                            >
                                                <p>{sub.title}</p>
                                                <div className="flex flex-row gap-4">
                                                    <button 
                                                        className="whitespace-nowrap w-fit py-1.5 px-3 font-medium text-gray-800 hover:text-orange-700 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[0.5px] active:translate-y-[0.5px] shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[0.5px_0.5px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                                        onClick={() => navigate(`/admin-dashboard/category/edit/${sub.id}`)}
                                                    >
                                                        <AiOutlineEdit></AiOutlineEdit>
                                                    </button>
                                                    
                                                    <button 
                                                        className="whitespace-nowrap w-fit py-1.5 px-3 font-medium text-gray-800 hover:text-red-600 hover:bg-red-50 rounded-sm border border-orange-800 active:translate-x-[0.5px] active:translate-y-[0.5px] shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[0.5px_0.5px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                                        onClick={() => setShowCategoryToDelete(sub.id)}
                                                    >
                                                        <MdOutlineDelete></MdOutlineDelete>
                                                    </button>
                                                </div>

                                                <DeleteOverlay
                                                    itemName = 'category'
                                                    deleteUrl={`/categories/${sub.id}`}
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