import { useEffect, useState } from "react";
import API from "../services/api";

function Comments({ setPage, handleLogout }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const postId = "6a9fcad8a4bee7d8ae7db183";

  // =====================================================
  // FETCH COMMENTS
  // =====================================================
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await API.get(`/comments/${postId}`);

        setComments(response.data.comments || []);
      } catch (error) {
        console.log(
          "Comments fetch failed:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
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

          {/* COMMENTS - ACTIVE */}
          <button
            onClick={() => goToPage("comments")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left bg-blue-600 text-white font-semibold"
          >
            <span className="text-lg">💬</span>
            <span>Comments</span>
          </button>

          {/* ANALYTICS */}
          <button
            onClick={() => goToPage("analytics")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-slate-300 hover:bg-slate-800 hover:text-white transition"
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

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-800">
            Comments & Feedback
          </h1>

          <p className="text-gray-500 mt-1">
            Client comments on social media posts
          </p>

        </div>

        {/* COMMENTS CARD */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Client Comments
          </h2>

          {/* LOADING */}
          {loading ? (
            <p className="text-gray-500">
              Loading comments...
            </p>

          ) : comments.length === 0 ? (

            /* NO COMMENTS */
            <p className="text-gray-500">
              No comments found.
            </p>

          ) : (

            /* COMMENTS LIST */
            <div className="space-y-4">

              {comments.map((item) => (

                <div
                  key={item._id}
                  className="border border-gray-200 rounded-xl p-4"
                >

                  <p className="text-gray-700">
                    💬 {item.comment}
                  </p>

                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>

                </div>

              ))}

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Comments;