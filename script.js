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
    const recentSubmitsElement = document.getElementById('recent-submits');
    const timerDisplay = document.getElementById('timer');
    const feedbackMessage = document.getElementById('feedback-message');

    const usernameModal = document.getElementById('username-modal');
    const usernameInput = document.getElementById('username-input');
    const usernameSubmit = document.getElementById('username-submit');
    const overlay = document.getElementById('overlay');

    const submitScoreButton = document.getElementById('submit-score-button');

    const dailyLeaderboard = document.getElementById('daily-leaderboard');
    const monthlyLeaderboard = document.getElementById('monthly-leaderboard');
    const yearlyLeaderboard = document.getElementById('yearly-leaderboard');

    const dailyTimer = document.getElementById('daily-timer');
    const monthlyTimer = document.getElementById('monthly-timer');
    const yearlyTimer = document.getElementById('yearly-timer');

    // Funkcja do pokazania modalu z nickname'em
    function showUsernameModal() {
        console.log("Pokazywanie modalu z nickname'em.");
        usernameModal.style.display = 'block';
        overlay.style.display = 'block';
    }

    // Funkcja do ukrycia modalu z nickname'em
    function hideUsernameModal() {
        console.log("Ukrywanie modalu z nickname'em.");
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

        const userDocRef = db.collection("leaderboard").doc(username);

        userDocRef.get().then((doc) => {
            if (doc.exists) {
                // Jeśli dokument istnieje, dodaj do istniejącego wyniku
                const currentScore = doc.data().score || 0;
                userDocRef.update({
                    score: currentScore + score,
                    date: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    console.log("Wynik zaktualizowany pomyślnie.");
                    refreshAllLeaderboards();
                    showFeedback("Wynik został dodany do Twojego ogólnego wyniku!", "submission-success");
                })
                .catch((error) => {
                    console.error("Błąd przy aktualizacji wyniku: ", error);
                    showFeedback("Błąd przy dodawaniu wyniku. Spróbuj ponownie.", "submission-error");
                });
            } else {
                // Jeśli dokument nie istnieje, stwórz nowy
                userDocRef.set({
                    username: username,
                    score: score,
                    date: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    console.log("Wynik zapisany pomyślnie.");
                    refreshAllLeaderboards();
                    showFeedback("Wynik został przesłany!", "submission-success");
                })
                .catch((error) => {
                    console.error("Błąd przy zapisywaniu wyniku: ", error);
                    showFeedback("Błąd przy przesyłaniu wyniku. Spróbuj ponownie.", "submission-error");
                });
            }
        }).catch((error) => {
            console.error("Błąd przy pobieraniu dokumentu: ", error);
            showFeedback("Błąd przy przesyłaniu wyniku. Spróbuj ponownie.", "submission-error");
        });
    }

    // Funkcja do pobierania i wyświetlania ostatnich submitów
    function fetchRecentSubmits() {
        db.collection("leaderboard")
          .orderBy("date", "desc")
          .limit(10)
          .get()
          .then((querySnapshot) => {
              recentSubmitsElement.innerHTML = ''; // Czyści poprzednie wyniki
              const fragment = document.createDocumentFragment();

              querySnapshot.forEach((doc) => {
                  const data = doc.data();
                  const submitElement = document.createElement('div');
                  submitElement.classList.add('submit-entry');
                  const date = data.date ? data.date.toDate().toLocaleString() : 'Nieznany czas';
                  submitElement.textContent = `${data.username} - ${data.score} kliknięć - ${date}`;
                  fragment.appendChild(submitElement);
              });

              recentSubmitsElement.appendChild(fragment);
          })
          .catch((error) => {
              console.error("Błąd przy pobieraniu ostatnich submitów: ", error);
              showFeedback("Błąd przy pobieraniu ostatnich submitów. Spróbuj później.", "submission-error");
          });
    }

    // Funkcja do pobierania i wyświetlania leaderboardu dziennego
    function fetchDailyLeaderboard() {
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date();
        endOfDay.setHours(23,59,59,999);

        db.collection("leaderboard")
          .where("date", ">=", startOfDay)
          .where("date", "<=", endOfDay)
          .orderBy("score", "desc")
          .limit(10)
          .get()
          .then((querySnapshot) => {
              dailyLeaderboard.innerHTML = ''; // Czyści poprzednie wyniki
              const fragment = document.createDocumentFragment();

              querySnapshot.forEach((doc, index) => {
                  const data = doc.data();
                  const entryElement = document.createElement('div');
                  entryElement.classList.add('leaderboard-entry');
                  entryElement.textContent = `${index + 1}. ${data.username} - ${data.score} kliknięć`;
                  fragment.appendChild(entryElement);
              });

              dailyLeaderboard.appendChild(fragment);
          })
          .catch((error) => {
              console.error("Błąd przy pobieraniu leaderboardu dziennego: ", error);
              showFeedback("Błąd przy pobieraniu leaderboardu dziennego. Spróbuj później.", "submission-error");
          });
    }

    // Funkcja do pobierania i wyświetlania leaderboardu miesięcznego
    function fetchMonthlyLeaderboard() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0,0,0,0);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23,59,59,999);

        db.collection("leaderboard")
          .where("date", ">=", startOfMonth)
          .where("date", "<=", endOfMonth)
          .orderBy("score", "desc")
          .limit(10)
          .get()
          .then((querySnapshot) => {
              monthlyLeaderboard.innerHTML = ''; // Czyści poprzednie wyniki
              const fragment = document.createDocumentFragment();

              querySnapshot.forEach((doc, index) => {
                  const data = doc.data();
                  const entryElement = document.createElement('div');
                  entryElement.classList.add('leaderboard-entry');
                  entryElement.textContent = `${index + 1}. ${data.username} - ${data.score} kliknięć`;
                  fragment.appendChild(entryElement);
              });

              monthlyLeaderboard.appendChild(fragment);
          })
          .catch((error) => {
              console.error("Błąd przy pobieraniu leaderboardu miesięcznego: ", error);
              showFeedback("Błąd przy pobieraniu leaderboardu miesięcznego. Spróbuj później.", "submission-error");
          });
    }

    // Funkcja do pobierania i wyświetlania leaderboardu rocznego
    function fetchYearlyLeaderboard() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        startOfYear.setHours(0,0,0,0);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        endOfYear.setHours(23,59,59,999);

        db.collection("leaderboard")
          .where("date", ">=", startOfYear)
          .where("date", "<=", endOfYear)
          .orderBy("score", "desc")
          .limit(10)
          .get()
          .then((querySnapshot) => {
              yearlyLeaderboard.innerHTML = ''; // Czyści poprzednie wyniki
              const fragment = document.createDocumentFragment();

              querySnapshot.forEach((doc, index) => {
                  const data = doc.data();
                  const entryElement = document.createElement('div');
                  entryElement.classList.add('leaderboard-entry');
                  entryElement.textContent = `${index + 1}. ${data.username} - ${data.score} kliknięć`;
                  fragment.appendChild(entryElement);
              });

              yearlyLeaderboard.appendChild(fragment);
          })
          .catch((error) => {
              console.error("Błąd przy pobieraniu leaderboardu rocznego: ", error);
              showFeedback("Błąd przy pobieraniu leaderboardu rocznego. Spróbuj później.", "submission-error");
          });
    }

    // Uniwersalna funkcja do obsługi timerów
    function startTimer(element, targetDate, onComplete) {
        function updateTimer() {
            const now = new Date();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
                element.innerText = "00:00:00";
                if (onComplete) onComplete();
                return;
            }

            let formattedTime = '';

            if (targetDate === endOfDay || targetDate === endOfMonth || targetDate === endOfYear) {
                // Sprawdź, który to timer
                if (element.id === 'daily-timer') {
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                } else if (element.id === 'monthly-timer') {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    formattedTime = `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                } else if (element.id === 'yearly-timer') {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    formattedTime = `${String(days).padStart(3, '0')}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                }
            } else {
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }

            element.innerText = formattedTime;
        }

        updateTimer(); // Initial call to display immediately
        const interval = setInterval(updateTimer, 1000);
    }

    // Funkcja do obsługi pojedynczego kliknięcia
    function handleClick() {
        score++;
        updateScoreDisplay();
    }

    // Funkcja do obsługi przesyłania wyniku
    function handleSubmitScore() {
        if (score === 0) {
            showFeedback("Nie masz żadnych kliknięć do przesłania.", "submission-error");
            return;
        }
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

    // Funkcja do odliczania czasu do odświeżenia głównego leaderboardu
    function startMainTimer() {
        let targetTime = Date.now() + (60 * 1000); // 60 sekund od teraz

        const interval = setInterval(() => {
            const now = Date.now();
            const distance = targetTime - now;

            if (distance < 0) {
                clearInterval(interval);
                refreshAllLeaderboards();
                targetTime = Date.now() + (60 * 1000); // Następne 60 sekund
                startMainTimer();
                return;
            }

            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            timerDisplay.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    // Uniwersalna funkcja do inicjalizacji timerów
    function startLeaderboardTimers() {
        const now = new Date();

        // Leaderboard Dzienny
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        startTimer(dailyTimer, endOfDay, fetchDailyLeaderboard);

        // Leaderboard Miesięczny
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        startTimer(monthlyTimer, endOfMonth, fetchMonthlyLeaderboard);

        // Leaderboard Roczny
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        startTimer(yearlyTimer, endOfYear, fetchYearlyLeaderboard);
    }

    // Funkcja do odświeżania wszystkich leaderboardów
    function refreshAllLeaderboards() {
        fetchRecentSubmits();
        fetchDailyLeaderboard();
        fetchMonthlyLeaderboard();
        fetchYearlyLeaderboard();
    }

    // Funkcja do inicjalizacji aplikacji
    function init() {
        console.log("Inicjalizacja aplikacji.");
        // Zawsze pokazuj modal przy każdej wizycie
        showUsernameModal();
        updateScoreDisplay();
        startMainTimer();
        fetchRecentSubmits();
        fetchDailyLeaderboard();
        fetchMonthlyLeaderboard();
        fetchYearlyLeaderboard();
        startLeaderboardTimers();
        // Ustawienie odświeżania wszystkich leaderboardów co 60 sekund
        setInterval(refreshAllLeaderboards, 60 * 1000);
    }

    // Event listener dla guzika Submit Score
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
        hideUsernameModal();
        fetchRecentSubmits();
        fetchDailyLeaderboard();
        fetchMonthlyLeaderboard();
        fetchYearlyLeaderboard();
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

    init();
});
