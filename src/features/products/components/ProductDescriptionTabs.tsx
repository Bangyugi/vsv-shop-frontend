import { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import type { ProductDetail } from "../../../types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Typography component="div" sx={{ lineHeight: 1.8 }}>
            {children}
          </Typography>
        </Box>
      )}
    </div>
  );
}

interface ProductDescriptionTabsProps {
  product: ProductDetail;
}

const ProductDescriptionTabs = ({ product }: ProductDescriptionTabsProps) => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Product details tabs"
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Description" id="product-tab-0" />
          <Tab label="Instructions" id="product-tab-1" />
          <Tab label="Shipping & Returns" id="product-tab-2" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            margin: 0,
          }}
        >
          {product.longDescription}
        </pre>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            margin: 0,
          }}
        >
          {product.careInstructions}
        </pre>
      </TabPanel>
      <TabPanel value={value} index={2}>
        {product.shippingPolicy}
      </TabPanel>
    </Box>
  );
};

export default ProductDescriptionTabs;
