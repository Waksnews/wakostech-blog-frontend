import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  AccessTime,
  CalendarToday,
  Favorite,
  FavoriteBorder,
  Bookmark,
  BookmarkBorder,
  Share,
  Edit,
  Title,
  Description,
  PhotoCamera,
  ArrowBack, // ✅ ADDED BACK ICON
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import Comment from "../components/Comment";
import DOMPurify from "dompurify";

// React Quill import
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactQuillRef = React.useRef(null);
  
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // EDIT MODAL STATE
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = getAuthToken();
    const userId = localStorage.getItem("userId");
    return !!(token && userId);
  };

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ✅ ADDED IMAGE URL HELPER FUNCTION
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:image')) return imagePath;
    return `https://wakostechblog-backend.onrender.com${imagePath}`;
  };

  // ✅ ADDED BACK BUTTON FUNCTIONALITY
  const handleBack = () => {
    // Go back to previous page, or to blogs page if no history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/blogs');
    }
  };

  const getBlogDetail = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/blog/get-blog/${id}`);
      if (data?.success) {
        setBlog(data.blog);
        setLikesCount(data.blog.likesCount || 0);
        setFavoritesCount(data.blog.favoritesCount || 0);
        
        // Initialize edit form with blog data
        setEditForm({
          title: data.blog.title,
          description: data.blog.description,
          category: data.blog.category,
          image: null,
        });
        setImagePreview(data.blog.image || null);
        
        // Check if current user has liked/favorited this blog
        const userId = localStorage.getItem("userId");
        if (userId && data.blog.likes) {
          setIsLiked(data.blog.likes.includes(userId));
        }
        if (userId && data.blog.favorites) {
          setIsFavorited(data.blog.favorites.includes(userId));
        }
      }
    } catch (error) {
      console.log(error);
      setError("Failed to load blog");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const getComments = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/v1/comments/blog/${id}`);
      if (data?.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.log("Comments not available:", error);
      setComments([]);
    }
  }, [id]);

  useEffect(() => {
    getBlogDetail();
    getComments();
  }, [getBlogDetail, getComments]);

  // React Quill configuration
  const modules = React.useMemo(() => ({
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

  // Custom image upload handler for ReactQuill
  async function handleImageUpload() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error("Image size must be less than 2MB");
          return;
        }

        setUploadingImage(true);
        
        try {
          const formData = new FormData();
          formData.append('image', file);

          const { data } = await axios.post('/api/v1/blog/upload-editor-image', formData, {
            headers: { 
              'Content-Type': 'multipart/form-data',
              ...getAuthHeaders()
            },
          });

          if (data?.success) {
            const quill = reactQuillRef.current.getEditor();
            const range = quill.getSelection();
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
  }

  // Quill styles
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

  // Edit functions
  const handleEdit = () => {
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
        `/api/v1/blog/update-blog/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders()
          }
        }
      );

      if (data?.success) {
        toast.success("Blog updated successfully!");
        setEditModalOpen(false);
        // Refresh the blog data
        getBlogDetail();
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
    setImagePreview(blog.image || null);
  };

  const handleLike = async () => {
    if (!isAuthenticated()) {
      toast.error("Please login to like blogs");
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.post(
        `/api/v1/blog/${id}/like`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      if (data?.success) {
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        toast.error("Please login again");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        // If API fails, toggle locally
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        toast.success(isLiked ? "Blog unliked" : "Blog liked");
      }
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated()) {
      toast.error("Please login to favorite blogs");
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.post(
        `/api/v1/blog/${id}/favorite`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      if (data?.success) {
        setIsFavorited(data.isFavorited);
        setFavoritesCount(data.favoritesCount);
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        toast.error("Please login again");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        // If API fails, toggle locally
        setIsFavorited(!isFavorited);
        setFavoritesCount(prev => isFavorited ? prev - 1 : prev + 1);
        toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!isAuthenticated()) {
      toast.error("Please login to comment");
      navigate("/login");
      return;
    }

    try {
      setCommentLoading(true);
      const { data } = await axios.post(
        "/api/v1/comments",
        {
          content: newComment,
          blogId: id,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      if (data?.success) {
        setNewComment("");
        getComments();
        getBlogDetail();
        toast.success("Comment added successfully");
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        toast.error("Please login again");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        toast.error("Failed to add comment");
      }
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated()) {
      toast.error("Please login to delete comments");
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.delete(
        `/api/v1/comments/${commentId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (data?.success) {
        getComments();
        getBlogDetail();
        toast.success("Comment deleted successfully");
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        toast.error("Please login again");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        toast.error("Failed to delete comment");
      }
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Blog not found</Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* ✅ ADDED BACK BUTTON SECTION */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{
              color: "var(--text-secondary)",
              textTransform: "none",
              fontWeight: 500,
              mb: 2,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                color: "var(--primary-color)",
              }
            }}
          >
            Back to Blogs
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Chip 
                    label={blog.category?.charAt(0).toUpperCase() + blog.category?.slice(1) || "General"} 
                    color="primary"
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                    {blog.title}
                  </Typography>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {blog.user?.username?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {blog.user?.username}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 16, color: "var(--text-tertiary)" }} />
                      <Typography variant="body2" sx={{ color: "var(--text-tertiary)" }}>
                        {formatDate(blog.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTime sx={{ fontSize: 16, color: "var(--text-tertiary)" }} />
                      <Typography variant="body2" sx={{ color: "var(--text-tertiary)" }}>
                        {Math.ceil(blog.description?.split(/\s+/).length / 200)} min read
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {blog.image && (
                  <Box sx={{ mb: 3 }}>
                    <img
                      src={getFullImageUrl(blog.image)} /* ✅ FIXED IMAGE URL */
                      alt={blog.title}
                      style={{
                        width: "100%",
                        height: "400px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  </Box>
                )}

                {/* Blog Content */}
                <Box
                  sx={{
                    color: "var(--text-primary)",
                    lineHeight: 1.8,
                    fontSize: "1.1rem",
                    "& img": {
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "10px",
                      margin: "20px 0",
                      display: "block",
                    },
                    "& p": {
                      marginBottom: "16px",
                    },
                    "& h1, & h2, & h3, & h4, & h5, & h6": {
                      marginTop: "24px",
                      marginBottom: "16px",
                      fontWeight: "600"
                    },
                    "& ul, & ol": {
                      paddingLeft: "24px",
                      marginBottom: "16px"
                    },
                    "& li": {
                      marginBottom: "8px"
                    },
                    "& blockquote": {
                      borderLeft: "4px solid #3b82f6",
                      paddingLeft: "16px",
                      margin: "16px 0",
                      fontStyle: "italic",
                      color: "#6b7280"
                    },
                    "& a": {
                      color: "#3b82f6",
                      textDecoration: "underline"
                    },
                    "& code": {
                      backgroundColor: "#f3f4f6",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontFamily: "monospace"
                    },
                    "& pre": {
                      backgroundColor: "#1f2937",
                      color: "white",
                      padding: "16px",
                      borderRadius: "8px",
                      overflow: "auto",
                      margin: "16px 0"
                    }
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(blog.description || ""),
                  }}
                />

                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton onClick={handleLike} sx={{ color: isLiked ? "var(--error-color)" : "var(--text-secondary)" }}>
                      {isLiked ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                    <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                      {likesCount}
                    </Typography>

                    <IconButton onClick={handleFavorite} sx={{ color: isFavorited ? "var(--warning-color)" : "var(--text-secondary)" }}>
                      {isFavorited ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                    <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                      {favoritesCount}
                    </Typography>

                    <IconButton onClick={handleShare} sx={{ color: "var(--text-secondary)" }}>
                      <Share />
                    </IconButton>
                  </Box>

                  {blog.user?._id === localStorage.getItem("userId") && (
                    <Button
                      startIcon={<Edit />}
                      variant="outlined"
                      onClick={handleEdit}
                    >
                      Edit Blog
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Comments ({blog.commentCount || 0})
                </Typography>

                {isAuthenticated() ? (
                  <Box sx={{ mb: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="contained"
                        onClick={handleAddComment}
                        disabled={commentLoading}
                      >
                        {commentLoading ? <CircularProgress size={20} /> : "Post Comment"}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 2 }}>
                      Please login to leave a comment
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/login")}>
                      Login
                    </Button>
                  </Box>
                )}

                <Divider sx={{ mb: 3 }} />

                {/* Comments List */}
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <Comment 
                      key={comment._id} 
                      comment={comment} 
                      onDelete={handleDeleteComment}
                      onReplyAdded={getComments}
                    />
                  ))
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
                      No comments yet. Be the first to comment!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ position: "sticky", top: 100 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    About the Author
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 60, height: 60, fontSize: "1.5rem" }}>
                      {blog.user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {blog.user?.username}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
                        {blog.user?.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    fullWidth 
                    variant="outlined"
                    onClick={() => navigate(`/my-blogs`)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* EDIT MODAL */}
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
            /* Title Input */
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
                        src={getFullImageUrl(imagePreview)} /* ✅ FIXED IMAGE PREVIEW URL */
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
};

export default BlogDetails;