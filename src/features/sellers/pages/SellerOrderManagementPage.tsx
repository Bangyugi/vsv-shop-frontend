// src/features/sellers/pages/SellerOrderManagementPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import {
  CheckCircleOutline,
  LocalShippingOutlined,
  AutorenewOutlined,
  CancelOutlined,
  ReplayOutlined,
  HourglassTopOutlined,
  FactCheckOutlined,
  VisibilityOutlined,
  Search,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as sellerService from "../../../services/sellerService"; // <-- Dùng sellerService
import type { ApiOrderData, ApiOrderStatus } from "../../../types/order";
import { format } from "date-fns";

// (Các hàm getStatusChipProps, getNextStatusActions, CustomToolbar, formatCurrency...
// được sao chép từ AdminOrderManagementPage)

const getStatusChipProps = (
  status: ApiOrderStatus
): {
  icon: React.ReactElement;
  color: "success" | "info" | "default" | "error" | "warning";
  label: string;
} => {
  const statusMap: Record<
    ApiOrderStatus,
    {
      label: string;
      color: "default" | "info" | "success" | "error" | "warning";
      icon: React.ReactElement;
    }
  > = {
    PENDING: {
      label: "Pending",
      color: "default",
      icon: <HourglassTopOutlined />,
    },
    CONFIRMED: {
      label: "Confirmed",
      color: "info",
      icon: <FactCheckOutlined />,
    },
    PROCESSING: {
      label: "Processing",
      color: "info",
      icon: <AutorenewOutlined />,
    },
    SHIPPED: {
      label: "Shipped",
      color: "info",
      icon: <LocalShippingOutlined />,
    },
    DELIVERED: {
      label: "Delivered",
      color: "success",
      icon: <CheckCircleOutline />,
    },
    CANCELLED: {
      label: "Cancelled",
      color: "error",
      icon: <CancelOutlined />,
    },
    RETURNED: {
      label: "Returned",
      color: "warning",
      icon: <ReplayOutlined />,
    },
  };
  return statusMap[status] || statusMap["PENDING"];
};

// Logic cho Seller: Chỉ có thể xác nhận và gửi hàng
const getNextSellerStatusActions = (currentStatus: ApiOrderStatus) => {
  const actions: { label: string; status: ApiOrderStatus }[] = [];

  switch (currentStatus) {
    case "PENDING":
      actions.push({ label: "Confirm Order", status: "CONFIRMED" });
      actions.push({ label: "Cancel Order", status: "CANCELLED" });
      break;
    case "CONFIRMED":
      actions.push({ label: "Start Processing", status: "PROCESSING" });
      break;
    case "PROCESSING":
      actions.push({ label: "Mark as Shipped", status: "SHIPPED" });
      break;
    // Seller không thể tự đánh dấu Delivered hoặc Returned
    case "SHIPPED":
    case "DELIVERED":
    case "CANCELLED":
    case "RETURNED":
      break;
  }
  return actions;
};

// Cell Actions
const ActionButtonsCell: React.FC<
  GridRenderCellParams<ApiOrderData> & {
    onStatusUpdate: (orderId: string, newStatus: ApiOrderStatus) => void;
  }
