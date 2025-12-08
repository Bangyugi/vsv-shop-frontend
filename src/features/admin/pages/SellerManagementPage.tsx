import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridPaginationModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  CheckCircleOutline,
  HighlightOffOutlined,
  HourglassEmptyOutlined,
  BlockOutlined,
  CheckCircle,
  Cancel,
  Search,
  VisibilityOutlined,
  DoDisturbOnOutlined,
  StorefrontOutlined,
} from "@mui/icons-material";
import * as adminService from "../../../services/adminService";
import type { ApiSellerData, SellerStatus } from "../../../types/seller";

import SellerDetailDialog from "../components/SellerDetailDialog";

// CẬP NHẬT: Mapping status mới sang UI
const getStatusChipProps = (
  status: SellerStatus
): {
  icon: React.ReactElement;
  color: "success" | "error" | "default" | "warning" | "info";
  label: string;
} => {
  switch (status) {
    case "ACTIVE":
      return {
        icon: <CheckCircleOutline />,
        color: "success",
        label: "Active",
      };
    case "PENDING_VERIFICATION":
      return {
        icon: <HourglassEmptyOutlined />,
        color: "warning", // Màu vàng cho trạng thái chờ
        label: "Pending Verification",
      };
    case "BANNED":
      return {
        icon: <BlockOutlined />,
        color: "error",
        label: "Banned",
      };
    case "DEACTIVATED":
      return {
        icon: <DoDisturbOnOutlined />,
        color: "default",
        label: "Deactivated",
      };
    case "CLOSED":
      return {
        icon: <StorefrontOutlined />,
        color: "default",
        label: "Closed",
      };
    case "REJECTED":
      return {
        icon: <HighlightOffOutlined />,
        color: "error",
        label: "Rejected",
      };
    default:
      return {
        icon: <HourglassEmptyOutlined />,
        color: "default",
        label: status,
      };
  }
};

type StatusFilter = SellerStatus | "ALL";

// CẬP NHẬT: Danh sách filter mới
const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING_VERIFICATION", label: "Pending Verification" },
  { value: "ACTIVE", label: "Active" },
  { value: "BANNED", label: "Banned" },
  { value: "DEACTIVATED", label: "Deactivated" },
];

