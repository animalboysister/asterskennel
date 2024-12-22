// Get elements from the DOM
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSizeInput = document.getElementById('brushSize');
const brushColorInput = document.getElementById('brushColor');
const messageInput = document.getElementById('message');
const submitButton = document.getElementById('submit');
const undoButton = document.getElementById('undoButton');

// Set initial drawing settings
let drawing = false;
let brushSize = brushSizeInput.value;
let brushColor = brushColorInput.value;

// History of canvas states for undo functionality
let canvasHistory = [];
const maxHistory = 10; // Limit the number of states to save memory

// Save the current state of the canvas
function saveState() {
  if (canvasHistory.length >= maxHistory) {
    canvasHistory.shift(); // Remove the oldest state if history exceeds max length
  }
  canvasHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

// Undo the last drawing action
function undo() {
    const lastState = canvasHistory.pop();
    ctx.putImageData(lastState, 0, 0);
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
  saveState(); // Save the state before starting a new drawing
  drawing = true;
  draw(e);
});

// Stop drawing when mouse is released
canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.beginPath();
});

// Draw on the canvas
canvas.addEventListener('mousemove', (e) => {
  if (drawing) {
    draw(e);
  }
});

// Start drawing when touch starts
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  saveState(); // Save the state before starting a new drawing
  drawing = true;
  draw(e.touches[0]);
});

// Stop drawing when touch ends
canvas.addEventListener('touchend', () => {
  drawing = false;
  ctx.beginPath();
});

// Draw on the canvas when touch moves
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (drawing) {
    draw(e.touches[0]);
  }
});

// Drawing function
function draw(e) {
  const rect = canvas.getBoundingClientRect(); // Get the canvas's position
  const x = e.clientX - rect.left; // Adjust for canvas position
  const y = e.clientY - rect.top;  // Adjust for canvas position

  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = brushColor;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

// Check if the canvas is empty
function isCanvasDrawn() {
  const empty = document.createElement('canvas');
  empty.width = canvas.width;
  empty.height = canvas.height;
  return canvas.toDataURL() !== empty.toDataURL();
}

// Submit the drawing and message to Discord Webhook
submitButton.addEventListener('click', async () => {
  const imageData = canvas.toDataURL(); // Get canvas data as base64 image
  const message = messageInput.value.trim();

  if (!isCanvasDrawn() && !message) {
    alert('You must draw something or enter a message before submitting!');
    return;
  }

  if (message) {
    await sendMessageToDiscord(message);
    return;
  }

  if (isCanvasDrawn()) {
    await sendDrawingToDiscord(imageData)
    return;
  }
});

// Function to send message to Discord
async function sendMessageToDiscord(message) {
  const webhookUrl = ' https://tuvik-dog.xyz/web-inbox.php?target=aster'; // Replace with your actual Discord webhook URL

  // Create a FormData object for the file and message
  const formData = new FormData();
  formData.append('payload_json', JSON.stringify({ content: message })); // Attach the message

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert('Your message has been submitted!');
    messageInput.value = ''; // Clear the message input
  } catch (error) {
    console.error('Error sending message to Discord:', error);
    alert('Something went wrong. Please try again.');
  }
}

// Function to send drawing to Discord
async function sendDrawingToDiscord(imageData) {
  const webhookUrl = 'https://tuvik-dog.xyz/web-inbox.php?target=aster'; // Replace with your actual Discord webhook URL

  // Convert the base64 data URL to a Blob
  const blob = await fetch(imageData).then((res) => res.blob());

  // Create a FormData object for the file and message
  const formData = new FormData();
  formData.append('file', blob, 'drawing.png'); // Attach the image

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert('Your drawing has been submitted!');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    canvasHistory = []; // Clear history after submission
  } catch (error) {
    console.error('Error sending drawing and message to Discord:', error);
    alert('Something went wrong. Please try again.');
  }
}

// Undo button event listener
undoButton.addEventListener('click', undo);