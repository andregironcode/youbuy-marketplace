
import { 
  ChartContainer 
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Sample data - in a real app, this would come from Supabase
const data = [
  { month: 'Jan', purchases: 2, amount: 340 },
  { month: 'Feb', purchases: 1, amount: 120 },
  { month: 'Mar', purchases: 3, amount: 580 },
  { month: 'Apr', purchases: 0, amount: 0 },
  { month: 'May', purchases: 2, amount: 250 },
  { month: 'Jun', purchases: 4, amount: 780 },
];

export const BuyingActivity = () => {
  // Calculate total spent and purchases
  const totalSpent = data.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPurchases = data.reduce((acc, curr) => acc + curr.purchases, 0);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases} items</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="h-[300px]">
        <ChartContainer
          config={{
            purchases: {
              label: "Purchases",
              color: "#8B5CF6" // violet-500
            },
            amount: {
              label: "Amount ($)",
              color: "#06B6D4" // cyan-500
            }
          }}
        >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="left"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="purchases" 
              stroke="#8B5CF6" 
              activeDot={{ r: 8 }} 
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="amount" 
              stroke="#06B6D4" 
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
};
