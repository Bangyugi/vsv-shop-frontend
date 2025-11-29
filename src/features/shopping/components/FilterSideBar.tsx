// src/features/shopping/components/FilterSideBar.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  // --- THAY ĐỔI: Bỏ FormGroup, Checkbox ---
  // FormGroup,
  // FormControlLabel,
  // Checkbox,
  // --- THÊM: Thêm RadioGroup, Radio, FormControlLabel ---
  RadioGroup,
  Radio,
  FormControlLabel,
  Slider,
  Rating,
  Button,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import {
  ExpandMore,
  FilterListOff,
  Check as CheckIcon,
  RadioButtonUnchecked, // Thêm icon cho "All"
} from "@mui/icons-material";

import * as categoryService from "../../../services/categoryService";
import type { ApiCategory } from "../../../types/category";

// const availableGenders = ["Men", "Women", "Unisex"];
const availableSizes = [
  "S",
  "M",
  "L",
  "XL",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "One Size",
];
const availableColors = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Red", hex: "#EF4444" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Gray", hex: "#808080" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Navy", hex: "#000080" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Green", hex: "#008000" },
];

const isColorDark = (hex: string) => {
  if (!hex) return false;
  const hexValue = hex.replace("#", "");
  const isShortHex = hexValue.length === 3;
  const r = parseInt(
    isShortHex ? hexValue.substring(0, 1).repeat(2) : hexValue.substring(0, 2),
    16
  );
  const g = parseInt(
    isShortHex ? hexValue.substring(1, 2).repeat(2) : hexValue.substring(2, 4),
    16
  );
  const b = parseInt(
    isShortHex ? hexValue.substring(2, 3).repeat(2) : hexValue.substring(4, 6),
    16
  );
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
};

export interface Filters {
  // --- THAY ĐỔI: Chuyển từ mảng sang string (hoặc string | null) ---
  // "" hoặc null sẽ có nghĩa là "All"
  categories: string;
  brands?: string[]; // Giữ nguyên brand nếu cần multi-select
  priceRange: [number, number];
  rating: number | null;
  colors: string;
  sizes: string;
  gender: string; // Chuyển từ mảng sang string
}

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (name: keyof Filters, value: any) => void;
  onClearFilters: () => void;
  parentCategoryId?: number;
}

