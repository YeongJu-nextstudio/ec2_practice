const express = require('express');
const router = express.Router();
const path = require("path");
const multer = require("multer");
const multerS3 = require('multer-s3');
// AWS
const AWS = require('aws-sdk');
AWS.config.update({
  "accessKeyId": "",
  "secretAccessKey": "",
  "region": "ap-northeast-2"
});
// S3
const s3 = new AWS.S3();
// S3 bucket and directory
const BUCKET = "Bucket_Name";
const DIR = "Directory_Name";
// Multer
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET,
    key: function (req, file, cb) {
      const filePath = DIR + "/" + Date.now().toString() + "_" + file.originalname;
      cb(null, filePath);
    },
    acl: 'private'
  })
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

/* Upload image in S3 */
router.post('/upload', function(req, res) {
  upload.single('image')(req, res, function(err) {
    if (err) {
      console.error("Upload error:", err);
      if (err.code === 'SignatureDoesNotMatch') {
        return res.status(403).json({
          result: false,
          message: "AWS authentication failed. Please check your credentials.",
          error: err.message
        });
      }
      return res.status(500).json({
        result: false,
        message: "File upload failed",
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({result: false, message: "No file uploaded"});
    }

    console.log("Successfully uploaded:", req.file);
    res.json({result: true, message: "Successfully uploaded file!", file: req.file});
  });
});

module.exports = router;