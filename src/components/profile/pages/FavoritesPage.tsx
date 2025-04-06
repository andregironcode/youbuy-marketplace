import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FavoriteProductsTab } from "@/components/favorites/FavoriteProductsTab";
import { FavoriteSellersTab } from "@/components/favorites/FavoriteSellersTab";
import { Heart, User } from "lucide-react";

export const FavoritesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Favorites</h1>
        <p className="text-muted-foreground">
          All your saved items and favorite sellers in one place.
        </p>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="products" className="flex items-center flex-1">
            <Heart className="mr-2 h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="sellers" className="flex items-center flex-1">
            <User className="mr-2 h-4 w-4" />
            Sellers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <FavoriteProductsTab />
        </TabsContent>

        <TabsContent value="sellers">
          <FavoriteSellersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 