import { Card, CardContent, Skeleton } from "@mui/material";

const ProductSkeleton = () => {
  return (
    <Card
      sx={{
        width: "100%",
        boxShadow: "none",
        border: "1px solid #eee",
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        sx={{ paddingTop: "100%" }}
      />
      <CardContent>
        <Skeleton height={28} width="80%" />
        <Skeleton height={24} width="40%" sx={{ marginTop: 1 }} />
      </CardContent>
    </Card>
  );
};

export default ProductSkeleton;
