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
import type { RevenueAnalyticsItem } from "../../../../types/seller";

interface RevenueChartProps {
  data: RevenueAnalyticsItem[];
  isLoading?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading }) => {
  const formatYAxis = (tick: number) => {
    if (tick >= 1000000) return `$${(tick / 1000000).toFixed(1)}M`;
    if (tick >= 1000) return `$${(tick / 1000).toFixed(0)}k`;
    return `$${tick}`;
  };

  const hasData = data && data.length > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "12px",
        height: 400,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" className="font-bold" sx={{ mb: 3 }}>
        Revenue Analytics (Last 6 Months)
      </Typography>
      
      {isLoading ? (
        <Box 
          sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Typography color="text.secondary">Loading chart...</Typography>
        </Box>
      ) : !hasData ? (
        <Box 
          sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: 320, flexGrow: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eee"
              />
              <XAxis 
                dataKey="month" 
                stroke="#757575" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatYAxis} 
                stroke="#757575" 
                tick={{ fontSize: 12 }}
                width={40}
              />
              <Tooltip
                formatter={(value: number) => [
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                  }).format(value),
                  "Revenue",
                ]}
                contentStyle={{ 
                  borderRadius: "8px", 
                  border: "none", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#00bfa6"
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0 }}
                dot={{ r: 3, strokeWidth: 0, fill: "#00bfa6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default RevenueChart;