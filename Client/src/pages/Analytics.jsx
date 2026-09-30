import { useEffect, useState } from "react";
import API from "../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Analytics({ setPage, handleLogout }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH ANALYTICS
  // =====================================================
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await API.get(
          "/analytics/client/6a9fb90a6c6e882f79409a9c"
        );

        const analytics = response.data.analytics;

        if (analytics.length > 0) {
          const latest = analytics[0];

          const chartData = [
            {
              name: "Followers",
              value: latest.followers,
            },
            {
              name: "Likes",
              value: latest.likes,
            },
            {
              name: "Comments",
              value: latest.comments,
            },
            {
              name: "Reach",
              value: latest.reach,
            },
          ];

          setData(chartData);
        }
      } catch (error) {
        console.error(
          "Error fetching analytics:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // =====================================================
  // NAVIGATION
  // =====================================================
  const goToPage = (page) => {
    setPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* =================================================
          LEFT SIDEBAR
      ================================================= */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0">

        {/* LOGO */}
        <div className="px-6 py-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">
            Social Media
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Agency Management
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-2">

          {/* DASHBOARD */}
          <button
            onClick={() => goToPage("dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <span className="text-lg">🏠</span>
            <span>Dashboard</span>
          </button>

          {/* CLIENTS */}
          <button
            onClick={() => goToPage("clients")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <span className="text-lg">👥</span>
            <span>Clients</span>
          </button>

          {/* POSTS */}
          <button
            onClick={() => goToPage("posts")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <span className="text-lg">📝</span>
            <span>Posts</span>
          </button>

          {/* CALENDAR */}
          <button
            onClick={() => goToPage("calendar")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <span className="text-lg">📅</span>
            <span>Calendar</span>
          </button>

          {/* COMMENTS */}
          <button
            onClick={() => goToPage("comments")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <span className="text-lg">💬</span>
            <span>Comments</span>
          </button>

          {/* ANALYTICS - ACTIVE */}
          <button
            onClick={() => goToPage("analytics")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left bg-blue-600 text-white font-semibold"
          >
            <span className="text-lg">📊</span>
            <span>Analytics</span>
          </button>

        </nav>

        {/* LOGOUT */}
        <div className="px-4 py-5 border-t border-slate-700">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-400 hover:bg-red-500 hover:text-white transition"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}
      <main className="ml-64 flex-1 min-h-screen p-8">

        {/* HEADING */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Analytics
          </h1>

          <p className="text-gray-500 mt-1">
            View basic social media performance
          </p>
        </div>

        {/* ANALYTICS CARD */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Social Media Performance
          </h2>

          {loading ? (
            <p className="text-gray-600">
              Loading analytics...
            </p>
          ) : data.length === 0 ? (
            <p className="text-gray-500">
              No analytics data available.
            </p>
          ) : (
            <div className="w-full h-96">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={data}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#2563eb"
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Analytics;