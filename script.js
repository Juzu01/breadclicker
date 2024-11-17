let score = 0;

document.getElementById('clicker-button').addEventListener('click', () => {
    score++;
    document.getElementById('score').innerText = score;
});

// Funkcja do przesyłania wyniku
function submitScore(username, score) {
    fetch('submit_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&score=${encodeURIComponent(score)}`
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        // Opcjonalnie: odśwież leaderboard po zapisaniu wyniku
        fetchLeaderboard();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Funkcja do pobierania leaderboardu
function fetchLeaderboard() {
    fetch('get_leaderboard.php')
    .then(response => response.json())
    .then(data => {
        const leaderboardElement = document.getElementById('leaderboard');
        leaderboardElement.innerHTML = ''; // Czyść poprzednie wyniki

        data.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.textContent = `${index + 1}. ${entry.username} - ${entry.score} pts`;
            leaderboardElement.appendChild(entryElement);
        });
    })
    .catch(error => {
        console.error('Error:', error);
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
