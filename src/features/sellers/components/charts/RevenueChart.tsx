import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockRevenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
];

const RevenueChart: React.FC = () => {
  const formatYAxis = (tick: number) => `$${tick / 1000}M`;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "12px",
        height: 400,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="h6" className="font-bold" sx={{ mb: 3 }}>
        Revenue Analytics (Last 6 Months)
      </Typography>
      <Box sx={{ width: "100%", height: 320 }}>
        {/* Sử dụng Recharts để tạo biểu đồ đơn giản */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockRevenueData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#eee"
            />
            <XAxis dataKey="month" stroke="#757575" />
            <YAxis tickFormatter={formatYAxis} stroke="#757575" />
            <Tooltip
              formatter={(value: number) => [
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(value),
                "Revenue",
              ]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#00bfa6"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default RevenueChart;
