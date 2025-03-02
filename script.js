const gameContainer = document.getElementById("game-container");
const startButton = document.getElementById("start-button");
const optionsButton = document.getElementById("options-button");
const menuButtons = document.getElementById("menu-buttons");
const options = document.getElementById("options");
const exitOptionsButton = document.getElementById("exitOptions");
const volumeRange = document.getElementById("volumeRange");
const hangmanAnimation = document.getElementById("hangstandHangman");
const letterFields = document.getElementById("letterFields");
const load = document.getElementById("load");
const guessedWordsParagraph = document.getElementById("guessedWords");
const gameOver = document.getElementById("game-over");
const retryButton = document.getElementById("retry");
const wordParagraph = document.getElementById("wordWas");
const guessedWordCountParagraph = document.getElementById("guessedWordCount");
const definitionHintsCheckbox = document.getElementById("checkboxForDefinitionHints");
const wordDefinitionParagraph = document.getElementById("wordDefinitionParagraph");

const scribbleAudio = new Audio("audio/scribble.mp3"); // Ensure 'audio/' exists
const hangedAudio = new Audio("audio/hanged.mp3");
sessionStorage.setItem("volume", volumeRange.value / 100);

let guesses = 7;
let guessedWords = [];
let wordsCounter = -1;

startButton.addEventListener("click", async () => {
    hangedAudio.volume = sessionStorage.getItem("volume");
    scribbleAudio.volume = sessionStorage.getItem("volume");
    menuButtons.style.display = "none";
    load.style.display = "block";
    await fetchData();
    load.style.display = "none";
    hangmanAnimation.style.display = "block";
    animPause();
});

retryButton.addEventListener("click", () => {
    location.reload();
    hangedAudio.volume = sessionStorage.getItem("volume");
    scribbleAudio.volume = sessionStorage.getItem("volume");
});

optionsButton.addEventListener("click", () => {
    options.style.display = "block";
    definitionHintsCheckbox.checked = sessionStorage.getItem("wordDefinitionHints") === "true";
});

volumeRange.addEventListener("change", event => {
    hangedAudio.volume = event.currentTarget.value / 100;
    scribbleAudio.volume = event.currentTarget.value / 100;
    sessionStorage.setItem("volume", hangedAudio.volume);
});

definitionHintsCheckbox.addEventListener("change", () => {
    sessionStorage.setItem("wordDefinitionHints", definitionHintsCheckbox.checked);
});

exitOptionsButton.addEventListener("click", () => {
    options.style.display = "none";
});

function createInputCharacterFields(word) {
    letterFields.innerHTML = ""; // Clear previous fields

    for (let i = 0; i < word.length; i++) {
        let inputChar = document.createElement("input");
        inputChar.setAttribute("id", i);
        inputChar.style.textTransform = "uppercase";
        inputChar.style.marginRight = "8px";
        inputChar.style.width = "12px";
        inputChar.style.borderStyle = "solid";
        inputChar.style.borderBottomColor = "black";
        inputChar.style.outline = "none";
        inputChar.style.textAlign = "center";
        inputChar.setAttribute("type", "text");
        inputChar.maxLength = "1";
        inputChar.addEventListener("keyup", () => {
            const onlyLetters = /^[A-Za-z]+$/;
            if (inputChar.value.match(onlyLetters) && inputChar.value == word.charAt(inputChar.id)) {
                inputChar.style.backgroundColor = "lightgreen";
                inputChar.setAttribute("disabled", "disabled");
                checkIfWon(word);
            } else if (!inputChar.value.match(onlyLetters)) {
                inputChar.value = "";
            } else {
                guesses--;
                inputChar.value = "";
                drawHungman(word);
                scribbleAudio.play();
            }
        });

        letterFields.append(inputChar);
    }
    generateRandomHintLetters(word);
}

function generateRandomHintLetters(randWord) {
    let uniqueIndexes = new Set();
    let hintCount = Math.min(Math.floor(randWord.length / 4), 5); // Dynamic hints based on word length

    while (uniqueIndexes.size < hintCount) {
        let randomIndex = Math.floor(Math.random() * randWord.length);
        uniqueIndexes.add(randomIndex);
    }

    uniqueIndexes.forEach(index => {
        let input = document.getElementById(index);
        input.value = randWord.charAt(index);
        input.setAttribute("disabled", "disabled");
    });
}

function drawHungman(word) {
    switch (guesses) {
        case 6: case 5: case 4: case 3: case 2: case 1:
            animateFrame();
            break;
        default:
            animPlay();
            hangedAudio.play();
            gameOver.style.display = "block";
            wordParagraph.textContent = word;
            guessedWordCountParagraph.style.display = "block";
            guessedWordCountParagraph.textContent = `You've guessed: ${guessedWords.length} ${guessedWords.length > 1 ? "words" : "word"}`;
            letterFields.style.display = "none";
    }
}

function animPause() {
    hangmanAnimation.style.animationPlayState = "paused";
}

function animPlay() {
    hangmanAnimation.style.animationPlayState = "running";
}

function animateFrame() {
    animPlay();
    setTimeout(animPause, 125);
}

async function checkIfWon(word) {
    let emptyFields = word.length;
    for (let i = 0; i < word.length; i++) {
        let elem = document.getElementById(i);
        if (elem.value !== "") {
            emptyFields--;
        }
    }
    if (emptyFields === 0) {
        guessedWords.push(word);
        wordsCounter++;
        guessedWordsParagraph.style.display = "block";
        guessedWordsParagraph.textContent += (wordsCounter > 0 ? ", " : "") + guessedWords[wordsCounter];

        let inputFields = [];
        load.style.display = "block";
        for (let i = 0; i < word.length; i++) {
            inputFields.push(document.getElementById(i));
            letterFields.removeChild(inputFields[i]);
        }
        await fetchData();
        load.style.display = "none";
    }
}

async function fetchData() {
    const options = { method: 'GET' };
    try {
        const response = await fetch('https://random-word-api.vercel.app/api?words=1');

        const record = await response.json();
        const word = record[0];

        // Fetch definition
        const definitionResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, options);
        const definitionRecord = await definitionResponse.json();

        createInputCharacterFields(word);

        if (sessionStorage.getItem("wordDefinitionHints") === "true") {
            if (definitionRecord[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
                wordDefinitionParagraph.style.display = "block";
                wordDefinitionParagraph.textContent = definitionRecord[0].meanings[0].definitions[0].definition;
            } else {
                wordDefinitionParagraph.style.display = "block";
                wordDefinitionParagraph.style.color = "red";
                wordDefinitionParagraph.textContent = "Definition not found.";
            }
        }
    } catch (error) {
        console.log("API Failed. Using fallback words.");
        const fallbackWords = ["python", "developer", "github"];
        let word = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
        createInputCharacterFields(word);
    }
}
