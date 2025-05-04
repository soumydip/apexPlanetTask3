const questions = [
    {
        question: "What is the capital of France?",
        choices: ["Berlin", "Madrid", "Paris", "Lisbon"],
        correctAnswer: 2
    },
    {
        question: "What is 2 + 2?",
        choices: ["3", "4", "5", "6"],
        correctAnswer: 1
    },
    {
        question: "What is the largest planet in our solar system?",
        choices: ["Earth", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 2
    },
    {
        question: "What is the boiling point of water?",
        choices: ["50°C", "100°C", "150°C", "200°C"],
        correctAnswer: 1
    },
    {
        question: "What does 'NaN' stand for in JavaScript?",
        choices: ["Not a Null", "Not a Number", "Null and Null", "None"],
        correctAnswer: 1
    },
    {
        question: "Which of the following is a JavaScript data type?",
        choices: ["Boolean", "Integer", "Character", "Float"],
        correctAnswer: 0
    },
    {
        question: "Which method is used to convert a string into an integer in JavaScript?",
        choices: ["parseInt()", "parseString()", "toString()", "Number()"],
        correctAnswer: 0
    },
    {
        question: "Which keyword is used to declare a constant in JavaScript?",
        choices: ["var", "const", "let", "static"],
        correctAnswer: 1
    },
    {
        question: "How do you create a function in JavaScript?",
        choices: ["function myFunc() {}", "def myFunc() {}", "func myFunc() {}", "fn myFunc() {}"],
        correctAnswer: 0
    },
    {
        question: "Which of the following is NOT a JavaScript framework?",
        choices: ["React", "Angular", "Vue", "Django"],
        correctAnswer: 3
    },
    {
        question: "What is the correct way to declare an array in JavaScript?",
        choices: ["let arr = {}", "let arr = []", "let arr = ()", "let arr = ''"],
        correctAnswer: 1
    },
    {
        question: "Which operator is used to assign a value to a variable?",
        choices: ["=", "==", "===", "+"],
        correctAnswer: 0
    },
    {
        question: "Which JavaScript function can be used to find the length of a string?",
        choices: [".length", ".size()", ".count()", ".findLength()"],
        correctAnswer: 0
    },
    {
        question: "Which of the following loops is not present in JavaScript?",
        choices: ["for", "while", "do-while", "foreach"],
        correctAnswer: 3
    }
];

let score = 0;
let usedQuestions = [];
let currentQuestionIndex = 0;

// Correctly reference DOM elements
const questionEl = document.getElementById('question');
const choiceButtons = document.querySelectorAll('.choice');
const submitButton = document.getElementById('submit');
const scoreEl = document.getElementById('score');
const body = document.getElementsByTagName("body")[0];  // Correct body reference

function getRandomQuestionIndex() {
    return Math.floor(Math.random() * questions.length);
}

function loadQuestion() {
    let randomIndex;
    
    do {
        randomIndex = getRandomQuestionIndex();
    } while (usedQuestions.includes(randomIndex));

    usedQuestions.push(randomIndex);
    currentQuestionIndex = randomIndex;

    const currentQuestion = questions[currentQuestionIndex];
    questionEl.innerText = currentQuestion.question;
    choiceButtons.forEach((button, index) => {
        button.innerText = currentQuestion.choices[index];
        button.classList.remove('selected', 'correct', 'incorrect');  // Remove previous colors
        button.disabled = false;  // Enable all buttons again
    });
}

function showScore() {
    questionEl.innerText = "Quiz Finished!";
    document.getElementById('choices').style.display = 'none';
    submitButton.style.display = 'none';
    scoreEl.innerText = `Your Score: ${score}/${questions.length}`;
}

submitButton.addEventListener('click', () => {
    const selectedChoice = document.querySelector('.choice.selected');
    if (!selectedChoice) {
        alert('Please select an answer!');
        return;
    }

    const selectedAnswer = parseInt(selectedChoice.getAttribute('data-number'));
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;

    // Mark correct and incorrect answers
    if (selectedAnswer === correctAnswer) {
        selectedChoice.classList.add('correct');  // Make background green for correct
        score++;
        body.style.backgroundColor = "green";  // Correct syntax
    } else {
        selectedChoice.classList.add('incorrect');  // Make background red for incorrect
        choiceButtons[correctAnswer].classList.add('correct');  // Show the correct answer
        body.style.backgroundColor = "red";  // Correct syntax
    }

    // Disable all choices after submission
    choiceButtons.forEach(button => {
        button.disabled = true;
    });

    // Load next question after 2 seconds
    setTimeout(() => {
        body.style.backgroundColor = "";  // Reset background color after question change
        if (usedQuestions.length < questions.length) {
            loadQuestion();
        } else {
            showScore();
        }
    }, 1500);
});

choiceButtons.forEach(button => {
    button.addEventListener('click', () => {
        choiceButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    });
});

loadQuestion();
