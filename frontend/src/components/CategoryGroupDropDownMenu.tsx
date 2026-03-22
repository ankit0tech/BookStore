import { useState } from "react";
import { Category } from "../types";

interface GroupDropDownMenuOptions {
    title: string;
    defaultValue?: string;
    selectedOptionStatus: string;
    setSelectedOptionStatus: (selectedOptionStatus: string) => void;
    options: Category[] | null;
    getLabel?: (status: string) => string;
};

const CategoryGroupDropDownMenu = ({ title, defaultValue, selectedOptionStatus, setSelectedOptionStatus, options, getLabel }: GroupDropDownMenuOptions) => {

    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    return (
        <div 
            className="w-full relative border border-gray-300 hover:border-gray-400 rounded-sm text-gray-800"
        >
            <button
                className="w-full text-nowrap px-3 py-2 flex flex-row gap-2 items-center justify-between"
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => setShowDropdown(false)}
                aria-label={title}
                type="button"
            >
                {title}
            </button>
        </div>
    );
}

export default CategoryGroupDropDownMenu;