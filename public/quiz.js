const overlay = document.getElementById("quizOverlay");
const steps = document.querySelectorAll(".quiz-step");
const result = document.getElementById("quizResult");
const message = document.getElementById("quizMessage");
const closeButton = document.getElementById("quizClose");
const correctOrder = ["1", "2", "3", "4"];
const chosenOrder = [];

function resetQuiz() {
    chosenOrder.length = 0;
    if (result) {
        result.textContent = "Your order:";
    }
    if (message) {
        message.textContent = "";
        message.className = "";
    }
    steps.forEach(step => {
        step.style.opacity = "1";
        step.style.pointerEvents = "auto";
    });
}

function showQuiz() {
    if (overlay) {
        resetQuiz();
        overlay.classList.add("show");
    }
}

if (steps && steps.length > 0) {
    steps.forEach(step => {
        step.addEventListener("click", () => {
            const stepNum = step.dataset.step;
            if (!chosenOrder.includes(stepNum)) {
                chosenOrder.push(stepNum);
                if (result) {
                    result.textContent = "Your order: " + chosenOrder.join(" ➜ ");
                }
                step.style.opacity = "0.6";
                step.style.pointerEvents = "none";

                if (chosenOrder.length === correctOrder.length) {
                    if (message) {
                        if (JSON.stringify(chosenOrder) === JSON.stringify(correctOrder)) {
                            message.textContent = "✅ Perfect! You're a true barista!";
                            message.className = "quiz-message correct";
                        } else {
                            message.textContent = "❌ Oops! Try again next time!";
                            message.className = "quiz-message wrong";
                        }
                    }
                }
            }
        });
    });
}

if (closeButton) {
    closeButton.addEventListener("click", () => {
        if (overlay) {
            overlay.classList.remove("show");
        }
        resetQuiz();
    });
}

window.showQuiz = showQuiz;