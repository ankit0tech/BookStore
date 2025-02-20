import { useEffect, useState } from "react";
import { Book, Category } from "../../types";
import { enqueueSnackbar } from "notistack";
import api from "../../utils/api";
import { ChildProps } from "../../App";

interface Extended extends ChildProps {
    handleFetchBooks: (prevBooks: Book[], direction?:string) => void
    categoryId: number|null;
    setCategoryId: React.Dispatch<React.SetStateAction<number|null>>;
}

const SideBar = ({handleFetchBooks, categoryId, setCategoryId, books, setBooks, prevCursor, setPrevCursor, nextCursor, setNextCursor}: Extended) => {
    // 1. Price
    // < 100
    // 100 to 200
    // 200 to 500
    // 500 to 1000
    // 1000 <

    // 2. Category
    // 3. Reviews / Rating

    const [categories, setCategories] = useState<Category[] | null>([]);

    const fetchCategories = () => {
        api.get('http://localhost:5555/category')
        .then((response) => {
            setCategories(response.data.data);
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error while fetching categories', { variant: 'error' });
        });
    }



    useEffect(()=> {
        fetchCategories();
    }, []);

    useEffect(()=>{
        if(categoryId) {
            handleFetchBooks([], 'next');
        }
    }, [categoryId]);


    return (
        <div className="border rounded-xl py-2 px-4">
 
            <div className="p-2">
                <div className="font-bold">Sort By</div>
                <div>Price
                    <div className="pl-4">Higest first</div>
                    <div className="pl-4">Lowest first</div>
                </div>
                <div>Reviews</div>
            </div>
            

            <div className="p-2">
                <div className="font-bold">Filter By</div>
                <div>Price</div>
                <label>Category</label>
                <ul>
                    {categories?.map((category) => (
                        <li key={category.id} className="font-bold">
                            {category.title}
                            {category.sub_category.length > 0 && (
                                <ul className="ml-4 font-normal">
                                    {category.sub_category.map((sub) => (
                                        <li 
                                            onClick={() => setCategoryId(sub.id)} 
                                            key={sub.id} 
                                            className="cursor-pointer hover:text-purple-600">
                                                    - {sub.title}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
}

export default SideBar;