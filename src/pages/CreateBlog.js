import React, { useState, useMemo, useRef, useCallback } from "react";
import axios from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { 
  PhotoCamera, 
  Title, 
  Description,
  Send
} from "@mui/icons-material";

// React Quill import
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateBlog = () => {
  const navigate = useNavigate();
  const reactQuillRef = useRef(null);
  
  const [inputs, setInputs] = useState({
    title: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Custom image upload handler for ReactQuill
  const handleImageUpload = useCallback(() => {
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
  }, []);

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
  }), [handleImageUpload]); // ✅ FIXED: Added handleImageUpload dependency

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'script',
    'list', 'bullet', 'indent', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditorChange = (content) => {
    setInputs((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!inputs.description || inputs.description === '<p><br></p>' || inputs.description === '<p></p>') {
        toast.error("Please add some content to your blog post");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", inputs.title);
      formData.append("description", inputs.description);
      if (imageFile) formData.append("image", imageFile);

      const { data } = await axios.post("/blog/create-blog", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data?.success) {
        toast.success("Blog Created Successfully!");
        navigate("/my-blogs");
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 400) {
        toast.error("Please fill all required fields");
      } else if (error.response?.status === 401) {
        toast.error("Please login again");
        navigate("/login");
      } else {
        toast.error("Something went wrong while creating blog");
      }
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Title className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create A New Post
            </h1>
            <p className="text-gray-600 mt-2">Share your story with the world using our rich text editor</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <Title className="text-blue-600 mr-2" sx={{ fontSize: 20 }} />
                Blog Title
              </label>
              <TextField
                name="title"
                value={inputs.title}
                onChange={handleChange}
                variant="outlined"
                required
                fullWidth
                placeholder="Enter a compelling title for your blog..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                      borderWidth: '2px',
                    },
                  },
                }}
              />
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <Description className="text-green-600 mr-2" sx={{ fontSize: 20 }} />
                Blog Content
                {uploadingImage && (
                  <span className="ml-2 text-sm text-blue-600">
                    📤 Uploading image...
                  </span>
                )}
              </label>
              
              <Box sx={quillStyles}>
                <ReactQuill
                  ref={reactQuillRef}
                  theme="snow"
                  value={inputs.description}
                  onChange={handleEditorChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your amazing story here... Use the toolbar above to format your text, add images, links, and more!"
                />
              </Box>
              
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>
                  {inputs.description.replace(/<[^>]*>/g, '').length} characters,{' '}
                  {inputs.description.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} words
                </span>
                <span className={inputs.description.replace(/<[^>]*>/g, '').length < 50 ? 'text-red-500' : 'text-green-500'}>
                  {inputs.description.replace(/<[^>]*>/g, '').length < 50 ? 'Add more content' : 'Good length'}
                </span>
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <PhotoCamera className="text-purple-600 mr-2" sx={{ fontSize: 20 }} />
                Featured Image
              </label>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                        <PhotoCamera className="text-purple-600" />
                      </div>
                      <p className="text-gray-700 font-medium mb-1">
                        Click to upload featured image
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports JPG, PNG, GIF • Max 5MB
                      </p>
                    </div>
                  </label>
                </div>

                {imagePreview && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">Featured Image Preview:</p>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {imageFile?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(imageFile?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !inputs.title || !inputs.description || inputs.description === '<p><br></p>'}
                startIcon={loading ? null : <Send />}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '12px',
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textTransform: 'none',
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    boxShadow: '0 6px 8px -1px rgba(59, 130, 246, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: '#9ca3af',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.2s ease-in-out',
                  minWidth: '200px',
                }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Post...
                  </div>
                ) : (
                  "Publish Blog Post"
                )}
              </Button>
            </div>
          </form>

          {/* Tips Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Writing Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Write a compelling title that grabs attention</li>
              <li>• Use the formatting tools to make your content engaging</li>
              <li>• Click the image button to add images within your content</li>
              <li>• Use headings to structure your content</li>
              <li>• Add a relevant featured image to attract readers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;