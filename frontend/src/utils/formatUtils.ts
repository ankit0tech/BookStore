
export const prettifyString = (input: string): string => {
    return input
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export const formatPrice = (price: number, currency?: string): string => {
    const convertedPrice = (price/100).toFixed(2);
    
    if(currency == 'USD') {
        return ('$' + convertedPrice);
    } else {
        return ('₹' + convertedPrice);
    }
}