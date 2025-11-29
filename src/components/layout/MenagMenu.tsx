import { Box, Grid, Link, Typography } from "@mui/material";
import { motion } from "framer-motion";
import type { MegaMenuCategory } from "../../types/category";
import { Link as RouterLink } from "react-router-dom";

interface MegaMenuProps {
  categories: MegaMenuCategory[];
}

const MegaMenu = ({ categories }: MegaMenuProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        className="shadow-lg rounded-b-md"
        sx={{
          p: 4,
          bgcolor: "white",
          border: "1px solid",
          borderColor: "divider",
          borderTop: "none",
        }}
      >
        <Grid container spacing={4} sx={{ flexWrap: "nowrap" }}>
          {categories.map((level2Category) => (
            <Grid item sx={{ minWidth: 160 }} key={level2Category.id}>
              <Link
                component={RouterLink}
                to={`/shop/${level2Category.name.toLowerCase()}`}
                underline="none"
                sx={{
                  display: "block",
                  marginBottom: "10px",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "primary.dark",
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  className="font-bold text-primary mb-3"
                  sx={{
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    fontSize: 16,
                    color: "primary.main",
                  }}
                >
                  {level2Category.name}
                </Typography>
              </Link>

              {level2Category.children.map((level3Category) => (
                <Link
                  key={level3Category.id}
                  component={RouterLink}
                  to={`/shop/${level3Category.name.toLowerCase()}`}
                  underline="hover"
                  display="block"
                  sx={{
                    color: "text.secondary",
                    py: 0.5,
                    whiteSpace: "nowrap",
                    fontSize: 14,
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {level3Category.name}
                </Link>
              ))}
            </Grid>
          ))}
        </Grid>
      </Box>
    </motion.div>
  );
};

export default MegaMenu;
