import { useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

interface DropDownMenuProps<T extends string> {
    title: string,
    defaultValue?: string,
    selectedOptionStatus: T | '', 
    setSelectedOptionStatus: (selectedOptionStatus: T | '') => void,
    options: readonly T[],
    getLabel?: (value: T) => string
};


const DropDownMenu = <T extends string> ({title, defaultValue, selectedOptionStatus, setSelectedOptionStatus, options, getLabel}: DropDownMenuProps<T>) => {
    
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
                {selectedOptionStatus === '' ? title : (getLabel ? getLabel(selectedOptionStatus) : selectedOptionStatus)}
                <MdKeyboardArrowDown className={`text-lg ${showDropdown ? 'rotate-180' : 'rotate-0'} transition-transform duration-300 ease-out`} />
            </button>

            <div 
                className={`max-h-[240px] overflow-y-auto bg-white min-w-full text-gray-800 p-2 absolute left-0 top-full mt-1 shadow-md flex flex-col items-start bg-white border border-gray-300 rounded-md z-10 outline-hidden transition-[opacity,scale,transform] duration-200 
                    ${showDropdown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 pointer-events-none scale-95 translate-y-1'}
                `}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => e.preventDefault()}
            >
                { defaultValue && (
                    <div
                        className="w-full text-nowrap cursor-pointer px-4 py-1.5 box-border hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        onClick={() => {setSelectedOptionStatus(''); setShowDropdown(false)}}
                    >
                        {defaultValue}
                    </div>)
                }

                {options.map((option) => (
                    <div 
                        className="w-full text-nowrap cursor-pointer px-4 py-1.5 box-border hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        key={option}
                        onClick={() => {setSelectedOptionStatus(option); setShowDropdown(false)}}
                    >
                        {getLabel ? getLabel(option) : option}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DropDownMenu;