const MAX_PRICE = 500;
const STEP_PRICE = 10;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const FilterSidebar = ({
  filters,
  onFilterChange,
  onClearFilters,
  parentCategoryId,
}: FilterSidebarProps) => {
  const [level3Categories, setLevel3Categories] = useState<ApiCategory[]>([]);
  const [loadingL3, setLoadingL3] = useState(false);
  const [errorL3, setErrorL3] = useState<string | null>(null);

  const [minPriceInput, setMinPriceInput] = useState(
    filters.priceRange[0].toString()
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    filters.priceRange[1].toString()
  );

  useEffect(() => {
    setMinPriceInput(filters.priceRange[0].toString());
    setMaxPriceInput(filters.priceRange[1].toString());
  }, [filters.priceRange]);

  useEffect(() => {
    if (parentCategoryId) {
      setLoadingL3(true);
      setErrorL3(null);
      setLevel3Categories([]);

      categoryService
        .getLevel3Subcategories(parentCategoryId)
        .then((response) => {
          if (response.code === 200 && response.data) {
            setLevel3Categories(response.data);
          } else {
            throw new Error(
              response.message || "Failed to fetch subcategories"
            );
          }
        })
        .catch((err: any) => {
          console.error("Error fetching L3 categories:", err);
          setErrorL3(err.message || "Could not load subcategories.");
        })
        .finally(() => {
          setLoadingL3(false);
        });
    } else {
      setLevel3Categories([]);
      setLoadingL3(false);
      setErrorL3(null);
    }
  }, [parentCategoryId]);

  // --- BỎ: createMultiSelectHandler ---

  // --- THÊM: Handler cho RadioGroup (hoặc có thể dùng inline) ---
  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange("categories", event.target.value);
  };
  // const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   onFilterChange("gender", event.target.value);
  // };

  // (Các hàm handle price giữ nguyên)
  const handlePriceSliderChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    const [newMin, newMax] = newValue as [number, number];

    setMinPriceInput(newMin.toString());
    setMaxPriceInput(newMax.toString());
    onFilterChange("priceRange", [newMin, newMax]);
  };

  const handlePriceInputChange =
    (type: "min" | "max") => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (type === "min") {
        setMinPriceInput(value);
      } else {
        setMaxPriceInput(value);
      }
    };

  const handlePriceInputBlur = () => {
    let minVal = parseInt(minPriceInput, 10);
    let maxVal = parseInt(maxPriceInput, 10);

    minVal = isNaN(minVal) || minVal < 0 ? 0 : minVal;
    maxVal = isNaN(maxVal) || maxVal > MAX_PRICE ? MAX_PRICE : maxVal;
    if (minVal > maxVal) {
      [minVal, maxVal] = [maxVal, minVal];
    }

    setMinPriceInput(minVal.toString());
    setMaxPriceInput(maxVal.toString());
    onFilterChange("priceRange", [minVal, maxVal]);
  };

  // (Hàm handle rating giữ nguyên)
  const handleRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") {
      onFilterChange("rating", null);
    } else {
      const newValue = parseInt(value, 10);
      onFilterChange("rating", isNaN(newValue) ? null : newValue);
    }
  };

  return (
    <Box className="sticky top-24 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Box className="mb-3 flex items-center justify-between">
        <Typography variant="h6" className="font-bold">
          Filters
        </Typography>
        <Button
          size="small"
          startIcon={<FilterListOff />}
          onClick={onClearFilters}
          className="!normal-case !text-text-secondary"
        >
          Clear All
        </Button>
      </Box>

      {/* --- CẬP NHẬT: CATEGORY (RadioGroup) --- */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className="font-semibold">Category</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, maxHeight: 300, overflowY: "auto" }}>
          {loadingL3 && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          )}
          {!loadingL3 && errorL3 && (
            <Alert severity="error" sx={{ my: 1 }}>
              {errorL3}
            </Alert>
          )}
          {!loadingL3 && !errorL3 && !parentCategoryId && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ p: 1, textAlign: "center" }}
            >
              Select a category to see sub-filters.
            </Typography>
          )}
          {!loadingL3 &&
            !errorL3 &&
            level3Categories.length === 0 &&
            parentCategoryId && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ p: 1, textAlign: "center" }}
              >
                No subcategories found.
              </Typography>
            )}
          {!loadingL3 && !errorL3 && level3Categories.length > 0 && (
            <RadioGroup
              value={filters.categories}
              onChange={handleCategoryChange}
            >
              {/* Thêm lựa chọn "Tất cả" */}
              <FormControlLabel
                value="" // Giá trị rỗng đại diện cho "Tất cả"
                control={<Radio size="small" />}
                label="All Subcategories"
                sx={{
                  "& .MuiFormControlLabel-label": { fontSize: "0.9rem" },
                }}
              />
              {level3Categories.map((category) => (
                <FormControlLabel
                  key={category.id}
                  value={category.name} // Value là tên
                  control={<Radio size="small" />}
                  label={category.name}
                  sx={{
                    "& .MuiFormControlLabel-label": { fontSize: "0.9rem" },
                  }}
                />
              ))}
            </RadioGroup>
          )}
        </AccordionDetails>
      </Accordion>

      {/* --- CẬP NHẬT: COLOR (Single Select) --- */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className="font-semibold">Color</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Box className="flex flex-wrap gap-2">
            {/* Thêm nút "All Colors" */}
            <Tooltip title="All Colors">
              <IconButton
                onClick={() => onFilterChange("colors", "")} // Set về rỗng
                sx={{
                  width: 28,
                  height: 28,
                  border: "2px solid",
                  borderColor: filters.colors === "" ? "primary.main" : "#ccc",
                  borderRadius: "50%",
                }}
              >
                <RadioButtonUnchecked sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            {availableColors.map((color) => {
              const isSelected = filters.colors === color.name; // So sánh trực tiếp
              const isDark = isColorDark(color.hex);
              return (
                <Tooltip title={color.name} key={color.name}>
                  <Box
                    onClick={() => onFilterChange("colors", color.name)} // Set giá trị, không toggle
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: color.hex,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid",
                      borderColor: isSelected
                        ? "primary.main"
                        : color.hex === "#FFFFFF"
                        ? "#ccc"
                        : color.hex,
                      outline:
                        color.hex === "#FFFFFF" && isSelected
                          ? `1px solid ${"primary.main"}`
                          : "none",
                      boxShadow: isSelected ? "0 0 0 2px white inset" : "none",
                      transition:
                        "border-color 0.2s ease, box-shadow 0.2s ease",
                      position: "relative",
                    }}
                  >
                    {isSelected && (
                      <CheckIcon
                        sx={{ fontSize: 16, color: isDark ? "white" : "black" }}
                      />
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* --- CẬP NHẬT: SIZE (Single Select) --- */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className="font-semibold">Size</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Box className="flex flex-wrap gap-1">
            {/* Thêm Chip "All Sizes" */}
            <Chip
              label="All Sizes"
              clickable
              onClick={() => onFilterChange("sizes", "")} // Set về rỗng
              size="small"
              sx={{
                m: 0.3,
                fontSize: "0.75rem",
                height: "26px",
                bgcolor: filters.sizes === "" ? "primary.main" : "default",
                color: filters.sizes === "" ? "white" : "inherit",
                "&:hover": {
                  bgcolor: filters.sizes === "" ? "primary.dark" : "#f0f0f0",
                },
              }}
            />
            {availableSizes.map((size) => (
              <Chip
                key={size}
                label={size}
                clickable
                onClick={() => onFilterChange("sizes", size)} // Set giá trị, không toggle
                size="small"
                sx={{
                  m: 0.3,
                  fontSize: "0.75rem",
                  height: "26px",
                  bgcolor: filters.sizes === size ? "primary.main" : "default",
                  color: filters.sizes === size ? "white" : "inherit",
                  "&:hover": {
                    bgcolor:
                      filters.sizes === size ? "primary.dark" : "#f0f0f0",
                  },
                }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* (Price Range giữ nguyên) */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className="font-semibold">Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 1 }}>
          <Box className="flex gap-2 mb-4">
            <TextField
              label="Min"
              type="number"
              size="small"
              value={minPriceInput}
              onChange={handlePriceInputChange("min")}
              onBlur={handlePriceInputBlur}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
                inputProps: {
                  min: 0,
                  max: MAX_PRICE,
                  step: STEP_PRICE,
                },
              }}
              sx={{ "& .MuiInputBase-input": { fontSize: "0.9rem" } }}
            />
            <TextField
              label="Max"
              type="number"
              size="small"
              value={maxPriceInput}
              onChange={handlePriceInputChange("max")}
              onBlur={handlePriceInputBlur}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
                inputProps: {
                  min: 0,
                  max: MAX_PRICE,
                  step: STEP_PRICE,
                },
              }}
              sx={{ "& .MuiInputBase-input": { fontSize: "0.9rem" } }}
            />
          </Box>

          <Slider
            value={filters.priceRange}
            onChange={handlePriceSliderChange}
            valueLabelDisplay="off"
            min={0}
            max={MAX_PRICE}
            step={STEP_PRICE}
            className="!text-primary !mx-auto !block !w-[90%]"
            disableSwap
          />

          <Box className="mt-2 flex justify-between text-sm text-text-secondary">
            <Typography variant="caption">
              {formatCurrency(filters.priceRange[0])}
            </Typography>
            <Typography variant="caption">
              {formatCurrency(filters.priceRange[1])}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* (Rating giữ nguyên) */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className="font-semibold">Rating</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <RadioGroup
            value={filters.rating ?? ""}
            onChange={handleRatingChange}
          >
            {[5, 4, 3, 2, 1].map((stars) => (
              <FormControlLabel
                key={stars}
                value={stars.toString()}
                control={<Radio size="small" />}
                label={
                  <Box className="flex items-center">
                    <Rating value={stars} readOnly size="small" />
                    <Typography variant="body2" className="ml-1">
                      & Up
                    </Typography>
                  </Box>
                }
                sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.9rem" } }}
              />
            ))}
            <FormControlLabel
              key="any"
              value=""
              control={<Radio size="small" />}
              label={<Typography variant="body2">Any Rating</Typography>}
              sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.9rem" } }}
            />
          </RadioGroup>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FilterSidebar;
