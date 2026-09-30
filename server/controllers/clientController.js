const Client = require("../models/Client");
const User = require("../models/User");

// =========================
// CREATE CLIENT
// =========================
const createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      companyName,
      phone,
      businessType
    } = req.body;

    if (!name || !email || !companyName) {
      return res.status(400).json({
        message: "Name, email and company name are required"
      });
    }

    // =========================================
    // FIND CLIENT USER ACCOUNT BY EMAIL
    // =========================================
    const clientUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!clientUser) {
      return res.status(404).json({
        message:
          "No client account found with this email. Please ask the client to register first."
      });
    }

    // Make sure the account is actually a client
    if (clientUser.role !== "client") {
      return res.status(400).json({
        message:
          "This email belongs to an agency account. Please use a client account email."
      });
    }

    // =========================================
    // CHECK IF THIS USER IS ALREADY ADDED
    // =========================================
    const existingClient = await Client.findOne({
      userId: clientUser._id,
      createdBy: req.user.id
    });

    if (existingClient) {
      return res.status(400).json({
        message: "This client is already added to your agency."
      });
    }

    // =========================================
    // CREATE CLIENT
    // =========================================
    const client = await Client.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      companyName: companyName.trim(),
      phone,
      businessType,

      // Client's actual User ID
      userId: clientUser._id,

      // Agency who added this client
      createdBy: req.user.id
    });

    return res.status(201).json({
      message: "Client created successfully",
      client
    });

  } catch (error) {
    console.error("CREATE CLIENT ERROR:", error);

    return res.status(500).json({
      message: "Failed to create client",
      error: error.message
    });
  }
};


// =========================
// GET ALL CLIENTS
// =========================
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({
      createdBy: req.user.id
    })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Clients fetched successfully",
      clients
    });

  } catch (error) {
    console.error("GET CLIENTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch clients",
      error: error.message
    });
  }
};


// =========================
// GET SINGLE CLIENT
// =========================
const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    }).populate("userId", "name email role");

    if (!client) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    return res.status(200).json({
      message: "Client fetched successfully",
      client
    });

  } catch (error) {
    console.error("GET CLIENT ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch client",
      error: error.message
    });
  }
};


// =========================
// UPDATE CLIENT
// =========================
const updateClient = async (req, res) => {
  try {
    const {
      name,
      email,
      companyName,
      phone,
      businessType
    } = req.body;

    // =========================================
    // FIND CLIENT
    // =========================================
    const existingClient = await Client.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!existingClient) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    // =========================================
    // IF EMAIL IS CHANGED
    // FIND NEW CLIENT USER
    // =========================================
    let userId = existingClient.userId;

    if (
      email &&
      email.trim().toLowerCase() !== existingClient.email
    ) {
      const clientUser = await User.findOne({
        email: email.trim().toLowerCase()
      });

      if (!clientUser) {
        return res.status(404).json({
          message:
            "No client account found with this email. Please ask the client to register first."
        });
      }

      if (clientUser.role !== "client") {
        return res.status(400).json({
          message:
            "This email belongs to an agency account."
        });
      }

      userId = clientUser._id;
    }

    // =========================================
    // UPDATE CLIENT
    // =========================================
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id
      },
      {
        name: name?.trim(),
        email: email?.trim().toLowerCase(),
        companyName: companyName?.trim(),
        phone,
        businessType,
        userId
      },
      {
        new: true,
        runValidators: true
      }
    ).populate("userId", "name email role");

    return res.status(200).json({
      message: "Client updated successfully",
      client
    });

  } catch (error) {
    console.error("UPDATE CLIENT ERROR:", error);

    return res.status(500).json({
      message: "Failed to update client",
      error: error.message
    });
  }
};


// =========================
// DELETE CLIENT
// =========================
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    return res.status(200).json({
      message: "Client deleted successfully"
    });

  } catch (error) {
    console.error("DELETE CLIENT ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete client",
      error: error.message
    });
  }
};


// =========================
// EXPORT CONTROLLERS
// =========================
module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
};