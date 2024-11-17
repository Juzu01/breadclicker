// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "breadclicker-1019c.firebaseapp.com",
  projectId: "breadclicker-1019c",
  storageBucket: "breadclicker-1019c.firebasestorage.app",
  messagingSenderId: "497351840391",
  appId: "1:497351840391:web:2977403af6bb0339719e22",
  measurementId: "G-PXS06NYDCM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Initialize variables
let score = 0;
const clickerButton = document.getElementById('clicker-button');
const scoreDisplay = document.getElementById('score');
const leaderboardElement = document.getElementById('leaderboard');
const timerDisplay = document.getElementById('timer');
const leaderboardRefreshInterval = 10 * 60 * 1000; // 10 minutes in milliseconds
let timer = 10 * 60; // 10 minutes in seconds

// Function to update the score display
function updateScoreDisplay() {
    scoreDisplay.innerText = score;
}

// Function to submit the score to Firestore
function submitScore(username, score) {
    if (!username) return;

    db.collection("leaderboard").add({
        username: username,
        score: score,
        date: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Score successfully saved.");
        fetchLeaderboard();
    })
    .catch((error) => {
        console.error("Error saving score: ", error);
    });
}

// Function to fetch and display the leaderboard
function fetchLeaderboard() {
    db.collection("leaderboard")
      .orderBy("score", "desc")
      .limit(10)
      .get()
      .then((querySnapshot) => {
          leaderboardElement.innerHTML = ''; // Clear previous results

          querySnapshot.forEach((doc, index) => {
              const data = doc.data();
              const entryElement = document.createElement('div');
              entryElement.classList.add('leaderboard-entry');
              entryElement.textContent = `${index + 1}. ${data.username} - ${data.score} clicks`;
              leaderboardElement.appendChild(entryElement);
          });
      })
      .catch((error) => {
          console.error("Error fetching leaderboard: ", error);
      });
}

// Function to handle single click
function handleClick() {
    score++;
    updateScoreDisplay();
}

// Function to handle double click
function handleDoubleClick() {
    const username = prompt("Congratulations! Enter your username:");
    if (username) {
        submitScore(username, score);
        score = 0;
        updateScoreDisplay();
    }
}

// Function to handle click animation
function animateClick() {
    clickerButton.classList.add('active');
    setTimeout(() => {
        clickerButton.classList.remove('active');
    }, 100);
}

// Function to start the timer
function startTimer() {
    const interval = setInterval(() => {
        timer--;
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerDisplay.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (timer <= 0) {
            fetchLeaderboard();
            timer = 10 * 60; // Reset timer to 10 minutes
        }
    }, 1000);
}

// Add event listeners
clickerButton.addEventListener('click', () => {
    handleClick();
    animateClick();
});

clickerButton.addEventListener('dblclick', handleDoubleClick);

// Initialize
updateScoreDisplay();
fetchLeaderboard();
startTimer();
