
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

// Sample data - in a real app, this would come from Supabase
const data = [
  { name: 'Electronics', views: 4000, likes: 240, messages: 180 },
  { name: 'Clothing', views: 3000, likes: 138, messages: 70 },
  { name: 'Home', views: 2000, likes: 98, messages: 48 },
  { name: 'Sports', views: 2780, likes: 98, messages: 40 },
  { name: 'Collectibles', views: 1890, likes: 80, messages: 38 },
];

export const ProductsMetrics = () => {
  return (
    <div className="h-full w-full">
      <ChartContainer
        config={{
          views: {
            label: "Views",
            color: "#4338CA" // indigo-700
          },
          likes: {
            label: "Likes",
            color: "#EC4899" // pink-500
          },
          messages: {
            label: "Messages",
            color: "#10B981" // emerald-500
          }
        }}
      >
        <BarChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}> {/* Reduced margins */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }} {/* Set smaller font size */}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }} {/* Set smaller font size */}
          />
          <Tooltip />
          <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} /> {/* Reduced icon size and font size */}
          <Bar dataKey="views" fill="#4338CA" radius={[4, 4, 0, 0]} />
          <Bar dataKey="likes" fill="#EC4899" radius={[4, 4, 0, 0]} />
          <Bar dataKey="messages" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
