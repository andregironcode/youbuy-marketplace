import { supabase } from "@/integrations/supabase/client";
import { NotificationType } from "@/types/notification";

/**
 * Send a notification to a user
 */
export const sendNotification = async ({
  userId,
  type,
  title,
  message,
  actionUrl,
  metadata = {}
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        description: message, // Database field is 'description'
        read: false,
        action_url: actionUrl,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending notification:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
};

/**
 * Send a notification when someone buys a user's product
 */
export const notifyProductPurchased = async ({
  sellerId,
  buyerName,
  productId,
  productTitle,
  productImage,
  productPrice
}: {
  sellerId: string;
  buyerName: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  productPrice: string;
}) => {
  return sendNotification({
    userId: sellerId,
    type: "product_purchased",
    title: "Your item has been purchased!",
    message: `${buyerName} has purchased your item "${productTitle}" for ${productPrice}.`,
    actionUrl: `/profile/sales`,
    metadata: {
      product_id: productId,
      image_url: productImage,
      price: productPrice
    }
  });
};

/**
 * Send a notification when someone favorites a user's product
 */
export const notifyProductFavorited = async ({
  sellerId,
  buyerName,
  productId,
  productTitle,
  productImage
}: {
  sellerId: string;
  buyerName: string;
  productId: string;
  productTitle: string;
  productImage?: string;
}) => {
  return sendNotification({
    userId: sellerId,
    type: "product_favorited",
    title: "Someone favorited your item",
    message: `${buyerName} added "${productTitle}" to their favorites.`,
    actionUrl: `/product/${productId}`,
    metadata: {
      product_id: productId,
      image_url: productImage
    }
  });
};

/**
 * Send a notification when a favorite seller posts a new product
 */
export const notifySellerNewProduct = async ({
  sellerId,
  sellerName,
  followerIds,
  productId,
  productTitle,
  productImage,
  productPrice
}: {
  sellerId: string;
  sellerName: string;
  followerIds: string[];
  productId: string;
  productTitle: string;
  productImage?: string;
  productPrice: string;
}) => {
  const promises = followerIds.map(followerId =>
    sendNotification({
      userId: followerId,
      type: "seller_new_product",
      title: "New item from a seller you follow",
      message: `${sellerName} just listed a new item: "${productTitle}" for ${productPrice}.`,
      actionUrl: `/product/${productId}`,
      metadata: {
        product_id: productId,
        seller_id: sellerId,
        image_url: productImage,
        price: productPrice
      }
    })
  );

  return Promise.all(promises);
};

/**
 * Send a notification when a product is sold
 */
export const notifyProductSold = async ({
  buyerId,
  sellerName,
  productId,
  productTitle,
  productImage,
  productPrice
}: {
  buyerId: string;
  sellerName: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  productPrice: string;
}) => {
  return sendNotification({
    userId: buyerId,
    type: "product_sold",
    title: "Your purchase is confirmed",
    message: `Your purchase of "${productTitle}" from ${sellerName} for ${productPrice} has been confirmed.`,
    actionUrl: `/profile/purchases`,
    metadata: {
      product_id: productId,
      image_url: productImage,
      price: productPrice
    }
  });
};

/**
 * Send a notification when a product is reserved
 */
export const notifyProductReserved = async ({
  sellerId,
  buyerName,
  productId,
  productTitle,
  productImage
}: {
  sellerId: string;
  buyerName: string;
  productId: string;
  productTitle: string;
  productImage?: string;
}) => {
  return sendNotification({
    userId: sellerId,
    type: "product_reserved",
    title: "Your item has been reserved",
    message: `${buyerName} has reserved your item "${productTitle}".`,
    actionUrl: `/product/${productId}`,
    metadata: {
      product_id: productId,
      image_url: productImage
    }
  });
};

/**
 * Send a system message to a user
 */
export const sendSystemNotification = async ({
  userId,
  title,
  message,
  actionUrl
}: {
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
}) => {
  return sendNotification({
    userId,
    type: "system_message",
    title,
    message,
    actionUrl
  });
};

/**
 * Send a system message to multiple users
 */
export const sendBulkSystemNotification = async ({
  userIds,
  title,
  message,
  actionUrl
}: {
  userIds: string[];
  title: string;
  message: string;
  actionUrl?: string;
}) => {
  const notifications = userIds.map(userId => ({
    user_id: userId,
    type: "system_message" as NotificationType,
    title,
    description: message,
    read: false,
    action_url: actionUrl
  }));

  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notifications);

    if (error) {
      console.error("Error sending bulk notifications:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    return false;
  }
}; 