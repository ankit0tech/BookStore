import { ReactHTML, useEffect, useState } from "react";
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";
import { Category } from "../../types";
import { useNavigate, useParams } from "react-router-dom";
import DropDownMenu from "../../components/DropDownMenu";
import { prettifyString } from "../../utils/formatUtils";


const CreateCategory = () => {

    const { id } = useParams();
    const [categoryTitle, setCategoryTitle] = useState<string>('');
    const [existingCategories, setExistingCategories] = useState<Category[]|null>(null);
    const [existingCategoryTitles, setExistingCategoryTitles] = useState<string[]>([]);
    const [selectedParent, setSelectedParent] = useState<string|null>("");
    const [updateCategory, setUpdateCategory] = useState<boolean>(false);
    const navigate = useNavigate();


    const fetchExistingCategories = () => {
        
        api.get('/categories')
        .then((response) => {
            setExistingCategories(response.data.data);

            setExistingCategoryTitles(response.data.data.map((cat:Category)=> cat.title));
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
        api.put(`/categories/${id}`, data)
        :
        api.post('/categories', data);

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
        
        api.get(`/categories/${id}`)
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
            <h2 className="text-gray-800 text-xl my-4 font-semibold">{updateCategory ? 'Update Category' : 'Add new category'}</h2>
            <form
                className="space-y-6"
                onSubmit={(e) => handleCreateCategory(e)}
            >
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="category">Category title</label>
                    <input 
                        type='text' 
                        id='category' 
                        name='category'
                        value={categoryTitle}
                        onChange={(e) => setCategoryTitle(e.target.value)}
                        // className="text-gray-800 w-full px-4 py-2 rounded-lg border border-gray-300 outline-hidden focus:border-blue-400"
                        className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                        placeholder="Enter category title" 
                        required   
                    >
                    </input>
            
                    { updateCategory && selectedParent == null && 
                        <div className="text-xs text-red-500">This category already have sub-categories. You cannot assign it a parent.</div>
                    }
                </div>

                <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="parent-category">Parent Category</label>
                    <DropDownMenu
                        title="Select Parent"
                        defaultValue="No Parent"
                        selectedOptionStatus={selectedParent || ''} 
                        setSelectedOptionStatus={setSelectedParent}
                        options={existingCategoryTitles|| []}
                        getLabel={(status) => prettifyString(status)}
                    />
 
                </div>

                <div className="flex flex-row gap-3 justify-end pt-4">
                    <button
                        type="submit"
                        className="w-fit py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                    >
                        {updateCategory ? 'Update' : 'Save'}
                    </button>

                    <button
                        type='button'
                        className="w-fit py-2 px-4 font-medium text-gray-800 hover:text-gray-900 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>

                </div>
            </form>
        </div>
    );
}

export default CreateCategory