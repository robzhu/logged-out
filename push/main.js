const Hidden = "hidden";

window.onload = () => {
  const buttonLogIn = document.getElementById("buttonLogIn");
  const status = document.getElementById("status");
  const loggedOutNotification = document.getElementById(
    "loggedOutNotification"
  );

  buttonLogIn.onclick = async () => {
    buttonLogIn.classList.add(Hidden);
    loggedOutNotification.classList.add(Hidden);
    const userId = "1234";
    await logIn(userId, () => {
      loggedOutNotification.classList.remove(Hidden);
      buttonLogIn.classList.remove(Hidden);
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

  const socket = new WebSocket("ws://localhost:9001");
  socket.addEventListener("open", () => {
    socket.addEventListener("message", ({ data }) => {
      const { event, args } = JSON.parse(data);
      if (event === "sessionInvalidated") {
        //args.sessionId should equal sessionId
        onSessionInvalidated();
      }
    });
    socket.send(
      JSON.stringify({
        action: "subscribeToSessionInvalidation",
        args: {
          sessionId,
        },
      })
    );
  });

  socket.addEventListener("error", (error) => {
    console.error(error);
  });

  return sessionId;
}
