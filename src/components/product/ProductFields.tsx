
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductFieldsProps {
  category: string;
  subcategory?: string;
  subSubcategory?: string;
}

export const ProductFields = ({ 
  category, 
  subcategory,
  subSubcategory 
}: ProductFieldsProps) => {
  // Electronics fields
  if (category === "electronics") {
    if (subcategory === "televisions") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" placeholder="e.g., Samsung, LG, Sony" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="screenSize">Screen Size (inches)</Label>
            <Input id="screenSize" type="number" placeholder="e.g., 55" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select>
              <SelectTrigger id="resolution">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hd">HD (720p)</SelectItem>
                <SelectItem value="fullhd">Full HD (1080p)</SelectItem>
                <SelectItem value="4k">4K Ultra HD</SelectItem>
                <SelectItem value="8k">8K</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select>
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New (never used)</SelectItem>
                <SelectItem value="like-new">Like New</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="salvage">For parts or not working</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smartTv">Smart TV Features</Label>
            <Select>
              <SelectTrigger id="smartTv">
                <SelectValue placeholder="Select smart TV features" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Regular TV)</SelectItem>
                <SelectItem value="basic">Basic Smart Features</SelectItem>
                <SelectItem value="full">Full Smart TV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }
    
    // Generic electronics fields as fallback
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" placeholder="e.g., Samsung, Apple, Sony" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" placeholder="e.g., Galaxy S21, MacBook Pro" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select>
            <SelectTrigger id="condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New (never used)</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="salvage">For parts or not working</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
  
  // Mobile phones & tablets fields
  else if (category === "mobile") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" placeholder="e.g., Apple, Samsung, Google" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" placeholder="e.g., iPhone 13, Galaxy S21" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="storage">Storage Capacity</Label>
          <Select>
            <SelectTrigger id="storage">
              <SelectValue placeholder="Select storage capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16">16GB</SelectItem>
              <SelectItem value="32">32GB</SelectItem>
              <SelectItem value="64">64GB</SelectItem>
              <SelectItem value="128">128GB</SelectItem>
              <SelectItem value="256">256GB</SelectItem>
              <SelectItem value="512">512GB</SelectItem>
              <SelectItem value="1024">1TB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select>
            <SelectTrigger id="condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New (never used)</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="salvage">For parts or not working</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
  
  // Furniture fields
  else if (category === "furniture") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input id="material" placeholder="e.g., Wood, Glass, Metal" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dimensions">Dimensions (cm)</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input id="length" placeholder="Length" />
            <Input id="width" placeholder="Width" />
            <Input id="height" placeholder="Height" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select>
            <SelectTrigger id="condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New (never used)</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="salvage">For parts or not working</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
  
  // Default fields for other categories
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="condition">Condition</Label>
        <Select>
          <SelectTrigger id="condition">
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New (never used)</SelectItem>
            <SelectItem value="like-new">Like New</SelectItem>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="salvage">For parts or not working</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
