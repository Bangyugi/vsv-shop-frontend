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
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import type {
  ApiCategory,
  CreateCategoryRequest,
} from "../../../types/category";

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateCategoryRequest) => Promise<void>;
  initialData: ApiCategory | null;
  allCategories: ApiCategory[];
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  allCategories,
}) => {
  const parentOptions = useMemo(() => {
    return allCategories
      .filter((c) => c.level < 3)
      .sort((a, b) => a.level - b.level);
  }, [allCategories]);

  const validationSchema = useMemo(
    () =>
      yup.object({
        name: yup.string().required("Category name is required"),
        parentCategoryId: yup
          .number()
          .nullable()
          .test(
            "max-level",
            "Cannot create a category deeper than level 3",
            (value) => {
              if (!value) return true;

              const parent = allCategories.find(
                (c: ApiCategory) => c.id === value
              );
              if (parent && parent.level >= 2) {
                return parent.level < 3;
              }
              return true;
            }
          ),
      }),
    [allCategories]
  );

  const formik = useFormik<CreateCategoryRequest>({
    initialValues: {
      name: initialData?.name || "",
      parentCategoryId: initialData?.parentCategory?.id || null,
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {initialData ? "Edit Category" : "Create New Category"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="normal"
            id="name"
            name="name"
            label="Category Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            disabled={formik.isSubmitting}
          />
          <FormControl
            fullWidth
            margin="normal"
            error={
              formik.touched.parentCategoryId &&
              Boolean(formik.errors.parentCategoryId)
            }
            disabled={formik.isSubmitting}
          >
            <InputLabel>Parent Category (Optional)</InputLabel>
            <Select
              name="parentCategoryId"
              label="Parent Category (Optional)"
              value={formik.values.parentCategoryId || ""}
              onChange={(e) => {
                formik.setFieldValue(
                  "parentCategoryId",
                  e.target.value || null
                );
              }}
            >
              <MenuItem value="">
                <em>None (Level 1)</em>
              </MenuItem>
              {parentOptions.map((cat) => (
                <MenuItem
                  key={cat.id}
                  value={cat.id}
                  disabled={cat.id === initialData?.id}
                >
                  {/* Hiển thị level cho rõ ràng */}
                  (L{cat.level}) {cat.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.parentCategoryId &&
                formik.errors.parentCategoryId}
            </FormHelperText>
          </FormControl>

          {formik.status && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formik.status}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryFormDialog;
