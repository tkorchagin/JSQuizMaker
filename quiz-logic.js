const container = document.getElementById('quiz-container');
let currentQuestionIndex = 0;
let score = 0;
let quizData = null;

async function loadQuizData(jsonPath) {
  try {
    const response = await fetch(jsonPath);
    return await response.json(); // This returns the quiz data
  } catch (error) {
    console.error('Failed to load quiz data:', error);
    return null; // Handle the error appropriately
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  const jsonPath = container.getAttribute('data-json-path');
  quizData = await loadQuizData(jsonPath); // Load and store quizData globally

  if (!quizData) {
    console.error('Quiz data is not available.');
    return; // Optionally handle this case in your UI
  }

  displayWelcomeScreen(); // No need to pass quizData
});

function displayWelcomeScreen() {
    const welcomeScreen = quizData.welcome_screen;
    let html = '';
    // Include the welcome image with error handling, if available
    if (welcomeScreen.image_url) {
    html += `
    <img src="${welcomeScreen.image_url}" onerror="this.style.display='none'" alt="Welcome Image" style="max-width:100%; height:auto;">`;
    }
    // Append the title and subtitle after the image
    html += `
    <h1>${welcomeScreen.title}</h1>
    <p>${welcomeScreen.subtitle}</p>
    <button class="button" id="startButton">${welcomeScreen.button_text}</button>`;
    container.innerHTML = html;
    document.getElementById('startButton').addEventListener('click', startQuiz);
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= quizData.questions.length) {
    displayResults();
    return;
    }
    const question = quizData.questions[currentQuestionIndex];
    let html = '';
    // Check and include the question image with error handling, if available
    if (question.question_url) {
    html += `
    <img src="${question.question_url}" onerror="this.style.display='none'" alt="Question Image" style="max-width:100%; height:auto;">`;
    }
    html += `
        <h2>Question ${currentQuestionIndex + 1} of ${quizData.questions.length}</h2>
        <p>${question.question}</p>`;
    question.answers.forEach((answer, index) => {
    const answerButtonId = `answerButton${index}`;
    html += `
        <div class="question">`;
    // Add the answer button
    html += `
        <button class="button" id="${answerButtonId}">${answer.text}</button>`;
    // Check for and add an optional description if it exists
    if (answer.description) {
        html += `
        <p class="answer-description">${answer.description}</p>`;
    }
    html += `
        </div>`; // Close the question div
    });
    container.innerHTML = html;
    // Attach click event listeners to each answer button
    question.answers.forEach((answer, index) => {
    document.getElementById(`answerButton${index}`).addEventListener('click', () => selectAnswer(index));
    });
}

function selectAnswer(answerIndex) {
    const question = quizData.questions[currentQuestionIndex];
    const answerPoints = question.answers[answerIndex].points; // This should be a number
    if (typeof answerPoints !== 'number') {
    console.error('Points value is not a number:', answerPoints);
    } else {
    score += answerPoints;
    }
    console.log(`Current Score: ${score}`); // This should now reflect the correct numeric score
    currentQuestionIndex++;
    displayQuestion();
}

function displayResults() {
    // Attempt to find a matching result based on the score
    const result = quizData.results.find(r => score >= r.score_range[0] && score <= r.score_range[1]);
    let html = '';
    // Check and include the result image with error handling, if available
    if (result && result.image_url) {
    html += `
        <img src="${result.image_url}" onerror="this.style.display='none'" alt="Result Image" style="max-width:100%; height:auto;">`;
    }
    // Check if a result was found
    if (result) {
    html += `
        <h1>${result.title}</h1>
        <p>${result.description}</p>
        <button class="button" id="restartButton">Restart</button>`;
    } else {
    // Fallback content if no result matches the score
    html += `
        <h1>Result Unavailable</h1>
        <p>We couldn't find a result that matches your score. Please try the quiz again!</p>
        <button class="button" id="restartButton">Restart</button>`;
    }
    container.innerHTML = html;
    document.getElementById('restartButton').addEventListener('click', displayWelcomeScreen);
}

