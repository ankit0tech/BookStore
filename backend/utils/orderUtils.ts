

const generateOrderNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-5);  // last 5 digits from epoch time
    const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');   // YYYMMDD 

    return `ORD-${dateStr}-${timestamp}`;
}

const validateOrderNumber = (orderNumber: string): boolean => {
    const orderNumberRegex = /^ORD-\d{8}-\d{5}%/;
    return orderNumberRegex.test(orderNumber);
}

const calculateDeliveryCharges = (subTotal: number, deliveryMethod: string|null): number => {

    if(deliveryMethod == 'NEXT_DAY') {
        return 15000;
    } else if(deliveryMethod == 'EXPRESS') {
        return 10000;
    } else if(subTotal >= 50000) {
        return 0;
    }
    // for standard delivery
    return 5000;

}


export { generateOrderNumber, validateOrderNumber, calculateDeliveryCharges };