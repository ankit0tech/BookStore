import { useEffect, useMemo, useState } from "react";
import { Category, SubCategory } from "../types";
import { MdKeyboardArrowDown } from "react-icons/md";

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
    console.log(selectedOptionStatus);

    const dropDownTitle = useMemo(() => {

        if(selectedOptionStatus === '') {
            return defaultValue;
        }

        if(options) {
            for(const category of options) {
                for(const sub of category.sub_category) {
                    if(String(sub.id) === selectedOptionStatus) {
                        return getLabel ? getLabel(sub.title) : sub.title;
                    }
                }
            }
        }

        return defaultValue;

    }, [options, selectedOptionStatus, options, getLabel]);


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
                <div>{dropDownTitle}</div>
                <MdKeyboardArrowDown className={`text-lg ${showDropdown ? 'rotate-180' : 'rotate-0'} transition-transform duration-300 ease-out`} />
            </button>

            <div
                className={`max-h-[280px] absolute min-w-full p-2 left-0 top-full mt-1 flex flex-col items-start bg-white text-gray-800 shadow-md border border-gray-300 rounded-sm z-10 overflow-y-auto 
                    ${showDropdown ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 pointer-events-none opacity-0 translate-y-5'} outline-hidden transition-[opacity,scale,transform] duration-200
                `}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => e.preventDefault()}
            >
                {defaultValue && (
                    <button
                        className="w-full text-nowrap px-4 py-1.5 text-gray-950 hover:bg-gray-100 text-left rounded-lg transition-colors duration-200"
                        onClick={() => {setSelectedOptionStatus(''); setShowDropdown(false)}}
                        type='button'
                    >
                        {defaultValue}
                    </button>)
                }

                {options?.map((category: Category) => (
                    <div 
                        className="w-full flex flex-col items-start"
                        key={category.id}
                    >
                        <div className="w-full text-nowrap px-4 py-1.5 text-gray-600 text-left"> {category.title} </div>
                        {category.sub_category.map((sub: SubCategory) => (
                            <button 
                                className="w-full text-nowrap px-4 py-1.5 pl-8 text-gray-950 hover:bg-gray-100 text-left rounded-lg transition-colors duration-200"
                                onClick={() => {setSelectedOptionStatus(sub.id.toString()); setShowDropdown(false)}}
                                type="button"
                                key={sub.id}
                            >
                                {sub.title}
                            </button>
                        ))}
                    </div>
                ))}

            </div>
        </div>
    );
}

export default CategoryGroupDropDownMenu;