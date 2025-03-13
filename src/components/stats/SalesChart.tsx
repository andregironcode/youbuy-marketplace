
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip 
} from "recharts";

// Sample data - in a real app, this would come from Supabase
const data = [
  { month: 'Jan', sales: 1200, views: 2400 },
  { month: 'Feb', sales: 1900, views: 3600 },
  { month: 'Mar', sales: 800, views: 1400 },
  { month: 'Apr', sales: 1600, views: 2800 },
  { month: 'May', sales: 2400, views: 4000 },
  { month: 'Jun', sales: 1800, views: 3100 },
];

export const SalesChart = () => {
  return (
    <div className="h-full w-full">
      <ChartContainer
        config={{
          sales: {
            label: "Sales ($)",
            color: "#1E40AF" // blue-700
          },
          views: {
            label: "Views",
            color: "#60A5FA" // blue-400
          }
        }}
      >
        <AreaChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            tickLine={false}
            axisLine={false}
            padding={{ left: 5, right: 5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            padding={{ top: 5, bottom: 0 }}
            tick={{ fontSize: 12 }}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke="#1E40AF" 
            fillOpacity={1} 
            fill="url(#colorSales)" 
          />
          <Area 
            type="monotone" 
            dataKey="views" 
            stroke="#60A5FA" 
            fillOpacity={1} 
            fill="url(#colorViews)" 
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-2 text-xs">
        <p className="font-medium">{label}</p>
        <p className="text-blue-700">Sales: ${payload[0].value}</p>
        <p className="text-blue-400">Views: {payload[1].value}</p>
      </div>
    );
  }

  return null;
};