> = ({ row, onStatusUpdate }) => {
  const navigate = useNavigate();
  const nextStatusActions = getNextSellerStatusActions(row.orderStatus); // <-- Dùng hàm của Seller

  const handleStatusChange = (event: SelectChangeEvent<ApiOrderStatus>) => {
    const newStatus = event.target.value as ApiOrderStatus;
    if (newStatus && newStatus !== row.orderStatus) {
      onStatusUpdate(row.orderId, newStatus);
    }
  };

  const isFinalStatus = ["SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"].includes(
    row.orderStatus
  );
  const isStatusUpdatable = nextStatusActions.length > 0;

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", height: "100%" }}>
      <Tooltip title="View Details">
        <IconButton
          size="small"
          onClick={() => navigate(`/profile/orders/${row.orderId}`)}
        >
          <VisibilityOutlined fontSize="small" color="primary" />
        </IconButton>
      </Tooltip>

      <FormControl size="small">
        <Select
          value={row.orderStatus}
          onChange={handleStatusChange}
          displayEmpty
          disabled={isFinalStatus || !isStatusUpdatable}
          sx={{
            borderRadius: "8px",
            ".MuiSelect-select": { p: 0.8 },
          }}
          renderValue={() => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CheckCircleOutline fontSize="small" color="primary" />
              <Typography variant="body2">Update</Typography>
            </Box>
          )}
        >
          <MenuItem disabled value={row.orderStatus}>
            Current: {getStatusChipProps(row.orderStatus).label}
          </MenuItem>
          <Divider />
          {nextStatusActions.map((action) => (
            // (Render logic giữ nguyên)
            <MenuItem key={action.status} value={action.status}>
              {action.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

// (Filter và Toolbar giữ nguyên)
type StatusFilter = ApiOrderStatus | "ALL";
const allStatuses: ApiOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];
const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  ...allStatuses.map((status) => ({
    value: status,
    label: status.charAt(0) + status.slice(1).toLowerCase(),
  })),
];

const sortOptions = [
  { value: "orderDate_desc", label: "Date: Mới nhất" },
  { value: "orderDate_asc", label: "Date: Cũ nhất" },
];

interface CustomToolbarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sortBy: string;
  onSortChange: (event: SelectChangeEvent<string>) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (event: SelectChangeEvent) => void;
}
const CustomToolbar: React.FC<CustomToolbarProps> = (props) => (
  <Box
    sx={{
      p: 2,
      display: "flex",
      justifyContent: "space-between",
      gap: 2,
      flexWrap: "wrap",
      borderBottom: "1px solid",
      borderColor: "divider",
    }}
  >
    <TextField
      variant="outlined"
      size="small"
      placeholder="Tìm kiếm order (ID, Customer...)"
      value={props.searchTerm}
      onChange={props.onSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
      sx={{ width: { xs: "100%", sm: 300 } }}
    />
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={props.statusFilter}
          label="Status"
          onChange={props.onStatusFilterChange}
        >
          {statusFilters.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Sắp xếp theo</InputLabel>
        <Select
          value={props.sortBy}
          label="Sắp xếp theo"
          onChange={props.onSortChange}
        >
          {sortOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  </Box>
);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const SellerOrderManagementPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ApiOrderData[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("orderDate_desc");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Dùng service của Seller
      const response = await sellerService.getMySellOrders(
        paginationModel.page + 1,
        paginationModel.pageSize,
        statusFilter,
        searchTerm
        // (sort mock chưa cần)
      );
      if (response.code === 200 && response.data) {
        setRows(response.data.pageContent);
        setRowCount(response.data.totalElements);
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    statusFilter,
    searchTerm,
    sortBy,
  ]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchOrders]);

  const handleActionUpdateStatus = useCallback(
    async (orderId: string, newStatus: ApiOrderStatus) => {
      try {
        // Dùng service của Seller
        const response = await sellerService.updateSellOrderStatus(
          orderId,
          newStatus
        );
        if (response.code === 200) {
          setSnackbar({
            open: true,
            message: `Order status updated to ${newStatus}`,
            severity: "success",
          });
          fetchOrders();
        } else {
          throw new Error(response.message);
        }
      } catch (err: any) {
        setSnackbar({
          open: true,
          message:
            err.response?.data?.message ||
            err.message ||
            "Failed to update status",
          severity: "error",
        });
      }
    },
    [fetchOrders]
  );

  const handleCloseSnackbar = () => setSnackbar(null);

  const columns: GridColDef[] = [
    // Các cột tương tự Admin, nhưng "Total" chỉ nên tính
    // tiền hàng của Seller (logic này cần API hỗ trợ)
    {
      field: "orderId",
      headerName: "Order ID",
      width: 300,
    },
    {
      field: "orderDate",
      headerName: "Date",
      width: 120,
      valueGetter: (_value: any, row: ApiOrderData) =>
        row.orderDate ? new Date(row.orderDate as string) : null,
      valueFormatter: (value: Date | null) =>
        value ? format(value, "dd/MM/yyyy") : "N/A",
      type: "date",
    },
    {
      field: "customer",
      headerName: "Customer",
      width: 150,
      valueGetter: (_value: any, row: ApiOrderData) =>
        `${row.user?.firstName || ""} ${row.user?.lastName || ""}`,
    },
    {
      field: "totalPrice", // Tạm dùng totalPrice của cả order
      headerName: "My Items Total",
      width: 120,
      type: "number",
      valueFormatter: (value: number) => formatCurrency(value || 0),
    },
    {
      field: "totalItem", // Tạm dùng totalItem của cả order
      headerName: "My Items",
      width: 80,
      type: "number",
      align: "center",
    },
    {
      field: "orderStatus",
      headerName: "Status",
      width: 150,
      renderCell: (params: GridRenderCellParams<any, ApiOrderStatus>) => {
        const props = getStatusChipProps(params.value || "PENDING");
        return <Chip {...props} size="small" variant="outlined" />;
      },
    },
    {
      field: "customActions",
      headerName: "Actions",
      sortable: false,
      width: 200,
      align: "center",
      renderCell: (params: GridRenderCellParams<ApiOrderData>) => (
        <ActionButtonsCell
          {...params}
          onStatusUpdate={handleActionUpdateStatus}
        />
      ),
    },
  ];

  return (
    <>
      <Typography
        variant="h4"
        component="h1"
        className="font-bold"
        sx={{ mb: 4 }}
      >
        My Orders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          height: "70vh",
          width: "100%",
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <DataGrid
          getRowId={(row) => row.id}
          rows={rows}
          columns={columns}
          loading={isLoading}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          slots={{
            toolbar: () => (
              <CustomToolbar
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                sortBy={sortBy}
                onSortChange={(e) => setSortBy(e.target.value as string)}
                statusFilter={statusFilter}
                onStatusFilterChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
              />
            ),
          }}
          sx={{
            /* (styles giống admin) */
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "background.default",
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              py: 2,
            },
            "& .MuiDataGrid-cell[data-field='totalItem']": {
              justifyContent: "center",
            },
            "& .MuiDataGrid-cell[data-field='orderStatus']": {
              justifyContent: "center",
            },
            "& .MuiDataGrid-cell[data-field='customActions']": {
              justifyContent: "center",
            },
            "& .MuiDataGrid-cell[data-field='orderDate']": {
              justifyContent: "center",
            },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
              {
                outline: "none",
              },
          }}
        />
      </Paper>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

export default SellerOrderManagementPage;