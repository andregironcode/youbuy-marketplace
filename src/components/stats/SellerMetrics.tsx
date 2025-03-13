
import { 
  ChartContainer 
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

// Sample data - in a real app, this would come from Supabase
const data = [
  { name: 'Available', value: 8 },
  { name: 'Sold', value: 12 },
  { name: 'Reserved', value: 3 },
];

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B'];

export const SellerMetrics = () => {
  // Calculate total and average rating
  const totalProducts = data.reduce((acc, curr) => acc + curr.value, 0);
  const averageRating = 4.8; // This would be calculated from real data

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Total Products</span>
          <span className="font-bold">{totalProducts}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Average Rating</span>
          <div className="flex items-center">
            <span className="font-bold mr-1">{averageRating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-muted'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Response Rate</span>
          <span className="font-bold">98%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Avg. Response Time</span>
          <span className="font-bold">1.2 hours</span>
        </div>
      </div>

      <div className="h-[200px]">
        <ChartContainer
          config={{
            available: {
              label: "Available",
              color: "#22C55E" // green-500
            },
            sold: {
              label: "Sold",
              color: "#3B82F6" // blue-500
            },
            reserved: {
              label: "Reserved",
              color: "#F59E0B" // amber-500
            }
          }}
        >
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
};
