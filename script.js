let score = 0;

document.getElementById('clicker-button').addEventListener('click', () => {
    score++;
    document.getElementById('score').innerText = score;
});
