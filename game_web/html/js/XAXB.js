var random_number;;
var success = 0;

function random_generate() {
    random_number = "";
    while (random_number.length < 4) {
        var number = Math.floor(Math.random() * 10);
        if (random_number.indexOf(number) == -1) {
            random_number += number;
        }
    }
    console.log(random_number);
}
random_generate();


var btn = document.getElementById("submit-btn");
var userInput = document.getElementById("user-input");
var result = document.getElementById("result");
var guess_num = document.getElementById("guess_num");
var question_num = document.getElementById("question_num");
var game_over_text = document.getElementById("game_over");



function guess() {
    guess_num.innerHTML = parseInt(guess_num.innerHTML) + 1;
    var userAnswer = userInput.value;
    var a = 0;
    var b = 0;
    for (var i = 0; i < 4; i++) {
        if (userAnswer[i] == random_number[i]) {
            a++;
        } else if (random_number.indexOf(userAnswer[i]) != -1) {
            b++;
        }
    }

    var resultAB = a + "A" + b + "B";
    if (a == 4) {
        result.innerHTML = "Correct Answer";
        success += 1;
        question_num.innerHTML = parseInt(question_num.innerHTML) - 1;
        if (success < 3) {
            random_generate();
        }
    } else {
        result.innerHTML = resultAB;
    }
    userInput.value = "";
    if (success >= 3) {
        btn.removeEventListener("click", guess_num);
        game_over_text.innerHTML = "GAME IS OVER, You take " + guess_num.innerHTML + " guesses to complete";
    }
}

btn.addEventListener("click", guess);