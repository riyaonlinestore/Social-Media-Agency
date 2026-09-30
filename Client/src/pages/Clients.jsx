import React, { useEffect, useState } from "react";
import API from "../services/api";

const Clients = ({ setPage, handleLogout }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    phone: "",
    businessType: "",
  });

  // NEW: Selected client details
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientPosts, setSelectedClientPosts] = useState([]);
  const [clientPostsLoading, setClientPostsLoading] = useState(false);

  // =========================
  // FETCH CLIENTS
  // =========================
  const fetchClients = async () => {
    try {
      setLoading(true);

      const response = await API.get("/clients");

      setClients(response.data.clients || []);
    } catch (error) {
      console.error("FETCH CLIENTS ERROR:", error);
      alert(
        error.response?.data?.message || "Failed to fetch clients"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // =========================
  // FORM INPUT
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      companyName: "",
      phone: "",
      businessType: "",
    });

    setEditingClient(null);
    setShowForm(false);
  };

  // =========================
  // PHONE VALIDATION
  // =========================
  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  // =========================
  // ADD CLIENT
  // =========================
  const handleAddClient = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Client name is required");
      return;
    }

    if (!formData.email.trim()) {
      alert("Email is required");
      return;
    }

    if (!formData.companyName.trim()) {
      alert("Company name is required");
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    try {
      await API.post("/clients", formData);

      alert("Client added successfully!");

      resetForm();
      fetchClients();
    } catch (error) {
      console.error("ADD CLIENT ERROR:", error);

      alert(
        error.response?.data?.message || "Failed to add client"
      );
    }
  };

  // =========================
  // EDIT CLIENT
  // =========================
  const handleEditClient = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Client name is required");
      return;
    }

    if (!formData.email.trim()) {
      alert("Email is required");
      return;
    }

    if (!formData.companyName.trim()) {
      alert("Company name is required");
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    try {
      await API.put(
        `/clients/${editingClient._id}`,
        formData
      );

      alert("Client updated successfully!");

      resetForm();
      fetchClients();
    } catch (error) {
      console.error("EDIT CLIENT ERROR:", error);

      alert(
        error.response?.data?.message || "Failed to update client"
      );
    }
  };

  // =========================
  // DELETE CLIENT
  // =========================
  const handleDeleteClient = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/clients/${id}`);

      alert("Client deleted successfully!");

      // If deleted client was selected
      if (
        selectedClient &&
        String(selectedClient._id) === String(id)
      ) {
        setSelectedClient(null);
        setSelectedClientPosts([]);
      }

      fetchClients();
    } catch (error) {
      console.error("DELETE CLIENT ERROR:", error);

      alert(
        error.response?.data?.message || "Failed to delete client"
      );
    }
  };

  // =========================
  // OPEN EDIT FORM
  // =========================
  const openEditForm = (client) => {
    setEditingClient(client);

    setFormData({
      name: client.name || "",
      email: client.email || "",
      companyName: client.companyName || "",
      phone: client.phone || "",
      businessType: client.businessType || "",
    });

    setShowForm(true);
  };

  // =========================
  // VIEW CLIENT DETAILS
  // =========================
  const openClientDetails = async (client) => {
    try {
      setSelectedClient(client);
      setSelectedClientPosts([]);
      setClientPostsLoading(true);

      /*
        Agency GET /posts returns agency posts
        with populated client information.

        We fetch all posts and then show only
        the selected client's posts.
      */
      const response = await API.get("/posts");

      const allPosts = response.data.posts || [];

      const filteredPosts = allPosts.filter((post) => {
        const postClientId =
          typeof post.client === "object"
            ? post.client?._id
            : post.client;

        return (
          String(postClientId) === String(client._id)
        );
      });

      setSelectedClientPosts(filteredPosts);
    } catch (error) {
      console.error("CLIENT DETAILS ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to fetch client posts"
      );
    } finally {
      setClientPostsLoading(false);
    }
  };

  // =========================
  // BACK TO CLIENT LIST
  // =========================
  const closeClientDetails = () => {
    setSelectedClient(null);
    setSelectedClientPosts([]);
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================
  // STATUS STYLE
  // =========================
  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return {
          background: "#dcfce7",
          color: "#166534",
        };

      case "rejected":
        return {
          background: "#fee2e2",
          color: "#991b1b",
        };

      case "pending_approval":
        return {
          background: "#fef3c7",
          color: "#92400e",
        };

      case "scheduled":
        return {
          background: "#dbeafe",
          color: "#1e40af",
        };

      case "draft":
      default:
        return {
          background: "#f3f4f6",
          color: "#374151",
        };
    }
  };

  // =========================
  // SIDEBAR
  // =========================
  const Sidebar = () => {
    return (
      <div
        style={{
          width: "240px",
          background: "#111827",
          color: "white",
          minHeight: "100vh",
          padding: "25px 15px",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            marginBottom: "35px",
            paddingLeft: "10px",
          }}
        >
          Agency Panel
        </h2>

        <div
          onClick={() => setPage("dashboard")}
          style={{
            padding: "14px 12px",
            marginBottom: "8px",
            cursor: "pointer",
            borderRadius: "8px",
          }}
        >
          🏠 Dashboard
        </div>

        <div
          onClick={() => setPage("clients")}
          style={{
            padding: "14px 12px",
            marginBottom: "8px",
            cursor: "pointer",
            borderRadius: "8px",
            background: "#1f2937",
          }}
        >
          👥 Clients
        </div>

        <div
          onClick={() => setPage("posts")}
          style={{
            padding: "14px 12px",
            marginBottom: "8px",
            cursor: "pointer",
            borderRadius: "8px",
          }}
        >
          📝 Posts
        </div>

        <div
          onClick={() => setPage("calendar")}
          style={{
            padding: "14px 12px",
            marginBottom: "8px",
            cursor: "pointer",
            borderRadius: "8px",
          }}
        >
          📅 Calendar
        </div>

        <div
          onClick={() => setPage("analytics")}
          style={{
            padding: "14px 12px",
            marginBottom: "8px",
            cursor: "pointer",
            borderRadius: "8px",
          }}
        >
          📊 Analytics
        </div>

        <div
          onClick={handleLogout}
          style={{
            padding: "14px 12px",
            marginTop: "30px",
            cursor: "pointer",
            borderRadius: "8px",
            color: "#fca5a5",
          }}
        >
          🚪 Logout
        </div>
      </div>
    );
  };

  // ============================================================
  // CLIENT DETAILS PAGE
  // ============================================================
  if (selectedClient) {
    const totalPosts = selectedClientPosts.length;

    const pendingPosts = selectedClientPosts.filter(
      (post) => post.status === "pending_approval"
    ).length;

    const approvedPosts = selectedClientPosts.filter(
      (post) => post.status === "approved"
    ).length;

    const scheduledPosts = selectedClientPosts.filter(
      (post) =>
        post.status === "scheduled" ||
        post.scheduledDate
    ).length;

    const schedulePosts = selectedClientPosts
      .filter((post) => post.scheduledDate)
      .sort(
        (a, b) =>
          new Date(a.scheduledDate) -
          new Date(b.scheduledDate)
      );

    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f3f4f6",
        }}
      >
        <Sidebar />

        <div
          style={{
            flex: 1,
            padding: "30px",
            overflowY: "auto",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <div>
              <button
                onClick={closeClientDetails}
                style={{
                  border: "none",
                  background: "white",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "15px",
                  boxShadow:
                    "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                ← Back to Clients
              </button>

              <h1
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                {selectedClient.companyName}
              </h1>

              <p
                style={{
                  color: "#6b7280",
                  marginTop: "8px",
                }}
              >
                Client Details & Content Management
              </p>
            </div>

            <button
              onClick={() => openEditForm(selectedClient)}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              ✏️ Edit Client
            </button>
          </div>

          {/* CLIENT INFORMATION */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "25px",
              marginBottom: "25px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
              }}
            >
              👤 Client Information
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  Client Name
                </p>
                <strong>
                  {selectedClient.name || "N/A"}
                </strong>
              </div>

              <div>
                <p
                  style={{
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  Email
                </p>
                <strong>
                  {selectedClient.email || "N/A"}
                </strong>
              </div>

              <div>
                <p
                  style={{
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  Phone
                </p>
                <strong>
                  {selectedClient.phone || "N/A"}
                </strong>
              </div>

              <div>
                <p
                  style={{
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  Business Type
                </p>
                <strong>
                  {selectedClient.businessType || "N/A"}
                </strong>
              </div>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: "28px" }}>
                📝
              </div>

              <h3>Total Posts</h3>

              <strong
                style={{
                  fontSize: "28px",
                }}
              >
                {totalPosts}
              </strong>
            </div>

            <div
              style={{
                background: "white",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: "28px" }}>
                ⏳
              </div>

              <h3>Pending Approval</h3>

              <strong
                style={{
                  fontSize: "28px",
                }}
              >
                {pendingPosts}
              </strong>
            </div>

            <div
              style={{
                background: "white",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: "28px" }}>
                ✅
              </div>

              <h3>Approved</h3>

              <strong
                style={{
                  fontSize: "28px",
                }}
              >
                {approvedPosts}
              </strong>
            </div>

            <div
              style={{
                background: "white",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: "28px" }}>
                📅
              </div>

              <h3>Scheduled</h3>

              <strong
                style={{
                  fontSize: "28px",
                }}
              >
                {scheduledPosts}
              </strong>
            </div>
          </div>

          {/* POSTS */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "25px",
              marginBottom: "30px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
              }}
            >
              📝 {selectedClient.companyName} - Posts
            </h2>

            {clientPostsLoading ? (
              <p>Loading posts...</p>
            ) : selectedClientPosts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                <div
                  style={{
                    fontSize: "45px",
                    marginBottom: "10px",
                  }}
                >
                  📝
                </div>

                <h3>No posts found</h3>

                <p>
                  This client does not have any posts
                  yet.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {selectedClientPosts.map((post) => (
                  <div
                    key={post._id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "18px",
                    }}
                  >
                    {/* MEDIA */}
                    {post.mediaUrl ? (
                      <div
                        style={{
                          marginBottom: "15px",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        {post.contentType ===
                        "image" ? (
                          <img
                            src={post.mediaUrl}
                            alt={post.title}
                            style={{
                              width: "100%",
                              height: "180px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <a
                            href={post.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "block",
                              padding: "30px",
                              background:
                                "#f3f4f6",
                              textAlign: "center",
                              textDecoration:
                                "none",
                            }}
                          >
                            🎬 View Media
                          </a>
                        )}
                      </div>
                    ) : null}

                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "10px",
                      }}
                    >
                      {post.title}
                    </h3>

                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >
                      {post.caption ||
                        "No caption"}
                    </p>

                    {post.hashtags && (
                      <p
                        style={{
                          color: "#2563eb",
                          fontSize: "14px",
                        }}
                      >
                        {post.hashtags}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        marginTop: "15px",
                      }}
                    >
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          ...getStatusStyle(
                            post.status
                          ),
                        }}
                      >
                        {post.status
                          ?.replaceAll(
                            "_",
                            " "
                          )
                          .toUpperCase()}
                      </span>

                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {post.contentType}
                      </span>
                    </div>

                    {post.scheduledDate && (
                      <div
                        style={{
                          marginTop: "15px",
                          padding: "10px",
                          background: "#eff6ff",
                          borderRadius: "8px",
                          color: "#1e40af",
                          fontSize: "13px",
                        }}
                      >
                        📅 Scheduled:
                        <br />
                        <strong>
                          {formatDate(
                            post.scheduledDate
                          )}
                        </strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SCHEDULE */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "25px",
              marginBottom: "30px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
              }}
            >
              📅 {selectedClient.companyName} -
              Schedule
            </h2>

            {schedulePosts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "#6b7280",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                  }}
                >
                  📅
                </div>

                <p>
                  No posts are scheduled for this
                  client.
                </p>
              </div>
            ) : (
              <div>
                {schedulePosts.map((post) => (
                  <div
                    key={post._id}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      padding: "16px",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    <div>
                      <strong>
                        {post.title}
                      </strong>

                      <p
                        style={{
                          margin:
                            "5px 0 0 0",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        {post.contentType}
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <div
                        style={{
                          color: "#2563eb",
                          fontWeight: "600",
                        }}
                      >
                        📅{" "}
                        {formatDate(
                          post.scheduledDate
                        )}
                      </div>

                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {post.status
                          ?.replaceAll(
                            "_",
                            " "
                          )
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* EDIT FORM MODAL */}
        {showForm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                width: "500px",
                maxWidth: "90%",
                padding: "30px",
                borderRadius: "12px",
              }}
            >
              <h2>Edit Client</h2>

              <form
                onSubmit={handleEditClient}
              >
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Client Name"
                  style={inputStyle}
                />

                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  type="email"
                  style={inputStyle}
                />

                <input
                  name="companyName"
                  value={
                    formData.companyName
                  }
                  onChange={handleChange}
                  placeholder="Company Name"
                  style={inputStyle}
                />

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  style={inputStyle}
                />

                <input
                  name="businessType"
                  value={
                    formData.businessType
                  }
                  onChange={handleChange}
                  placeholder="Business Type"
                  style={inputStyle}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    type="submit"
                    style={primaryButton}
                  >
                    Update Client
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    style={secondaryButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // CLIENT LIST PAGE
  // ============================================================
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#111827",
              }}
            >
              Clients
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginTop: "8px",
              }}
            >
              Manage your social media agency
              clients
            </p>
          </div>

          <button
            onClick={() => {
              setEditingClient(null);

              setFormData({
                name: "",
                email: "",
                companyName: "",
                phone: "",
                businessType: "",
              });

              setShowForm(true);
            }}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            + Add Client
          </button>
        </div>

        {/* CLIENT FORM */}
        {showForm && (
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              marginBottom: "30px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              {editingClient
                ? "Edit Client"
                : "Add New Client"}
            </h2>

            <form
              onSubmit={
                editingClient
                  ? handleEditClient
                  : handleAddClient
              }
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "15px",
                }}
              >
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Client Name"
                  style={inputStyle}
                />

                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  type="email"
                  style={inputStyle}
                />

                <input
                  name="companyName"
                  value={
                    formData.companyName
                  }
                  onChange={handleChange}
                  placeholder="Company Name"
                  style={inputStyle}
                />

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  style={inputStyle}
                />

                <input
                  name="businessType"
                  value={
                    formData.businessType
                  }
                  onChange={handleChange}
                  placeholder="Business Type"
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="submit"
                  style={primaryButton}
                >
                  {editingClient
                    ? "Update Client"
                    : "Add Client"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  style={secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "50px",
              borderRadius: "12px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <div
              style={{
                fontSize: "50px",
              }}
            >
              👥
            </div>

            <h2>No clients yet</h2>

            <p>
              Click "Add Client" to add your first
              client.
            </p>
          </div>
        ) : (
          /* CLIENT CARDS */
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {clients.map((client) => (
              <div
                key={client._id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "22px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                {/* CLIENT ICON */}
                <div
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "50%",
                    background: "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "25px",
                    marginBottom: "15px",
                  }}
                >
                  👤
                </div>

                <h2
                  style={{
                    margin: "0 0 5px 0",
                    color: "#111827",
                  }}
                >
                  {client.companyName}
                </h2>

                <p
                  style={{
                    margin: "5px 0",
                    fontWeight: "600",
                  }}
                >
                  {client.name}
                </p>

                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  📧 {client.email}
                </p>

                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  📱 {client.phone || "N/A"}
                </p>

                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  💼{" "}
                  {client.businessType ||
                    "N/A"}
                </p>

                {/* ACTION BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* NEW VIEW BUTTON */}
                  <button
                    onClick={() =>
                      openClientDetails(client)
                    }
                    style={{
                      flex: 1,
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      padding: "10px 12px",
                      borderRadius: "7px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    👁️ View
                  </button>

                  {/* EXISTING EDIT */}
                  <button
                    onClick={() =>
                      openEditForm(client)
                    }
                    style={{
                      flex: 1,
                      background: "#f59e0b",
                      color: "white",
                      border: "none",
                      padding: "10px 12px",
                      borderRadius: "7px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    ✏️ Edit
                  </button>

                  {/* EXISTING DELETE */}
                  <button
                    onClick={() =>
                      handleDeleteClient(
                        client._id
                      )
                    }
                    style={{
                      flex: 1,
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      padding: "10px 12px",
                      borderRadius: "7px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =========================
// COMMON STYLES
// =========================

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  boxSizing: "border-box",
  fontSize: "14px",
};

const primaryButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "11px 18px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: "600",
};

const secondaryButton = {
  background: "#e5e7eb",
  color: "#374151",
  border: "none",
  padding: "11px 18px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: "600",
};

export default Clients;