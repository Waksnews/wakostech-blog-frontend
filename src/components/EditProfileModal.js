import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, uploadProfilePicture, clearProfileError } from '../redux/profileSlice';

const EditProfileModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { userProfile, loading, error } = useSelector((state) => state.profile);
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    social: {
      twitter: '',
      linkedin: '',
      github: ''
    },
    preferences: {
      emailNotifications: true,
      publicProfile: true,
      showEmail: false
    }
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Reset form when modal opens/closes or userProfile changes
  useEffect(() => {
    if (isOpen && userProfile) {
      setFormData({
        displayName: userProfile.profile?.displayName || '',
        bio: userProfile.profile?.bio || '',
        location: userProfile.profile?.location || '',
        website: userProfile.profile?.website || '',
        social: {
          twitter: userProfile.profile?.social?.twitter || '',
          linkedin: userProfile.profile?.social?.linkedin || '',
          github: userProfile.profile?.social?.github || ''
        },
        preferences: {
          emailNotifications: userProfile.preferences?.emailNotifications ?? true,
          publicProfile: userProfile.preferences?.publicProfile ?? true,
          showEmail: userProfile.preferences?.showEmail ?? false
        }
      });
      setSelectedImage(null);
      setImagePreview('');
    }
  }, [isOpen, userProfile]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value
        }
      }));
    } else if (name.startsWith('preferences.')) {
      const prefField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, JPEG)');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Starting profile update process...');
    console.log('📝 Bio to save:', formData.bio);
    console.log('🖼️ Image selected:', selectedImage ? selectedImage.name : 'None');

    try {
      // Clear any previous errors
      dispatch(clearProfileError());

      let avatarUrl = null;

      // Upload image first if selected
      if (selectedImage) {
        console.log('📤 Uploading profile picture...');
        try {
          const imageResult = await dispatch(uploadProfilePicture(selectedImage)).unwrap();
          avatarUrl = imageResult.avatar;
          console.log('✅ Profile picture uploaded:', avatarUrl);
        } catch (imageError) {
          console.error('❌ Profile picture upload failed:', imageError);
          // Continue with profile update even if image fails
        }
      }

      // Prepare profile data (include avatar URL if uploaded)
      const profileUpdateData = {
        ...formData
      };

      // Only include avatar if upload was successful
      if (avatarUrl) {
        profileUpdateData.avatar = avatarUrl;
      }

      console.log('💾 Saving profile data:', profileUpdateData);
      
      // Update profile data
      const result = await dispatch(updateUserProfile(profileUpdateData)).unwrap();
      console.log('✅ Profile update successful:', result);
      
      // Close modal on success
      onClose();
      
      // Refresh profile data after short delay
      setTimeout(() => {
        console.log('🔄 Refreshing profile data...');
        window.location.reload(); // Force full refresh to show changes
      }, 1000);
      
    } catch (error) {
      console.error('❌ Profile update failed:', error);
    }
  };

  // Add click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            type="button"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {(imagePreview || userProfile?.profile?.avatar) ? (
                  <img 
                    src={imagePreview || userProfile.profile.avatar} 
                    alt="Profile preview" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                {selectedImage && (
                  <p className="text-sm text-green-600 mt-1">Selected: {selectedImage.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your display name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your location"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Tell us about yourself..."
              maxLength="500"
            />
            <div className="text-sm text-gray-500 text-right mt-1">
              {formData.bio.length}/500 characters
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Social Media */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Media Links
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="url"
                name="social.twitter"
                value={formData.social.twitter}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Twitter URL"
              />
              <input
                type="url"
                name="social.linkedin"
                value={formData.social.linkedin}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="LinkedIn URL"
              />
              <input
                type="url"
                name="social.github"
                value={formData.social.github}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="GitHub URL"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="preferences.emailNotifications"
                  checked={formData.preferences.emailNotifications}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="preferences.publicProfile"
                  checked={formData.preferences.publicProfile}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Public profile</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="preferences.showEmail"
                  checked={formData.preferences.showEmail}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Show email on profile</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;