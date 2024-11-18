document.addEventListener('DOMContentLoaded', () => {
    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "breadclicker-1019c.firebaseapp.com",
        projectId: "breadclicker-1019c",
        storageBucket: "breadclicker-1019c.appspot.com",
        messagingSenderId: "497351840391",
        appId: "1:497351840391:web:2977403af6bb0339719e22",
        measurementId: "G-PXS06NYDCM"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Initialize variables
    let score = 0;
    let username = '';
    let clickTimestamps = []; // Array to store click timestamps
    const clickLimit = 14; // Maximum number of clicks in 1 second
    const clickWindow = 1000; // Time window in milliseconds (1 second)
    const localTimerDuration = 60; // Time in seconds to submit the score

    const clickerButton = document.getElementById('clicker-button');
    const scoreDisplay = document.getElementById('score');
    const totalLeaderboardElement = document.getElementById('total-leaderboard');
    const localTimerDisplay = document.getElementById('local-timer');
    const submitScoreButton = document.getElementById('submit-score-button');
    const feedbackMessage = document.getElementById('feedback-message');

    // Admin Panel Elements
    const adminPanelButton = document.getElementById('admin-panel-button');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminUsernameInput = document.getElementById('admin-username');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminLoginSubmit = document.getElementById('admin-login-submit');
    const adminLoginCancel = document.getElementById('admin-login-cancel');
    const adminLoginFeedback = document.getElementById('admin-login-feedback');
    const adminPanelModal = document.getElementById('admin-panel-modal');
    const resetLeaderboardButton = document.getElementById('reset-leaderboard-button');
    const adminPanelClose = document.getElementById('admin-panel-close');
    const adminPanelFeedback = document.getElementById('admin-panel-feedback');

    const usernameModal = document.getElementById('username-modal');
    const usernameInput = document.getElementById('username-input');
    const usernameSubmit = document.getElementById('username-submit');
    const overlay = document.getElementById('overlay');

    // Admin Credentials (Hardcoded - Not Secure!)
    const ADMIN_CREDENTIALS = {
        username: "JuzuToSzef",
        password: "kL110L010__"
    };

    // Function to show the username modal with animation
    function showUsernameModal() {
        console.log("Showing username modal.");
        usernameModal.style.display = 'block';
        usernameModal.classList.remove('animate__fadeOut');
        usernameModal.classList.add('animate__fadeIn');
        overlay.style.display = 'block';
    }

    // Function to hide the username modal with animation
    function hideUsernameModal() {
        console.log("Hiding username modal.");
        usernameModal.classList.remove('animate__fadeIn');
        usernameModal.classList.add('animate__fadeOut');
        setTimeout(() => {
            usernameModal.style.display = 'none';
            overlay.style.display = 'none';
        }, 500); // Duration of the animation
    }

    // Function to update the score display
    function updateScoreDisplay() {
        scoreDisplay.innerText = score;
    }

    // Function to display feedback messages
    function showFeedback(message, className, feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = className;
        setTimeout(() => {
            feedbackElement.textContent = '';
            feedbackElement.className = '';
        }, 5000); // Message disappears after 5 seconds
    }

    // Function to submit the score to Firestore
    function submitScore(username, score) {
        if (!username) return;

        const userDocRef = db.collection("leaderboard").doc(username);

        userDocRef.get().then((doc) => {
            if (doc.exists) {
                // If the document exists, add to the existing score
                const currentScore = doc.data().score || 0;
                userDocRef.update({
                    score: currentScore + score,
                    date: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    console.log("Score successfully updated.");
                    refreshTotalLeaderboard();
                    showFeedback("Your score has been added to your total score!", "submission-success", feedbackMessage);
                })
                .catch((error) => {
                    console.error("Error updating score: ", error);
                    showFeedback("Error adding your score. Please try again.", "submission-error", feedbackMessage);
                });
            } else {
                // If the document does not exist, create a new one
                userDocRef.set({
                    username: username,
                    score: score,
                    date: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    console.log("Score successfully saved.");
                    refreshTotalLeaderboard();
                    showFeedback("Your score has been submitted!", "submission-success", feedbackMessage);
                })
                .catch((error) => {
                    console.error("Error saving score: ", error);
                    showFeedback("Error submitting your score. Please try again.", "submission-error", feedbackMessage);
                });
            }
        }).catch((error) => {
            console.error("Error fetching document: ", error);
            showFeedback("Error submitting your score. Please try again.", "submission-error", feedbackMessage);
        });
    }

    // Function to fetch and display the total leaderboard
    function fetchTotalLeaderboard() {
        db.collection("leaderboard")
          .orderBy("score", "desc")
          .limit(10)
          .get()
          .then((querySnapshot) => {
              totalLeaderboardElement.innerHTML = ''; // Clear previous results
              const fragment = document.createDocumentFragment();

              querySnapshot.forEach((doc, index) => {
                  const data = doc.data();
                  const entryElement = document.createElement('div');
                  entryElement.classList.add('leaderboard-entry');
                  entryElement.textContent = `${index + 1}. ${data.username} - ${data.score} Clicks`;
                  fragment.appendChild(entryElement);
              });

              totalLeaderboardElement.appendChild(fragment);
          })
          .catch((error) => {
              console.error("Error fetching total leaderboard: ", error);
              showFeedback("Error fetching leaderboard. Please try again later.", "submission-error", feedbackMessage);
          });
    }

    // Function to start the local timer for submitting the score
    function startLocalTimer(duration, display, onComplete) {
        let timer = duration;
        display.innerText = timer;

        const interval = setInterval(() => {
            timer--;
            display.innerText = timer;

            if (timer <= 0) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 1000);
    }

    // Function to handle a single click
    function handleClick() {
        score++;
        updateScoreDisplay();
    }

    // Function to handle submitting the score
    function handleSubmitScore() {
        if (score === 0) {
            showFeedback("You have no clicks to submit.", "submission-error", feedbackMessage);
            return;
        }
        submitScore(username, score);
        score = 0;
        updateScoreDisplay();
        submitScoreButton.disabled = true;
        // Start a new session
        startNewSession();
    }

    // Function to handle click animation
    function animateClick() {
        clickerButton.classList.add('active');
        setTimeout(() => {
            clickerButton.classList.remove('active');
        }, 200); // Animation duration
    }

    // Function to refresh the total leaderboard
    function refreshTotalLeaderboard() {
        fetchTotalLeaderboard();
    }

    // Function to initialize the application
    function init() {
        console.log("Initializing application.");
        // Always show the nickname modal on each visit
        showUsernameModal();
        updateScoreDisplay();
        fetchTotalLeaderboard();
        // Set leaderboard to refresh every 60 seconds
        setInterval(refreshTotalLeaderboard, 60 * 1000);
    }

    // Function to start a new game session
    function startNewSession() {
        score = 0;
        updateScoreDisplay();
        submitScoreButton.disabled = true;
        startLocalTimer(localTimerDuration, localTimerDisplay, () => {
            submitScoreButton.disabled = false;
            showFeedback("You can now submit your score!", "submission-info", feedbackMessage);
        });
    }

    // Function to check if the user can click (limit to 14 clicks per second)
    function canClick() {
        const now = Date.now();
        // Remove clicks older than 1 second
        clickTimestamps = clickTimestamps.filter(timestamp => now - timestamp < clickWindow);
        if (clickTimestamps.length < clickLimit) {
            clickTimestamps.push(now);
            return true;
        }
        return false;
    }

    // Event listener for the Submit Score button
    submitScoreButton.addEventListener('click', () => {
        handleSubmitScore();
    });

    // Event listener for entering the username
    usernameSubmit.addEventListener('click', () => {
        const enteredUsername = usernameInput.value.trim();
        if (enteredUsername === '') {
            alert("Nickname cannot be empty.");
            return;
        }
        username = enteredUsername;
        hideUsernameModal();
        fetchTotalLeaderboard();
        startNewSession();
    });

    // Event listener to allow submitting the username by pressing Enter
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            usernameSubmit.click();
        }
    });

    // Event listener for the clicker button with click rate limiting
    clickerButton.addEventListener('click', () => {
        // Check if the user can click (hasn't exceeded the limit)
        if (canClick()) {
            if (submitScoreButton.disabled === false) {
                // If the Submit button is active, it means the session has ended and is waiting for score submission
                showFeedback("Click 'Submit Score' to submit your score.", "submission-info", feedbackMessage);
                return;
            }

            handleClick();
            animateClick();
        } else {
            // Click rate limit exceeded
            showFeedback("Too many clicks! Please try again later.", "submission-error", feedbackMessage);
        }
    });

    init();
});
