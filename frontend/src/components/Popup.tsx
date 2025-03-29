import React, { useState } from 'react';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({isOpen, onClose, children}) => {
    if (!isOpen) {
        return null;
    }
    
    return (
        <div onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose}>X</button>
                {children}
            </div>
        </div>
    );

};

export default Popup;