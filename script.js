// Twoja konfiguracja Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "breadclicker-1019c",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicjalizacja Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let score = 0;

document.getElementById('clicker-button').addEventListener('click', () => {
    score++;
    document.getElementById('score').innerText = score;
});

// Funkcja do przesyłania wyniku
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

// Funkcja do pobierania leaderboardu
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
              entryElement.textContent = `${data.username} - ${data.score} pts`;
              leaderboardElement.appendChild(entryElement);
          });
      })
      .catch((error) => {
          console.error("Błąd: ", error);
      });
}

// Wywołaj fetchLeaderboard po załadowaniu strony
window.onload = fetchLeaderboard;

// Przesyłanie wyniku po podwójnym kliknięciu przycisku
document.getElementById('clicker-button').addEventListener('dblclick', () => {
    const username = prompt("Gratulacje! Podaj swoją nazwę użytkownika:");
    if (username) {
        submitScore(username, score);
        score = 0;
        document.getElementById('score').innerText = score;
    }
});
