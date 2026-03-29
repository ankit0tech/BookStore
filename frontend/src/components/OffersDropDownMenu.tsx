import { useMemo, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { Offer } from '../types';

interface DropDownMenuProps<T extends string> {
    title: string,
    defaultValue?: string,
    selectedOptionStatus: string, 
    setSelectedOptionStatus: (selectedOptionStatus: string) => void,
    offers: readonly Offer[],
    getLabel?: (value: string) => string
};


const OffersDropDownMenu = <T extends string> ({title, defaultValue, selectedOptionStatus, setSelectedOptionStatus, offers, getLabel}: DropDownMenuProps<T>) => {
    
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const dropDownTitle = useMemo(() => {

        if(selectedOptionStatus === '') {
            return defaultValue;
        }

        if(offers) {
            for(const offer of offers) {
                if(String(offer.id) === selectedOptionStatus) {
                    return getLabel ? getLabel(offer.offer_type) : offer.offer_type;
                }
            }
        }

        return defaultValue;

    }, [offers, selectedOptionStatus, getLabel]);

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

                {offers?.map((offer) => (
                    <div
                        className="w-full text-nowrap cursor-pointer px-4 py-1.5 box-border hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        key={offer.id}
                        onClick={() => {setSelectedOptionStatus(String(offer.id)); setShowDropdown(false)}}
                    >
                        {getLabel ? getLabel(offer.offer_type) : offer.offer_type}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OffersDropDownMenu;