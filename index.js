const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for testing; adjust for production
    methods: ["GET", "POST"]
  }
});

// Enable CORS
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Function to generate responses like an AI
function getAIResponse(message) {
  const lowerCaseMessage = message.toLowerCase();
  
  if (lowerCaseMessage.includes('hello')) {
    return 'Hello! How can I assist you today?';
  }
  if (lowerCaseMessage.includes('how are you')) {
    return 'I am just a computer program, but thanks for asking!';
  }
  if (lowerCaseMessage.includes('what is your name')) {
    return 'I am Juri, your virtual assistant!';
  }
  if (lowerCaseMessage.includes('tell me a joke')) {
    return 'Why did the scarecrow win an award? Because he was outstanding in his field!';
  }
  return 'I am not sure how to respond to that. Can you please rephrase it?';
}

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    console.log('Message received: ' + msg);
    const reply = getAIResponse(msg);
    console.log('Replying with: ' + reply);
    socket.emit('bot reply', reply);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server on port 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
