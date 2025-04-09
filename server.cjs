// server.cjs - CommonJS
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

// Add security headers and MIME types
app.use((req, res, next) => {
  // Set Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
  );

  // Set proper MIME types for assets
  if (req.url.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico)$/)) {
    const extname = path.extname(req.url);
    if (mimeTypes[extname]) {
      res.setHeader('Content-Type', mimeTypes[extname]);
    }
  }
  
  next();
});

// Handle 404 errors for assets by serving index.html instead
app.use((req, res, next) => {
  const filePath = path.join(__dirname, 'dist', req.url);
  
  if (req.url.startsWith('/assets/') && !fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}, serving index.html instead`);
    return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
  
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    const extname = path.extname(filePath);
    if (mimeTypes[extname]) {
      res.setHeader('Content-Type', mimeTypes[extname]);
    }
  },
  extensions: ['html', 'js', 'css']
}));

// For all other requests, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app; 