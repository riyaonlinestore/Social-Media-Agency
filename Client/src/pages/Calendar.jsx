import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import API from "../services/api";

function Calendar({ setPage, handleLogout }) {
  const [events, setEvents] = useState([]);

  // =====================================================
  // FETCH SCHEDULED POSTS
  // =====================================================
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.get("/posts");

        const posts = response.data.posts || response.data;

        const calendarEvents = posts
          .filter(
            (post) =>
              post.status === "scheduled" &&
              post.scheduledDate
          )
          .map((post) => ({
            title: post.title,
            date: post.scheduledDate.split("T")[0],
          }));

        setEvents(calendarEvents);
      } catch (error) {
        console.log(
          "Calendar data fetch failed:",
          error.response?.data || error.message
        );
      }
    };

    fetchPosts();
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

        {/* LOGO / TITLE */}
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

          {/* CALENDAR - ACTIVE */}
          <button
            onClick={() => goToPage("calendar")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left bg-blue-600 text-white font-semibold"
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
            Content Calendar
          </h1>

          <p className="text-gray-500 mt-1">
            View and manage scheduled social media posts
          </p>

        </div>

        {/* CALENDAR */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <FullCalendar
            plugins={[
              dayGridPlugin,
              interactionPlugin
            ]}
            initialView="dayGridMonth"
            height="auto"
            events={events}
            dateClick={(info) => {
              alert(`Selected date: ${info.dateStr}`);
            }}
          />

        </div>

      </main>

    </div>
  );
}

export default Calendar;