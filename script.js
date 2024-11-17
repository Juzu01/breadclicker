// Twoja konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCe2oHIq_UnAJY6ky9RG2aUgoLSeESbf_o",
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

// Obsługa kliknięcia przycisku
document.getElementById('clicker-button').addEventListener('click', () => {
    score++;
    document.getElementById('score').innerText = score;
});

// Funkcja do przesyłania wyniku do Firestore
function submitScore(username, score) {
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
        console.error("Błąd: ", error);
    });
}

// Funkcja do pobierania i wyświetlania leaderboardu
function fetchLeaderboard() {
    db.collection("leaderboard")
      .orderBy("score", "desc")
      .limit(10)
      .get()
      .then((querySnapshot) => {
          const leaderboardElement = document.getElementById('leaderboard');
          leaderboardElement.innerHTML = '';

          querySnapshot.forEach((doc) => {
              const data = doc.data();
              const entryElement = document.createElement('div');
              entryElement.classList.add('leaderboard-entry');
              entryElement.textContent = `${data.username} - ${data.score} pts`;
              leaderboardElement.appendChild(entryElement);
          });
      })
      .catch((error) => {
          console.error("Błąd: ", error);
      });
}

// Pobierz leaderboard po załadowaniu strony
window.onload = fetchLeaderboard;

// Obsługa podwójnego kliknięcia przycisku do przesłania wyniku
document.getElementById('clicker-button').addEventListener('dblclick', () => {
    const username = prompt("Gratulacje! Podaj swoją nazwę użytkownika:");
    if (username) {
        submitScore(username, score);
        score = 0;
        document.getElementById('score').innerText = score;
    }
});
