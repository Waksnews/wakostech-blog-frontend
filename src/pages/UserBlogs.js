import React, { useState, useEffect } from "react";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import { Box, Container, Typography, Grid, CircularProgress, Alert, Button } from "@mui/material";

const UserBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //get user blogs - FIXED ENDPOINT
  const getUserBlogs = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      console.log("Fetching blogs for user:", userId);
      
      let data;
      
      // Try protected endpoint first (current user blogs)
      try {
        const response = await axios.get(`/api/v1/blog/user-blog`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        data = response.data;
        console.log("Protected endpoint response:", data);
      } catch (protectedError) {
        console.log("Protected endpoint failed, trying public endpoint...");
        // Fallback to public endpoint
        const response = await axios.get(`/api/v1/blog/user-blog/${userId}`);
        data = response.data;
        console.log("Public endpoint response:", data);
      }

      if (data?.success) {
        // Handle both response formats
        const blogsData = data.userBlog?.blogs || data.blogs || data.userBlog || [];
        console.log("Blogs data:", blogsData);
        setBlogs(Array.isArray(blogsData) ? blogsData : []);
      } else {
        setError("Failed to load blogs");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError(error.response?.data?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserBlogs();
  }, []);

  // Handle blog update
  const handleBlogUpdate = (updatedBlog) => {
    console.log("Updating blog:", updatedBlog);
    setBlogs(prevBlogs => 
      prevBlogs.map(blog => 
        blog._id === updatedBlog._id ? { ...blog, ...updatedBlog } : blog
      )
    );
  };

  // Handle blog delete
  const handleBlogDelete = (deletedBlogId) => {
    console.log("Deleting blog:", deletedBlogId);
    setBlogs(prevBlogs => 
      prevBlogs.filter(blog => blog._id !== deletedBlogId)
    );
  };

  // Refresh blogs
  const refreshBlogs = () => {
    getUserBlogs();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          My Blogs
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ color: "var(--text-secondary)" }}
        >
          {blogs.length} {blogs.length === 1 ? 'Blog' : 'Blogs'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Box mt={1}>
            <Button onClick={refreshBlogs} variant="outlined" size="small">
              Try Again
            </Button>
          </Box>
        </Alert>
      )}

      {blogs && blogs.length > 0 ? (
        <Grid container spacing={3}>
          {blogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} key={blog._id}>
              <BlogCard
                id={blog._id}
                isUser={true}
                title={blog.title}
                description={blog.description}
                image={blog.image}
                username={blog.user?.username || blog.username || "Unknown User"}
                time={blog.createdAt}
                category={blog.category || "technology"}
                likesCount={blog.likesCount || 0}
                favoritesCount={blog.favoritesCount || 0}
                onBlogUpdate={handleBlogUpdate}
                onBlogDelete={handleBlogDelete}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box 
          textAlign="center" 
          sx={{ 
            py: 8,
            backgroundColor: "var(--card-background)",
            borderRadius: 2,
            boxShadow: "var(--card-shadow)"
          }}
        >
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{ color: "var(--text-secondary)" }}
          >
            You Haven't Created Any Blogs Yet
          </Typography>
          <Typography 
            variant="body1"
            sx={{ color: "var(--text-tertiary)", mb: 3 }}
          >
            Start sharing your thoughts and experiences with the world!
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default UserBlogs;