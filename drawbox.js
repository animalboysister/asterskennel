// Get elements from the DOM
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSizeInput = document.getElementById('brushSize');
const brushColorInput = document.getElementById('brushColor');
const messageInput = document.getElementById('message');
const submitButton = document.getElementById('submitDrawing');

// Set initial drawing settings
let drawing = false;
let brushSize = brushSizeInput.value;
let brushColor = brushColorInput.value;

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

// Submit the drawing to Discord Webhook
submitButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  const imageData = canvas.toDataURL(); // Get canvas data as base64 image

  if (message || imageData) {
    sendToDiscord(message, imageData);
  }
});

async function sendToDiscord(message, imageData) {
  const webhookUrl = 'https://discord.com/api/webhooks/1319231562226602024/RiOrNJwdG2uKpeWWKE3pKFPqDVVkDWA89jOJV9okHEFUBswQig2ZkhZWiziOjzDFPXhU'; // Replace with your actual Discord webhook URL

  // Convert the base64 data URL to a Blob
  const blob = await fetch(imageData).then((res) => res.blob());

  // Create a FormData object for the file and message
  const formData = new FormData();
  formData.append('file', blob, 'drawing.png'); // Attach the image
  formData.append(
    'payload_json',
    JSON.stringify({ content: message || "Anonymous submission" })
  );

  try {
    // Send POST request to Discord
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData, // Use the FormData object
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert('Your drawing has been submitted!');
    messageInput.value = ''; // Clear the message input
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  } catch (error) {
    console.error('Error sending data to Discord:', error);
    alert('Something went wrong. Please try again.');
  }
}