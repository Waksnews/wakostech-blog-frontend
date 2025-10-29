import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { Email, Send } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/api/v1/newsletter/subscribe", { email });
      
      if (data?.success) {
        setSubscribed(true);
        setEmail("");
        toast.success("Successfully subscribed to newsletter!");
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to subscribe to newsletter");
      }
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <Card sx={{ backgroundColor: "var(--surface-color)" }}>
        <CardContent sx={{ textAlign: "center", py: 3 }}>
          <Email sx={{ fontSize: 48, color: "var(--success-color)", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome to our community!
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
            Thank you for subscribing to our newsletter. You'll receive the latest updates and exclusive content.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ backgroundColor: "var(--surface-color)" }}>
      <CardContent>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Email sx={{ fontSize: 40, color: "var(--primary-color)", mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Stay Updated
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 2 }}>
            Get the latest news and articles delivered to your inbox
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubscribe}>
          <TextField
            fullWidth
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            disabled={loading}
            sx={{
              borderRadius: "20px",
              py: 1,
            }}
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </Box>

        <Typography variant="caption" sx={{ color: "var(--text-tertiary)", mt: 2, display: "block", textAlign: "center" }}>
          No spam. Unsubscribe at any time.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Newsletter;