import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

import * as categoryService from "../../../services/categoryService";
import type { ApiCategory } from "../../../types/category";

const categoryImages: Record<string, string> = {
  Pants:
    "https://sneakerdaily.vn/wp-content/uploads/2022/10/Gear-Cargo-Pants.jpg.webp",
  Shirts:
    "https://campussutra.com/cdn/shop/files/CSMOVSRT7609_3_52eadbc3-3c06-4480-abda-47bf3a54c0dd.jpg?v=1730801146&width=2000",
  Shoes:
    "https://wildrhinoshoes.com.au/cdn/shop/products/RushGrey_6.jpg?v=1677561364",
  Accessories:
    "https://img.freepik.com/free-photo/women-s-day-still-life-with-makeup-jewelry_23-2149263158.jpg?semt=ais_hybrid&w=740&q=80",
};

const CategorySection = () => {
  const [level1Categories, setLevel1Categories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevel1Categories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await categoryService.getCategories();
        if (response.code === 200 && response.data) {
          const level1 = response.data.filter((cat) => cat.level === 1);
          setLevel1Categories(level1);
        } else {
          throw new Error(response.message || "Failed to fetch categories");
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError(
          err.message || "Could not load categories. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLevel1Categories();
  }, []);

  return (
    <Container sx={{ py: 8 }}>
      {loading && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Grid container spacing={4}>
          {level1Categories.map((category, index) => (
            <Grid item xs={12} sm={6} md={3} key={category.id}>
              <RouterLink
                to={`/shop/${category.name.toLowerCase()}`}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 2,
                      cursor: "pointer",
                      "&:hover .category-image": {
                        transform: "scale(1.1)",
                      },
                      "&:hover .category-overlay": {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        categoryImages[category.name] ||
                        "/placeholder-category.jpg"
                      }
                      alt={category.name}
                      className="category-image"
                      sx={{
                        width: "100%",
                        height: { xs: 300, sm: 400 },
                        objectFit: "cover",
                        transition: "transform 0.4s ease",
                      }}
                    />
                    <Box
                      className="category-overlay"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        transition: "background-color 0.4s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h4"
                        component="h3"
                        className="font-bold text-white"
                      >
                        {category.name}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </RouterLink>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CategorySection;
