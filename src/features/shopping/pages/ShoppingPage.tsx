// src/features/shopping/pages/ShoppingPage.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Pagination,
  Breadcrumbs,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  Drawer,
  Button,
  Alert,
} from "@mui/material";
import {
  useSearchParams,
  Link as RouterLink,
  useParams,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Home,
  ChevronRight,
  FilterList,
  Close,
} from "@mui/icons-material";
import FilterSidebar from "../components/FilterSideBar";
import type { Filters } from "../components/FilterSideBar";
import ProductGrid from "../components/ProductGrid";

import * as productService from "../../../services/productService";
import * as categoryService from "../../../services/categoryService";
import type { ApiCategory } from "../../../types/category";
import type { FrontendProduct, ProductApiParams } from "../../../types/product";
import { mapApiProductToShoppingProduct } from "../../../types/product";

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

const DEFAULT_FILTERS: Filters = {
  categories: "",
  brands: [],
  priceRange: [0, 500],
  rating: null,
  colors: "",
  sizes: "",
  gender: "",
};

const ITEMS_PER_PAGE = 8;
const MAX_PRICE_SLIDER = 500;
// --- CẬP NHẬT MẢNG NÀY ---
const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "sales", label: "Best Selling" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount_desc", label: "Best Discount" }, // <-- THÊM DÒNG NÀY
];
// --- KẾT THÚC CẬP NHẬT ---

