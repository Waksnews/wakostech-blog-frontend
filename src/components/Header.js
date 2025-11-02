import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../redux/store";
import toast from "react-hot-toast";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Person, ExitToApp, Dashboard, Menu as MenuIcon } from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  let isLogin = useSelector((state) => state.isLogin);
  isLogin = isLogin || localStorage.getItem("userId");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  
  // ✅ FIXED: Removed unused setSearchQuery
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userData, setUserData] = useState({
    username: "User",
    email: "Welcome!"
  });

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      const username = localStorage.getItem("username");
      const email = localStorage.getItem("email");
      
      setUserData({
        username: username || "User",
        email: email || "Welcome!"
      });
    };

    loadUserData();
    
    window.addEventListener('storage', loadUserData);
    
    return () => {
      window.removeEventListener('storage', loadUserData);
    };
  }, []);

  const handleLogout = () => {
    try {
      dispatch(authActions.logout());
      toast.success("Logout Successfully");
      navigate("/login");
      localStorage.clear();
      handleUserMenuClose();
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ FIXED: Removed unused handleSearch function

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  // Get current date formatted like Chrome News
  const getCurrentDate = () => {
    const now = new Date();
    const options = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return now.toLocaleDateString('en-US', options);
  };

  return (
    <>
      {/* Top Date Bar - Retro Style */}
      <Box sx={{ 
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        padding: '6px 0',
        fontSize: '0.8rem',
        textAlign: 'center',
        fontWeight: '400',
        fontFamily: 'Arial, sans-serif',
        borderBottom: '1px solid #34495e'
      }}>
        {getCurrentDate()}
      </Box>

      <AppBar 
        position="sticky" 
        sx={{ 
          backgroundColor: '#ffffff',
          color: '#2c3e50',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '2px solid #e74c3c'
        }}
      >
        <Toolbar sx={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          width: '100%',
          padding: { xs: '8px 16px', md: '12px 24px' },
          minHeight: '70px !important',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
          
          {/* Logo and Tagline Row */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%',
            justifyContent: 'space-between',
            mb: 1
          }}>
            {/* Logo Section */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <Typography 
                variant="h3" 
                component={Link}
                to="/"
                sx={{ 
                  textDecoration: 'none',
                  color: '#2c3e50',
                  fontWeight: '700',
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '-1px',
                  lineHeight: 1
                }}
              >
                WakosTech
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#7f8c8d',
                  fontSize: '0.75rem',
                  fontStyle: 'italic',
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: '300'
                }}
              >
                CODED PROUDLY BY WAKO ROBA
              </Typography>
            </Box>

            {/* Right Side Actions */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1
            }}>
              {/* Theme Toggle */}
              <IconButton 
                onClick={toggleTheme} 
                sx={{ 
                  color: '#2c3e50',
                  '&:hover': {
                    backgroundColor: '#ecf0f1'
                  }
                }}
              >
                {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>

              {/* Mobile Menu Button */}
              <IconButton 
                onClick={handleMobileMenuOpen}
                sx={{ 
                  color: '#2c3e50',
                  display: { md: 'none' }
                }}
              >
                <MenuIcon />
              </IconButton>

              {/* User Menu or Auth Buttons */}
              {!isLogin ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{ 
                      color: '#2c3e50',
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      padding: '4px 12px',
                      border: '1px solid #bdc3c7',
                      borderRadius: '3px',
                      '&:hover': {
                        backgroundColor: '#ecf0f1'
                      }
                    }}
                  >
                    SIGN IN
                  </Button>
                </Box>
              ) : (
                <>
                  <IconButton 
                    onClick={handleUserMenuOpen} 
                    sx={{ 
                      p: 0.5,
                      '&:hover': {
                        backgroundColor: '#ecf0f1'
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: '#e74c3c', 
                        width: 32, 
                        height: 32,
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      {userData.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>

                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: "3px",
                        boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                        backgroundColor: '#ffffff',
                        border: '1px solid #bdc3c7',
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                        {userData.username}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                        {userData.email}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ borderColor: '#ecf0f1' }} />
                    
                    <MenuItem 
                      onClick={() => { handleUserMenuClose(); navigate('/profile'); }}
                      sx={{ color: '#2c3e50', fontSize: '0.9rem' }}
                    >
                      <Person sx={{ mr: 2, fontSize: 18 }} />
                      Profile
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => { handleUserMenuClose(); navigate('/dashboard'); }}
                      sx={{ color: '#2c3e50', fontSize: '0.9rem' }}
                    >
                      <Dashboard sx={{ mr: 2, fontSize: 18 }} />
                      Dashboard
                    </MenuItem>
                    
                    <Divider sx={{ borderColor: '#ecf0f1' }} />
                    
                    <MenuItem 
                      onClick={handleLogout} 
                      sx={{ color: '#e74c3c', fontSize: '0.9rem' }}
                    >
                      <ExitToApp sx={{ mr: 2, fontSize: 18 }} />
                      Sign out
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>

          {/* Main Navigation Menu - Retro Style */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            width: '100%',
            gap: 3,
            pt: 1
          }}>
            {/* Main Navigation Links */}
            <Button
              component={Link}
              to="/blogs"
              sx={{ 
                color: '#2c3e50',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                fontWeight: '700',
                padding: '2px 8px',
                minWidth: 'auto',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#e74c3c'
                }
              }}
            >
              BLOG
            </Button>
            
            <Button
              sx={{ 
                color: '#2c3e50',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                fontWeight: '700',
                padding: '2px 8px',
                minWidth: 'auto',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#e74c3c'
                }
              }}
            >
              SINGLE POST
            </Button>
            
            {/* Empty buttons for layout - keeping for design consistency */}
            <Button sx={{ color: '#2c3e50', textTransform: 'uppercase', fontSize: '0.85rem', minWidth: 'auto' }} />
            <Button sx={{ color: '#2c3e50', textTransform: 'uppercase', fontSize: '0.85rem', minWidth: 'auto' }} />
            <Button sx={{ color: '#2c3e50', textTransform: 'uppercase', fontSize: '0.85rem', minWidth: 'auto' }} />

            {/* Right Side Navigation */}
            <Box sx={{ display: 'flex', gap: 3, ml: 'auto' }}>
              <Button sx={{ color: '#2c3e50', textTransform: 'uppercase', fontSize: '0.85rem', minWidth: 'auto' }} />
              <Button
                component={Link}
                to="/register"
                sx={{ 
                  color: '#2c3e50',
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  minWidth: 'auto',
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#e74c3c'
                  }
                }}
              >
                REGISTER
              </Button>
            </Box>
          </Box>

          {/* Breaking News Ticker */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            width: '100%',
            backgroundColor: '#e74c3c',
            color: 'white',
            padding: '4px 12px',
            mt: 1,
            borderRadius: '2px',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            <Box sx={{ 
              backgroundColor: '#c0392b', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '2px',
              mr: 2,
              fontSize: '0.7rem',
              fontWeight: '700'
            }}>
              BREAKING NEWS
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: '500' }}>
              Need to Know About the Classic Cars in a Retro Movie? • How Many of These Italian Foods Have You Tried? • How To Headlin
            </Typography>
          </Box>

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: "3px",
                boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                backgroundColor: '#ffffff',
                border: '1px solid #bdc3c7',
              },
            }}
          >
            <MenuItem component={Link} to="/blogs" onClick={handleMobileMenuClose} sx={{ fontSize: '0.9rem' }}>
              BLOG
            </MenuItem>
            
            {/* CREATE POST - Only show in mobile menu when logged in */}
            {isLogin && (
              <MenuItem component={Link} to="/create-blog" onClick={handleMobileMenuClose} sx={{ fontSize: '0.9rem' }}>
                CREATE POST
              </MenuItem>
            )}
            
            <MenuItem onClick={handleMobileMenuClose} sx={{ fontSize: '0.9rem' }}>SINGLE POST</MenuItem>
            <MenuItem onClick={handleMobileMenuClose} sx={{ fontSize: '0.9rem' }}>MAIN BANNER</MenuItem>
            <MenuItem onClick={handleMobileMenuClose} sx={{ fontSize: '0.9rem' }}>ARCHIVE</MenuItem>
            <MenuItem onClick={handleMobileMenuClose} sx={{ fontSize: '0.9rem' }}>ALL DEMOS</MenuItem>
            <MenuItem onClick={handleMobileMenuClose} sx={{ fontSize: '0.9rem' }}>PURCHASE</MenuItem>
            <MenuItem component={Link} to="/register" onClick={handleMobileMenuClose} sx={{ fontSize: '0.9rem' }}>
              REGISTER
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;