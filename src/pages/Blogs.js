import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import BlogCardSkeleton from "../components/BlogCardSkeleton";
import SearchBar from "../components/SearchBar";
import Newsletter from "../components/Newsletter";
import {
  Box,
  Grid,
  Container,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    "all",
    "technology",
    "science", 
    "business",
    "health",
    "entertainment",
    "sports",
    "lifestyle"
  ];

  const getAllBlogs = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const { data } = await axios.get(`/api/v1/blog/all-blog?page=${pageNum}&limit=9`);
      if (data?.success) {
        if (append) {
          setBlogs(prev => [...prev, ...data.blogs]);
        } else {
          setBlogs(data.blogs);
        }
        
        setHasMore(data.blogs.length === 9);
        if (!append) {
          setFilteredBlogs(data.blogs);
        }
      }
    } catch (error) {
      console.log(error);
      setError("Failed to load blogs");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    let result = blogs;

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(blog => 
        blog.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchTerm) {
      result = result.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case "newest":
        result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result = [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "title":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "popular":
        result = [...result].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        break;
      default:
        break;
    }

    setFilteredBlogs(result);
  }, [blogs, searchTerm, sortBy, selectedCategory]);

  useEffect(() => {
    getAllBlogs(1);
  }, [getAllBlogs]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    getAllBlogs(nextPage, true);
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
    setPage(1);
    if (!query) {
      getAllBlogs(1);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Skeleton Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ width: "60%", mb: 2 }}>
            <Box sx={{ width: "300px", height: "48px", bgcolor: "grey.300", borderRadius: 1, mb: 1 }} />
            <Box sx={{ width: "400px", height: "28px", bgcolor: "grey.300", borderRadius: 1 }} />
          </Box>
          
          {/* Skeleton Filters */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ width: "250px", height: "56px", bgcolor: "grey.300", borderRadius: "28px" }} />
            <Box sx={{ width: "120px", height: "56px", bgcolor: "grey.300", borderRadius: "28px" }} />
            <Box sx={{ width: "120px", height: "56px", bgcolor: "grey.300", borderRadius: "28px" }} />
          </Box>
        </Box>

        {/* Skeleton Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <BlogCardSkeleton size={index < 2 ? "medium" : "small"} />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[...Array(4)].map((_, index) => (
                <BlogCardSkeleton key={index} size="sidebar" />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            color: "var(--text-primary)",
            mb: 2
          }}
        >
          Latest News
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: "var(--text-secondary)",
            mb: 3
          }}
        >
          Stay updated with the latest articles and insights
        </Typography>
        
        {/* Search and Filter Bar */}
        <Box sx={{ 
          display: "flex", 
          gap: 2, 
          flexWrap: "wrap",
          alignItems: "center",
          mb: 4
        }}>
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search blogs by title, content, or author..."
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
              sx={{ borderRadius: "20px" }}
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ borderRadius: "20px" }}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="title">Title A-Z</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Featured Post Section */}
      {filteredBlogs.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "var(--text-primary)" }}>
            Featured Story
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <BlogCard
                {...filteredBlogs[0]}
                id={filteredBlogs[0]._id}
                isUser={localStorage.getItem("userId") === filteredBlogs[0].user?._id}
                featured={true}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Main Content Grid */}
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Main Articles */}
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "var(--text-primary)" }}>
              {searchTerm ? `Search Results for "${searchTerm}"` : "Latest Articles"}
              {selectedCategory !== "all" && ` in ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
            </Typography>
            
            {filteredBlogs.length > 1 ? (
              <>
                <Grid container spacing={3}>
                  {filteredBlogs.slice(1, 7).map((blog, index) => (
                    <Grid item xs={12} sm={6} key={blog._id}>
                      <BlogCard
                        {...blog}
                        id={blog._id}
                        isUser={localStorage.getItem("userId") === blog.user?._id}
                        size={index < 2 ? "medium" : "small"}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Load More Section */}
                {hasMore && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={loadMore}
                      disabled={loadingMore}
                      sx={{
                        borderRadius: "20px",
                        px: 4,
                        py: 1,
                        minWidth: 120
                      }}
                    >
                      {loadingMore ? <CircularProgress size={24} /> : "Load More"}
                    </Button>
                  </Box>
                )}
              </>
            ) : filteredBlogs.length === 1 ? (
              <Typography sx={{ color: "var(--text-secondary)", textAlign: "center", py: 4 }}>
                Only one blog found - it's featured above!
              </Typography>
            ) : null}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Trending Now */}
              <Box sx={{ 
                position: "sticky", 
                top: 100,
                backgroundColor: "var(--surface-color)",
                borderRadius: "12px",
                padding: 3,
                border: "1px solid var(--border-color)"
              }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "var(--text-primary)" }}>
                  Trending Now
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {filteredBlogs.slice(0, 5).map((blog) => (
                    <BlogCard
                      key={blog._id}
                      {...blog}
                      id={blog._id}
                      isUser={localStorage.getItem("userId") === blog.user?._id}
                      size="sidebar"
                    />
                  ))}
                  {filteredBlogs.length === 0 && (
                    <Typography variant="body2" sx={{ color: "var(--text-secondary)", textAlign: "center", py: 2 }}>
                      No blogs found
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Newsletter */}
              <Newsletter />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* No Results Message */}
      {filteredBlogs.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" sx={{ color: "var(--text-secondary)", mb: 2 }}>
            No blogs found
          </Typography>
          <Typography variant="body1" sx={{ color: "var(--text-tertiary)" }}>
            {searchTerm ? `Try adjusting your search terms or filters` : "Be the first to create a blog!"}
          </Typography>
          {localStorage.getItem("userId") && (
            <Button 
              variant="contained" 
              sx={{ mt: 2, borderRadius: "20px" }}
              onClick={() => navigate("/create-blog")}
            >
              Create Your First Blog
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Blogs;