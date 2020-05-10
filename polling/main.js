window.onload = () => {
  const buttonLogIn = document.getElementById("buttonLogIn");
  const buttonCallAPI = document.getElementById("buttonCallAPI");
  const status = document.getElementById("status");
  const loggedOutNotification = document.getElementById(
    "loggedOutNotification"
  );

  buttonLogIn.onclick = async () => {
    buttonLogIn.classList.add("hidden");
    loggedOutNotification.classList.add("hidden");
    const userId = "1234";
    await logIn(userId, () => {
      loggedOutNotification.classList.remove("hidden");
      buttonLogIn.classList.remove("hidden");
      status.textContent = null;
    });
    status.textContent = "Logged In. Now try logging in from a different tab.";
  };
};

// Return a session token
async function logIn(userId, onSessionInvalidated) {
  const response = await fetch("http://localhost:9000/login", {
    headers: {
      user: userId,
    },
  });
  const { sessionId } = await response.json();

  const POLLING_INTERVAL = 200;
  const poll = setInterval(async () => {
    const response = await fetch("http://localhost:9000/api", {
      headers: {
        sessionId,
      },
    });

    if (response.status !== 200) {
      // non-200 status code means the token is invalid
      clearTimeout(poll);
      onSessionInvalidated();
    }
  }, POLLING_INTERVAL);

  return sessionId;
}
