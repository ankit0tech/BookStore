import { ReactHTML, useEffect, useState } from "react";
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";
import { Category } from "../../types";
import { useParams } from "react-router-dom";


const CreateCategory = () => {

    const { id } = useParams();
    const [categoryTitle, setCategoryTitle] = useState<string>('');
    const [existingCategories, setExistingCategories] = useState<Category[]|null>(null);
    const [selectedParent, setSelectedParent] = useState<string|null>("");
    const [updateCategory, setUpdateCategory] = useState<boolean>(false);


    const fetchExistingCategories = () => {
        
        api.get('http://localhost:5555/category')
        .then((response) => {
            setExistingCategories(response.data.data);
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error while fetching categories', { variant: 'error' });
        });

    }

    const handleCreateCategory = (e: React.FormEvent) => {

        e.preventDefault();

        const data = {
            title: categoryTitle,
            parent_id: selectedParent !== "" ? Number(selectedParent) : null
        }

        const apiCall = updateCategory ? 
        api.put(`http://localhost:5555/category/${id}`, data)
        :
        api.post('http://localhost:5555/category', data);

        apiCall
        .then((response) => {
            enqueueSnackbar('Category created successfully', { variant: 'success' });
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error while creating new category', { variant: 'error' });
        });

    }

    const fetchCategory = (id: string) => {
        
        api.get(`http://localhost:5555/category/${id}`)
        .then((response) => {

            console.log(response.data);
            
            const {title, parent_id} = response.data.data;
            setCategoryTitle(title ?? '');
            setSelectedParent(parent_id ?? null);
            setUpdateCategory(true);
        })
        .catch((error: any) => {
            console.log(error);
        })
    }

    useEffect(() => {
        fetchExistingCategories();

        if(id) {
            fetchCategory(id);
        }

    }, []);


    return (
        <div className="p-4 flex flex-col min-w-1/4 max-w-[300px] mx-auto">
            <form
                className="flex flex-col"
                onSubmit={(e) => handleCreateCategory(e)}
            >
                <label htmlFor="category">Category title</label>
                <input 
                    type='text' 
                    id='category' 
                    name='category'
                    value={categoryTitle}
                    onChange={(e) => setCategoryTitle(e.target.value)}
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                >
                </input>
                
                {updateCategory && selectedParent == null && 
                    <div className="p-2 text-sm text-red-500">This category already has subcategories. You cannot assign it a parent.</div>
                }
                    <>
                    <label className="py-2" htmlFor="parentSelection">Parent Category</label>
                    <select
                        className="p-1 border rounded-xl"
                        id="parentSelection"
                        name="parentSelection"
                        value={selectedParent || ""}
                        onChange={(e) => setSelectedParent(e.target.value)}
                    >   
                        <option value="">No Parent</option>
                        {!(updateCategory && selectedParent == null) && Array.isArray(existingCategories) && existingCategories.length>0 && existingCategories.map((category) => (
                                <option key={category.id} value={category.id}> {category.title} </option>
                        ))}
                    </select>
                    </> 

                <button
                    type="submit"
                    className="rounded-full mt-2 text-white bg-purple-500 px-4 py-2 border border-gray-300"
                >
                    Save
                </button>
            </form>
        </div>
    );
}

export default CreateCategory