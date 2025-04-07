
const WebSocket = require('ws');
const express = require('express');
const path = require('path');

// Initialize Express
const app = express();
const PORTEXPRESS = 8081;
const PORT = 8080;

// Serve the static HTML file for video call
app.get('/', (req, res) => {
  // const roomId = req.params.roomId; // The URL parameter to identify the room

  // You can pass the roomId to the HTML template if needed
  const htmlFilePath = path.join(__dirname, 'index.html');
  res.sendFile(htmlFilePath);
});

// Start the Express server
app.listen(PORTEXPRESS, () => {
  console.log(`Express server running on http://localhost:${PORTEXPRESS}`);
});

// Initialize WebSocket server
const server = new WebSocket.Server({ noServer: true });

let userUrls = []; // Stores all user-generated URLs
let adminSocket = null; // Tracks admin connection

server.on('connection', (socket) => {
  // console.log('New connection established.');

  socket.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'user') {
      // Add user URL to the array
      userUrls.push({ id: socket.id, url: data.url });
      console.log('User URL added:', data.url);

      // Notify admin if connected
      if (adminSocket) {
        adminSocket.send(JSON.stringify({ type: 'update', userUrls }));
      }
    }

    if (data.type === 'admin') {
      adminSocket = socket; // Register admin socket
      console.log('Admin connected.');

      // Send the existing user URLs to the admin
      adminSocket.send(JSON.stringify({ type: 'update', userUrls }));
    }
  });

  socket.on('close', () => {
    // Remove disconnected users' URLs
    // userUrls = userUrls.filter((user) => user.id !== socket.id);
    console.log('Socket disconnected.');

    if (adminSocket) {
      adminSocket.send(JSON.stringify({ type: 'update', userUrls }));
    }
  });
});

// Handle WebSocket upgrades for HTTP server
app.server = app.listen(PORT, () => {
  console.log(`Socket server running on ws://localhost:${PORT}`);
});

app.server.on('upgrade', (request, socket, head) => {
  server.handleUpgrade(request, socket, head, (socket) => {
    server.emit('connection', socket, request);
  });
});
