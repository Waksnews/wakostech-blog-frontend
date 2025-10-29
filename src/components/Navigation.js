import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Tabs, Tab, Chip } from "@mui/material";

const Navigation = () => {
  const location = useLocation();
  
  // Define categories for the navigation (Chrome News style)
  const categories = [
    'Technology', 
    'Science', 
    'Business', 
    'Health', 
    'Entertainment', 
    'Sports',
    'Politics',
    'World'
  ];

  // Get current value for tabs
  const getCurrentValue = () => {
    if (location.pathname === "/blogs") return 0;
    if (location.pathname === "/my-blogs") return 1;
    if (location.pathname === "/create-blog") return 2;
    return 0;
  };

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("userId");

  return (
    <Box 
      sx={{ 
        backgroundColor: 'var(--background-color)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: '64px',
        zIndex: 999,
      }}
    >
      <Box sx={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        px: { xs: 2, md: 3 } 
      }}>
        {/* Category Navigation - Chrome News Style */}
        <Box sx={{ 
          overflowX: 'auto', 
          py: 2,
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            minWidth: 'max-content',
            pb: 0.5
          }}>
            {/* For You Chip (Chrome News style) */}
            <Link
              to="/blogs"
              style={{ textDecoration: 'none' }}
            >
              <Chip
                label="For You"
                clickable
                sx={{
                  backgroundColor: location.pathname === "/blogs" ? 
                    (document.documentElement.getAttribute('data-theme') === 'dark' ? '#8ab4f8' : '#1a73e8') : 
                    'transparent',
                  color: location.pathname === "/blogs" ? 
                    'white' : 
                    'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: location.pathname === "/blogs" ? 
                    'none' : 
                    '1px solid var(--border-color)',
                  borderRadius: '16px',
                  '&:hover': {
                    backgroundColor: location.pathname === "/blogs" ? 
                      (document.documentElement.getAttribute('data-theme') === 'dark' ? '#8ab4f8' : '#1a73e8') : 
                      'var(--surface-color)',
                  },
                }}
              />
            </Link>

            {/* Category Chips */}
            {categories.map((category) => (
              <Link
                key={category}
                to={`/blogs?category=${category.toLowerCase()}`}
                style={{ textDecoration: 'none' }}
              >
                <Chip
                  label={category}
                  clickable
                  sx={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    '&:hover': {
                      backgroundColor: 'var(--surface-color)',
                      color: 'var(--text-primary)',
                    },
                  }}
                />
              </Link>
            ))}
          </Box>
        </Box>

        {/* Main Navigation Tabs - Only show when logged in */}
        {isLoggedIn && (
          <Box sx={{ 
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--surface-color)'
          }}>
            <Tabs
              value={getCurrentValue()}
              sx={{
                minHeight: '48px',
                '& .MuiTabs-indicator': {
                  backgroundColor: 'var(--primary-color)',
                  height: '3px',
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTab-root': {
                  color: 'var(--text-secondary)',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  minWidth: 'auto',
                  padding: '12px 20px',
                  minHeight: '48px',
                  '&.Mui-selected': {
                    color: 'var(--primary-color)',
                  },
                  '&:hover': {
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--hover-color)'
                  }
                },
              }}
            >
              <Tab 
                label="All Blogs" 
                component={Link} 
                to="/blogs" 
              />
              <Tab 
                label="My Blogs" 
                component={Link} 
                to="/my-blogs" 
              />
              <Tab 
                label="Create Blog" 
                component={Link} 
                to="/create-blog" 
              />
            </Tabs>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Navigation;