const findCategoryHierarchy = (
  categoryName: string | undefined,
  allCategories: ApiCategory[]
): ApiCategory[] => {
  if (!categoryName || allCategories.length === 0) {
    return [];
  }

  const normalizedCategoryName = categoryName.toLowerCase();
  const targetCategory = allCategories.find(
    (cat) => cat.name.toLowerCase() === normalizedCategoryName
  );

  if (!targetCategory) {
    return [];
  }

  const hierarchy: ApiCategory[] = [targetCategory];
  let current: ApiCategory | null = targetCategory;

  for (let i = 0; i < 2 && current?.parentCategory; i++) {
    const parent = allCategories.find(
      (cat) => cat.id === current?.parentCategory?.id
    );
    if (parent) {
      hierarchy.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }

  return hierarchy;
};

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

const ShoppingPage = () => {
  const { category: categoryParam } = useParams<{ category: string }>();

  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useQueryState(
    "q",
    "",
    parseString,
    stringifyString
  );
  const [page, setPage] = useQueryState("page", 1, parseIntParam, stringifyInt);
  const [sortBy, setSortBy] = useQueryState(
    "sort",
    "latest",
    parseString,
    stringifyString
  );

  const [category, setCategory] = useQueryState(
    "category",
    DEFAULT_FILTERS.categories,
    parseString,
    stringifyString
  );

  const [brands, setBrands] = useQueryState(
    "brands",
    DEFAULT_FILTERS.brands,
    (val) => (parseJson(val) as string[] | null) || DEFAULT_FILTERS.brands,
    stringifyJson
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
  const [gender, setGender] = useQueryState(
    "gender",
    DEFAULT_FILTERS.gender,
    parseString,
    stringifyString
  );

  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCategories(true);
      setCategoryError(null);
      try {
        const response = await categoryService.getCategories();
        if (response.code === 200 && response.data) {
          setAllCategories(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch categories");
        }
      } catch (err: any) {
        setCategoryError(err.message || "Could not load category data.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  const filters: Filters = useMemo(
    () => ({
      categories: category,
      brands,
      priceRange,
      rating,
      colors: color,
      sizes: size,
      gender: gender,
    }),
    [category, brands, priceRange, rating, color, size, gender]
  );

  useEffect(() => {
    if (loadingCategories) {
      return;
    }

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductError(null);

      let apiSortBy: string;
      let apiSortDir: "ASC" | "DESC";

      switch (sortBy) {
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
        // --- THÊM CASE NÀY ---
        case "discount_desc":
          apiSortBy = "discountPercent";
          apiSortDir = "DESC";
          break;
        // --- KẾT THÚC THÊM ---
        case "latest":
        default:
          apiSortBy = "createdAt";
          apiSortDir = "DESC";
      }

      const categoryNameToFindId = category || categoryParam;
      const categoryId = findCategoryIdByName(
        categoryNameToFindId,
        allCategories
      );

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
        console.error("Error fetching products:", err);
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
    brands,
    priceRange,
    rating,
    color,
    size,
    gender,
    categoryParam,
    allCategories,
    loadingCategories,
    setPage,
  ]);

  const handleFilterChange = (name: keyof Filters, value: any) => {
    if (name === "categories") setCategory(value);
    else if (name === "brands") setBrands(value);
    else if (name === "priceRange") setPriceRange(value);
    else if (name === "rating") setRating(value);
    else if (name === "colors") setColor(value);
    else if (name === "sizes") setSize(value);
    else if (name === "gender") setGender(value);
  };

  const handleClearFilters = () => {
    setCategory(DEFAULT_FILTERS.categories);
    setBrands(DEFAULT_FILTERS.brands);
    setPriceRange(DEFAULT_FILTERS.priceRange);
    setRating(DEFAULT_FILTERS.rating);
    setColor(DEFAULT_FILTERS.colors);
    setSize(DEFAULT_FILTERS.sizes);
    setGender(DEFAULT_FILTERS.gender);
    setSearchTerm("");
    setSortBy("latest");
  };

  const breadcrumbsData = useMemo(() => {
    const hierarchy = findCategoryHierarchy(categoryParam, allCategories);
    const data = [{ name: "Home", path: "/" }];
    hierarchy.forEach((cat) => {
      data.push({ name: cat.name, path: `/shop/${cat.name.toLowerCase()}` });
    });
    if (!categoryParam && hierarchy.length === 0) {
      data.push({ name: "Shop", path: "/shop" });
    }
    return data;
  }, [categoryParam, allCategories]);

  const parentCategoryId = useMemo(() => {
    const categoryNameFromParam = categoryParam
      ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
      : undefined;
    return findCategoryIdByName(categoryNameFromParam, allCategories);
  }, [categoryParam, allCategories]);

  const handleDrawerClose = () => {
    setFilterDrawerOpen(false);
  };
  const drawerContent = (
    <Box
      sx={{
        width: 300,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
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
          Filters
        </Typography>
        <IconButton onClick={handleDrawerClose}>
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1 }}>
        {" "}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          parentCategoryId={parentCategoryId}
        />
      </Box>

      <Box
        sx={{ p: 2, borderTop: 1, borderColor: "divider", textAlign: "right" }}
      >
        <Button variant="contained" onClick={handleDrawerClose}>
          Apply
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box className="bg-background py-6 md:py-8">
      <Container maxWidth="xl">
        {/* Breadcrumbs (giữ nguyên) */}
        <Breadcrumbs
          separator={<ChevronRight fontSize="small" />}
          aria-label="breadcrumb"
          className="mb-4"
        >
          {loadingCategories ? (
            <Typography color="text.secondary">Loading path...</Typography>
          ) : categoryError ? (
            <Typography color="error">Error loading path</Typography>
          ) : (
            breadcrumbsData.map((item, index) => {
              const isLast = index === breadcrumbsData.length - 1;
              return isLast ? (
                <Typography key={item.name} className="!font-semibold">
                  {item.name}
                </Typography>
              ) : (
                <Link
                  key={item.name}
                  component={RouterLink}
                  to={item.path}
                  underline="hover"
                  color="inherit"
                  className="!flex items-center !text-text-secondary"
                >
                  {item.name === "Home" && (
                    <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                  )}
                  {item.name}
                </Link>
              );
            })
          )}
        </Breadcrumbs>

        <Grid container spacing={3} sx={{ mt: 0 }}>
          {/* Sidebar (giữ nguyên) */}
          <Grid item xs={12} md={3} className="hidden md:block">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              parentCategoryId={parentCategoryId}
            />
          </Grid>

          {/* Main Content (giữ nguyên) */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={0}
              className="mb-4 flex flex-col gap-4 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center"
            >
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  className: "!rounded-full !bg-background",
                }}
                className="flex-grow"
              />
              <Box className="flex items-center justify-between gap-4">
                <Typography
                  variant="body2"
                  className="!text-text-secondary !whitespace-nowrap"
                >
                  {isLoadingProducts
                    ? "Loading..."
                    : `${totalElements} Products Found`}
                </Typography>

                <FormControl size="small" className="min-w-[150px]">
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

                <IconButton
                  className="!bg-primary/10 !text-primary md:!hidden"
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  <FilterList />
                </IconButton>
              </Box>
            </Paper>

            <motion.div layout>
              <ProductGrid
                products={products}
                isLoading={isLoadingProducts}
                error={productError}
              />
            </motion.div>

            {!isLoadingProducts && !productError && totalPages > 1 && (
              <Box className="mt-8 flex justify-center">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_e, newPage) => setPage(newPage)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            {productError && (
              <Alert severity="error" sx={{ mt: 4 }}>
                {productError}
              </Alert>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Drawer (giữ nguyên) */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default ShoppingPage;
