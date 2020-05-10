const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

function getRandomChar() {
  const index = Math.floor(Math.random() * Math.floor(charset.length));
  return charset[index];
}

function generateSessionId() {
  let sessionId = "";
  for (let i = 0; i < 6; i++) {
    sessionId += getRandomChar();
  }
  return sessionId;
}

module.exports = {
  generateSessionId,
};
