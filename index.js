
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

const scribbleAudio = new Audio("audio/scribble.mp3")
const hangedAudio = new Audio("audio/hanged.mp3")
sessionStorage.setItem("volume", volumeRange.value / 100);

let guesses = 7;
let guessedWords = [];
let wordsCounter = -1;

startButton.addEventListener("click", async()=>{
    hangedAudio.volume = sessionStorage.getItem("volume");
    scribbleAudio.volume = sessionStorage.getItem("volume");
    menuButtons.style.display ="none";
    load.style.display = "block";
    await fetchData();
    load.style.display = "none";
    hangmanAnimation.style.display = "block";
    animPause();
});

retryButton.addEventListener("click", ()=>{
    location.reload();
    hangedAudio.volume = sessionStorage.getItem("volume");
    scribbleAudio.volume = sessionStorage.getItem("volume");
});

optionsButton.addEventListener("click", ()=>{
    options.style.display = "block";
    if(sessionStorage.getItem("wordDefinitionHints") == "true"){
        definitionHintsCheckbox.checked = true;
    }else{
        definitionHintsCheckbox.checked = false;
    }

});

volumeRange.addEventListener("change", event=>{
    hangedAudio.volume = event.currentTarget.value / 100;
    scribbleAudio.volume = event.currentTarget.value / 100;
    sessionStorage.setItem("volume", hangedAudio.volume)
});

definitionHintsCheckbox.addEventListener("change", ()=>{
    if(definitionHintsCheckbox.checked){
        sessionStorage.setItem("wordDefinitionHints", true);
    }else{
        sessionStorage.setItem("wordDefinitionHints", false);
    }
});

exitOptionsButton.addEventListener("click", ()=>{
    options.style.display = "none";
});

function createInputCharacterFields(word){
    for(i = 0; i < word.length; i++){
    let inputChar = document.createElement("input");
    inputChar.setAttribute("id", i);
    inputChar.style.textTransform = "uppercase";
    inputChar.style.marginRight = "8px"
    inputChar.style.width = "12px";
    inputChar.style.borderStyle = "solid";
    inputChar.style.borderBottomColor = "black";
    inputChar.style.outline = "none";
    inputChar.style.textAlign = "center";
    inputChar.setAttribute("type", "text");
    inputChar.maxLength = "1"
    inputChar.addEventListener("keyup", ()=>{
        const onlyLetters = /^[A-Za-z]+$/;
            if(inputChar.value.match(onlyLetters) && inputChar.value == word.charAt(inputChar.id)){
                inputChar.style.backgroundColor = "lightgreen";
                inputChar.setAttribute("disabled", "disabled");
                checkIfWon(word, inputChar);
            }else if(inputChar.value.match(onlyLetters) == null){
                inputChar.value = "";
            }else{
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

function generateRandomHintLetters(randWord){
    let randomLetters = [];
    if(randWord.length > 1 < 5){
        for(i = 0; i < 1; i++){
            checkIfGeneratedHintLettersDuplicate(randomLetters, randWord);
        }
    }else if(randWord.length > 5 < 10){
        for(i = 0; i < 3; i++){
           checkIfGeneratedHintLettersDuplicate(randomLetters, randWord);
        }

    }else if(randWord.length > 9 < 14){
        for(i = 0; i < 4; i++){
            checkIfGeneratedHintLettersDuplicate(randomLetters, randWord);
        }
    
    }else if(randWord.length > 13 < 18){
        for(i = 0; i < 5; i++){
            checkIfGeneratedHintLettersDuplicate(randomLetters, randWord);
        }
        
    }
    
}

function checkIfGeneratedHintLettersDuplicate(generatedRandomLetters, randWord){
    let randomLetter = randWord.charAt(Math.floor(Math.random() * randWord.length));
    generatedRandomLetters.push(randomLetter);
    input = document.getElementById(randWord.indexOf(randomLetter));
    if(generatedRandomLetters.indexOf(generatedRandomLetters[i]) !== generatedRandomLetters.lastIndexOf(generatedRandomLetters[i])){
        randomLetter = randWord.charAt(Math.floor(Math.random() * randWord.length));
        input = document.getElementById(randWord.indexOf(randomLetter));
        input.setAttribute("value", randomLetter);
        input.setAttribute("disabled", "disabled");
    }else{
        input.setAttribute("value", randomLetter);
        input.setAttribute("disabled", "disabled");
    }
}

function drawHungman(word){
    switch(guesses){
        case 6: animateFrame();
        break;
        case 5: animateFrame();
        break;
        case 4: animateFrame();
        break;
        case 3: animateFrame();
        break;
        case 2: animateFrame();
        break;
        case 1: animateFrame();
        break;
        default: animPlay();
        hangedAudio.play();
        gameOver.style.display = "block";
        wordParagraph.textContent = word;
        if(guessedWords.length === 1){
            gameOver.style.height = "265px";
            guessedWordCountParagraph.style.display = "block";
            guessedWordCountParagraph.textContent = `You've guessed: ${guessedWords.length} word`;
        }else if(guessedWords.length > 1){
            gameOver.style.height = "265px";
            guessedWordCountParagraph.style.display = "block";
            guessedWordCountParagraph.textContent = `You've guessed: ${guessedWords.length} words`;
        }
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

async function checkIfWon(word){
    let emptyFields = word.length;
    for(i = 0; i < word.length; i++){
        let elem = document.getElementById(i);
       if(!elem.value == ""){
        emptyFields--;
       }
    }
    if(emptyFields == 0){
        guessedWords.push(word);
        wordsCounter++;
        if(guessedWords.length > 1){
            guessedWordsParagraph.textContent += ", ";
        }
        guessedWordsParagraph.style.display = "block";
        
        guessedWordsParagraph.textContent += guessedWords[wordsCounter];
        let inputFields = [];
        load.style.display = "block";
        for(i = 0; i < word.length; i++){
            inputFields.push(document.getElementById(i));
            letterFields.removeChild(inputFields[i]);
        }
        await fetchData();
        load.style.display = "none";
    }
}
async function fetchData(){
const options = {
        method: 'GET',
    };
const response = await fetch('https://random-word-api.herokuapp.com/word?lang=en', options);
const record = await response.json();
const definitionResponse = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+record[0], options);
const definitionRecord = await definitionResponse.json();
    try{
        createInputCharacterFields(record[0]);
    if(sessionStorage.getItem("wordDefinitionHints") == "true"){
        console.log(definitionRecord[0].meanings[0].definitions[0].definition);
        wordDefinitionParagraph.style.display = "block";
        wordDefinitionParagraph.textContent = definitionRecord[0].meanings[0].definitions[0].definition;
    }
    }catch(error){
    if(typeof definitionRecord[0] === "undefined"){
        wordDefinitionParagraph.style.display = "block";
        wordDefinitionParagraph.style.color = "red";
        wordDefinitionParagraph.textContent = "The defintion for this word was not found.";
    }
        
    }
        
}