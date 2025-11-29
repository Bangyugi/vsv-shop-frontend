import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Avatar,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  type SelectChangeEvent,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridPaginationModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  Add,
  EditOutlined,
  DeleteOutline,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as sellerService from "../../../services/sellerService";
import * as categoryService from "../../../services/categoryService";
import type {
  ApiProduct,
  SellerProductFormValues,
} from "../../../types/product";
import type { ApiCategory } from "../../../types/category";
import SellerProductFormDialog from "../components/SellerProductFormDialog";

const sortOptions = [
  { value: "id_asc", label: "ID: Tăng dần" },
  { value: "title_asc", label: "Tên: A-Z" },
  { value: "sellingPrice_asc", label: "Giá: Thấp đến Cao" },
  { value: "totalQuantity_asc", label: "Tồn kho: Ít nhất" },
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
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          width: "100%",
          justifyContent: "flex-end",
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Tìm kiếm sản phẩm (tên, SKU...)"
          value={searchTerm}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
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
    </Box>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const SellerProductManagementPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ApiProduct[]>([]);
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
  const [productToDelete, setProductToDelete] = useState<ApiProduct | null>(
    null
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [sortField, sortDirection] = sortBy.split("_");
    const keyword = searchTerm || undefined;

    try {
      const response = await sellerService.getMyProducts(
        paginationModel.page + 1,
        paginationModel.pageSize,
        keyword,
        sortField,
        sortDirection as "ASC" | "DESC"
      );
      if (response.code === 200 && response.data) {
        setRows(response.data.pageContent);
        setRowCount(response.data.totalElements);
      } else {
        throw new Error(response.message || "Failed to fetch products");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchTerm, sortBy]);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await categoryService.getCategories();
      if (response.code === 200 && response.data) {
        setAllCategories(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch categories");
      }
    } catch (err: any) {
      setError("Failed to load categories. Cannot add or edit products.");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  const handleOpenDelete = (product: ApiProduct) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDelete = () => setDeleteConfirmOpen(false);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await sellerService.deleteMyProduct(productToDelete.id);
      setSnackbar({
        open: true,
        message: "Product deleted successfully",
        severity: "success",
      });
      fetchProducts(); 
      handleCloseDelete(); 
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete product",
        severity: "error",
      });
    }
  };

  const handleAddNew = () => {
    if (loadingCategories) {
      setError("Categories still loading, please wait.");
      return;
    }
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: ApiProduct) => {
    if (loadingCategories) {
      setError("Categories still loading, please wait.");
      return;
    }
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleSubmitForm = async (values: SellerProductFormValues) => {
    const categoryName =
      allCategories.find((c) => c.id === values.categoryId)?.name || "Unknown";
    try {
      if (editingProduct) {
        await sellerService.updateMyProduct(
          editingProduct.id,
          values,
          categoryName,
          editingProduct
        );
        setSnackbar({
          open: true,
          message: "Product updated successfully",
          severity: "success",
        });
      } else {
        await sellerService.addMyProduct(values, categoryName);
        setSnackbar({
          open: true,
          message: "Product created successfully",
          severity: "success",
        });
      }
      fetchProducts();
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || err.message || "Failed to save product"
      );
    }
  };

  const handleCloseSnackbar = () => setSnackbar(null);

  const columns: GridColDef<ApiProduct>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 60,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "image",
      headerName: "Image",
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Avatar
          src={params.row.images?.[0]}
          alt={params.row.title}
          variant="rounded"
        />
      ),
      sortable: false,
    },
    { field: "title", headerName: "Product Name", width: 250 },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      valueGetter: (_value, row) => row.category?.name || "N/A",
    },
    {
      field: "sellingPrice",
      headerName: "Price",
      width: 100,
      type: "number",
      valueFormatter: (value: number) => formatCurrency(value || 0),
    },
    {
      field: "totalQuantity",
      headerName: "Stock",
      width: 80,
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 150,
      align: "center",
      headerAlign: "center",
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="View Product on Site">
              <VisibilityOutlined />
            </Tooltip>
          }
          label="View"
          onClick={() => navigate(`/product/${params.row.id}`)}
          {...{ target: "_blank" }}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit Product">
              <EditOutlined />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete Product">
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
          My Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
          disabled={loadingCategories}
        >
          Add New Product
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
            "& .MuiDataGrid-cell[data-field='totalQuantity']": {
              justifyContent: "center",
            },
            "& .MuiDataGrid-cell[data-field='isVisible']": {
              justifyContent: "center",
            },
            "& .MMuiDataGrid-cell[data-field='actions']": {
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

      {!loadingCategories && (
        <SellerProductFormDialog
          open={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          initialData={editingProduct}
          allCategories={allCategories}
        />
      )}

      <Dialog open={deleteConfirmOpen} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "
            <strong>{productToDelete?.title}</strong>"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
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

export default SellerProductManagementPage;
