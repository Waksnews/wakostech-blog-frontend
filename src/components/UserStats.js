import React from 'react';

const UserStats = ({ stats }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">📊 Your Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats?.blogCount || 0}</div>
          <div className="text-sm text-gray-600">Blogs</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats?.totalLikes || 0}</div>
          <div className="text-sm text-gray-600">Likes</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats?.totalComments || 0}</div>
          <div className="text-sm text-gray-600">Comments</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats?.totalViews || 0}</div>
          <div className="text-sm text-gray-600">Views</div>
        </div>
      </div>
      
      {stats?.enhanced && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Engagement Rate</div>
            <div className="text-lg font-semibold">{stats.enhanced.engagementRate}%</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Avg Views/Post</div>
            <div className="text-lg font-semibold">{stats.enhanced.avgViewsPerPost}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStats;