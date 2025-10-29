import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const { isLogin } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const [dashboardData] = useState({
    newUsers: 1560,
    sessions: 2840,
    totalViews: 2120,
    pageViews: 3150,
    avgTimeOnPage: "00:05:16",
    topBlogs: [
      { title: "Blog Title 1", sessions: 365, avgTime: "00:06:12" },
      { title: "Blog Title 2", sessions: 287, avgTime: "00:07:35" },
      { title: "Blog Title 3", sessions: 195, avgTime: "00:04:53" },
      { title: "Blog Title 4", sessions: 120, avgTime: "00:08:55" }
    ]
  });

  useEffect(() => {
    if (isLogin) {
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
    }
  }, [isLogin]);

  if (!isLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to view the dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Blog performance evaluation dashboard for effective storytelling
          </h1>
          <p className="text-gray-600">
            This slide showcases dashboard used to analyze the performance of blogs which are formulated as part of written storytelling marketing campaign. 
            It includes evaluation of visits, page views, average page time, bounce rate and top blogs.
          </p>
        </div>

        {/* Main Content - Single Column Layout */}
        <div className="space-y-6">
          
          {/* News and Visits Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">News and Visits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* New Users Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-700 mb-2">New Users</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardData.newUsers.toLocaleString()}
                </div>
              </div>
              
              {/* Sessions Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-700 mb-2">Sessions</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardData.sessions.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Top Blogs Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Blogs</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Page Titles
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Sessions
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Avg. Time on Page
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.topBlogs.map((blog, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-b-0">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {blog.title}
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-semibold text-gray-900">
                          {blog.sessions}
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-semibold text-gray-900">
                          {blog.avgTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Additional Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Views Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Views</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {dashboardData.totalViews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {dashboardData.pageViews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Pageviews</div>
                </div>
              </div>
            </div>

            {/* Pages Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pages</h2>
              <div>
                <div className="text-sm text-gray-600 mb-2">Avg. Time on Page</div>
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardData.avgTimeOnPage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;