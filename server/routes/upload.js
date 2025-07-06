const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(uploadsDir, 'products');
    
    // Create directory based on file type
    if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadsDir, 'avatars');
    } else if (file.fieldname === 'categoryImage') {
      uploadPath = path.join(uploadsDir, 'categories');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Image processing function
const processImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg'
    } = options;

    await sharp(inputPath)
      .resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .toFormat(format, { quality })
      .toFile(outputPath);

    return true;
  } catch (error) {
    console.error('Image processing error:', error);
    return false;
  }
};

// Single file upload endpoint
router.post('/single', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const relativePath = path.relative(path.join(__dirname, '../'), file.path);
    const fileUrl = `/${relativePath.replace(/\\/g, '/')}`;

    // Create thumbnail if it's a product image
    if (file.fieldname === 'image' || file.fieldname === 'productImage') {
      const thumbnailDir = path.join(path.dirname(file.path), 'thumbnails');
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }
      
      const thumbnailPath = path.join(thumbnailDir, file.filename);
      await processImage(file.path, thumbnailPath, {
        width: 300,
        height: 300,
        quality: 70
      });

      const thumbnailRelativePath = path.relative(path.join(__dirname, '../'), thumbnailPath);
      const thumbnailUrl = `/${thumbnailRelativePath.replace(/\\/g, '/')}`;

      res.json({
        message: 'File uploaded successfully',
        file: {
          filename: file.filename,
          originalName: file.originalname,
          url: fileUrl,
          thumbnailUrl,
          size: file.size,
          mimetype: file.mimetype
        }
      });
    } else {
      res.json({
        message: 'File uploaded successfully',
        file: {
          filename: file.filename,
          originalName: file.originalname,
          url: fileUrl,
          size: file.size,
          mimetype: file.mimetype
        }
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Multiple files upload endpoint
router.post('/multiple', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const relativePath = path.relative(path.join(__dirname, '../'), file.path);
      const fileUrl = `/${relativePath.replace(/\\/g, '/')}`;

      // Create thumbnail
      const thumbnailDir = path.join(path.dirname(file.path), 'thumbnails');
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }
      
      const thumbnailPath = path.join(thumbnailDir, file.filename);
      await processImage(file.path, thumbnailPath, {
        width: 300,
        height: 300,
        quality: 70
      });

      const thumbnailRelativePath = path.relative(path.join(__dirname, '../'), thumbnailPath);
      const thumbnailUrl = `/${thumbnailRelativePath.replace(/\\/g, '/')}`;

      uploadedFiles.push({
        filename: file.filename,
        originalName: file.originalname,
        url: fileUrl,
        thumbnailUrl,
        size: file.size,
        mimetype: file.mimetype
      });
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Delete file endpoint
router.delete('/:type/:filename', protect, admin, (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(uploadsDir, type, filename);
    const thumbnailPath = path.join(uploadsDir, type, 'thumbnails', filename);

    // Delete main file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete thumbnail if exists
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

// Get file info endpoint
router.get('/info/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(uploadsDir, type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    const relativePath = path.relative(path.join(__dirname, '../'), filePath);
    const fileUrl = `/${relativePath.replace(/\\/g, '/')}`;

    res.json({
      filename,
      url: fileUrl,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ message: 'Failed to get file info', error: error.message });
  }
});

// List files endpoint
router.get('/list/:type', protect, admin, (req, res) => {
  try {
    const { type } = req.params;
    const dirPath = path.join(uploadsDir, type);

    if (!fs.existsSync(dirPath)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(dirPath)
      .filter(file => !file.startsWith('.') && file !== 'thumbnails')
      .map(filename => {
        const filePath = path.join(dirPath, filename);
        const stats = fs.statSync(filePath);
        const relativePath = path.relative(path.join(__dirname, '../'), filePath);
        const fileUrl = `/${relativePath.replace(/\\/g, '/')}`;

        return {
          filename,
          url: fileUrl,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      });

    res.json({ files });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ message: 'Failed to list files', error: error.message });
  }
});

// Image resize endpoint
router.post('/resize', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { width = 800, height = 600, quality = 80, format = 'jpeg' } = req.body;
    
    const outputFilename = `resized-${Date.now()}-${req.file.filename}`;
    const outputPath = path.join(path.dirname(req.file.path), outputFilename);

    const success = await processImage(req.file.path, outputPath, {
      width: parseInt(width),
      height: parseInt(height),
      quality: parseInt(quality),
      format
    });

    if (!success) {
      return res.status(500).json({ message: 'Image processing failed' });
    }

    // Delete original file
    fs.unlinkSync(req.file.path);

    const relativePath = path.relative(path.join(__dirname, '../'), outputPath);
    const fileUrl = `/${relativePath.replace(/\\/g, '/')}`;

    res.json({
      message: 'Image resized successfully',
      file: {
        filename: outputFilename,
        url: fileUrl,
        dimensions: { width: parseInt(width), height: parseInt(height) },
        quality: parseInt(quality),
        format
      }
    });
  } catch (error) {
    console.error('Resize error:', error);
    res.status(500).json({ message: 'Resize failed', error: error.message });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 10 files.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name.' });
    }
  }
  
  res.status(500).json({ message: error.message || 'Upload error' });
});

module.exports = router;