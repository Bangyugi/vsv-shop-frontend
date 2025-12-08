import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Grid,
  InputAdornment,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Box,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline, CloudUpload, Delete } from "@mui/icons-material";
import * as uploadService from "../../../services/uploadService";

import { useFormik, FieldArray, getIn, FormikProvider } from "formik";
import * as yup from "yup";
import type {
  ApiProduct,
  SellerProductFormValues,
} from "../../../types/product";
import type { ApiCategory } from "../../../types/category";

interface SellerProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SellerProductFormValues) => Promise<void>;
  initialData: ApiProduct | null;
  allCategories: ApiCategory[];
}

const SellerProductFormDialog: React.FC<SellerProductFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  allCategories,
}) => {
  const isEditMode = Boolean(initialData);

  const validationSchema = useMemo(
    () =>
      yup.object({
        title: yup.string().required("Product title is required"),
        description: yup.string().required("Description is required"),
        price: yup
          .number()
          .min(0, "Price must be positive")
          .required("Original price is required"),
        sellingPrice: yup
          .number()
          .min(0, "Price must be positive")
          .required("Selling price is required")
          .max(
            yup.ref("price"),
            "Selling price cannot be greater than original price"
          ),
        categoryId: yup
          .number()
          .required("Category is required")
          .positive("Category is required"),
        images: yup.string().required("At least one image URL is required"),
        variants: yup
          .array()
          .of(
            yup.object().shape({
              color: yup.string().required("Color is required"),
              size: yup.string().required("Size is required"),
              quantity: yup
                .number()
                .min(0, "Must be >= 0")
                .required("Qty is required")
                .integer("Must be an integer"),
            })
          )
          .min(1, "At least one variant is required"),
      }),
    []
  );

  const formik = useFormik<SellerProductFormValues>({
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      sellingPrice: initialData?.sellingPrice || 0,
      categoryId: initialData?.category.id || 0,
      images: initialData?.images.join(", ") || "",
      variants: initialData?.variants
        ? initialData.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            color: v.color,
            size: v.size,
            quantity: v.quantity,
          }))
        : [
            {
              id: 0,
              sku: "",
              color: "",
              size: "",
              quantity: 0,
            },
          ],
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      setStatus(null);
      try {
        await onSubmit(values);
        onClose();
      } catch (err: any) {
        setStatus(err.message || "An error occurred");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const parentOptions = useMemo(() => {
    return allCategories.sort((a, b) => a.level - b.level);
  }, [allCategories]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {isEditMode ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="title"
                  label="Product Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  name="price"
                  label="Original Price"
                  type="number"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  name="sellingPrice"
                  label="Selling Price"
                  type="number"
                  value={formik.values.sellingPrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.sellingPrice &&
                    Boolean(formik.errors.sellingPrice)
                  }
                  helperText={
                    formik.touched.sellingPrice && formik.errors.sellingPrice
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.categoryId &&
                    Boolean(formik.errors.categoryId)
                  }
                >
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="categoryId"
                    label="Category"
                    value={formik.values.categoryId || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value={0} disabled>
                      <em>Select a category</em>
                    </MenuItem>
                    {parentOptions.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.level > 1 && "\u00A0\u00A0".repeat(cat.level - 1)}
                        (L{cat.level}) {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {formik.touched.categoryId && formik.errors.categoryId}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="product-images-upload"
                    multiple
                    type="file"
                    onChange={async (event) => {
                      const files = event.currentTarget.files;
                      if (files && files.length > 0) {
                        try {
                          const uploadPromises = Array.from(files).map((file) =>
                            uploadService.uploadFile(file)
                          );
                          const urls = await Promise.all(uploadPromises);
                          
                          const currentImages = formik.values.images
                            ? formik.values.images.split(",").map((s) => s.trim()).filter(Boolean)
                            : [];
                          
                          const newImages = [...currentImages, ...urls];
                          formik.setFieldValue("images", newImages.join(", "));
                        } catch (error) {
                          console.error("Error uploading product images:", error);
                          // You might want to add a snackbar here for error handling
                        }
                      }
                    }}
                  />
                  <label htmlFor="product-images-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                    >
                      Upload Images
                    </Button>
                  </label>
                </Box>

                <TextField
                  fullWidth
                  name="images"
                  label="Image URLs"
                  value={formik.values.images}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.images && Boolean(formik.errors.images)}
                  helperText={
                    formik.touched.images
                      ? formik.errors.images
                      : "Upload images or enter URLs separated by comma"
                  }
                />

                {formik.values.images && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                    {formik.values.images
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((url, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: "relative",
                            width: 100,
                            height: 100,
                            border: "1px solid #ddd",
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              bgcolor: "rgba(255,255,255,0.7)",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                            }}
                            onClick={() => {
                              const currentImages = formik.values.images
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              const newImages = currentImages.filter((_, i) => i !== index);
                              formik.setFieldValue("images", newImages.join(", "));
                            }}
                          >
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                      ))}
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Divider />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Product Variants
                </Typography>
              </Grid>

              <FieldArray
                name="variants"
                render={(arrayHelpers) => (
                  <Grid item xs={12}>
                    {formik.values.variants.map((variant, index) => {
                      const getError = (field: string) =>
                        getIn(formik.touched.variants?.[index], field) &&
                        getIn(formik.errors.variants?.[index], field);

                      return (
                        <Grid
                          container
                          spacing={2}
                          key={index}
                          sx={{
                            mb: 2,
                            pb: 2,
                            borderBottom: "1px dashed #ccc",
                          }}
                          alignItems="flex-start"
                        >
                          <Grid item xs={6} sm={2.5}>
                            <TextField
                              fullWidth
                              size="small"
                              name={`variants[${index}].color`}
                              label="Color"
                              value={variant.color}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={Boolean(getError("color"))}
                              helperText={getError("color") || ""}
                            />
                          </Grid>
                          <Grid item xs={6} sm={2.5}>
                            <TextField
                              fullWidth
                              size="small"
                              name={`variants[${index}].size`}
                              label="Size"
                              value={variant.size}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={Boolean(getError("size"))}
                              helperText={getError("size") || ""}
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
                            <TextField
                              fullWidth
                              size="small"
                              name={`variants[${index}].quantity`}
                              label="Quantity"
                              type="number"
                              value={variant.quantity}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={Boolean(getError("quantity"))}
                              helperText={getError("quantity") || ""}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={6}
                            sm={2}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              pt: 1,
                            }}
                          >
                            <Tooltip title="Remove variant">
                              <span>
                                <IconButton
                                  color="error"
                                  onClick={() => arrayHelpers.remove(index)}
                                  disabled={formik.values.variants.length <= 1}
                                >
                                  <RemoveCircleOutline />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      );
                    })}
                    <Button
                      variant="outlined"
                      startIcon={<AddCircleOutline />}
                      onClick={() =>
                        arrayHelpers.push({
                          id: 0,
                          sku: "",
                          color: "",
                          size: "",
                          quantity: 0,
                        })
                      }
                      sx={{ mt: 1 }}
                    >
                      Add Variant
                    </Button>
                  </Grid>
                )}
              />

              {formik.status && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {formik.status}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} disabled={formik.isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Create Product"}
            </Button>
          </DialogActions>
        </form>
      </FormikProvider>
    </Dialog>
  );
};

export default SellerProductFormDialog;
