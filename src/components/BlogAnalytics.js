import React from 'react';

const BlogAnalytics = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">📈 Analytics Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalViews}</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{analytics.totalLikes}</div>
          <div className="text-sm text-gray-600">Total Likes</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{analytics.totalComments}</div>
          <div className="text-sm text-gray-600">Total Comments</div>
        </div>
      </div>
      
      {analytics.topPerforming && (
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">🏆 Top Performing Blog</h4>
          <div className="p-3 bg-yellow-50 rounded">
            <div className="font-medium">{analytics.topPerforming.title}</div>
            <div className="text-sm text-gray-600">
              {analytics.topPerforming.views} views • {analytics.topPerforming.likesCount} likes
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogAnalytics;