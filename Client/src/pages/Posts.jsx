import { useEffect, useState } from "react";
import API from "../services/api";

function Posts({ setPage, handleLogout }) {
  const [posts, setPosts] = useState([]);
  const [clients, setClients] = useState([]);
  const [approvals, setApprovals] = useState({});
  const [comments, setComments] = useState({});

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [feedback, setFeedback] = useState({});
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    client: "",
    title: "",
    caption: "",
    hashtags: "",
    contentType: "image",
    mediaUrl: "",
    status: "draft",
    scheduledDate: "",
  });

  // =========================
  // FETCH POSTS
  // =========================
  const fetchPosts = async () => {
    try {
      const response = await API.get("/posts");

      setPosts(response.data.posts || []);
    } catch (error) {
      console.log(
        "Posts fetch failed:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH CLIENTS
  // =========================
  const fetchClients = async () => {
    try {
      const response = await API.get("/clients");

      setClients(response.data.clients || []);
    } catch (error) {
      console.log(
        "Clients fetch failed:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // FETCH APPROVALS
  // =========================
  const fetchApprovals = async () => {
    try {
      const response = await API.get("/approvals");

      const approvalList = response.data.approvals || [];

      const approvalMap = {};

      approvalList.forEach((approval) => {
        if (approval.post?._id) {
          approvalMap[approval.post._id] = approval;
        }
      });

      setApprovals(approvalMap);
    } catch (error) {
      console.log(
        "Approvals fetch failed:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchPosts();
    fetchClients();
    fetchApprovals();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      // If date + time is selected,
      // automatically make status Scheduled.
      if (name === "scheduledDate") {
        if (value) {
          updatedData.status = "scheduled";
        } else {
          updatedData.status = "draft";
        }
      }

      return updatedData;
    });
  };

  // =========================
  // IMAGE UPLOAD
  // =========================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setUploading(true);

      const response = await API.post(
        "/upload/image",
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFormData((prev) => ({
        ...prev,
        mediaUrl: response.data.imageUrl,
      }));

      alert("Image uploaded successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // CREATE POST
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.client) {
      alert("Please select a client.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Please enter post title.");
      return;
    }

    // If scheduled, date + time are required
    if (formData.status === "scheduled") {
      if (!formData.scheduledDate) {
        alert("Please select scheduled date and time.");
        return;
      }
    }

    try {
      await API.post("/posts", formData);

      alert("Post created successfully!");

      setFormData({
        client: "",
        title: "",
        caption: "",
        hashtags: "",
        contentType: "image",
        mediaUrl: "",
        status: "draft",
        scheduledDate: "",
      });

      setShowForm(false);

      fetchPosts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create post"
      );
    }
  };

  // =========================
  // SEND FOR APPROVAL
  // =========================
  const sendForApproval = async (post) => {
    if (!post.client) {
      alert("Client information not found.");
      return;
    }

    const clientId = post.client._id || post.client;

    try {
      await API.post("/approvals", {
        post: post._id,
        client: clientId,
      });

      alert("Post sent for approval successfully!");

      fetchPosts();
      fetchApprovals();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to send post for approval"
      );
    }
  };

  // =========================
  // APPROVE POST
  // =========================
  const approvePost = async (approvalId) => {
    try {
      await API.put(
        `/approvals/${approvalId}/approve`,
        {
          feedback: feedback[approvalId] || "",
        }
      );

      alert("Post approved successfully!");

      fetchPosts();
      fetchApprovals();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to approve post"
      );
    }
  };

  // =========================
  // REJECT POST
  // =========================
  const rejectPost = async (approvalId) => {
    if (!feedback[approvalId]?.trim()) {
      alert(
        "Please enter feedback before rejecting the post."
      );
      return;
    }

    try {
      await API.put(
        `/approvals/${approvalId}/reject`,
        {
          feedback: feedback[approvalId],
        }
      );

      alert("Post rejected successfully!");

      fetchPosts();
      fetchApprovals();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to reject post"
      );
    }
  };

  // =========================
  // ADD FEEDBACK
  // =========================
  const addFeedback = async (approvalId) => {
    if (!feedback[approvalId]?.trim()) {
      alert("Please enter feedback.");
      return;
    }

    try {
      await API.put(
        `/approvals/${approvalId}/feedback`,
        {
          feedback: feedback[approvalId],
        }
      );

      alert("Feedback added successfully!");

      fetchApprovals();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to add feedback"
      );
    }
  };

  // =========================
  // FEEDBACK INPUT
  // =========================
  const handleFeedbackChange = (approvalId, value) => {
    setFeedback((prev) => ({
      ...prev,
      [approvalId]: value,
    }));
  };

  // =========================
  // FETCH COMMENTS
  // =========================
  const fetchComments = async (postId) => {
    try {
      const response = await API.get(
        `/comments/${postId}`
      );

      setComments((prev) => ({
        ...prev,
        [postId]: response.data.comments || [],
      }));
    } catch (error) {
      console.log(
        "Comments fetch failed:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // FORMAT DATE + TIME
  // =========================
  const formatScheduleDateTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="w-64 bg-blue-700 text-white min-h-screen p-6">

        <h1 className="text-2xl font-bold mb-10">
          Social Media
        </h1>

        <nav className="space-y-3">

          <div
            onClick={() => setPage("dashboard")}
            className="px-4 py-3 rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            🏠 Dashboard
          </div>

          <div
            onClick={() => setPage("clients")}
            className="px-4 py-3 rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            👥 Clients
          </div>

          <div className="bg-blue-800 rounded-lg px-4 py-3">
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

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="flex-1 p-8">

        {/* HEADING */}
        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Posts
            </h1>

            <p className="text-gray-500 mt-1">
              Manage social media posts and client feedback
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "+ Add Post"}
          </button>

        </div>

        {/* =========================
            ADD POST FORM
        ========================= */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Create New Post
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >

              {/* CLIENT */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Select Client
                </label>

                <select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                >
                  <option value="">
                    Select a client
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client._id}
                      value={client._id}
                    >
                      {client.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Post Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Collection"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              {/* CAPTION */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Caption
                </label>

                <textarea
                  name="caption"
                  value={formData.caption}
                  onChange={handleChange}
                  placeholder="Write your social media caption..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              {/* HASHTAGS */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Hashtags
                </label>

                <input
                  type="text"
                  name="hashtags"
                  value={formData.hashtags}
                  onChange={handleChange}
                  placeholder="#Fashion #Summer #Style"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              {/* CONTENT TYPE */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Content Type
                </label>

                <select
                  name="contentType"
                  value={formData.contentType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="image">
                    Image
                  </option>

                  <option value="reel">
                    Reel
                  </option>

                  <option value="text">
                    Text
                  </option>
                </select>
              </div>

              {/* IMAGE UPLOAD */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Upload Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                {uploading && (
                  <p className="text-blue-600 mt-2">
                    Uploading image...
                  </p>
                )}

                {formData.mediaUrl &&
                  !uploading && (
                    <div className="mt-3">

                      <p className="text-green-600">
                        ✅ Image uploaded successfully!
                      </p>

                      <img
                        src={formData.mediaUrl}
                        alt="Uploaded preview"
                        className="mt-3 w-40 h-40 object-cover rounded-lg border"
                      />

                    </div>
                  )}
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="pending_approval">
                    Pending Approval
                  </option>

                  <option value="approved">
                    Approved
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>

                  <option value="scheduled">
                    Scheduled
                  </option>
                </select>
              </div>

              {/* =========================
                  SCHEDULE DATE + TIME
              ========================= */}
              <div className="md:col-span-2">

                <label className="block text-gray-700 font-medium mb-2">
                  📅 Schedule Date & Time
                </label>

                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                />

                <p className="text-gray-500 text-sm mt-2">
                  Select the date and time when this post
                  should be scheduled.
                </p>

                {formData.scheduledDate && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">

                    <p className="text-green-700 font-medium">
                      ✅ Post will be scheduled for:
                    </p>

                    <p className="text-green-700 mt-1">
                      📅{" "}
                      {formatScheduleDateTime(
                        formData.scheduledDate
                      )}
                    </p>

                  </div>
                )}

              </div>

              {/* CREATE */}
              <div className="md:col-span-2">

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                >
                  Create Post
                </button>

              </div>

            </form>
          </div>
        )}

        {/* =========================
            POST LIST
        ========================= */}
        {loading ? (
          <p className="text-gray-600">
            Loading posts...
          </p>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8">

            <p className="text-gray-600">
              No posts found.
            </p>

          </div>
        ) : (
          <div className="space-y-6">

            {posts.map((post) => {

              const approval = approvals[post._id];

              return (
                <div
                  key={post._id}
                  className="bg-white rounded-2xl shadow-md p-6"
                >

                  {/* =========================
                      POST IMAGE
                  ========================= */}
                  {post.mediaUrl && (
                    <div className="mb-5">

                      <img
                        src={post.mediaUrl}
                        alt={post.title}
                        className="w-full max-h-96 object-cover rounded-xl border border-gray-200"
                      />

                    </div>
                  )}

                  {/* POST DETAILS */}
                  <h2 className="text-xl font-bold text-gray-800">
                    {post.title}
                  </h2>

                  {post.caption && (
                    <p className="text-gray-600 mt-2">
                      {post.caption}
                    </p>
                  )}

                  {post.hashtags && (
                    <p className="text-blue-600 mt-2">
                      {post.hashtags}
                    </p>
                  )}

                  <p className="mt-3">
                    <span className="font-medium">
                      Status:
                    </span>{" "}
                    {post.status}
                  </p>

                  {post.client && (
                    <p className="text-gray-500 mt-2">
                      Client:{" "}
                      {post.client.companyName ||
                        post.client.name}
                    </p>
                  )}

                  {/* =========================
                      SCHEDULE INFORMATION
                  ========================= */}
                  {post.scheduledDate && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">

                      <p className="text-blue-800 font-semibold">
                        📅 Scheduled Post
                      </p>

                      <p className="text-blue-700 mt-1">
                        {formatScheduleDateTime(
                          post.scheduledDate
                        )}
                      </p>

                    </div>
                  )}

                  {/* =========================
                      SEND FOR APPROVAL
                  ========================= */}
                  {post.status === "draft" &&
                    !approval && (
                      <button
                        onClick={() =>
                          sendForApproval(post)
                        }
                        className="mt-5 bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600"
                      >
                        📤 Send for Approval
                      </button>
                    )}

                  {/* =========================
                      APPROVAL SECTION
                  ========================= */}
                  {approval && (
                    <div className="mt-5 border-t pt-5">

                      <h3 className="text-lg font-bold text-gray-800">
                        Approval
                      </h3>

                      <p className="mt-2">
                        <span className="font-medium">
                          Approval Status:
                        </span>{" "}
                        {approval.status}
                      </p>

                      {/* Existing Feedback */}
                      {approval.feedback && (
                        <div className="bg-gray-100 rounded-lg p-4 mt-3">

                          <p className="font-medium">
                            Feedback:
                          </p>

                          <p className="text-gray-600 mt-1">
                            {approval.feedback}
                          </p>

                        </div>
                      )}

                      {/* Pending Approval */}
                      {approval.status === "pending" && (
                        <div className="mt-4">

                          <label className="block text-gray-700 font-medium mb-2">
                            Feedback
                          </label>

                          <textarea
                            value={
                              feedback[
                                approval._id
                              ] || ""
                            }
                            onChange={(e) =>
                              handleFeedbackChange(
                                approval._id,
                                e.target.value
                              )
                            }
                            placeholder="Enter feedback..."
                            rows="3"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                          />

                          <div className="flex gap-3 mt-3">

                            <button
                              onClick={() =>
                                approvePost(
                                  approval._id
                                )
                              }
                              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                            >
                              ✅ Approve
                            </button>

                            <button
                              onClick={() =>
                                rejectPost(
                                  approval._id
                                )
                              }
                              className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
                            >
                              ❌ Reject
                            </button>

                            <button
                              onClick={() =>
                                addFeedback(
                                  approval._id
                                )
                              }
                              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                            >
                              💬 Add Feedback
                            </button>

                          </div>

                        </div>
                      )}

                    </div>
                  )}

                  {/* =========================
                      COMMENTS
                  ========================= */}
                  <button
                    onClick={() =>
                      fetchComments(post._id)
                    }
                    className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                  >
                    View Comments
                  </button>

                  {comments[post._id] && (
                    <div className="mt-5 border-t pt-4">

                      <h3 className="font-bold text-gray-800 mb-3">
                        Client Feedback
                      </h3>

                      {comments[post._id].length ===
                      0 ? (
                        <p className="text-gray-500">
                          No comments yet.
                        </p>
                      ) : (
                        <div className="space-y-3">

                          {comments[post._id].map(
                            (item) => (
                              <div
                                key={item._id}
                                className="bg-gray-100 rounded-lg p-3"
                              >

                                <p className="font-medium">
                                  {item.client?.name}
                                </p>

                                <p className="text-gray-600 mt-1">
                                  {item.comment}
                                </p>

                              </div>
                            )
                          )}

                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </main>
    </div>
  );
}

export default Posts;