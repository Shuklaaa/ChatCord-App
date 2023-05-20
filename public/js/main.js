const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from the URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
// console.log(username, room);

const socket = io();

// JOIN CHAT ROOM
socket.emit('joinRoom', {username, room});

// GET ROOM AND USERS
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
})

// MESSAGE FROM SERVER
socket.on('message', message => {
  console.log(message);
  outputMessage(message); 


  // Scroll Down
  chatMessages.scrollTop = chatMessages.scrollHeight;   //this line basically drag us down whenever we send a new message
});

// MESSAGE SUBMIT
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // GET MESSAGE TEXT
  const msg = e.target.elements.msg.value;  //msg because id = msg in chat.html

  // EMIT MESSAGE TO SERVER
  socket.emit('chatMessage',msg);

  // CLEAR INPUTS
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});


// OUTPUT MESSAGE TO DOM
function outputMessage(message) {
  const div = document.createElement('div');

  div.classList.add('message');
  div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;

  document.querySelector('.chat-messages').appendChild(div);
}

// ADD ROOM NAME TO DOM

function outputRoomName(room){
  roomName.innerText = room;
}

// ADD USERS TO DOM

function outputUsers(users){
  userList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}

// LEAVE THE CHAT BY CLICKING ON BUTTON
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = './index.html';
  } else {
  }
});