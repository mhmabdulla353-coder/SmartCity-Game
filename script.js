// =============================================================================
// SmartCity Puzzle Crisis Simulator - script.js
// Unit: CIS046-3 Software For Enterprise
// =============================================================================

// ── THEME: VIRTUAL IDENTITY ──────────────────────────────────────────────────
// localStorage and sessionStorage manage player identity
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API

let playerName = localStorage.getItem("playerName");

if (!playerName || localStorage.getItem("authenticated") !== "true") {
    window.location.href = "login.html";
}

document.getElementById("playerNameDisplay").innerText = playerName;

function logout() {
    localStorage.removeItem("playerName");
    localStorage.removeItem("authenticated");
    sessionStorage.removeItem("playerPassword");
    window.location.href = "login.html";
}

// =============================================================================
// GAME VARIABLES
// =============================================================================

let puzzlesSolved = 0;
let progress      = 0;
let score         = 0;
let correctAnswer = null;
let currentCrisis = null;
let timeLeft      = 30;
let timerInterval = null;
let totalTime     = 0;

// =============================================================================
// THEME: EVENT-DRIVEN PROGRAMMING
// onclick, keydown, window.onload, fetch .then(), setInterval, setTimeout
// =============================================================================

// Enter key submits answer (keyboard event)
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") { checkAnswer(); }
});

// =============================================================================
// COUNTDOWN TIMER
// setInterval fires every 1000ms - event-driven timer
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/setInterval
// =============================================================================

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    updateTimerDisplay();

    timerInterval = setInterval(function() {
        timeLeft--;
        totalTime++;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById("feedbackMsg").innerText = "⏰ Time's up! Loading next puzzle...";
            document.getElementById("feedbackMsg").style.color = "#f59e0b";
            document.getElementById("answer").value = "";
            setTimeout(function() { loadPuzzle(); }, 1500);
        }
    }, 1000);
}

function updateTimerDisplay() {
    let timerEl = document.getElementById("timerDisplay");
    if (!timerEl) return;
    timerEl.innerText = timeLeft + "s";
    if (timeLeft > 15)     timerEl.style.color = "#22c55e";
    else if (timeLeft > 8) timerEl.style.color = "#f59e0b";
    else                   timerEl.style.color = "#ef4444";
}

function stopTimer() { clearInterval(timerInterval); }

// =============================================================================
// THEME: INTEROPERABILITY
// Banana API by Marc Conrad - external PHP server
// JS frontend + PHP backend communicate via HTTP GET and JSON
// API:  https://marcconrad.com/uob/banana/api.php
// Docs: https://marcconrad.com/uob/banana/doc.php
// =============================================================================

function loadPuzzle() {
    document.getElementById("loadingText").innerText = "⏳ Loading puzzle from API...";
    document.getElementById("puzzleImage").style.display = "none";
    document.getElementById("feedbackMsg").innerText = "";

    fetch("https://marcconrad.com/uob/banana/api.php")
        .then(function(response) { return response.json(); })
        .then(function(data) {
            document.getElementById("puzzleImage").src = data.question;
            document.getElementById("puzzleImage").style.display = "block";
            document.getElementById("loadingText").innerText = "";
            correctAnswer = Number(data.solution);
            startTimer();
        })
        .catch(function(error) {
            document.getElementById("loadingText").innerText = "❌ Failed to load puzzle. Check connection.";
            console.error("Banana API error:", error);
        });
}

// =============================================================================
// CRISIS MANAGEMENT
// =============================================================================

function startCrisis(type) {
    currentCrisis = type;
    totalTime     = 0;

    let crisisLabels = {
        fire:     "🔥 FIRE EMERGENCY",
        flood:    "🌊 FLOOD EMERGENCY",
        accident: "🚗 ACCIDENT EMERGENCY"
    };

    document.getElementById("crisisStatus").innerText = crisisLabels[type];
    document.getElementById("feedbackMsg").innerText = "";

    puzzlesSolved = 0;
    score         = 0;
    progress      = 0;

    document.getElementById("score").innerText = score;
    updateProgress();
    loadPuzzle();
}

// =============================================================================
// ANSWER CHECKING
// =============================================================================

function checkAnswer() {

    if (!currentCrisis) {
        alert("⚠️ Please select a crisis type first!");
        return;
    }

    let userAnswer = document.getElementById("answer").value.trim();

    if (userAnswer === "") {
        document.getElementById("feedbackMsg").innerText = "⚠️ Please enter an answer!";
        document.getElementById("feedbackMsg").style.color = "#f59e0b";
        return;
    }

    userAnswer = Number(userAnswer);

    if (userAnswer === correctAnswer) {
        stopTimer();
        puzzlesSolved++;
        score += 10;

        // Bonus points for fast answers
        if (timeLeft >= 20)      score += 5;
        else if (timeLeft >= 10) score += 2;

        document.getElementById("score").innerText = score;
        document.getElementById("feedbackMsg").innerText = "✅ Correct! +10 points";
        document.getElementById("feedbackMsg").style.color = "#22c55e";

        updateProgress();

        if (puzzlesSolved >= 10) {
            stopTimer();
            document.getElementById("crisisStatus").innerText = "✅ City Safe!";
            document.getElementById("feedbackMsg").innerText = "🎉 Crisis Solved! City is safe!";
            document.getElementById("victorySound").play();
            saveScore(score, totalTime);
            currentCrisis = null;
            return;
        }

        document.getElementById("answer").value = "";
        document.getElementById("answer").focus();
        loadPuzzle();

    } else {
        document.getElementById("feedbackMsg").innerText = "❌ Wrong answer! Try again.";
        document.getElementById("feedbackMsg").style.color = "#ef4444";
        document.getElementById("answer").value = "";
    }
}

// =============================================================================
// LEADERBOARD - Save score to localStorage
// =============================================================================

function saveScore(finalScore, timeTaken) {
    let scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");

    scores.push({
        name:  playerName,
        score: finalScore,
        time:  timeTaken,
        date:  new Date().toLocaleDateString()
    });

    scores.sort(function(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.time - b.time;
    });

    scores = scores.slice(0, 10);
    localStorage.setItem("leaderboard", JSON.stringify(scores));

    setTimeout(function() {
        let view = confirm("🏆 Score saved! View leaderboard now?");
        if (view) window.location.href = "leaderboard.html";
    }, 2000);
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function updateProgress() {
    progress = puzzlesSolved * 10;
    if (progress > 100) progress = 100;
    document.getElementById("progressText").innerText = progress + "%";
    document.getElementById("progressBar").style.width = progress + "%";
}

// =============================================================================
// WINDOW ONLOAD EVENT (event-driven)
// =============================================================================

window.onload = function() { loadPuzzle(); };