import React from 'react';

const RecentActivity = ({ activities }) => {
  if (!activities || activities.length === 0) return null;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'comment': return '💬';
      case 'blog': return '📝';
      default: return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = (now - time) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">🔄 Recent Activity</h3>
      <div className="space-y-4">
        {activities.slice(0, 6).map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded">
            <span className="text-lg">{getActivityIcon(activity.type)}</span>
            <div className="flex-1">
              <div className="text-sm">
                {activity.type === 'comment' && activity.user && (
                  <span className="font-medium">{activity.user.username}</span>
                )}
                {activity.message}
              </div>
              {activity.content && (
                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                  "{activity.content}"
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {formatTime(activity.time)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;