const sortOptions = [
  { value: "id_asc", label: "ID: Tăng dần" },
  { value: "id_desc", label: "ID: Giảm dần" },
  { value: "businessName_asc", label: "Tên Shop: A-Z" },
  { value: "businessName_desc", label: "Tên Shop: Z-A" },
  { value: "createdAt_asc", label: "Ngày đăng ký: Cũ nhất" },
  { value: "createdAt_desc", label: "Ngày đăng ký: Mới nhất" },
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
        placeholder="Tìm kiếm seller (tên, email...)"
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
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

const SellerManagementPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ApiSellerData[]>([]);
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
  const [sortBy, setSortBy] = useState("id_asc");

  const [viewSellerOpen, setViewSellerOpen] = useState(false);
  const [sellerToView, setSellerToView] = useState<ApiSellerData | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchSellers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [sortField, sortDirection] = sortBy.split("_");
    const keyword = searchTerm || undefined;

    try {
      let response;

      // Nếu filter là PENDING_VERIFICATION, dùng API chuyên biệt mới
      if (statusFilter === "PENDING_VERIFICATION") {
        response = await adminService.getPendingSellers(
          paginationModel.page + 1,
          paginationModel.pageSize,
          sortField,
          sortDirection as "ASC" | "DESC"
        );
      } else {
        // Ngược lại dùng API chung (backend sẽ lọc theo status param)
        const apiStatus = statusFilter === "ALL" ? undefined : statusFilter;
        response = await adminService.getSellers(
          paginationModel.page + 1,
          paginationModel.pageSize,
          apiStatus,
          keyword,
          sortField,
          sortDirection as "ASC" | "DESC"
        );
      }

      if (response.code === 200 && response.data) {
        setRows(response.data.pageContent);
        setRowCount(response.data.totalElements);
      } else {
        throw new Error(response.message || "Failed to fetch sellers");
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
        fetchSellers();
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

  const handleUpdateStatus = async (
    sellerUserId: number,
    newStatus: SellerStatus
  ) => {
    try {
      const response = await adminService.updateSellerStatus(
        sellerUserId,
        newStatus
      );
      if (response.code === 200) {
        setSnackbar({
          open: true,
          message: `Seller status updated to ${newStatus}`,
          severity: "success",
        });
        fetchSellers();
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
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const handleOpenView = async (seller: ApiSellerData) => {
    setViewSellerOpen(true);
    setViewLoading(true);
    setSellerToView(null);
    try {
      const response = await adminService.getSellerById(seller.user.id);
      if (response.code === 200 && response.data) {
        setSellerToView(response.data);
      } else {
        throw new Error(response.message || "Seller not found");
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to fetch seller details",
        severity: "error",
      });
      handleCloseView();
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseView = () => {
    setViewSellerOpen(false);
    setSellerToView(null);
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 60,
      valueGetter: (_value: any, row: ApiSellerData) => row.user.id,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "businessName",
      headerName: "Business Name",
      width: 200,
      valueGetter: (_value: any, row: ApiSellerData) =>
        row.businessDetails.businessName,
    },
    {
      field: "owner",
      headerName: "Owner",
      width: 180,
      valueGetter: (_value: any, row: ApiSellerData) =>
        `${row.user.firstName} ${row.user.lastName}`,
    },
    {
      field: "email",
      headerName: "Email",
      width: 220,
      valueGetter: (_value: any, row: ApiSellerData) => row.user.email,
    },
    {
      field: "accountStatus",
      headerName: "Status",
      width: 180,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<any, SellerStatus>) => {
        const props = getStatusChipProps(
          params.value || "PENDING_VERIFICATION"
        );
        return <Chip {...props} size="small" variant="outlined" />;
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 150,
      align: "center",
      headerAlign: "center",
      getActions: (params) => {
        const { row } = params;
        const actions = [];

        actions.push(
          <GridActionsCellItem
            icon={
              <Tooltip title="View Details">
                <VisibilityOutlined />
              </Tooltip>
            }
            label="View"
            onClick={() => handleOpenView(row as ApiSellerData)}
          />
        );

        // CẬP NHẬT: Logic hiển thị nút theo status mới
        if (row.accountStatus === "PENDING_VERIFICATION") {
          actions.push(
            <GridActionsCellItem
              icon={
                <Tooltip title="Approve (Activate)">
                  <CheckCircle color="success" />
                </Tooltip>
              }
              label="Approve"
              onClick={() => handleUpdateStatus(row.user.id, "ACTIVE")}
            />
          );
          actions.push(
            <GridActionsCellItem
              icon={
                <Tooltip title="Reject (Ban)">
                  <Cancel color="error" />
                </Tooltip>
              }
              label="Reject"
              onClick={() => handleUpdateStatus(row.user.id, "BANNED")} // Hoặc REJECTED tùy backend mapping
            />
          );
        } else if (row.accountStatus === "ACTIVE") {
          actions.push(
            <GridActionsCellItem
              icon={
                <Tooltip title="Ban / Deactivate">
                  <BlockOutlined color="error" />
                </Tooltip>
              }
              label="Ban"
              onClick={() => handleUpdateStatus(row.user.id, "BANNED")}
            />
          );
        } else if (
          row.accountStatus === "BANNED" ||
          row.accountStatus === "DEACTIVATED"
        ) {
          actions.push(
            <GridActionsCellItem
              icon={
                <Tooltip title="Re-activate">
                  <CheckCircleOutline color="success" />
                </Tooltip>
              }
              label="Re-activate"
              onClick={() => handleUpdateStatus(row.user.id, "ACTIVE")}
            />
          );
        }

        return actions;
      },
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
        Seller Management
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
          getRowId={(row: ApiSellerData) => row.user.id}
          rows={rows}
          columns={columns}
          loading={isLoading}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20]}
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
              py: 2,
            },
            "& .MuiDataGrid-cell[data-field='id']": {
              justifyContent: "center",
            },
            "& .MuiDataGrid-cell[data-field='accountStatus']": {
              justifyContent: "center",
            },
            "& .MuiDataGrid-cell[data-field='actions']": {
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

      <SellerDetailDialog
        open={viewSellerOpen}
        onClose={handleCloseView}
        seller={sellerToView}
        isLoading={viewLoading}
      />

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

export default SellerManagementPage;
