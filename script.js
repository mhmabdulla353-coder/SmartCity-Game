// Player identity
let playerName = localStorage.getItem("playerName");

if (!playerName) {
    window.location.href = "login.html";
}

document.getElementById("playerNameDisplay").innerText = playerName;

// Game variables
let puzzlesSolved = 0;
let progress = 0;
let score = 0;
let correctAnswer = null;

// Start crisis
function startCrisis(type) {
    document.getElementById("crisisStatus").innerText =
        "Crisis Active: " + type.toUpperCase();

    loadPuzzle();
}

// Load puzzle from API
function loadPuzzle() {
    fetch("https://marcconrad.com/uob/banana/api.php")
        .then(response => response.json())
        .then(data => {
            document.getElementById("puzzleImage").src = data.question;
            correctAnswer = Number(data.solution);
            console.log("Correct answer:", correctAnswer);
        })
        .catch(error => {
            console.log("Error loading puzzle:", error);
        });
}

// Check answer
function checkAnswer() {

    let userAnswer = document.getElementById("answer").value.trim();

    if (userAnswer === "") {
        alert("Please enter an answer");
        return;
    }

    userAnswer = Number(userAnswer);

    if (userAnswer === correctAnswer) {

        alert("Correct!");

        puzzlesSolved++;
        score += 10;

        document.getElementById("score").innerText = score;

        updateProgress();

        // 🎯 Victory check (CORRECT PLACE)
        if (puzzlesSolved >= 10) {

            alert("🎉 Crisis Solved!");
            document.getElementById("crisisStatus").innerText = "City Safe";

            // 🔊 Play sound
            document.getElementById("victorySound").play();
        }

        document.getElementById("answer").value = "";
        document.getElementById("answer").focus();

        loadPuzzle();

    } else {

        alert("Wrong answer");
        document.getElementById("answer").value = "";

    }
}

// Update progress
function updateProgress() {

    progress = puzzlesSolved * 10;

    if (progress > 100) {
        progress = 100;
    }

    document.getElementById("progressText").innerText = progress + "%";
    document.getElementById("progressBar").style.width = progress + "%";

}

// Load first puzzle automatically
window.onload = function () {
    loadPuzzle();
};