// Twoja konfiguracja Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "breadclicker-1019c.firebaseapp.com",
  projectId: "breadclicker-1019c",
  storageBucket: "breadclicker-1019c.firebasestorage.app",
  messagingSenderId: "497351840391",
  appId: "1:497351840391:web:2977403af6bb0339719e22",
  measurementId: "G-PXS06NYDCM"
};

// Inicjalizacja Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Inicjalizacja zmiennych
let score = 0;
const clickerButton = document.getElementById('clicker-button');
const scoreDisplay = document.getElementById('score');
const leaderboardElement = document.getElementById('leaderboard');
const timerDisplay = document.getElementById('timer');
const leaderboardRefreshInterval = 10 * 60 * 1000; // 10 minut w milisekundach
let timer = 10 * 60; // 10 minut w sekundach

// Funkcja do aktualizacji wyświetlania licznika
function updateScoreDisplay() {
    scoreDisplay.innerText = score;
}

// Funkcja do przesyłania wyniku do Firestore
function submitScore(username, score) {
    if (!username) return;

    db.collection("leaderboard").add({
        username: username,
        score: score,
        date: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Wynik zapisany pomyślnie.");
        fetchLeaderboard();
    })
    .catch((error) => {
        console.error("Błąd przy zapisywaniu wyniku: ", error);
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
      });
}

// Funkcja do obsługi kliknięcia przycisku
function handleClick() {
    score++;
    updateScoreDisplay();
}

// Funkcja do obsługi podwójnego kliknięcia przycisku
function handleDoubleClick() {
    const username = prompt("Gratulacje! Podaj swoją nazwę użytkownika:");
    if (username) {
        submitScore(username, score);
        score = 0;
        updateScoreDisplay();
    }
}

// Funkcja do obsługi animacji kliknięcia
function animateClick() {
    clickerButton.classList.add('active');
    setTimeout(() => {
        clickerButton.classList.remove('active');
    }, 100);
}

// Funkcja do odliczania czasu do następnego odświeżenia leaderboardu
function startTimer() {
    const interval = setInterval(() => {
        timer--;
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerDisplay.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (timer <= 0) {
            fetchLeaderboard();
            timer = 10 * 60; // Resetuj timer do 10 minut
        }
    }, 1000);
}

// Dodanie nasłuchiwaczy zdarzeń
clickerButton.addEventListener('click', () => {
    handleClick();
    animateClick();
});

clickerButton.addEventListener('dblclick', handleDoubleClick);

// Inicjalizacja
updateScoreDisplay();
fetchLeaderboard();
startTimer();
