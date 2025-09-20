import { ReactHTML, useEffect, useState } from "react";
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";
import { Category } from "../../types";
import { useNavigate, useParams } from "react-router-dom";


const CreateCategory = () => {

    const { id } = useParams();
    const [categoryTitle, setCategoryTitle] = useState<string>('');
    const [existingCategories, setExistingCategories] = useState<Category[]|null>(null);
    const [selectedParent, setSelectedParent] = useState<string|null>("");
    const [updateCategory, setUpdateCategory] = useState<boolean>(false);
    const navigate = useNavigate();


    const fetchExistingCategories = () => {
        
        api.get('http://localhost:5555/categories')
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
        api.put(`http://localhost:5555/categories/${id}`, data)
        :
        api.post('http://localhost:5555/categories', data);

        apiCall
        .then((response) => {
            enqueueSnackbar('Success', { variant: 'success' });
            navigate(-1);
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error', { variant: 'error' });
        });

    }

    const fetchCategory = (id: string) => {
        
        api.get(`http://localhost:5555/categories/${id}`)
        .then((response) => {

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
        <div className="p-4 flex flex-col max-w-2xl mx-auto">
            <h2 className="text-gray-800 text-2xl my-4 font-semibold">{updateCategory ? 'Update Category' : 'Add new category'}</h2>
            <form
                className="space-y-6"
                onSubmit={(e) => handleCreateCategory(e)}
            >
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="category">Category title</label>
                    <input 
                        type='text' 
                        id='category' 
                        name='category'
                        value={categoryTitle}
                        onChange={(e) => setCategoryTitle(e.target.value)}
                        className="text-gray-800 w-full px-4 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-blue-500"
                        placeholder="Enter category title" 
                        required   
                    >
                    </input>
            
                    { updateCategory && selectedParent == null && 
                        <div className="text-xs text-red-500">This category already have sub-categories. You cannot assign it a parent.</div>
                    }
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="parentSelection">Parent Category</label>
                    <select
                        className="text-gray-800 w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-400 outline-hidden"
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
                </div>

                <div className="flex flex-row gap-3 justify-end pt-4">
                    <button
                        type='button'
                        className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors duration-200"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors duration-200"
                        >
                        {updateCategory ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateCategory