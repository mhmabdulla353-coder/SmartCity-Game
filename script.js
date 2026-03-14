let playerName = localStorage.getItem("playerName");

if(!playerName){
window.location.href = "login.html";
}

document.getElementById("playerNameDisplay").innerText = playerName;

// Virtual Identity System
let playerName = localStorage.getItem("playerName");

if(!playerName){
playerName = prompt("Enter your name:");
localStorage.setItem("playerName", playerName);
}

console.log("Player:", playerName);


// Game variables
let puzzlesSolved = 0;
let progress = 0;
let score = 0;
let correctAnswer = null;

function startCrisis(type){

document.getElementById("crisisStatus").innerText =
"Crisis Active: " + type.toUpperCase();

loadPuzzle();

}

function loadPuzzle(){

fetch("https://marcconrad.com/uob/banana/api.php")
.then(response => response.json())
.then(data => {

document.getElementById("puzzleImage").src = data.question;

// convert answer to number safely
correctAnswer = Number(data.solution);

console.log("Correct answer:", correctAnswer);

})
.catch(error => {
console.log("Error loading puzzle:", error);
});

}

function checkAnswer(){

let userAnswer = document.getElementById("answer").value.trim();

if(userAnswer === ""){
alert("Please enter an answer");
return;
}

userAnswer = Number(userAnswer);

console.log("User answer:", userAnswer);

if(userAnswer === correctAnswer){

alert("Correct!");

puzzlesSolved++;

score = score + 10;

document.getElementById("score").innerText = score;

updateProgress();

document.getElementById("answer").value = "";

document.getElementById("answer").focus();

loadPuzzle();

}
else{

alert("Wrong answer");

document.getElementById("answer").value = "";

}

}

function updateProgress(){

progress = puzzlesSolved * 10;

if(progress > 100){
progress = 100;
}

document.getElementById("progressText").innerText = progress + "%";

document.getElementById("progressBar").style.width = progress + "%";

if(puzzlesSolved >= 10){

alert("🎉 Crisis Solved!");

document.getElementById("crisisStatus").innerText = "City Safe";

}

}