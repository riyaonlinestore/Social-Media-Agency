const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
});

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "social-media-agency",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    return res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  uploadImage,
};