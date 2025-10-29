import React from 'react';

const ContentCalendar = ({ calendarData }) => {
  if (!calendarData) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">📅 Content Calendar</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-green-600">Scheduled Posts</h4>
        {calendarData.scheduled && calendarData.scheduled.length > 0 ? (
          <div className="space-y-3">
            {calendarData.scheduled.map((blog, index) => (
              <div key={index} className="p-3 border-l-4 border-green-500 bg-green-50 rounded">
                <div className="font-medium">{blog.title}</div>
                <div className="text-sm text-gray-600">
                  Scheduled: {new Date(blog.publishDate).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500 capitalize">{blog.category}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No scheduled posts</p>
        )}
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-blue-600">Drafts</h4>
        {calendarData.drafts && calendarData.drafts.length > 0 ? (
          <div className="space-y-3">
            {calendarData.drafts.map((blog, index) => (
              <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                <div className="font-medium">{blog.title}</div>
                <div className="text-sm text-gray-600">
                  Created: {new Date(blog.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500 capitalize">{blog.category}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No drafts</p>
        )}
      </div>
    </div>
  );
};

export default ContentCalendar;