
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface DistanceFilterProps {
  onDistanceChange: (distance: number | null) => void;
}

export const DistanceFilter: React.FC<DistanceFilterProps> = ({
  onDistanceChange,
}) => {
  const [distance, setDistance] = useState<number>(10);
  const [isActive, setIsActive] = useState<boolean>(false);
  const { user } = useAuth();

  const handleDistanceChange = (value: number[]) => {
    setDistance(value[0]);
    if (isActive) {
      onDistanceChange(value[0]);
    }
  };

  const toggleFilter = () => {
    const newState = !isActive;
    setIsActive(newState);
    onDistanceChange(newState ? distance : null);
  };

  if (!user) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Distance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Sign in to filter by distance
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Distance</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Up to {distance} km</span>
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={toggleFilter}
            >
              {isActive ? "Applied" : "Apply"}
            </Button>
          </div>
          <Slider
            value={[distance]}
            onValueChange={handleDistanceChange}
            min={1}
            max={50}
            step={1}
            disabled={!isActive}
          />
        </div>
      </CardContent>
    </Card>
  );
};
