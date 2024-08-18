'use strict';

const socket = io('http://localhost:5000', {
  transports: ['websocket'] // Force WebSocket transport
});

const outputYou = document.querySelector('.output-you');
const outputBot = document.querySelector('.output-bot');
const speechBtn = document.querySelector('#speech-btn');
const chatBox = document.querySelector('#chat-box');
const moveableContainer = document.querySelector('.moveable-container');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  console.error('Speech Recognition API not supported in this browser.');
  alert('Sorry, your browser does not support speech recognition. Please try a different browser.');
} else {
  const recognition = new SpeechRecognition();

  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  speechBtn.addEventListener('click', () => {
    moveableContainer.style.transform = 'translateY(-50%)';
    chatBox.classList.remove('hidden');
    chatBox.classList.add('visible');

    recognition.start();
    console.log('Speech recognition started.');
  });

  recognition.addEventListener('speechstart', () => {
    console.log('Speech has been detected.');
  });

  recognition.addEventListener('result', (e) => {
    const last = e.results.length - 1;
    const text = e.results[last][0].transcript;

    const userMessage = document.createElement('div');
    userMessage.textContent = 'You: ' + text;
    outputYou.appendChild(userMessage);

    console.log('Emitted message: ' + text);
    socket.emit('chat message', text);
  });

  recognition.addEventListener('speechend', () => {
    recognition.stop();
    console.log('Speech recognition ended.');
  });

  recognition.addEventListener('error', (e) => {
    console.error('Error occurred in recognition: ' + e.error);
  });

  function synthVoice(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  }

  socket.on('bot reply', function(replyText) {
    console.log('Bot replied: ' + replyText);
    if (replyText === '') replyText = '(No answer...)';

    const botMessage = document.createElement('div');
    botMessage.textContent = 'Juri: ' + replyText;
    outputBot.appendChild(botMessage);

    synthVoice(replyText);
  });

  socket.on('connect', () => {
    console.log('Connected to the server');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error: ', err);
  });

  socket.on('error', (error) => {
    console.error('Socket error: ', error);
  });

  socket.on('disconnect', () => {
    console.warn('Disconnected from the server');
  });
}
