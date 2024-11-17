document.addEventListener('DOMContentLoaded', () => {
    // Konfiguracja Firebase
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "breadclicker-1019c.firebaseapp.com",
        projectId: "breadclicker-1019c",
        storageBucket: "breadclicker-1019c.appspot.com",
        messagingSenderId: "497351840391",
        appId: "1:497351840391:web:2977403af6bb0339719e22",
        measurementId: "G-PXS06NYDCM"
    };

    // Inicjalizacja Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Inicjalizacja zmiennych
    let score = 0;
    let username = '';
    let clickTimeout = null;
    const doubleClickThreshold = 300; // milisekundy

    const clickerButton = document.getElementById('clicker-button');
    const scoreDisplay = document.getElementById('score');
    const leaderboardElement = document.getElementById('leaderboard');
    const timerDisplay = document.getElementById('timer');
    const feedbackMessage = document.getElementById('feedback-message');

    const usernameModal = document.getElementById('username-modal');
    const usernameInput = document.getElementById('username-input');
    const usernameSubmit = document.getElementById('username-submit');
    const overlay = document.getElementById('overlay');

    const submitScoreButton = document.getElementById('submit-score-button');

    const leaderboardRefreshInterval = 10 * 60 * 1000; // 10 minut w milisekundach
    let timer = 10 * 60; // 10 minut w sekundach

    // Funkcja do pokazania modalu z nickname'em
    function showUsernameModal() {
        usernameModal.style.display = 'block';
        overlay.style.display = 'block';
    }

    // Funkcja do ukrycia modalu z nickname'em
    function hideUsernameModal() {
        usernameModal.style.display = 'none';
        overlay.style.display = 'none';
    }

    // Funkcja do aktualizacji wyświetlania liczby kliknięć
    function updateScoreDisplay() {
        scoreDisplay.innerText = score;
    }

    // Funkcja do wyświetlania komunikatów zwrotnych
    function showFeedback(message, className) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = className;
        setTimeout(() => {
            feedbackMessage.textContent = '';
            feedbackMessage.className = '';
        }, 5000); // Komunikat znika po 5 sekundach
    }

    // Funkcja do przesyłania wyniku do Firestore
    function submitScore(username, score) {
        if (!username) return;

        db.collection("leaderboard").doc(username).set({
            username: username,
            score: score,
            date: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then(() => {
            console.log("Wynik zapisany pomyślnie.");
            fetchLeaderboard();
            showFeedback("Wynik został przesłany!", "submission-success");
        })
        .catch((error) => {
            console.error("Błąd przy zapisywaniu wyniku: ", error);
            showFeedback("Błąd przy przesyłaniu wyniku. Spróbuj ponownie.", "submission-error");
        });
    }

    // Funkcja do pobierania i wyświetlania leaderboardu
    function fetchLeaderboard() {
        db.collection("leaderboard")
          .orderBy("score", "desc")
          .limit(10)
          .get()
          .then((querySnapshot) => {
              leaderboardElement.innerHTML = ''; // Czyści poprzednie wyniki

              querySnapshot.forEach((doc, index) => {
                  const data = doc.data();
                  const entryElement = document.createElement('div');
                  entryElement.classList.add('leaderboard-entry');
                  entryElement.textContent = `${index + 1}. ${data.username} - ${data.score} kliknięć`;
                  leaderboardElement.appendChild(entryElement);
              });
          })
          .catch((error) => {
              console.error("Błąd przy pobieraniu leaderboardu: ", error);
              showFeedback("Błąd przy pobieraniu leaderboardu. Spróbuj później.", "submission-error");
          });
    }

    // Funkcja do obsługi pojedynczego kliknięcia
    function handleClick() {
        score++;
        updateScoreDisplay();
    }

    // Funkcja do obsługi przesyłania wyniku
    function handleSubmitScore() {
        submitScore(username, score);
        score = 0;
        updateScoreDisplay();
    }

    // Funkcja do obsługi animacji kliknięcia
    function animateClick() {
        clickerButton.classList.add('active');
        setTimeout(() => {
            clickerButton.classList.remove('active');
        }, 200); // Czas trwania animacji
    }

    // Funkcja do startu timera
    function startTimer() {
        const interval = setInterval(() => {
            timer--;
            const minutes = Math.floor(timer / 60);
            const seconds = timer % 60;
            timerDisplay.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            if (timer <= 0) {
                fetchLeaderboard();
                timer = 10 * 60; // Reset timera do 10 minut
            }
        }, 1000);
    }

    // Event listener dla submit score button
    submitScoreButton.addEventListener('click', () => {
        handleSubmitScore();
    });

    // Event listener dla wprowadzenia nickname'u
    usernameSubmit.addEventListener('click', () => {
        const enteredUsername = usernameInput.value.trim();
        if (enteredUsername === '') {
            alert("Nickname nie może być pusty.");
            return;
        }
        username = enteredUsername;
        localStorage.setItem('breadClickerUsername', username);
        hideUsernameModal();
        fetchLeaderboard();
    });

    // Event listener umożliwiający zatwierdzenie nickname'u klawiszem Enter
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            usernameSubmit.click();
        }
    });

    // Event listener dla przycisku klikającego z własną logiką obsługi kliknięć
    clickerButton.addEventListener('click', () => {
        if (clickTimeout !== null) {
            // Jeśli timeout jest aktywny, to znaczy, że wykryto podwójne kliknięcie
            clearTimeout(clickTimeout);
            clickTimeout = null;
            // Możesz dodać tutaj dodatkowe akcje na podwójne kliknięcie, jeśli potrzebujesz
        } else {
            // Ustawienie timeoutu, aby odróżnić pojedyncze kliknięcie od podwójnego
            clickTimeout = setTimeout(() => {
                handleClick();
                animateClick();
                clickTimeout = null;
            }, doubleClickThreshold);
        }
    });

    // Inicjalizacja aplikacji
    function init() {
        // Sprawdzenie, czy nickname jest już zapisany w localStorage
        const storedUsername = localStorage.getItem('breadClickerUsername');
        if (storedUsername) {
            username = storedUsername;
            hideUsernameModal();
            fetchLeaderboard();
        } else {
            showUsernameModal();
        }
        updateScoreDisplay();
        startTimer();
    }

    init();
});
