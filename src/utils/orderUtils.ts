import { supabase } from "@/integrations/supabase/client";
import { sendPurchaseNotification, sendDeliveryNotification } from "./emailService";

interface OrderStatusUpdate {
  orderId: string;
  status: string;
  notes?: string;
}

export const handleOrderStatusUpdate = async ({ orderId, status, notes }: OrderStatusUpdate) => {
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        products:product_id (
          title
        ),
        buyer:buyer_id (
          email,
          full_name
        ),
        seller:seller_id (
          email,
          full_name
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Send appropriate email notifications based on status
    switch (status) {
      case 'confirmed':
        // Notify seller that their product has been purchased
        await sendPurchaseNotification(
          order.seller.email,
          order.products.title,
          order.buyer.full_name
        );
        break;

      case 'out_for_delivery':
        // Notify buyer that their order is on its way
        await sendDeliveryNotification(
          order.buyer.email,
          order.products.title
        );
        break;

      case 'delivered':
        // Notify buyer that their order has been delivered
        await sendDeliveryNotification(
          order.buyer.email,
          order.products.title,
          'Your order has been delivered!'
        );
        break;
    }

    return true;
  } catch (error) {
    console.error('Error handling order status update:', error);
    return false;
  }
}; 