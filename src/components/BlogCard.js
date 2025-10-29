import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  InputLabel,
} from "@mui/material";
import toast from "react-hot-toast";
import axios from "../utils/axiosConfig";
import DOMPurify from "dompurify";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { PhotoCamera, Title, Description } from "@mui/icons-material";

// React Quill import
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function BlogCard({
  title,
  description,
  image,
  username,
  time,
  id,
  isUser,
  featured = false,
  size = "medium",
  likesCount = 0,
  favoritesCount = 0,
  category = "technology",
  onBlogUpdate,
  onBlogDelete,
}) {
  const navigate = useNavigate();
  const reactQuillRef = useRef(null);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount);
  const [currentFavoritesCount, setCurrentFavoritesCount] = useState(favoritesCount);
  
  // EDIT MODAL STATE
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editForm, setEditForm] = useState({
    title: title,
    description: description,
    category: category,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(image || null);

  // Custom image upload handler for ReactQuill
  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        // Check file size (2MB limit for inline images)
        if (file.size > 2 * 1024 * 1024) {
          toast.error("Image size must be less than 2MB");
          return;
        }

        setUploadingImage(true);
        
        try {
          const formData = new FormData();
          formData.append('image', file);

          const { data } = await axios.post('/blog/upload-editor-image', formData, {
            headers: { 
              'Content-Type': 'multipart/form-data',
            },
          });

          if (data?.success) {
            // Get the Quill editor instance
            const quill = reactQuillRef.current.getEditor();
            const range = quill.getSelection();
            
            // Insert the image at cursor position
            quill.insertEmbed(range.index, 'image', data.imageUrl);
            
            toast.success("Image uploaded successfully!");
          } else {
            toast.error("Failed to upload image");
          }
        } catch (error) {
          console.error('Image upload error:', error);
          toast.error("Failed to upload image. Please try again.");
        } finally {
          setUploadingImage(false);
        }
      }
    };
  };

  // React Quill configuration with custom image handler
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: handleImageUpload
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'script',
    'list', 'bullet', 'indent', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  // Custom styles for React Quill
  const quillStyles = {
    '& .ql-toolbar': {
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      borderColor: '#d1d5db',
      backgroundColor: '#f9fafb'
    },
    '& .ql-container': {
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
      borderColor: '#d1d5db',
      fontSize: '16px',
      fontFamily: 'inherit',
      minHeight: '300px'
    },
    '& .ql-editor': {
      minHeight: '300px',
      '&.ql-blank::before': {
        color: '#9ca3af',
        fontStyle: 'normal',
        fontSize: '16px'
      },
      '& img': {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '8px',
        margin: '10px 0'
      }
    },
    '& .ql-toolbar .ql-formats': {
      marginRight: '15px'
    }
  };

  // FIXED: Proper edit function
  const handleEdit = () => {
    setEditForm({
      title: title,
      description: description,
      category: category,
      image: null,
    });
    setImagePreview(image || null);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      if (!editForm.description || editForm.description === '<p><br></p>' || editForm.description === '<p></p>') {
        toast.error("Please add some content to your blog post");
        setEditLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      formData.append('category', editForm.category);
      
      if (editForm.image) {
        formData.append('image', editForm.image);
      }

      const { data } = await axios.put(
        `/blog/update-blog/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (data?.success) {
        toast.success("Blog updated successfully!");
        setEditModalOpen(false);
        
        // Call the parent callback to refresh the blog list
        if (onBlogUpdate) {
          onBlogUpdate(data.blog);
        }
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update blog");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (content) => {
    setEditForm(prev => ({
      ...prev,
      description: content,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setEditForm(prev => ({
        ...prev,
        image: file
      }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setEditForm(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  // ... (keep all your existing functions: handleDelete, handleShare, handleLike, handleFavorite, etc.)

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      const { data } = await axios.delete(`/blog/delete-blog/${id}`);
      if (data?.success) {
        toast.success("Blog deleted successfully");
        
        // Call the parent callback to remove the blog from list
        if (onBlogDelete) {
          onBlogDelete(id);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete blog");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/blog-details/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleLike = async () => {
    if (!localStorage.getItem("userId")) {
      toast.error("Please login to like blogs");
      navigate('/login');
      return;
    }

    try {
      const { data } = await axios.post(`/blog/like-blog/${id}`);
      if (data?.success) {
        setIsLiked(data.isLiked);
        setCurrentLikesCount(data.likesCount);
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        toast.error("Please login again");
      } else {
        toast.error("Failed to like blog");
      }
    }
  };

  const handleFavorite = async () => {
    if (!localStorage.getItem("userId")) {
      toast.error("Please login to favorite blogs");
      navigate('/login');
      return;
    }

    try {
      const { data } = await axios.post(`/blog/favorite-blog/${id}`);
      if (data?.success) {
        setIsFavorited(data.isFavorited);
        setCurrentFavoritesCount(data.favoritesCount);
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        toast.error("Please login again");
      } else {
        toast.error("Failed to favorite blog");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    // Strip HTML tags for accurate word count
    const cleanText = text?.replace(/<[^>]*>/g, '') || '';
    const words = cleanText.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const readingTime = calculateReadingTime(description);

  // ... (keep all your existing styling functions: getCardStyles, getImageStyles, getTitleVariant)

  const getCardStyles = () => {
    const baseStyles = {
      backgroundColor: "var(--card-background)",
      borderRadius: "12px",
      boxShadow: "var(--card-shadow)",
      transition: "all 0.3s ease",
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      "&:hover": {
        transform: size === "sidebar" ? "translateX(4px)" : "translateY(-4px)",
        boxShadow: "var(--card-shadow-hover)",
      },
    };

    switch (size) {
      case "featured":
        return {
          ...baseStyles,
          minHeight: 400,
        };
      case "medium":
        return {
          ...baseStyles,
          minHeight: 320,
        };
      case "small":
        return {
          ...baseStyles,
          minHeight: 280,
        };
      case "sidebar":
        return {
          ...baseStyles,
          minHeight: "auto",
          flexDirection: "row",
        };
      default:
        return baseStyles;
    }
  };

  const getImageStyles = () => {
    switch (size) {
      case "featured":
        return { height: 240 };
      case "medium":
        return { height: 160 };
      case "small":
        return { height: 140 };
      case "sidebar":
        return { height: 80, width: 80, minWidth: 80 };
      default:
        return { height: 160 };
    }
  };

  const getTitleVariant = () => {
    switch (size) {
      case "featured":
        return "h5";
      case "medium":
        return "h6";
      case "small":
      case "sidebar":
        return "body1";
      default:
        return "h6";
    }
  };

  return (
    <>
      <Card sx={getCardStyles()}>
        {/* Action buttons for user's own blogs */}
        {isUser && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "20px",
              padding: "4px",
              display: "flex",
              gap: 0.5,
            }}
          >
            <IconButton 
              onClick={handleEdit} 
              size="small"
              sx={{ 
                color: "var(--primary-color)",
                "&:hover": { backgroundColor: "rgba(26, 115, 232, 0.1)" }
              }}
            >
              <ModeEditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              onClick={handleDelete} 
              size="small"
              sx={{ 
                color: "var(--error-color)",
                "&:hover": { backgroundColor: "rgba(217, 48, 37, 0.1)" }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Action buttons for all users */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <IconButton 
            onClick={handleShare}
            size="small"
            sx={{ 
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "var(--text-secondary)",
              "&:hover": { 
                backgroundColor: "var(--primary-color)",
                color: "white"
              }
            }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>

          {localStorage.getItem("userId") && (
            <>
              <IconButton 
                onClick={handleLike}
                size="small"
                sx={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: isLiked ? "var(--error-color)" : "var(--text-secondary)",
                  "&:hover": { 
                    backgroundColor: "var(--error-color)",
                    color: "white"
                  }
                }}
              >
                {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>

              <IconButton 
                onClick={handleFavorite}
                size="small"
                sx={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: isFavorited ? "var(--warning-color)" : "var(--text-secondary)",
                  "&:hover": { 
                    backgroundColor: "var(--warning-color)",
                    color: "white"
                  }
                }}
              >
                {isFavorited ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
              </IconButton>
            </>
          )}
        </Box>

        {/* Image section */}
        <Box sx={{ 
          position: "relative", 
          flexShrink: 0,
          cursor: "pointer"
        }}
        onClick={() => navigate(`/blog-details/${id}`)}
        >
          <CardMedia
            component="img"
            image={image || "/api/placeholder/400/200"}
            alt={title}
            sx={{
              ...getImageStyles(),
              objectFit: "cover",
              transition: "transform 0.3s ease",
              ".MuiCard-root:hover &": {
                transform: "scale(1.05)",
              },
            }}
          />
          
          {/* Category chip */}
          <Chip
            label={category.charAt(0).toUpperCase() + category.slice(1)}
            size="small"
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              backgroundColor: "var(--primary-color)",
              color: "white",
              fontWeight: 500,
              fontSize: "0.7rem",
            }}
          />

          {/* Like/Favorite counts for featured posts */}
          {featured && (
            <Box sx={{ 
              position: "absolute", 
              top: 12, 
              right: 12, 
              display: "flex", 
              gap: 1,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderRadius: "16px",
              padding: "4px 8px",
              color: "white"
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <FavoriteIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">{currentLikesCount}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BookmarkIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">{currentFavoritesCount}</Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Content section */}
        <CardContent 
          sx={{ 
            flexGrow: 1, 
            display: "flex", 
            flexDirection: "column",
            p: size === "sidebar" ? 1.5 : 2,
            "&:last-child": { pb: size === "sidebar" ? 1.5 : 2 }
          }}
        >
          {/* Meta information */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
              flexWrap: "wrap",
              gap: 0.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, fontSize: "0.8rem" }}>
                <PersonIcon fontSize="small" />
              </Avatar>
              <Typography
                variant="caption"
                sx={{ color: "var(--text-secondary)", fontWeight: 500 }}
              >
                {username}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: "var(--text-tertiary)" }} />
              <Typography
                variant="caption"
                sx={{ color: "var(--text-tertiary)", whiteSpace: "nowrap" }}
              >
                {readingTime} min read
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant={getTitleVariant()}
            component="h3"
            sx={{
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.3,
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: size === "featured" ? 2 : size === "sidebar" ? 2 : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: size === "sidebar" ? "2.6em" : "auto",
              cursor: "pointer",
              "&:hover": {
                color: "var(--primary-color)",
              }
            }}
            onClick={() => navigate(`/blog-details/${id}`)}
          >
            {title}
          </Typography>

          {/* ✅ UPDATED: Description with HTML rendering - hidden for sidebar */}
          {size !== "sidebar" && (
            <Box
              sx={{
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                flexGrow: 1,
                overflow: "hidden",
                mb: 1,
                // Text clamping for multiple lines
                display: "-webkit-box",
                WebkitLineClamp: size === "featured" ? 3 : 2,
                WebkitBoxOrient: "vertical",
                // Styling for HTML content
                "& p": {
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: size === "featured" ? 3 : 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                },
                "& img": {
                  display: "none", // Hide images in preview to save space
                },
                "& h1, & h2, & h3, & h4, & h5, & h6": {
                  fontSize: "inherit",
                  fontWeight: "600",
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: size === "featured" ? 3 : 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                },
                "& ul, & ol": {
                  display: "none", // Hide lists in preview
                },
                "& blockquote": {
                  display: "none", // Hide blockquotes in preview
                },
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(description || ""),
              }}
            />
          )}

          {/* Footer with date and engagement */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: "var(--text-tertiary)" }} />
              <Typography
                variant="caption"
                sx={{ color: "var(--text-tertiary)" }}
              >
                {formatDate(time)}
              </Typography>
            </Box>

            {/* Engagement stats for non-sidebar cards */}
            {size !== "sidebar" && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FavoriteIcon sx={{ fontSize: 14, color: "var(--text-tertiary)" }} />
                  <Typography variant="caption" sx={{ color: "var(--text-tertiary)" }}>
                    {currentLikesCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <BookmarkIcon sx={{ fontSize: 14, color: "var(--text-tertiary)" }} />
                  <Typography variant="caption" sx={{ color: "var(--text-tertiary)" }}>
                    {currentFavoritesCount}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* EDIT MODAL WITH RICH TEXT EDITOR */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: 'white',
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          Edit Blog Post
        </DialogTitle>
        
        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ p: 3 }}>
            {/* Title Input */}
            <Box sx={{ mb: 3 }}>
              <InputLabel sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                fontWeight: 'bold',
                color: 'text.primary'
              }}>
                <Title sx={{ color: 'primary.main', mr: 1 }} />
                Blog Title
              </InputLabel>
              <TextField
                fullWidth
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                required
                placeholder="Enter a compelling title for your blog..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px',
                    },
                  },
                }}
              />
            </Box>

            {/* Rich Text Editor */}
            <Box sx={{ mb: 3 }}>
              <InputLabel sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                fontWeight: 'bold',
                color: 'text.primary'
              }}>
                <Description sx={{ color: 'success.main', mr: 1 }} />
                Blog Content
                {uploadingImage && (
                  <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                    📤 Uploading image...
                  </Typography>
                )}
              </InputLabel>
              
              <Box sx={quillStyles}>
                <ReactQuill
                  ref={reactQuillRef}
                  theme="snow"
                  value={editForm.description}
                  onChange={handleEditorChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your amazing story here... Use the toolbar above to format your text, add images, links, and more!"
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {editForm.description.replace(/<[^>]*>/g, '').length} characters,{' '}
                  {editForm.description.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} words
                </Typography>
                <Typography 
                  variant="caption" 
                  color={editForm.description.replace(/<[^>]*>/g, '').length < 50 ? 'error' : 'success.main'}
                >
                  {editForm.description.replace(/<[^>]*>/g, '').length < 50 ? 'Add more content' : 'Good length'}
                </Typography>
              </Box>
            </Box>

            {/* Category Selection */}
            <Box sx={{ mb: 3 }}>
              <InputLabel sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                Category
              </InputLabel>
              <TextField
                fullWidth
                select
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="science">Science</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="entertainment">Entertainment</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="lifestyle">Lifestyle</MenuItem>
              </TextField>
            </Box>

            {/* Image Upload Section */}
            <Box>
              <InputLabel sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                fontWeight: 'bold',
                color: 'text.primary'
              }}>
                <PhotoCamera sx={{ color: 'secondary.main', mr: 1 }} />
                Featured Image
              </InputLabel>
              
              <Box sx={{ spaceY: 2 }}>
                <Box 
                  sx={{ 
                    border: '2px dashed', 
                    borderColor: 'grey.300',
                    borderRadius: '12px',
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="edit-image-upload"
                  />
                  <label htmlFor="edit-image-upload" style={{ cursor: 'pointer' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 48, 
                        height: 48, 
                        bgcolor: 'secondary.light', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 1
                      }}>
                        <PhotoCamera sx={{ color: 'secondary.main' }} />
                      </Box>
                      <Typography variant="body2" fontWeight="medium" color="text.primary">
                        Click to change featured image
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Supports JPG, PNG, GIF • Max 5MB
                      </Typography>
                    </Box>
                  </label>
                </Box>

                {imagePreview && (
                  <Box sx={{ bgcolor: 'grey.50', borderRadius: '12px', p: 2, border: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant="body2" fontWeight="medium" color="text.primary" sx={{ mb: 1 }}>
                      Featured Image Preview:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          width: 80, 
                          height: 80, 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          border: '1px solid #d1d5db'
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {editForm.image?.name || 'Current image'}
                        </Typography>
                        {editForm.image && (
                          <Typography variant="caption" color="text.secondary">
                            {(editForm.image.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        )}
                      </Box>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Leave empty to keep current image
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setEditModalOpen(false)}
              variant="outlined"
              sx={{ borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={editLoading || !editForm.title || !editForm.description || editForm.description === '<p><br></p>'}
              startIcon={editLoading ? <CircularProgress size={20} /> : null}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '8px',
                fontWeight: 'bold',
                minWidth: '120px',
                '&:disabled': {
                  bgcolor: 'grey.400'
                }
              }}
            >
              {editLoading ? "Updating..." : "Update Blog"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}