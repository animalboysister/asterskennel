const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSizeInput = document.getElementById('brushSize');
const colorPicker = document.getElementById('colorPicker');
const submitButton = document.getElementById('submitDrawing');
const messageInput = document.getElementById('anonymousMessage');

let drawing = false;
let brushSize = brushSizeInput.value;
let brushColor = colorPicker.value;

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mousemove', draw);

brushSizeInput.addEventListener('input', () => brushSize = brushSizeInput.value);
colorPicker.addEventListener('input', () => brushColor = colorPicker.value);

function draw(event) {
    if (!drawing) return;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = brushColor;

    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
}

submitButton.addEventListener('click', submitDrawing);

function submitDrawing() {
    const imageData = canvas.toDataURL();
    const message = messageInput.value;

    // Send data to backend
    sendDataToSheet(imageData, message);
}

function sendDataToSheet(imageData, message) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbw2sGrChdXFUwM2Rfy4Q41LLV3Po-gEXvwqt1UXSiqO591flciGUkGGnr8xjEnCJhMK/exec';
    const payload = { image: imageData, message };

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(payload),  // Send data as JSON
        headers: {
            'Content-Type': 'application/json'  // Set the correct content-type
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Submission successful!');
        } else {
            alert('Error: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit data. Check the console for details.');
    });
}
