// Get elements from the DOM
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSizeInput = document.getElementById('brushSize');
const brushColorInput = document.getElementById('brushColor');
const messageInput = document.getElementById('message');
const submitDrawingButton = document.getElementById('submitDrawing');
const submitMessageButton = document.getElementById('submitMessage');
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

// Submit the drawing to Discord Webhook
submitDrawingButton.addEventListener('click', async () => {
  const imageData = canvas.toDataURL(); // Get canvas data as base64 image

  if (imageData) {
    await sendDrawingToDiscord(imageData);
  } else {
    alert('Nothing to submit!');
  }
});

// Submit the message to Discord Webhook
submitMessageButton.addEventListener('click', async () => {
  const message = messageInput.value.trim();

  if (message) {
    await sendMessageToDiscord(message);
  } else {
    alert('Message cannot be empty!');
  }
});

// Function to send drawing to Discord
async function sendDrawingToDiscord(imageData) {
  const webhookUrl = 'https://discord.com/api/webhooks/1319231562226602024/RiOrNJwdG2uKpeWWKE3pKFPqDVVkDWA89jOJV9okHEFUBswQig2ZkhZWiziOjzDFPXhU'; // Replace with your actual Discord webhook URL

  // Convert the base64 data URL to a Blob
  const blob = await fetch(imageData).then((res) => res.blob());

  // Create a FormData object for the file
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
    console.error('Error sending drawing to Discord:', error);
    alert('Something went wrong. Please try again.');
  }
}

// Function to send message to Discord
async function sendMessageToDiscord(message) {
  const webhookUrl = 'https://discord.com/api/webhooks/1319231562226602024/RiOrNJwdG2uKpeWWKE3pKFPqDVVkDWA89jOJV9okHEFUBswQig2ZkhZWiziOjzDFPXhU'; // Replace with your actual Discord webhook URL

  const payload = {
    content: message,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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

// Undo button event listener
undoButton.addEventListener('click', undo);