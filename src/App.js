import Header from "./components/Header";
import Navigation from "./components/Navigation";
import { Routes, Route } from "react-router-dom";
import Blogs from "./pages/Blogs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserBlogs from "./pages/UserBlogs";
import CreateBlog from "./pages/CreateBlog";
import BlogDetails from "./pages/BlogDetails";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";

// ADD THIS LINE - Import axios configuration
import "./utils/axiosConfig";

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <Header />
        <Navigation />
        <main className="main-content">
          <Toaster />
          <Routes>
            <Route path="/" element={<Blogs />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/my-blogs" element={<UserBlogs />} />
            <Route path="/blog-details/:id" element={<BlogDetails />} />
            <Route path="/create-blog" element={<CreateBlog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;