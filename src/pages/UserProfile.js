import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../redux/profileSlice';
import UserStats from '../components/UserStats';
import EditProfileModal from '../components/EditProfileModal';

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userProfile, loading, error } = useSelector((state) => state.profile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Get basic user info from localStorage as fallback
  const fallbackUserData = {
    username: localStorage.getItem('username') || 'User',
    email: localStorage.getItem('email') || '',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error loading profile: {error}
          </div>
          {/* Show basic user info from localStorage as fallback */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {fallbackUserData.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {fallbackUserData.username}
                </h1>
                <p className="text-gray-600">{fallbackUserData.email}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Profile details are currently unavailable. Please try refreshing the page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profileData = userProfile || {
    username: fallbackUserData.username,
    email: fallbackUserData.email,
    profile: {},
    stats: { totalBlogs: 0, totalLikes: 0, totalComments: 0, totalViews: 0 },
    blogs: [],
  };

  const { profile, stats, joinDate } = profileData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow">
                {profileData.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.displayName || profileData.username}
                  </h1>
                  <p className="text-gray-600">@{profileData.username}</p>
                  {profile?.bio && (
                    <p className="text-gray-700 mt-2">{profile.bio}</p>
                  )}
                  {!profile?.bio && (
                    <p className="text-gray-500 text-sm mt-2">
                      No bio added yet. 
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-blue-600 hover:text-blue-800 ml-1"
                      >
                        Add a bio
                      </button>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Edit Profile
                </button>
              </div>

              {/* Profile Details */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                {profile?.location && (
                  <div className="flex items-center">
                    <span className="mr-1">📍</span>
                    {profile.location}
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center">
                    <span className="mr-1">🌐</span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
                {joinDate && (
                  <div className="flex items-center">
                    <span className="mr-1">🕒</span>
                    Joined {new Date(joinDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Social Links */}
              {profile?.social && (
                <div className="mt-3 flex space-x-4">
                  {profile.social.twitter && (
                    <a
                      href={profile.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-600"
                    >
                      Twitter
                    </a>
                  )}
                  {profile.social.linkedin && (
                    <a
                      href={profile.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900"
                    >
                      LinkedIn
                    </a>
                  )}
                  {profile.social.github && (
                    <a
                      href={profile.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-6">
          <UserStats stats={stats} />
        </div>

        {/* Recent Blogs Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Blogs</h2>
          {profileData.blogs && profileData.blogs.length > 0 ? (
            <div className="space-y-4">
              {profileData.blogs.slice(0, 5).map((blog) => (
                <div key={blog._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h3 className="font-semibold text-lg">{blog.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <span>👁️ {blog.views || 0} views</span>
                    <span>❤️ {blog.likesCount || 0} likes</span>
                    <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
                    {blog.category && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {blog.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No blogs published yet.</p>
              <button
                onClick={() => navigate('/create-blog')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Create Your First Blog
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={profileData}
      />
    </div>
  );
};

export default UserProfile;