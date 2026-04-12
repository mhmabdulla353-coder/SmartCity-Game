// =============================================================================
// SmartCity Puzzle Crisis Simulator - script.js
// Unit: CIS046-3 Software For Enterprise
// =============================================================================

// ── THEME: VIRTUAL IDENTITY ──────────────────────────────────────────────────
// Using localStorage and sessionStorage to manage player identity.
// Checks if player is logged in - if not, redirects to login page.
// Reference: MDN Web Docs - Web Storage API
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API

let playerName = localStorage.getItem("playerName");

// If not logged in, redirect back to login page
if (!playerName || localStorage.getItem("authenticated") !== "true") {
    window.location.href = "login.html";
}

// Display player name from localStorage (Virtual Identity)
document.getElementById("playerNameDisplay").innerText = playerName;

// ── Logout Function ───────────────────────────────────────────────────────────
// Clears all stored identity data - destroys virtual identity
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

// =============================================================================
// THEME: EVENT-DRIVEN PROGRAMMING
// All actions in this app are triggered by events:
// onclick, keydown, window.onload, fetch .then(), setInterval
// =============================================================================

// ── Event: Enter key press submits answer ────────────────────────────────────
// Reference: MDN - KeyboardEvent
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
});

// =============================================================================
// THEME: INTEROPERABILITY
// Fetching puzzles from the Banana API (external web service)
// Our JavaScript app communicates with a remote PHP server using HTTP and JSON.
// This shows two different systems working together (interoperability).
// API by Marc Conrad: https://marcconrad.com/uob/banana/api.php
// API Documentation:  https://marcconrad.com/uob/banana/doc.php
// =============================================================================

// ── Load puzzle from Banana API ───────────────────────────────────────────────
function loadPuzzle() {

    document.getElementById("loadingText").innerText = "⏳ Loading puzzle from API...";
    document.getElementById("puzzleImage").style.display = "none";

    // HTTP GET request to external Banana API
    // Response format: { question: <image_url>, solution: <number> }
    fetch("https://marcconrad.com/uob/banana/api.php")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            document.getElementById("puzzleImage").src = data.question;
            document.getElementById("puzzleImage").style.display = "block";
            document.getElementById("loadingText").innerText = "";
            correctAnswer = Number(data.solution);
            console.log("Puzzle loaded from Banana API");
        })
        .catch(function(error) {
            // .catch() handles network errors (event-driven error handling)
            document.getElementById("loadingText").innerText = "❌ Failed to load puzzle. Check connection.";
            console.error("Banana API error:", error);
        });
}

// =============================================================================
// CRISIS MANAGEMENT
// =============================================================================

// ── Start crisis - triggered by button click event ────────────────────────────
function startCrisis(type) {

    currentCrisis = type;

    let crisisLabels = {
        fire:     "🔥 FIRE EMERGENCY",
        flood:    "🌊 FLOOD EMERGENCY",
        accident: "🚗 ACCIDENT EMERGENCY"
    };

    document.getElementById("crisisStatus").innerText = crisisLabels[type];
    document.getElementById("feedbackMsg").innerText = "";

    // Reset game for new crisis
    puzzlesSolved = 0;
    score         = 0;
    progress      = 0;

    document.getElementById("score").innerText = score;
    updateProgress();

    // Load first puzzle from API
    loadPuzzle();
}

// =============================================================================
// ANSWER CHECKING
// =============================================================================

// ── Check answer - triggered by button click or Enter key event ───────────────
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

        // ── Correct answer ────────────────────────────────────────────────
        puzzlesSolved++;
        score += 10;

        document.getElementById("score").innerText = score;
        document.getElementById("feedbackMsg").innerText = "✅ Correct! +10 points";
        document.getElementById("feedbackMsg").style.color = "#22c55e";

        updateProgress();

        // Check if crisis is fully resolved
        if (puzzlesSolved >= 10) {
            document.getElementById("crisisStatus").innerText = "✅ City Safe!";
            document.getElementById("feedbackMsg").innerText = "🎉 Crisis Solved! City is safe!";
            document.getElementById("victorySound").play();
            currentCrisis = null;
            return;
        }

        document.getElementById("answer").value = "";
        document.getElementById("answer").focus();
        loadPuzzle();

    } else {

        // ── Wrong answer ──────────────────────────────────────────────────
        document.getElementById("feedbackMsg").innerText = "❌ Wrong answer! Try again.";
        document.getElementById("feedbackMsg").style.color = "#ef4444";
        document.getElementById("answer").value = "";

    }
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
// WINDOW ONLOAD EVENT
// Automatically triggered when page finishes loading (event-driven)
// =============================================================================

window.onload = function() {
    loadPuzzle();
};