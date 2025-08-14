import React, { useEffect, useState } from "react";
import { UserBook, Category } from "../../types";
import { enqueueSnackbar } from "notistack";
import api from "../../utils/api";
import { ChildProps } from "../../App";
import { MdOutlineSportsRugby } from "react-icons/md";

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
        <div className="py-2 px-4">
 
            <div className="p-2">
                <div className="font-bold">Sort By</div>
 
                 <div
                    className={`cursor-pointer hover:text-purple-600  ${selectWithSpecialOffer && "text-purple-600"}`}
                    onClick={() => setSelectWithSpecialOffer(!selectWithSpecialOffer)}
                >Specail offers</div>
                
                <div
                    className={`cursor-pointer hover:text-purple-600  ${sortBy === 'created_at' && sortOrder === 'desc' && "text-purple-600"}`}
                    onClick={() => setSorting('created_at', 'desc')}
                >New Arrivals</div>

                <div
                    className={`cursor-pointer hover:text-purple-600  ${sortByAverageRating && "text-purple-600"}`}
                    onClick={() => setSortByAverageRating(!sortByAverageRating)}
                >4+ Rating</div>
                
                <div
                    className={`cursor-pointer hover:text-purple-600  ${sortBy === 'purchase_count' && "text-purple-600"}`}
                    onClick={() => setSorting('purchase_count', 'desc')}
                >Bestsellers</div>
                
                <div>Price
                    <div 
                        className={`pl-4 cursor-pointer hover:text-purple-600  ${sortBy === 'price' && sortOrder === 'desc' && "text-purple-600"}`}
                        onClick={() => setSorting('price', 'desc')}
                    >Higest first</div>
                    <div 
                        className={`pl-4 cursor-pointer hover:text-purple-600  ${sortBy === 'price' && sortOrder == 'asc' && "text-purple-600"}`}
                        onClick={() => setSorting('price', 'asc')}
                    >Lowest first</div>
                </div>
            </div>
            

            <div className="p-2">
                <div className="font-bold">Filter By</div>
                <div>
                    <h3 className="font-bold block">Price</h3>
                    <ul id="PriceFilter">
                        <li 
                        className={`ml-4 cursor-pointer hover:text-purple-600 
                            ${activePrice === 0 && "text-purple-600"}`}
                        onClick={() => {updateMinPrice(0); updateMaxPrice(100)}} >
                            Under &#8377;100
                        </li>
                        <li 
                        className={`ml-4 cursor-pointer hover:text-purple-600
                            ${activePrice === 100 && "text-purple-600"}`} 
                        onClick={() => {updateMinPrice(100); updateMaxPrice(200)}} >
                            &#8377;100 - &#8377;200
                        </li>
                        <li 
                        className={`ml-4 cursor-pointer hover:text-purple-600 
                            ${activePrice === 200 && "text-purple-600"}`} 
                        onClick={() => {updateMinPrice(200); updateMaxPrice(500)}} >
                            &#8377;200 - &#8377;500
                        </li>
                        <li 
                        className={`ml-4 cursor-pointer hover:text-purple-600 
                            ${activePrice === 500 && "text-purple-600"}`}
                        onClick={() => {updateMinPrice(500); updateMaxPrice(1000)}} >
                            &#8377;500 - &#8377;1000
                        </li>
                        <li 
                        className={`ml-4 cursor-pointer hover:text-purple-600 
                            ${activePrice === 1000 && "text-purple-600"}`}
                        onClick={() => {updateMinPrice(1000); updateMaxPrice(null)}} >
                            Over &#8377;1000
                        </li>
                    </ul>
                </div>
                <h3 className="my-1 font-bold block">Category</h3>
                <ul id="categoryList">
                    {categories?.map((category) => (
                        <li key={category.id} className="font-bold">
                            {category.title}
                            {category.sub_category.length > 0 && (
                                <ul className="ml-4 font-normal">
                                    {category.sub_category.map((sub) => (
                                        <li 
                                            onClick={() => updateCategoryId(sub.id)} 
                                            key={sub.id} 
                                            className={`cursor-pointer hover:text-purple-600 
                                                ${activeCategory === sub.id && "text-purple-600"}`}>
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