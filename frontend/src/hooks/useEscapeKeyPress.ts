import { useEffect, RefObject } from "react";


export const useEscapeKeyPress = <T extends HTMLElement = HTMLElement> (ref: RefObject<T>, handler: (Event: KeyboardEvent) => void) => {

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if(event.key === 'Escape') {
                handler(event);
            }
        };
        
        document.addEventListener('keydown', listener);

        return () => {
            document.removeEventListener('keydown', listener);
        };

    }, [ref, handler]);
}
