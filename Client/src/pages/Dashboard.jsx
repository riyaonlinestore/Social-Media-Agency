import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard({ setPage, handleLogout }) {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalPosts: 0,
    pendingApprovals: 0,
    approvedPosts: 0,
    rejectedPosts: 0,
    scheduledPosts: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await API.get("/dashboard/stats");

        setStats(response.data.stats);
      } catch (error) {
        console.log(
          "Dashboard data fetch failed:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const cards = [
    {
      title: "Total Clients",
      value: stats.totalClients,
    },
    {
      title: "Total Posts",
      value: stats.totalPosts,
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
    },
    {
      title: "Approved Posts",
      value: stats.approvedPosts,
    },
    {
      title: "Rejected Posts",
      value: stats.rejectedPosts,
    },
    {
      title: "Scheduled Posts",
      value: stats.scheduledPosts,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-10">
          Social Media
        </h1>

        <nav className="space-y-3">
          <div className="bg-blue-800 rounded-lg px-4 py-3">
            🏠 Dashboard
          </div>

          <div
            onClick={() => setPage("clients")}
            className="px-4 py-3 rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            👥 Clients
          </div>

          <div
            onClick={() => setPage("posts")}
            className="px-4 py-3 rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            📝 Posts
          </div>

          <div
            onClick={() => setPage("calendar")}
            className="px-4 py-3 rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            📅 Calendar
          </div>

         <div
            onClick={() => setPage("analytics")}
            className="px-4 py-3 rounded-lg hover:bg-blue-800 cursor-pointer"
>
          📊 Analytics
         </div>

          <div
            onClick={handleLogout}
            className="px-4 py-3 rounded-lg hover:bg-blue-800 cursor-pointer mt-10"
          >
            🚪 Logout
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h2>

          <p className="text-gray-500 mt-1">
            Manage your clients, content and social media performance
          </p>
        </div>

        {/* Dashboard Cards */}
        {loading ? (
          <p className="text-gray-600">
            Loading dashboard...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <h3 className="text-gray-500 font-medium">
                  {card.title}
                </h3>

                <p className="text-3xl font-bold text-blue-600 mt-3">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-md p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Recent Activity
          </h3>

          <div className="space-y-3">
            <p className="text-gray-600">
              📌 New post created for StyleWear
            </p>

            <p className="text-gray-600">
              💬 New client feedback received
            </p>

            <p className="text-gray-600">
              📅 Post scheduled successfully
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;