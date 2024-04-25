var socket = io();

var canvas = document.querySelector(".whiteboard");
var context = canvas.getContext("2d");
var lines = [];
var undoStack = [];

var drawing = false;
var current = {
  color: "#000000", // Default color set to black
  lineWidth: 2 // Default line width
};

function throttle(callback, delay) {
  var previousCall = new Date().getTime();
  return function () {
    var time = new Date().getTime();

    if (time - previousCall >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}

function drawLine(x0, y0, x1, y1, color,lineWidth, emit) {
  console.log("Drawing line with color: " + color + " and lineWidth: " + current.lineWidth); // Log the color and line width
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = current.lineWidth; // Use the current line width
  context.stroke();
  context.closePath();

  if (emit) {
    var w = canvas.width;
    var h = canvas.height;

    socket.emit("drawing", {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
      lineWidth: current.lineWidth
    });
  } else {
    // Only push to the undo stack if it's a user-initiated drawing action
    undoStack.push({ x0: x0, y0: y0, x1: x1, y1: y1, color: color, lineWidth: current.lineWidth });
  }
}

function undo() {
  if (undoStack.length > 0) {
    var lastLine = undoStack.pop(); // Remove the last drawn line from the undoStack
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw all the lines except the last one
    for (var i = 0; i < undoStack.length; i++) {
      var line = undoStack[i];
      context.beginPath();
      context.moveTo(line.x0, line.y0);
      context.lineTo(line.x1, line.y1);
      context.strokeStyle = line.color;
      context.lineWidth = line.lineWidth;
      context.stroke();
      context.closePath();
    }
  }
}

function redraw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < undoStack.length; i++) {
    var line = undoStack[i];
    context.beginPath();
    context.moveTo(line.x0, line.y0);
    context.lineTo(line.x1, line.y1);
    context.strokeStyle = line.color;
    context.lineWidth = line.lineWidth;
    context.stroke();
    context.closePath();
  }
}





function onMouseDown(e) {
  drawing = true;
  if (e.touches && e.touches.length > 0) {
    current.x = e.touches[0].clientX;
    current.y = e.touches[0].clientY;
  } else {
    current.x = e.clientX;
    current.y = e.clientY;
  }
}


function onMouseUp(e) {
  if (!drawing) {
    return;
  }
  drawing = false;
  drawLine(
    current.x,
    current.y,
    e.clientX || e.touches[0].clientX,
    e.clientY || e.touches[0].clientY,
    current.color,
    current.lineWidth,
    true
  );
}

function onMouseMove(e) {
  if (!drawing) {
    return;
  }

  if (e.touches && e.touches.length > 0) {
    drawLine(
      current.x,
      current.y,
      e.touches[0].clientX,
      e.touches[0].clientY,
      current.color,
      true
    );
    current.x = e.touches[0].clientX;
    current.y = e.touches[0].clientY;
  } else {
    drawLine(
      current.x,
      current.y,
      e.clientX,
      e.clientY,
      current.color,
      true
    );
    current.x = e.clientX;
    current.y = e.clientY;
  }
}



// This is for the browser.
canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mouseup", onMouseUp, false);
canvas.addEventListener("mouseout", onMouseUp, false);
canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

// This is for the touch devices.
canvas.addEventListener("touchstart", onMouseDown, false);
canvas.addEventListener("touchend", onMouseUp, false);
canvas.addEventListener("touchcancel", onMouseUp, false);
canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", onResize, false);
onResize();

function onDrawingEvent(data) {
  var w = canvas.width;
  var h = canvas.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineWidth);
}
function redraw() {
  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Redraw all the lines with the updated line width
  // You'll need to modify this part based on your application's logic
  // For example, you might have a list of lines stored somewhere
  // and redraw all of them here
  // This is just a placeholder example
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    drawLine(line.x0, line.y0, line.x1, line.y1, line.color, line.lineWidth, false);
  }
}

function getUsername() {
  // Implement your logic to get the username here
  return "JohnDoe"; // Example username
}


socket.on("drawing", onDrawingEvent);

// Color picker functionality
// Color picker functionality
document.addEventListener("DOMContentLoaded", function() {
  // Your script code here
  var colorPicker = document.querySelector("#color-picker");
  colorPicker.addEventListener("input", function () {
    current.color = colorPicker.value;
    console.log("Current color: " + current.color); // Log the current color value
    // Remove the redraw call here so that changing the color does not trigger a redraw
  });
});

// Line width picker functionality
document.addEventListener("DOMContentLoaded", function() {
  var lineWidthPicker = document.querySelector("#line-width-picker");
  lineWidthPicker.addEventListener("input", function () {
    current.lineWidth = parseInt(lineWidthPicker.value);
    console.log("Current line width: " + current.lineWidth); // Log the current line width value
    // Remove the redraw call here so that changing the line width does not trigger a redraw
  });
});

// Hide the welcome note after 5 seconds
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get the username from the form
    var username = document.getElementById("username").value;

    // Hide the welcome note
    document.getElementById("welcome-note").style.display = "none";

    // You can now use the username in your application
    console.log("Welcome, " + username + "!"); // For demonstration purposes, you can replace this with your actual logic
  });
});

document.addEventListener("DOMContentLoaded", function() {
  var usernameInput = document.querySelector("#username-input");
  console.log(usernameInput); // Check if usernameInput is null or the actual element
});


var isErasing = false; // Flag to indicate if the eraser is active

// Create an eraser element
const eraser = document.createElement('div');
eraser.className = 'eraser';
document.body.appendChild(eraser);

document.getElementById("eraserButton").addEventListener("click", function() {
  isErasing = !isErasing; // Toggle the eraser mode
  if (isErasing) {
      current.color = "#ffffff"; // Set the color to white (or the background color) for erasing
      current.lineWidth = 100; // Set the line width for erasing
      eraser.style.display = 'block'; // Show the eraser
  } else {
      current.color = document.getElementById("color-picker").value; // Restore the drawing color
      current.lineWidth = parseInt(document.getElementById("line-width-picker").value); // Restore the line width
      eraser.style.display = 'none'; // Hide the eraser
  }
  console.log("Eraser mode: " + isErasing); // Log the eraser mode for debugging
});

// Add a mousemove event listener to move the eraser with the mouse
document.addEventListener('mousemove', (event) => {
  if (isErasing) {
    eraser.style.left = `${event.clientX}px`;
    eraser.style.top = `${event.clientY}px`;
  }
});

// Add a mousedown event listener to perform erasing when the mouse is clicked
document.addEventListener('mousedown', (event) => {
  if (isErasing) {
    // Erase content on the whiteboard at the cursor position
    const whiteboard = document.getElementById('whiteboard');
    const rect = whiteboard.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const ctx = whiteboard.getContext('2d');
    ctx.clearRect(x - 10, y - 10, 20, 20); // Clear a 20x20 area at the cursor position
  }
});


document.getElementById("undoButton").addEventListener("click", function() {
  console.log("Undo button clicked"); // Check if the button click is registered
  undo(); // Call the undo function when the button is clicked
});

socket.on("drawing", onDrawingEvent);

function onDrawingEvent(data) {
  var w = canvas.width;
  var h = canvas.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineWidth);
}