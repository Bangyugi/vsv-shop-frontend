// src/features/search/pages/SearchPage.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  TextField,
  InputAdornment,
  Typography,
  Pagination,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Drawer,
  IconButton,
  Alert,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  TuneOutlined as TuneOutlinedIcon,
  Close,
} from "@mui/icons-material";
import { motion } from "framer-motion";

import FilterPanel from "../components/FilterPanel";
import type { Filters } from "../components/FilterPanel";
import ProductGrid from "../../shopping/components/ProductGrid";

// --- Imports mới ---
import * as productService from "../../../services/productService";
import * as categoryService from "../../../services/categoryService";
import type { ApiCategory } from "../../../types/category";
import type { FrontendProduct, ProductApiParams } from "../../../types/product";
import { mapApiProductToShoppingProduct } from "../../../types/product";
// --- Kết thúc Imports mới ---

// --- Helper hooks (Copy từ ShoppingPage) ---
const useQueryState = <T,>(
  key: string,
  defaultValue: T,
  parser: (val: string | null) => T,
  serializer: (val: T) => string
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState(() => {
    const valueFromUrl = searchParams.get(key);
    if (valueFromUrl !== null) {
      return parser(valueFromUrl);
    }
    return defaultValue;
  });

  const setQueryState = useCallback(
    (newValue: T) => {
      setState(newValue);
      const newParams = new URLSearchParams(searchParams);
      if (newValue === defaultValue || serializer(newValue) === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, serializer(newValue));
      }
      if (key !== "page") {
        newParams.set("page", "1");
      }
      setSearchParams(newParams, { replace: true });
    },
    [key, serializer, searchParams, setSearchParams, defaultValue]
  );

  useEffect(() => {
    const valueFromUrlRaw = searchParams.get(key);
    const valueFromUrlParsed =
      valueFromUrlRaw !== null ? parser(valueFromUrlRaw) : defaultValue;
    if (serializer(valueFromUrlParsed) !== serializer(state)) {
      setState(valueFromUrlParsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, key, parser, serializer, defaultValue]);

  return [state, setQueryState] as const;
};

const parseJson = (val: string | null) => {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
};
const stringifyJson = (val: any) => JSON.stringify(val);
const parseString = (val: string | null) => val || "";
const stringifyString = (val: string) => val;
const parseIntParam = (val: string | null) => parseInt(val || "1", 10) || 1;
const stringifyInt = (val: number) => val.toString();
const parseRating = (val: string | null) => {
  const num = parseInt(val || "0", 10);
  return num > 0 ? num : null;
};
// --- Kết thúc Helper hooks ---

// --- Constants (Đồng bộ với ShoppingPage) ---
const ITEMS_PER_PAGE = 8;
const MAX_PRICE_SLIDER = 500;
const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "sales", label: "Best Selling" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

// --- DEFAULT_FILTERS (Đồng bộ với FilterPanel mới) ---
const DEFAULT_FILTERS: Filters = {
  categories: "",
  priceRange: [0, MAX_PRICE_SLIDER],
  rating: null,
  colors: "",
  sizes: "",
  sortBy: "latest",
};

// --- Helper (Copy từ ShoppingPage) ---
const findCategoryIdByName = (
  categoryName: string | undefined,
  allCategories: ApiCategory[]
): number | undefined => {
  if (!categoryName) return undefined;
  const found = allCategories.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return found?.id;
};
// ---

const SearchPage = () => {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // --- State cho Categories ---
  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  // const [categoryError, setCategoryError] = useState<string | null>(null);

  // --- State cho Products ---
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // --- Hooks cho Query State ---
  const [searchTerm, setSearchTerm] = useQueryState(
    "q",
    "",
    parseString,
    stringifyString
  );
  const [page, setPage] = useQueryState("page", 1, parseIntParam, stringifyInt);
  const [sortBy, setSortBy] = useQueryState(
    "sort",
    DEFAULT_FILTERS.sortBy,
    parseString,
    stringifyString
  );
  const [category, setCategory] = useQueryState(
    "category",
    DEFAULT_FILTERS.categories,
    parseString,
    stringifyString
  );
  const [priceRange, setPriceRange] = useQueryState(
    "price",
    DEFAULT_FILTERS.priceRange,
    (val) =>
      (parseJson(val) as [number, number] | null) || DEFAULT_FILTERS.priceRange,
    stringifyJson
  );
  const [rating, setRating] = useQueryState(
    "rating",
    DEFAULT_FILTERS.rating,
    parseRating,
    (val) => (val ? val.toString() : "")
  );
  const [color, setColor] = useQueryState(
    "color",
    DEFAULT_FILTERS.colors,
    parseString,
    stringifyString
  );
  const [size, setSize] = useQueryState(
    "size",
    DEFAULT_FILTERS.sizes,
    parseString,
    stringifyString
  );

  // --- Build filters object từ state ---
  const filters: Filters = useMemo(
    () => ({
      categories: category,
      priceRange,
      rating,
      colors: color,
      sizes: size,
      sortBy: sortBy,
    }),
    [category, priceRange, rating, color, size, sortBy]
  );

  // --- Fetch Categories ---
  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCategories(true);
      // setCategoryError(null);
      try {
        const response = await categoryService.getCategories();
        if (response.code === 200 && response.data) {
          setAllCategories(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch categories");
        }
      } catch (err: any) {
        // setCategoryError(err.message || "Could not load category data.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  // --- Fetch Products ---
  useEffect(() => {
    if (loadingCategories) {
      return;
    }

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductError(null);

      let apiSortBy: string;
      let apiSortDir: "ASC" | "DESC";

      switch (filters.sortBy) {
        case "price_asc":
          apiSortBy = "sellingPrice";
          apiSortDir = "ASC";
          break;
        case "price_desc":
          apiSortBy = "sellingPrice";
          apiSortDir = "DESC";
          break;
        case "sales":
          apiSortBy = "numRatings";
          apiSortDir = "DESC";
          break;
        case "rating":
          apiSortBy = "averageRating";
          apiSortDir = "DESC";
          break;
        case "latest":
        default:
          apiSortBy = "createdAt";
          apiSortDir = "DESC";
      }

      const categoryId = findCategoryIdByName(category, allCategories);

      const apiParams: ProductApiParams = {
        keyword: searchTerm || undefined,
        categoryId: categoryId,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < MAX_PRICE_SLIDER ? priceRange[1] : undefined,
        color: color || undefined,
        size: size || undefined,
        minRating: rating || undefined,
        pageNo: page,
        pageSize: ITEMS_PER_PAGE,
        sortBy: apiSortBy,
        sortDir: apiSortDir,
      };

      try {
        const response = await productService.getProducts(apiParams);
        if (response.code === 200 && response.data) {
          setProducts(
            response.data.pageContent.map(mapApiProductToShoppingProduct)
          );
          setTotalPages(response.data.totalPages);
          setTotalElements(response.data.totalElements);
          if (page > response.data.totalPages && response.data.totalPages > 0) {
            setPage(response.data.totalPages);
          }
        } else {
          throw new Error(response.message || "Failed to fetch products");
        }
      } catch (err: any) {
        setProductError(err.message || "An error occurred.");
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [
    page,
    sortBy,
    searchTerm,
    category,
    priceRange,
    rating,
    color,
    size,
    allCategories,
    loadingCategories,
    setPage,
    filters.sortBy,
  ]);

  // --- Handler functions ---
  const handleFilterChange = (name: keyof Filters, value: any) => {
    if (name === "categories") setCategory(value);
    else if (name === "priceRange") setPriceRange(value);
    else if (name === "rating") setRating(value);
    else if (name === "colors") setColor(value);
    else if (name === "sizes") setSize(value);
    else if (name === "sortBy") setSortBy(value);
  };

  const handleClearFilters = () => {
    setCategory(DEFAULT_FILTERS.categories);
    setPriceRange(DEFAULT_FILTERS.priceRange);
    setRating(DEFAULT_FILTERS.rating);
    setColor(DEFAULT_FILTERS.colors);
    setSize(DEFAULT_FILTERS.sizes);
    setSortBy(DEFAULT_FILTERS.sortBy);
    // Note: We don't clear searchTerm when clearing filters
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Drawer Content ---
  const drawerContent = (
    <Box
      sx={{
        width: { xs: "100vw", sm: 400 },
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
      role="presentation"
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" className="font-bold">
          Filter & Sort
        </Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1 }}>
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          allCategories={allCategories.filter((cat) => cat.level === 1)} // Chỉ truyền L1 categories
          loadingCategories={loadingCategories}
        />
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          textAlign: "right",
          bgcolor: "background.paper",
        }}
      >
        <Button
          variant="contained"
          onClick={() => setFilterDrawerOpen(false)}
          fullWidth
        >
          Apply
        </Button>
      </Box>
    </Box>
  );
  // ---

  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="xl">
        <Box mb={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              sx: { borderRadius: "50px", bgcolor: "background.paper" },
            }}
          />
        </Box>

        <Box sx={{ px: { xs: 0, md: 2, lg: 4 } }}>
          <Paper
            elevation={0}
            className="mb-4 flex flex-col gap-4 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center"
          >
            <Typography
              variant="h6"
              className="font-bold flex-grow"
              sx={{ whiteSpace: "nowrap" }}
            >
              Search Results {!isLoadingProducts && `(${totalElements})`}
            </Typography>

            <Box className="flex items-center justify-between gap-4">
              <FormControl
                size="small"
                className="min-w-[150px] hidden md:block"
              >
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                  className="!rounded-full"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<TuneOutlinedIcon />}
                onClick={() => setFilterDrawerOpen(true)}
                sx={{
                  color: "text.primary",
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "text.primary",
                    bgcolor: "action.hover",
                  },
                }}
              >
                Filter & Sort
              </Button>
            </Box>
          </Paper>

          {/* Thay thế logic render cũ bằng ProductGrid */}
          <motion.div layout>
            <ProductGrid
              products={products}
              isLoading={isLoadingProducts}
              error={productError}
            />
          </motion.div>

          {!isLoadingProducts && !productError && totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 5,
                py: 2,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {productError && (
            <Alert severity="error" sx={{ mt: 4 }}>
              {productError}
            </Alert>
          )}
        </Box>
      </Container>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default SearchPage;
