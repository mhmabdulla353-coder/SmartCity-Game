// =============================================================================
// SmartCity Puzzle Crisis Simulator - script.js (FINAL FIXED VERSION)
// =============================================================================

// ── VIRTUAL IDENTITY ─────────────────────────────────────────────────────────
let playerName = localStorage.getItem("playerName");

// Redirect if not logged in
if (!playerName || localStorage.getItem("authenticated") !== "true") {
    window.location.href = "login.html";
}

// ── GAME VARIABLES ───────────────────────────────────────────────────────────
let puzzlesSolved = 0;
let progress = 0;
let score = 0;
let correctAnswer = null;
let currentCrisis = null;
let timeLeft = 30;
let timerInterval = null;
let totalTime = 0;

// ── PAGE LOAD ────────────────────────────────────────────────────────────────
window.onload = function () {

    // Safe DOM loading
    let nameEl = document.getElementById("playerNameDisplay");
    let loadEl = document.getElementById("loadingText");

    if (nameEl) nameEl.innerText = playerName;
    if (loadEl) loadEl.innerText = "👆 Select a crisis above to begin!";
};

// ── LOGOUT ───────────────────────────────────────────────────────────────────
function logout() {
    localStorage.removeItem("playerName");
    localStorage.removeItem("authenticated");
    sessionStorage.removeItem("playerPassword");
    window.location.href = "login.html";
}

// ── ENTER KEY EVENT ──────────────────────────────────────────────────────────
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
});

// ── TIMER ────────────────────────────────────────────────────────────────────
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    updateTimerDisplay();

    timerInterval = setInterval(function () {
        timeLeft--;
        totalTime++;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);

            let feedback = document.getElementById("feedbackMsg");
            if (feedback) {
                feedback.innerText = "⏰ Time's up! Loading next puzzle...";
                feedback.style.color = "#f59e0b";
            }

            document.getElementById("answer").value = "";

            setTimeout(loadPuzzle, 1500);
        }

    }, 1000);
}

function updateTimerDisplay() {
    let timerEl = document.getElementById("timerDisplay");
    if (!timerEl) return;

    timerEl.innerText = timeLeft + "s";

    if (timeLeft > 15) timerEl.style.color = "#22c55e";
    else if (timeLeft > 8) timerEl.style.color = "#f59e0b";
    else timerEl.style.color = "#ef4444";
}

function stopTimer() {
    clearInterval(timerInterval);
}

// ── BANANA API (PUZZLE) ──────────────────────────────────────────────────────
function loadPuzzle() {

    let loadEl = document.getElementById("loadingText");
    let img = document.getElementById("puzzleImage");

    if (loadEl) loadEl.innerText = "⏳ Loading puzzle...";
    if (img) img.style.display = "none";

    document.getElementById("feedbackMsg").innerText = "";

    let jokeCard = document.getElementById("jokeCard");
    if (jokeCard) jokeCard.style.display = "none";

    fetch("https://marcconrad.com/uob/banana/api.php")
        .then(res => res.json())
        .then(data => {

            if (img) {
                img.src = data.question;
                img.style.display = "block";
            }

            if (loadEl) loadEl.innerText = "";

            correctAnswer = Number(data.solution);
            startTimer();
        })
        .catch(() => {
            if (loadEl) loadEl.innerText = "❌ Failed to load puzzle.";
        });
}

// ── JOKE API (FIXED) ─────────────────────────────────────────────────────────
function fetchJoke() {

    let setupEl = document.getElementById("jokeSetup");
    let punchEl = document.getElementById("jokePunchline");

    if (!setupEl || !punchEl) {
        console.error("Joke elements missing!");
        return;
    }

    setupEl.innerText = "⏳ Loading joke...";
    punchEl.innerText = "Please wait...";

    fetch("https://official-joke-api.appspot.com/random_joke")
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(data => {
            setupEl.innerText = data.setup;
            punchEl.innerText = "😄 " + data.punchline;
        })
        .catch(() => {

            let jokes = [
                {
                    setup: "Why do programmers prefer dark mode?",
                    punchline: "Because light attracts bugs! 🐛"
                },
                {
                    setup: "Why did the SmartCity player win?",
                    punchline: "Because they saved the city! 🏙"
                }
            ];

            let j = jokes[Math.floor(Math.random() * jokes.length)];

            setupEl.innerText = j.setup;
            punchEl.innerText = "😄 " + j.punchline;
        });
}

// ── START CRISIS ─────────────────────────────────────────────────────────────
function startCrisis(type) {

    currentCrisis = type;
    totalTime = 0;

    document.getElementById("crisisStatus").innerText =
        "🚨 " + type.toUpperCase() + " EMERGENCY";

    puzzlesSolved = 0;
    score = 0;
    progress = 0;

    document.getElementById("score").innerText = score;

    updateProgress();
    loadPuzzle();
}

// ── CHECK ANSWER ─────────────────────────────────────────────────────────────
function checkAnswer() {

    if (!currentCrisis) {
        alert("Select a crisis first!");
        return;
    }

    let input = document.getElementById("answer");
    let feedback = document.getElementById("feedbackMsg");

    let userAnswer = input.value.trim();
    if (userAnswer === "") return;

    userAnswer = Number(userAnswer);

    if (userAnswer === correctAnswer) {

        stopTimer();

        puzzlesSolved++;
        score += 10;

        document.getElementById("score").innerText = score;

        if (feedback) {
            feedback.innerText = "✅ Correct!";
            feedback.style.color = "#22c55e";
        }

        updateProgress();

        if (puzzlesSolved >= 10) {

            document.getElementById("crisisStatus").innerText = "✅ City Safe!";
            if (feedback) feedback.innerText = "🎉 Crisis Solved!";

            // 🔊 SOUND
            let sound = document.getElementById("victorySound");
            if (sound) sound.play();

            // 😂 SHOW JOKE
            let jokeCard = document.getElementById("jokeCard");
            if (jokeCard) jokeCard.style.display = "block";

            fetchJoke();

            currentCrisis = null;
            return;
        }

        input.value = "";
        loadPuzzle();

    } else {
        if (feedback) {
            feedback.innerText = "❌ Wrong answer!";
            feedback.style.color = "#ef4444";
        }
        input.value = "";
    }
}

// ── PROGRESS BAR ─────────────────────────────────────────────────────────────
function updateProgress() {
    progress = puzzlesSolved * 10;
    if (progress > 100) progress = 100;

    let text = document.getElementById("progressText");
    let bar = document.getElementById("progressBar");

    if (text) text.innerText = progress + "%";
    if (bar) bar.style.width = progress + "%";
}