import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  type SelectChangeEvent,
  Stack,
  Tooltip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridPaginationModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  AdminPanelSettingsOutlined,
  PersonOutline,
  StorefrontOutlined,
  CheckCircleOutline,
  HighlightOffOutlined,
  Search,
  DeleteOutline,
  VisibilityOutlined,
} from "@mui/icons-material";
import * as adminService from "../../../services/adminService";
import type { UserData, UserRole } from "../../../types/auth";

import UserDetailDialog from "../components/UserDetailDialog";

const sortOptions = [
  { value: "id_asc", label: "ID: Tăng dần" },
  { value: "id_desc", label: "ID: Giảm dần" },
  { value: "username_asc", label: "Username: A-Z" },
  { value: "username_desc", label: "Username: Z-A" },
  { value: "email_asc", label: "Email: A-Z" },
  { value: "email_desc", label: "Email: Z-A" },
];

interface CustomToolbarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sortBy: string;
  onSortChange: (event: SelectChangeEvent<string>) => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <TextField
        variant="outlined"
        size="small"
        placeholder="Tìm kiếm user (username, email, tên...)"
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
          width: { xs: "100%", sm: 400 },
        }}
      />
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
  );
};

const UserManagementPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<UserData[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("id_asc");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [viewUserOpen, setViewUserOpen] = useState(false);
  const [userToView, setUserToView] = useState<UserData | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [sortField, sortDirection] = sortBy.split("_");
    try {
      const response = await adminService.getUsers(
        paginationModel.page + 1,
        paginationModel.pageSize,
        searchTerm || undefined,
        sortField || "id",
        (sortDirection?.toUpperCase() as "ASC" | "DESC") || "ASC"
      );
      if (response.code === 200 && response.data) {
        setRows(response.data.pageContent);
        setRowCount(response.data.totalElements);
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [paginationModel, searchTerm, sortBy]);

  useEffect(() => {
    if (paginationModel.page !== 0) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchUsers();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, sortBy, paginationModel.page, paginationModel.pageSize]);

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const handleOpenDelete = (user: UserData) => {
    setUserToDelete(user);
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteError(null);
    try {
      await adminService.deleteUser(userToDelete.id);
      setSnackbar({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });
      fetchUsers();
      handleCloseDelete();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete");
    }
  };

  const handleOpenView = async (user: UserData) => {
    setViewUserOpen(true);
    setViewLoading(true);
    setUserToView(null);
    try {
      const response = await adminService.getUserById(user.id);
      if (response.code === 200 && response.data) {
        setUserToView(response.data);
      } else {
        throw new Error(response.message || "User not found");
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to fetch user details",
        severity: "error",
      });
      handleCloseView();
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseView = () => {
    setViewUserOpen(false);
    setUserToView(null);
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "avatar",
      headerName: "Avatar",
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Avatar src={params.value} alt={params.row.username} />
      ),
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "username",
      headerName: "Username",
      width: 160,
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    {
      field: "fullName",
      headerName: "Full Name",
      width: 200,
      valueGetter: (_value: any, row: UserData) =>
        `${row.firstName || ""} ${row.lastName || ""}`,
    },
    {
      field: "enabled",
      headerName: "Status",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<any, boolean>) =>
        params.value ? (
          <Chip
            icon={<CheckCircleOutline />}
            label="Active"
            color="success"
            size="small"
            variant="outlined"
          />
        ) : (
          <Chip
            icon={<HighlightOffOutlined />}
            label="Disabled"
            color="error"
            size="small"
            variant="outlined"
          />
        ),
    },
    {
      field: "roles",
      headerName: "Roles",
      width: 280,
      sortable: false,
      filterable: false,
      align: "left",
      headerAlign: "left",
      renderCell: (params: GridRenderCellParams<any, UserRole[]>) => {
        const roles = params.value;
        if (!roles || roles.length === 0) {
          return (
            <Chip
              icon={<PersonOutline />}
              label="User"
              color="info"
              size="small"
              variant="outlined"
            />
          );
        }
        const sortedRoles = [...roles].sort((a, b) => {
          const order: Record<string, number> = {
            ROLE_SUPERADMIN: 1,
            ROLE_ADMIN: 2,
            ROLE_SELLER: 3,
            ROLE_USER: 4,
          };
          const aOrder = order[a.name] || 99;
          const bOrder = order[b.name] || 99;
          return aOrder - bOrder;
        });
        return (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",

              alignItems: "center",
            }}
          >
            {sortedRoles.map((role) => {
              let icon,
                color:
                  | "default"
                  | "primary"
                  | "secondary"
                  | "error"
                  | "info"
                  | "success"
                  | "warning" = "default",
                label = role.name.replace("ROLE_", "");
              if (role.name === "ROLE_SUPERADMIN") {
                icon = <AdminPanelSettingsOutlined />;
                color = "error";
              } else if (role.name === "ROLE_ADMIN") {
                icon = <AdminPanelSettingsOutlined />;
                color = "warning";
              } else if (role.name === "ROLE_SELLER") {
                icon = <StorefrontOutlined />;
                color = "secondary";
              } else if (role.name === "ROLE_USER") {
                icon = <PersonOutline />;
                color = "info";
              }
              return (
                <Tooltip title={role.description} key={role.id}>
                  <Chip
                    icon={icon}
                    label={label}
                    color={color}
                    size="small"
                    variant="filled"
                  />
                </Tooltip>
              );
            })}
          </Stack>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 100,
      align: "center",
      headerAlign: "center",
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="View Details">
              <VisibilityOutlined />
            </Tooltip>
          }
          label="View"
          onClick={() => handleOpenView(params.row as UserData)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete User">
              <DeleteOutline color="error" />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleOpenDelete(params.row as UserData)}
        />,
      ],
    },
  ];

  return (
    <>
      {/* (Tiêu đề, Alert, Paper giữ nguyên) */}
      <Typography
        variant="h4"
        component="h1"
        className="font-bold"
        sx={{ mb: 4 }}
      >
        User Management
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
          rows={rows}
          columns={columns}
          loading={isLoading}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20, 50]}
          slots={{
            toolbar: () => (
              <CustomToolbar
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                sortBy={sortBy}
                onSortChange={(e) => setSortBy(e.target.value as string)}
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
            "& .MuiDataGrid-cell[data-field='avatar']": {
              justifyContent: "center",
            },
            "& .MuiDataGrid-cell[data-field='enabled']": {
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

      {/* (Dialog Xóa giữ nguyên) */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the user "
            <strong>{userToDelete?.username}</strong>"?
          </DialogContentText>
          <DialogContentText
            sx={{ color: "error.main", fontWeight: "bold", mt: 1 }}
          >
            This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- THAY THẾ DIALOG XEM BẰNG COMPONENT MỚI --- */}
      <UserDetailDialog
        open={viewUserOpen}
        onClose={handleCloseView}
        user={userToView}
        isLoading={viewLoading}
      />
      {/* --- KẾT THÚC THAY THẾ --- */}

      {/* (Snackbar giữ nguyên) */}
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

export default UserManagementPage;
