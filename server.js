// server.js - CommonJS
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Define MIME types
const mimeTypes = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Serve static files with proper MIME types
app.use((req, res, next) => {
  if (req.url.startsWith('/assets/')) {
    const extname = path.extname(req.url);
    if (mimeTypes[extname]) {
      res.setHeader('Content-Type', mimeTypes[extname]);
    }
  }
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// For all other requests, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app; 