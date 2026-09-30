import { useEffect, useState } from "react";
import API from "./services/api";

import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Calendar from "./pages/Calendar";
import Posts from "./pages/Posts";
import Analytics from "./pages/Analytics";
import Comments from "./pages/Comments";

function App() {
  // =====================================================
  // PAGE STATE
  // =====================================================

  const [page, setPageState] = useState("dashboard");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [userRole, setUserRole] = useState("");

  const [loginType, setLoginType] = useState("");

  // =====================================================
  // AUTH STATES
  // =====================================================

  const [authMode, setAuthMode] = useState("login");

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // CLIENT STATES
  // =====================================================

  const [clientPosts, setClientPosts] = useState([]);

  const [clientPostsLoading, setClientPostsLoading] =
    useState(false);

  const [clientPostsError, setClientPostsError] =
    useState("");

  // Feedback for each post
  const [feedbackText, setFeedbackText] = useState({});

  // Action loading
  const [actionLoading, setActionLoading] = useState("");

  // =====================================================
  // PAGE NAVIGATION
  // =====================================================

  const setPage = (newPage) => {
    setPageState(newPage);

    localStorage.setItem("page", newPage);
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const loggedInUser = response.data.user;

      if (!loggedInUser) {
        setError(
          "User information was not received from server."
        );
        return;
      }

      // Check Agency / Client selection
      if (loggedInUser.role !== loginType) {
        setError(
          `This is a ${loggedInUser.role} account. Please select ${loggedInUser.role} login.`
        );
        return;
      }

      // Save token
      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "role",
        loggedInUser.role
      );

      localStorage.setItem(
        "page",
        "dashboard"
      );

      setUserRole(loggedInUser.role);

      setIsLoggedIn(true);

      setPageState("dashboard");

      setPassword("");

      setShowPassword(false);

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check that the backend server is running."
      );
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await API.post(
        "/auth/register",
        {
          name,
          email,
          password,
          role: loginType,
        }
      );

      console.log(
        "REGISTER RESPONSE:",
        response.data
      );

      setSuccess(
        "Registration successful! Please login."
      );

      setName("");
      setEmail("");
      setPassword("");
      setShowPassword(false);

      setAuthMode("login");

    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("page");

    setIsLoggedIn(false);

    setUserRole("");

    setLoginType("");

    setAuthMode("login");

    setName("");

    setEmail("");

    setPassword("");

    setShowPassword(false);

    setError("");

    setSuccess("");

    setClientPosts([]);

    setClientPostsError("");

    setFeedbackText({});

    setPageState("dashboard");
  };

  // =====================================================
  // FETCH CLIENT POSTS
  // =====================================================

  const fetchClientPosts = async () => {
    if (!isLoggedIn || userRole !== "client") {
      return;
    }

    setClientPostsLoading(true);
    setClientPostsError("");

    try {
      const response = await API.get("/posts/client");

      const posts = response.data.posts || [];

      setClientPosts(posts);

    } catch (error) {
      console.error(
        "CLIENT POSTS ERROR:",
        error
      );

      setClientPostsError(
        error.response?.data?.message ||
          "Unable to load your posts."
      );

      setClientPosts([]);

    } finally {
      setClientPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientPosts();
  }, [isLoggedIn, userRole]);

  // =====================================================
  // APPROVE POST
  // =====================================================

  const handleApprove = async (post) => {
    if (!post.approvalId) {
      alert(
        "Approval request was not found for this post."
      );
      return;
    }

    try {
      setActionLoading(post._id);

      await API.put(
        `/approvals/${post.approvalId}/approve`,
        {
          feedback:
            feedbackText[post._id] || "",
        }
      );

      alert("Post approved successfully! ✅");

      await fetchClientPosts();

    } catch (error) {
      console.error(
        "APPROVE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to approve post."
      );

    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // REJECT POST
  // =====================================================

  const handleReject = async (post) => {
    if (!post.approvalId) {
      alert(
        "Approval request was not found for this post."
      );
      return;
    }

    const feedback =
      feedbackText[post._id] || "";

    if (!feedback.trim()) {
      alert(
        "Please enter feedback before rejecting the post."
      );
      return;
    }

    try {
      setActionLoading(post._id);

      await API.put(
        `/approvals/${post.approvalId}/reject`,
        {
          feedback,
        }
      );

      alert("Post rejected. ❌");

      await fetchClientPosts();

    } catch (error) {
      console.error(
        "REJECT ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to reject post."
      );

    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // ADD FEEDBACK
  // =====================================================

  const handleFeedback = async (post) => {
    if (!post.approvalId) {
      alert(
        "Approval request was not found for this post."
      );
      return;
    }

    const feedback =
      feedbackText[post._id] || "";

    if (!feedback.trim()) {
      alert("Please enter feedback first.");
      return;
    }

    try {
      setActionLoading(post._id);

      await API.put(
        `/approvals/${post.approvalId}/feedback`,
        {
          feedback,
        }
      );

      alert("Feedback added successfully! 💬");

      setFeedbackText((prev) => ({
        ...prev,
        [post._id]: "",
      }));

      await fetchClientPosts();

    } catch (error) {
      console.error(
        "FEEDBACK ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to add feedback."
      );

    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // AGENCY / CLIENT SELECTION
  // =====================================================

  if (!isLoggedIn && !loginType) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-3xl font-bold text-blue-600 text-center">
            Social Media Agency
          </h1>

          <p className="text-gray-500 text-center mt-2">
            Select your login type
          </p>

          <div className="mt-8 space-y-4">

            <button
              type="button"
              onClick={() => {
                setLoginType("agency");
                setAuthMode("login");
                setError("");
                setSuccess("");
              }}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              🏢 Agency
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginType("client");
                setAuthMode("login");
                setError("");
                setSuccess("");
              }}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              👤 Client
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // LOGIN / REGISTER PAGE
  // =====================================================

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-3xl font-bold text-blue-600 text-center">
            Social Media Agency
          </h1>

          <p className="text-gray-500 text-center mt-2">
            {loginType === "agency"
              ? "Agency"
              : "Client"}{" "}
            {authMode === "login"
              ? "Login"
              : "Registration"}
          </p>

          {error && (
            <p className="bg-red-100 text-red-600 p-3 rounded-lg mt-5 text-sm">
              {error}
            </p>
          )}

          {success && (
            <p className="bg-green-100 text-green-600 p-3 rounded-lg mt-5 text-sm">
              {success}
            </p>
          )}

          {/* LOGIN */}

          {authMode === "login" && (
            <form
              onSubmit={handleLogin}
              className="mt-8"
            >

              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
              />

              <label className="block text-gray-700 font-medium mb-2 mt-5">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl"
                >
                  {showPassword
                    ? "👁️⃠"
                    : "👁️"}
                </button>

              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Login
              </button>

            </form>
          )}

          {/* REGISTER */}

          {authMode === "register" && (
            <form
              onSubmit={handleRegister}
              className="mt-8"
            >

              <label className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
              />

              <label className="block text-gray-700 font-medium mb-2 mt-5">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
              />

              <label className="block text-gray-700 font-medium mb-2 mt-5">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create your password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl"
                >
                  {showPassword
                    ? "👁️⃠"
                    : "👁️"}
                </button>

              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
              >
                Register
              </button>

            </form>
          )}

          {/* SWITCH */}

          {authMode === "login" ? (
            <p className="text-center text-gray-600 mt-5">

              New user?{" "}

              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setError("");
                  setSuccess("");
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Create Account
              </button>

            </p>
          ) : (
            <p className="text-center text-gray-600 mt-5">

              Already have an account?{" "}

              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                  setSuccess("");
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </button>

            </p>
          )}

          {/* BACK */}

          <button
            type="button"
            onClick={() => {
              setLoginType("");
              setAuthMode("login");
              setName("");
              setEmail("");
              setPassword("");
              setShowPassword(false);
              setError("");
              setSuccess("");
            }}
            className="w-full mt-4 text-gray-600 hover:text-blue-600"
          >
            ← Back to selection
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // CLIENT INTERFACE
  // =====================================================

  if (userRole === "client") {

    const pendingPosts =
      clientPosts.filter(
        (post) =>
          post.status ===
          "pending_approval"
      );

    return (
      <div className="min-h-screen bg-gray-100">

        {/* HEADER */}

        <div className="bg-green-600 text-white px-8 py-5 flex justify-between items-center">

          <div>

            <h1 className="text-2xl font-bold">
              Client Dashboard
            </h1>

            <p className="text-green-100">
              View and approve your social media content
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="bg-white text-green-600 px-5 py-2 rounded-lg font-medium hover:bg-gray-100"
          >
            Logout
          </button>

        </div>

        {/* CLIENT CONTENT */}

        <div className="p-8">

          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, Client 👋
          </h2>

          <p className="text-gray-500 mt-2">
            Review your posts and provide approval or feedback.
          </p>

          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

            <div className="bg-white rounded-xl shadow p-6">

              <h3 className="font-semibold text-gray-700 text-lg">
                📱 My Posts
              </h3>

              <p className="text-3xl font-bold text-green-600 mt-3">
                {clientPosts.length}
              </p>

              <p className="text-gray-500 mt-2">
                Total posts assigned to you.
              </p>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

              <h3 className="font-semibold text-gray-700 text-lg">
                ⏳ Pending Approval
              </h3>

              <p className="text-3xl font-bold text-orange-500 mt-3">
                {pendingPosts.length}
              </p>

              <p className="text-gray-500 mt-2">
                Posts waiting for your approval.
              </p>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

              <h3 className="font-semibold text-gray-700 text-lg">
                💬 Feedback
              </h3>

              <p className="text-gray-500 mt-3">
                Give feedback on your content.
              </p>

            </div>

          </div>

          {/* POSTS */}

          <div className="bg-white rounded-xl shadow mt-8 p-6">

            <h2 className="text-xl font-bold text-gray-800">
              My Posts
            </h2>

            {/* LOADING */}

            {clientPostsLoading && (
              <p className="text-gray-500 mt-5">
                Loading your posts...
              </p>
            )}

            {/* ERROR */}

            {!clientPostsLoading &&
              clientPostsError && (
                <p className="text-red-500 bg-red-50 p-4 rounded-lg mt-5">
                  {clientPostsError}
                </p>
              )}

            {/* NO POSTS */}

            {!clientPostsLoading &&
              !clientPostsError &&
              clientPosts.length === 0 && (
                <p className="text-gray-500 mt-5">
                  No posts have been assigned to you yet.
                </p>
              )}

            {/* POSTS LIST */}

            {!clientPostsLoading &&
              clientPosts.length > 0 && (

                <div className="space-y-5 mt-5">

                  {clientPosts.map((post) => (

                    <div
                      key={post._id}
                      className="border border-gray-200 rounded-xl p-5"
                    >

                      {/* TITLE */}

                      <h3 className="text-lg font-bold text-gray-800">
                        {post.title}
                      </h3>

                      {/* CLIENT */}

                      {post.client && (
                        <p className="text-sm text-gray-500 mt-2">
                          Client:{" "}
                          {post.client.companyName ||
                            post.client.name}
                        </p>
                      )}

                      {/* CAPTION */}

                      {post.caption && (
                        <p className="text-gray-700 mt-3">
                          {post.caption}
                        </p>
                      )}

                      {/* HASHTAGS */}

                      {post.hashtags && (
                        <p className="text-blue-600 mt-2">
                          {post.hashtags}
                        </p>
                      )}

                      {/* CONTENT TYPE */}

                      <p className="text-sm text-gray-500 mt-3">
                        Content Type:{" "}
                        {post.contentType}
                      </p>

                      {/* STATUS */}

                      <p className="text-sm mt-2">

                        Status:{" "}

                        <span
                          className={
                            post.status ===
                            "pending_approval"
                              ? "text-orange-600 font-semibold"
                              : post.status ===
                                "approved"
                              ? "text-green-600 font-semibold"
                              : post.status ===
                                "rejected"
                              ? "text-red-600 font-semibold"
                              : "text-gray-600 font-semibold"
                          }
                        >
                          {post.status}
                        </span>

                      </p>

                      {/* MEDIA */}

                      {post.mediaUrl && (
                        <div className="mt-4">

                          {post.contentType ===
                          "reel" ? (
                            <video
                              src={post.mediaUrl}
                              controls
                              className="w-full max-w-xl rounded-lg"
                            />
                          ) : (
                            <img
                              src={post.mediaUrl}
                              alt={post.title}
                              className="w-full max-w-xl rounded-lg"
                            />
                          )}

                        </div>
                      )}

                      {/* =================================================
                          CLIENT APPROVAL SECTION
                      ================================================= */}

                      {post.status ===
                        "pending_approval" && (

                        <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl p-5">

                          <p className="text-orange-700 font-semibold">
                            ⏳ This post is waiting for your approval.
                          </p>

                          <p className="text-orange-600 text-sm mt-1">
                            Review the post and choose an action below.
                          </p>

                          {/* FEEDBACK */}

                          <textarea
                            value={
                              feedbackText[
                                post._id
                              ] || ""
                            }
                            onChange={(e) =>
                              setFeedbackText(
                                (prev) => ({
                                  ...prev,
                                  [post._id]:
                                    e.target.value,
                                })
                              )
                            }
                            placeholder="Enter feedback..."
                            className="w-full mt-4 border border-gray-300 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                          {/* BUTTONS */}

                          <div className="flex flex-wrap gap-3 mt-4">

                            <button
                              onClick={() =>
                                handleApprove(
                                  post
                                )
                              }
                              disabled={
                                actionLoading ===
                                post._id
                              }
                              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionLoading ===
                              post._id
                                ? "Processing..."
                                : "✅ Approve"}
                            </button>

                            <button
                              onClick={() =>
                                handleReject(
                                  post
                                )
                              }
                              disabled={
                                actionLoading ===
                                post._id
                              }
                              className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                              ❌ Reject
                            </button>

                            <button
                              onClick={() =>
                                handleFeedback(
                                  post
                                )
                              }
                              disabled={
                                actionLoading ===
                                post._id
                              }
                              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                              💬 Add Feedback
                            </button>

                          </div>

                        </div>
                      )}

                      {/* APPROVED */}

                      {post.status ===
                        "approved" && (

                        <div className="mt-5 bg-green-50 border border-green-200 rounded-lg p-4">

                          <p className="text-green-700 font-semibold">
                            ✅ You approved this post.
                          </p>

                        </div>
                      )}

                      {/* REJECTED */}

                      {post.status ===
                        "rejected" && (

                        <div className="mt-5 bg-red-50 border border-red-200 rounded-lg p-4">

                          <p className="text-red-700 font-semibold">
                            ❌ You rejected this post.
                          </p>

                        </div>
                      )}

                    </div>

                  ))}

                </div>
              )}

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // AGENCY INTERFACE
  // =====================================================

  return (
    <>
      {page === "dashboard" && (
        <Dashboard
          setPage={setPage}
          handleLogout={handleLogout}
        />
      )}

      {page === "comments" && (
        <Comments
          setPage={setPage}
          handleLogout={handleLogout}
        />
      )}

      {page === "clients" && (
        <Clients
          setPage={setPage}
          handleLogout={handleLogout}
        />
      )}

      {page === "posts" && (
        <Posts
          setPage={setPage}
          handleLogout={handleLogout}
        />
      )}

      {page === "calendar" && (
        <Calendar
          setPage={setPage}
          handleLogout={handleLogout}
        />
      )}

      {page === "analytics" && (
        <Analytics
          setPage={setPage}
          handleLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;