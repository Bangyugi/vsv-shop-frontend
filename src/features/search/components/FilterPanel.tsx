import {
  Box,
  Typography,
  Slider,
  Chip,
  Button,
  RadioGroup,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Tooltip,
  FormControlLabel,
  Rating,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ExpandMore,
  Check as CheckIcon,
  FilterListOff,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import type { ApiCategory } from "../../../types/category";

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

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "sales", label: "Best Selling" },

  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount_desc", label: "Best Discount" },
];

const MAX_PRICE = 500;
const STEP_PRICE = 10;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
  categories: string;
  priceRange: [number, number];
  colors: string;
  sizes: string;
  rating: number | null;
  sortBy: string;
}

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (name: keyof Filters, value: any) => void;
  onClearFilters: () => void;
  allCategories: ApiCategory[];
  loadingCategories: boolean;
}

const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  allCategories,
  loadingCategories,
}: FilterPanelProps) => {
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

  const handleRadioChange =
    (name: keyof Filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange(name, event.target.value);
    };

  const handleRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const newValue = parseInt(value, 10);
    onFilterChange("rating", isNaN(newValue) ? null : newValue);
  };

  const renderFilterSection = (
    title: string,
    content: React.ReactNode,
    defaultExpanded = false
  ) => (
    <Accordion defaultExpanded={defaultExpanded} sx={{ border: "none" }}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "&.Mui-expanded": { minHeight: 48 },
        }}
      >
        <Typography variant="subtitle1" className="font-semibold">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2, pt: 1, maxHeight: 300, overflowY: "auto" }}>
        {content}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ p: 0 }}>
      <Button
        size="small"
        startIcon={<FilterListOff />}
        onClick={onClearFilters}
        className="!normal-case !text-text-secondary"
        sx={{ m: 1 }}
      >
        Clear All
      </Button>

      {/* Sort By (Giữ nguyên từ SearchPage cũ) */}
      {renderFilterSection(
        "Sort By",
        <RadioGroup
          value={filters.sortBy}
          onChange={handleRadioChange("sortBy")}
        >
          {sortOptions.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio size="small" />}
              label={opt.label}
              sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.9rem" } }}
            />
          ))}
        </RadioGroup>,
        true
      )}

      {/* Category (Đồng bộ logic: RadioGroup L1) */}
      {renderFilterSection(
        "Category",
        loadingCategories ? (
          <CircularProgress size={24} />
        ) : allCategories.length === 0 ? (
          <Alert severity="warning">No categories found.</Alert>
        ) : (
          <RadioGroup
            value={filters.categories}
            onChange={handleRadioChange("categories")}
          >
            <FormControlLabel
              value=""
              control={<Radio size="small" />}
              label="All Categories"
              sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.9rem" } }}
            />
            {allCategories.map((category) => (
              <FormControlLabel
                key={category.id}
                value={category.name}
                control={<Radio size="small" />}
                label={category.name}
                sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.9rem" } }}
              />
            ))}
          </RadioGroup>
        ),
        true
      )}

      {/* Price Range (Đồng bộ logic) */}
      {renderFilterSection(
        "Price Range",
        <>
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
              }}
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
              }}
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
        </>
      )}

      {/* Color (Đồng bộ logic) */}
      {renderFilterSection(
        "Color",
        <Box className="flex flex-wrap gap-2">
          <Tooltip title="All Colors">
            <IconButton
              onClick={() => onFilterChange("colors", "")}
              sx={{
                width: 28,
                height: 28,
                border: "2px solid",
                borderColor: filters.colors === "" ? "primary.main" : "#ccc",
              }}
            >
              <RadioButtonUnchecked sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          {availableColors.map((color) => {
            const isSelected = filters.colors === color.name;
            const isDark = isColorDark(color.hex);
            return (
              <Tooltip title={color.name} key={color.name}>
                <Box
                  onClick={() => onFilterChange("colors", color.name)}
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
      )}

      {/* Size (Đồng bộ logic) */}
      {renderFilterSection(
        "Size",
        <Box className="flex flex-wrap gap-1">
          <Chip
            label="All Sizes"
            clickable
            onClick={() => onFilterChange("sizes", "")}
            size="small"
            sx={{
              m: 0.3,
              bgcolor: filters.sizes === "" ? "primary.main" : "default",
              color: filters.sizes === "" ? "white" : "inherit",
            }}
          />
          {availableSizes.map((size) => (
            <Chip
              key={size}
              label={size}
              clickable
              onClick={() => onFilterChange("sizes", size)}
              size="small"
              sx={{
                m: 0.3,
                bgcolor: filters.sizes === size ? "primary.main" : "default",
                color: filters.sizes === size ? "white" : "inherit",
              }}
            />
          ))}
        </Box>
      )}

      {/* Rating (Đồng bộ logic) */}
      {renderFilterSection(
        "Rating",
        <RadioGroup value={filters.rating ?? ""} onChange={handleRatingChange}>
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
            />
          ))}
          <FormControlLabel
            key="any"
            value=""
            control={<Radio size="small" />}
            label={<Typography variant="body2">Any Rating</Typography>}
          />
        </RadioGroup>
      )}
    </Box>
  );
};

export default FilterPanel;
