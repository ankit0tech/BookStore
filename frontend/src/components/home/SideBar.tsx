import React, { useEffect, useState } from "react";
import { UserBook, Category } from "../../types";
import { enqueueSnackbar } from "notistack";
import api from "../../utils/api";
import { ChildProps } from "../../App";
import { HiOutlineSortDescending } from "react-icons/hi";
import { MdFilterList } from "react-icons/md";
import { IoFileTrayStackedOutline } from "react-icons/io5";

interface Extended extends ChildProps {
    handleFetchBooks: (prevBooks: UserBook[], cursor:number|null) => void
    categoryId: number | null;
    setCategoryId: React.Dispatch<React.SetStateAction<number|null>>;
    minPrice: number | null;
    setMinPrice: React.Dispatch<React.SetStateAction<number|null>>;
    maxPrice: number | null;
    setMaxPrice: React.Dispatch<React.SetStateAction<number|null>>;
    sortBy: string | null;
    setSortBy: React.Dispatch<React.SetStateAction<string|null>>;
    sortOrder: string | null;
    setSortOrder: React.Dispatch<React.SetStateAction<string|null>>;
    sortByAverageRating: boolean;
    setSortByAverageRating: React.Dispatch<React.SetStateAction<boolean>>;
    selectWithSpecialOffer: boolean;
    setSelectWithSpecialOffer: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar = ({selectWithSpecialOffer, setSelectWithSpecialOffer, sortByAverageRating, setSortByAverageRating, sortBy, setSortBy, sortOrder, setSortOrder, maxPrice, setMaxPrice, minPrice, setMinPrice, handleFetchBooks, categoryId, setCategoryId, books, setBooks, nextCursor, setNextCursor}: Extended) => {
 
    // sort by Price, Rating

    const [categories, setCategories] = useState<Category[] | null>([]);
    const [activeCategory, setActiveCategory] = useState<number|null>(null);
    const [activePrice, setActivePrice] = useState<number|null>(null);

    const fetchCategories = () => {
        api.get('http://localhost:5555/categories')
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


    const updateMinPrice = (price: number|null) => {
        if (minPrice === price) {
            setMinPrice(null);
            setActivePrice(null);
        } else {
            setMinPrice(price);
            setActivePrice(price);
        }
    }

    const updateMaxPrice = (price: number|null) => {
        if(maxPrice === price) {
            setMaxPrice(null);
        } else {
            setMaxPrice(price);
        }
    }

    const updateCategoryId = (id: number|null) => {
        if(categoryId === id) {
            setCategoryId(null);
            setActiveCategory(null);
        } else {
            setCategoryId(id);
            setActiveCategory(id);
        }
    }

    const setSorting = (by: string|null, order: string|null) => {
        if(sortBy === by && sortOrder === order) {
            setSortBy(null);
            setSortOrder(null);
        } else {
            setSortBy(by);
            setSortOrder(order);
        }
    }

    return (
        <div className="px-2 py-4">

            <div className="">
                <div className="flex items-center gap-1 my-2"><span className="inline-block text-xl"><HiOutlineSortDescending/></span> <span className="inline-block font-semibold">Sort By</span></div>
 
                <div
                    className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-950
                          ${selectWithSpecialOffer && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`}
                    onClick={() => setSelectWithSpecialOffer(!selectWithSpecialOffer)}
                >Specail offers</div>
                
                <div
                    className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-950 ${sortBy === 'created_at' && sortOrder === 'desc' && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`}
                    onClick={() => setSorting('created_at', 'desc')}
                >New Arrivals</div>

                <div
                    className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-950 ${sortByAverageRating && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`}
                    onClick={() => setSortByAverageRating(!sortByAverageRating)}
                >4+ Rating</div>
                
                <div
                    className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-950 ${sortBy === 'purchase_count' && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`}
                    onClick={() => setSorting('purchase_count', 'desc')}
                >Bestsellers</div>
                
                <div>
                    <div className="my-2 ml-4 font-medium">Price</div>
                    <div 
                        className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-950 ${sortBy === 'price' && sortOrder === 'desc' && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`}
                        onClick={() => setSorting('price', 'desc')}
                    >Higest first</div>
                    <div 
                        className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-950 ${sortBy === 'price' && sortOrder == 'asc' && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`}
                        onClick={() => setSorting('price', 'asc')}
                    >Lowest first</div>
                </div>
            </div>
            

            <div className="my-4">
                <div className="flex items-center gap-1 my-2"> <span className="inline-block text-xl"><MdFilterList></MdFilterList></span> <span className="inline-block font-semibold">Filter By</span></div>
                <div>
                    <h3 className="my-2 ml-4 font-medium">Price</h3>
                    <ul id="PriceFilter">
                        <li 
                        className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-900 
                            ${activePrice === 0 && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`}
                        onClick={() => {updateMinPrice(0); updateMaxPrice(100)}} >
                            Under &#8377;100
                        </li>
                        <li 
                        className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-900
                            ${activePrice === 100 && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`} 
                        onClick={() => {updateMinPrice(100); updateMaxPrice(200)}} >
                            &#8377;100 - &#8377;200
                        </li>
                        <li 
                        className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-900 
                            ${activePrice === 200 && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`} 
                        onClick={() => {updateMinPrice(200); updateMaxPrice(500)}} >
                            &#8377;200 - &#8377;500
                        </li>
                        <li 
                        className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-900 
                            ${activePrice === 500 && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`}
                        onClick={() => {updateMinPrice(500); updateMaxPrice(1000)}} >
                            &#8377;500 - &#8377;1000
                        </li>
                        <li 
                        className={`ml-4 py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-800/50 hover:text-gray-900 
                            ${activePrice === 1000 && "text-gray-900 border-gray-900 hover:border-gray-900 font-semibold"}`}
                        onClick={() => {updateMinPrice(1000); updateMaxPrice(null)}} >
                            Over &#8377;1000
                        </li>
                    </ul>
                </div>
                
                {/* <p className="my-2 ml-4 font-semibold">Category</p> */}
                <p className="flex items-center gap-1 my-4"><span className="inline-block"><IoFileTrayStackedOutline></IoFileTrayStackedOutline></span><span className="inline-block font-medium">Category</span></p>
                <ul className="pl-4" id="categoryList">
                    {categories?.map((category) => (
                        <li key={category.id} className="">
                            <p className="font-medium my-2">{category.title}</p>
                            {category.sub_category.length > 0 && (
                                <ul className="_ml-2 font-normal">
                                    {category.sub_category.map((sub) => (
                                        <li 
                                            onClick={() => updateCategoryId(sub.id)} 
                                            key={sub.id} 
                                            className={`py-1 border-l pl-2 cursor-pointer text-sm text-gray-600 hover:border-l hover:border-gray-950/50 hover:text-gray-900 
                                                ${activeCategory === sub.id && "text-gray-900 border-gray-950 hover:border-gray-900 font-semibold"}`}>
                                                {sub.title}
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