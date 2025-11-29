import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Tooltip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Add, EditOutlined, DeleteOutline } from "@mui/icons-material";
import * as adminService from "../../../services/adminService";
import type {
  ApiCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../../../types/category";
import CategoryFormDialog from "../components/CategoryFormDialog";

const CustomToolbar: React.FC = () => {
  return (
    <Box
      sx={{
        p: 1.5,
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <GridToolbarQuickFilter
        variant="outlined"
        size="small"
        sx={{ width: 300 }}
      />
    </Box>
  );
};

const CategoryManagementPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(
    null
  );

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ApiCategory | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getAdminCategories();
      if (response.code === 200 && response.data) {
        setAllCategories(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch categories");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: ApiCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleSubmitForm = async (values: CreateCategoryRequest) => {
    try {
      if (editingCategory) {
        const categoryIdToUpdate = editingCategory.id;

        const updateData: UpdateCategoryRequest = {
          name: values.name,
          parentCategoryId: values.parentCategoryId,
        };
        await adminService.updateCategory(categoryIdToUpdate, updateData);
        setSnackbar({
          open: true,
          message: "Category updated successfully",
          severity: "success",
        });
      } else {
        await adminService.createCategory(values);
        setSnackbar({
          open: true,
          message: "Category created successfully",
          severity: "success",
        });
      }
      fetchCategories();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        (editingCategory
          ? "Failed to update category"
          : "Failed to create category");
      throw new Error(errorMessage);
    }
  };

  const handleOpenDelete = (category: ApiCategory) => {
    setCategoryToDelete(category);
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteConfirmOpen(false);
    setCategoryToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleteError(null);
    try {
      await adminService.deleteCategory(categoryToDelete.id);
      setSnackbar({
        open: true,
        message: "Category deleted successfully",
        severity: "success",
      });
      fetchCategories();
      handleCloseDelete();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete";

      setDeleteError(errorMessage);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const columns: GridColDef<ApiCategory>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "name",
      headerName: "Category Name",
      width: 250,
      flex: 1,
      renderCell: (params) => (
        <Typography
          sx={{ fontWeight: params.row.level === 1 ? "bold" : "normal" }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "level",
      headerName: "Level",
      width: 100,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "parentCategory",
      headerName: "Parent Category",
      width: 200,
      valueGetter: (_value, row) => row.parentCategory?.name || "N/A (Level 1)",
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
            <Tooltip title="Edit">
              <EditOutlined />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleOpenEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete">
              <DeleteOutline color="error" />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleOpenDelete(params.row)}
        />,
      ],
    },
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" className="font-bold">
          Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
          Add New Category
        </Button>
      </Box>

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
          rows={allCategories}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          pagination
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          slots={{ toolbar: CustomToolbar }}
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
            "& .MuiDataGrid-cell[data-field='level']": {
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

      <CategoryFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingCategory}
        allCategories={allCategories}
      />

      <Dialog open={deleteConfirmOpen} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "
            <strong>{categoryToDelete?.name}</strong>"?
          </DialogContentText>
          <DialogContentText sx={{ color: "text.secondary", mt: 1 }}>
            This action cannot be undone.
          </DialogContentText>

          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={false}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default CategoryManagementPage;
