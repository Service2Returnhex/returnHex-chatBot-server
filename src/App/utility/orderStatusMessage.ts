export function buildOrderStatusMessage(order: any, status: string) {
    // Customize messages per status
    switch (status) {
        case "confirmed":
            return `Hi ${order.customerName || "Customer"}, your (${order.productName}) order (${order._id}) has been confirmed. We'll notify you when it's shipped. Thank you!`;
        case "delivered":
            return `Hi ${order.customerName || "Customer"}, your (${order.productName}) order (${order._id}) has been delivered. Enjoy!`;
        case "cancelled":
            return `Hi ${order.customerName || "Customer"}, your (${order.productName}) order (${order._id}) has been cancelled. Please contact us for more info.`;
        default:
            return `Hi ${order.customerName || "Customer"}, the status of your (${order.productName}) order (${order._id}) is now: ${status}.`;
    }
}