// Get elements from the DOM
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSizeInput = document.getElementById('brushSize');
const brushColorInput = document.getElementById('brushColor');
const messageInput = document.getElementById('message');
const submitButton = document.getElementById('submitDrawing');
const undoButton = document.getElementById('undoDrawing');

// Set initial drawing settings
let drawing = false;
let brushSize = brushSizeInput.value;
let brushColor = brushColorInput.value;

// Store the canvas history for undo functionality
let history = [];
let currentStateIndex = -1;

// Save the initial state (empty canvas)
function saveInitialCanvasState() {
  history.push(canvas.toDataURL()); // Save the empty canvas as the initial state
  currentStateIndex++;
}

// Adjust brush size and color dynamically
brushSizeInput.addEventListener('input', () => {
  brushSize = brushSizeInput.value;
});

brushColorInput.addEventListener('input', () => {
  brushColor = brushColorInput.value;
});

// Start drawing when mouse is pressed
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  draw(e);
});

// Stop drawing when mouse is released
canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.beginPath();
  saveCanvasState();
});

// Draw on the canvas
canvas.addEventListener('mousemove', (e) => {
  if (drawing) {
    draw(e);
  }
});

// Drawing function
function draw(e) {
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = brushColor;
  ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

// Save the current canvas state to history
function saveCanvasState() {
  if (currentStateIndex < history.length - 1) {
    // If we're in the middle of the history, trim any "future" states
    history = history.slice(0, currentStateIndex + 1);
  }
  history.push(canvas.toDataURL());
  currentStateIndex++;
}

// Undo the drawing
undoButton.addEventListener('click', () => {
  if (currentStateIndex > 0) {
    currentStateIndex--;
    const previousState = history[currentStateIndex];
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
});

// Submit the drawing to Discord Webhook
submitButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  const imageData = canvas.toDataURL(); // Get canvas data as base64 image

  if (message || imageData) {
    sendToDiscord(message, imageData);
  }
});

// Function to send the drawing and message to Discord via Webhook
async function sendToDiscord(message, imageData) {
  const webhookUrl = 'YOUR_DISCORD_WEBHOOK_URL'; // Replace with your actual Discord webhook URL

  const data = {
    content: message,
    embeds: [
      {
        title: "Anonymous Drawing",
        description: message ? message : "No message",
        image: {
          url: imageData
        }
      }
    ]
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    alert('Your drawing has been submitted!');
    messageInput.value = ''; // Clear the message input
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  } catch (error) {
    console.error('Error sending data to Discord:', error);
    alert('Something went wrong. Please try again.');
  }
}

// Save the initial canvas state when the page loads
window.onload = saveInitialCanvasState;