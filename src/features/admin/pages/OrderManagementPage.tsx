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
import * as adminService from "../../../services/adminService";
import type { ApiOrderData, ApiOrderStatus } from "../../../types/order";
import { format } from "date-fns";

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

const getNextStatusActions = (currentStatus: ApiOrderStatus) => {
  const actions: { label: string; status: ApiOrderStatus }[] = [];

  switch (currentStatus) {
    case "PENDING":
      actions.push({ label: "Confirm Order", status: "CONFIRMED" });
      actions.push({ label: "Cancel Order", status: "CANCELLED" });
      break;
    case "CONFIRMED":
      actions.push({ label: "Start Processing", status: "PROCESSING" });
      actions.push({ label: "Cancel Order", status: "CANCELLED" });
      break;
    case "PROCESSING":
      actions.push({ label: "Mark as Shipped", status: "SHIPPED" });
      actions.push({ label: "Cancel Order", status: "CANCELLED" });
      break;
    case "SHIPPED":
      actions.push({ label: "Mark as Delivered", status: "DELIVERED" });
      actions.push({ label: "Return/Refund", status: "RETURNED" });
      break;
    case "DELIVERED":
      actions.push({ label: "Return/Refund", status: "RETURNED" });
      break;
    case "CANCELLED":
    case "RETURNED":
      break;
  }
  return actions;
};

const ActionButtonsCell: React.FC<
  GridRenderCellParams<ApiOrderData> & {
    onStatusUpdate: (orderId: string, newStatus: ApiOrderStatus) => void;
  }
> = ({ row, onStatusUpdate }) => {
  const navigate = useNavigate();
  const nextStatusActions = getNextStatusActions(row.orderStatus);

  const handleStatusChange = (event: SelectChangeEvent<ApiOrderStatus>) => {
    const newStatus = event.target.value as ApiOrderStatus;
    if (newStatus && newStatus !== row.orderStatus) {
      onStatusUpdate(row.orderId, newStatus);
    }
  };

  const isFinalStatus = ["CANCELLED", "DELIVERED", "RETURNED"].includes(
    row.orderStatus
  );
  const isStatusUpdatable = nextStatusActions.length > 0;

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", height: "100%" }}>
      {/* Nút 1: View Details */}
      <Tooltip title="View Details">
        <IconButton
          size="small"
          onClick={() => navigate(`/profile/orders/${row.orderId}`)}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          <VisibilityOutlined fontSize="small" color="primary" />
        </IconButton>
      </Tooltip>

      {/* Nút 2: Update Status (Dùng Select để làm Dropdown) */}
      <FormControl size="small">
        <Select
          value={row.orderStatus}
          onChange={handleStatusChange}
          displayEmpty
          disabled={isFinalStatus || !isStatusUpdatable}
          sx={{
            borderRadius: "8px",
            ".MuiSelect-select": {
              p: 0.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
          renderValue={() => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CheckCircleOutline fontSize="small" color="primary" />
              <Typography variant="body2">Update Status</Typography>
            </Box>
          )}
        >
          {/* Menu Items: Chỉ hiển thị các trạng thái tiếp theo hợp lý */}
          <MenuItem disabled value={row.orderStatus}>
            Current: {getStatusChipProps(row.orderStatus).label}
          </MenuItem>
          <Divider />

          {nextStatusActions.map((action) => {
            let Icon = CheckCircleOutline;
            let color: "primary" | "error" | "warning" | "success" | "info" =
              "primary";

            if (action.status === "CANCELLED") {
              Icon = CancelOutlined;
              color = "error";
            } else if (action.status === "RETURNED") {
              Icon = ReplayOutlined;
              color = "warning";
            } else if (action.status === "DELIVERED") {
              Icon = CheckCircleOutline;
              color = "success";
            } else if (action.status === "SHIPPED") {
              Icon = LocalShippingOutlined;
              color = "info";
            } else if (
              action.status === "PROCESSING" ||
              action.status === "CONFIRMED"
            ) {
              Icon = FactCheckOutlined;
              color = "info";
            } else {
              color = "primary";
            }

            return (
              <MenuItem key={action.status} value={action.status}>
                <Icon color={color} fontSize="small" sx={{ mr: 1 }} />
                {action.label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
};

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
  { value: "totalPrice_desc", label: "Total: Cao đến Thấp" },
  { value: "totalPrice_asc", label: "Total: Thấp đến Cao" },
  { value: "id_asc", label: "ID: Tăng dần" },
  { value: "id_desc", label: "ID: Giảm dần" },
];

interface CustomToolbarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sortBy: string;
  onSortChange: (event: SelectChangeEvent<string>) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (event: SelectChangeEvent) => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
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
        placeholder="Tìm kiếm order (ID, Customer, Seller...)"
        value={searchTerm}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{
          width: { xs: "100%", sm: 300 },
        }}
      />
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={onStatusFilterChange}
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
          <Select value={sortBy} label="Sắp xếp theo" onChange={onSortChange}>
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
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const OrderManagementPage = () => {
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
      const response = await adminService.getAdminOrders(
        paginationModel.page + 1,
        paginationModel.pageSize,
        statusFilter
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
    if (paginationModel.page !== 0) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchOrders();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [
    searchTerm,
    sortBy,
    statusFilter,
    paginationModel.page,
    paginationModel.pageSize,
  ]);

  const handleActionUpdateStatus = useCallback(
    async (orderId: string, newStatus: ApiOrderStatus) => {
      try {
        const response = await adminService.updateAdminOrderStatus(
          orderId,
          newStatus
        );

        if (response.code === 200) {
          setSnackbar({
            open: true,
            message: `Order #${
              orderId.split("-")[0]
            } status updated to ${newStatus}`,
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

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const columns: GridColDef[] = [
    {
      field: "orderId",
      headerName: "Order ID (UUID)",
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
      align: "center",
      headerAlign: "center",
    },
    {
      field: "customer",
      headerName: "Customer",
      width: 150,
      valueGetter: (_value: any, row: ApiOrderData) =>
        `${row.user?.firstName || ""} ${row.user?.lastName || ""}`,
    },
    {
      field: "customerPhone",
      headerName: "Phone",
      width: 130,
      valueGetter: (_value: any, row: ApiOrderData) => row.user?.phone || "N/A",
      align: "center",
      headerAlign: "center",
    },

    {
      field: "totalPrice",
      headerName: "Total",
      width: 100,
      type: "number",
      valueFormatter: (value: number) => formatCurrency(value || 0),
    },
    {
      field: "totalItem",
      headerName: "Items",
      width: 80,
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "orderStatus",
      headerName: "Status",
      width: 150,
      type: "singleSelect",
      valueOptions: allStatuses,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<any, ApiOrderStatus>) => {
        const props = getStatusChipProps(
          (params.value as ApiOrderStatus) || "PENDING"
        );
        return <Chip {...props} size="small" variant="outlined" />;
      },
    },
    {
      field: "customActions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      width: 250,
      align: "center",
      headerAlign: "center",
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
        Order Management
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
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "background.default",
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              py: 2, // CẬP NHẬT: Tăng padding dọc
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
            "& .MuiDataGrid-cell[data-field='customerPhone']": {
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

export default OrderManagementPage;
