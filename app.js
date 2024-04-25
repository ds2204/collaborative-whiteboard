const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 2000;

let whiteboardIdCounter = 1;
let whiteboards = {};

app.use("/", express.static(__dirname + "/new"));

// Handle incoming connections
io.on("connection", (socket) => {
  console.log("A user connected");

  let whiteboardId = socket.handshake.query.whiteboardId;
  if (!whiteboardId) {
    whiteboardId = whiteboardIdCounter++;
    socket.emit("redirect", `/?whiteboardId=${whiteboardId}`);
  }

  if (!whiteboards[whiteboardId]) {
    whiteboards[whiteboardId] = [];
  }

  whiteboards[whiteboardId].push(socket);

  // Handle drawing events from clients
  socket.on("drawing", (data) => {
    // Broadcast the drawing event to all other clients in the same whiteboard session
    whiteboards[whiteboardId].forEach((clientSocket) => {
      if (clientSocket !== socket) {
        clientSocket.emit("drawing", data);
      }
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    const index = whiteboards[whiteboardId].indexOf(socket);
    if (index !== -1) {
      whiteboards[whiteboardId].splice(index, 1);
    }
  });
});

// Start the server
http.listen(port, () => {
  console.log("Server started on port " + port);
});
