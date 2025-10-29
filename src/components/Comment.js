import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Reply, Delete } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Comment = ({ comment, onDelete, level = 0, onReplyAdded }) => {
  const navigate = useNavigate();
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = getAuthToken();
    const userId = localStorage.getItem("userId");
    return !!(token && userId);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    if (!isAuthenticated()) {
      toast.error("Please login to reply");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/v1/comments",
        {
          content: replyContent,
          blogId: comment.blog,
          parentCommentId: comment._id,
        },
        {
          headers: getAuthHeaders(), // ✅ ADDED AUTH HEADERS
        }
      );

      if (data?.success) {
        setReplyContent("");
        setShowReply(false);
        toast.success("Reply added successfully");
        
        // Call the callback to refresh comments instead of reloading the page
        if (onReplyAdded) {
          onReplyAdded();
        } else {
          // Fallback: reload the page if no callback provided
          window.location.reload();
        }
      }
    } catch (error) {
      console.log("Reply error:", error);
      if (error.response?.status === 401) {
        toast.error("Please login again");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid request");
      } else {
        toast.error("Failed to add reply");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ ml: level * 3 }}>
      <Card sx={{ 
        mb: 2, 
        backgroundColor: level > 0 ? "var(--surface-light)" : "var(--surface-color)",
        borderLeft: level > 0 ? `3px solid var(--primary-color)` : 'none'
      }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: "0.875rem" }}>
                {comment.user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {comment.user?.username}
                </Typography>
                <Typography variant="caption" sx={{ color: "var(--text-tertiary)" }}>
                  {formatDate(comment.createdAt)}
                </Typography>
              </Box>
            </Box>
            
            {comment.user?._id === localStorage.getItem("userId") && (
              <IconButton 
                size="small" 
                onClick={() => onDelete(comment._id)}
                sx={{ color: "var(--error-color)" }}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>

          <Typography variant="body2" sx={{ color: "var(--text-primary)", mb: 1 }}>
            {comment.content}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              startIcon={<Reply />}
              size="small"
              onClick={() => setShowReply(!showReply)}
              sx={{ 
                color: "var(--text-secondary)",
                fontSize: "0.75rem",
                textTransform: "none"
              }}
            >
              Reply
            </Button>
          </Box>

          {showReply && (
            <Box sx={{ mt: 2, pl: 2, borderLeft: "2px solid var(--primary-color)" }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  onClick={() => setShowReply(false)}
                  sx={{ color: "var(--text-secondary)" }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleReply}
                  disabled={loading || !replyContent.trim()}
                  startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                  {loading ? "Replying..." : "Reply"}
                </Button>
              </Box>
            </Box>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {comment.replies.map((reply) => (
                <Comment 
                  key={reply._id} 
                  comment={reply} 
                  onDelete={onDelete}
                  onReplyAdded={onReplyAdded}
                  level={level + 1}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Comment;