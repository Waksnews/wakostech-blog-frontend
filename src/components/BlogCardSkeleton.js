import React from "react";
import { Card, CardContent, Box, Skeleton } from "@mui/material";

const BlogCardSkeleton = ({ size = "medium" }) => {
  const getImageHeight = () => {
    switch (size) {
      case "featured": return 240;
      case "medium": return 160;
      case "small": return 140;
      case "sidebar": return 80;
      default: return 160;
    }
  };

  const getTitleLines = () => {
    switch (size) {
      case "featured": return 2;
      case "medium": return 2;
      case "small": return 2;
      case "sidebar": return 2;
      default: return 2;
    }
  };

  return (
    <Card sx={{ 
      borderRadius: "12px", 
      boxShadow: "var(--card-shadow)",
      height: "100%",
      opacity: 0.8
    }}>
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={getImageHeight()} 
        sx={{ borderRadius: "12px 12px 0 0" }}
      />
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={60} height={16} />
          </Box>
          <Skeleton variant="text" width={40} height={16} />
        </Box>

        {[...Array(getTitleLines())].map((_, index) => (
          <Skeleton 
            key={index}
            variant="text" 
            width={index === 0 ? "90%" : "70%"} 
            height={20} 
            sx={{ mb: 0.5 }}
          />
        ))}

        {size !== "sidebar" && (
          <>
            <Skeleton variant="text" width="100%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1.5 }} />
          </>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Skeleton variant="circular" width={14} height={14} />
          <Skeleton variant="text" width={80} height={14} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlogCardSkeleton;