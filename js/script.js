const registrationForm = document.getElementById("registrationForm");

if (registrationForm) {
    registrationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email");
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const formMessage = document.getElementById("formMessage");

        formMessage.style.color = "red";

        if (name === "" || email.value.trim() === "" ||
            password === "" || confirmPassword === "") {
            formMessage.textContent = "Please fill in all required fields.";
        } else if (!email.checkValidity()) {
            formMessage.textContent = "Please enter a valid email address.";
        } else if (password.length < 8) {
            formMessage.textContent = "Password must contain at least 8 characters.";
        } else if (password !== confirmPassword) {
            formMessage.textContent = "Passwords do not match.";
        } else {
            formMessage.style.color = "green";
            formMessage.textContent = "All fields are valid.";
        }
    });
}
const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(function (question) {
    question.addEventListener("click", function () {
        const answer = question.nextElementSibling;

        if (question.getAttribute("aria-expanded") === "true") {
            answer.style.maxHeight = "0px";
            question.setAttribute("aria-expanded", "false");
        } else {
            answer.style.maxHeight = answer.scrollHeight + "px";
            question.setAttribute("aria-expanded", "true");
        }
    });
});
const openPopup = document.getElementById("openPopup");
const closePopup = document.getElementById("closePopup");
const subscribePopup = document.getElementById("subscribePopup");
const subscribeForm = document.getElementById("subscribeForm");

if (subscribePopup) {
    openPopup.addEventListener("click", function () {
        subscribePopup.style.display = "flex";
    });

    closePopup.addEventListener("click", function () {
        subscribePopup.style.display = "none";
    });

    subscribePopup.addEventListener("click", function (event) {
        if (event.target === subscribePopup) {
            subscribePopup.style.display = "none";
        }
    });

    subscribeForm.addEventListener("submit", function (event) {
        event.preventDefault();

        document.getElementById("subscribeMessage").textContent =
            "Email is valid. This is a demo form.";
    });
}
const changeColor = document.getElementById("changeColor");
const colors = ["#182535", "#283524", "#352438", "#0d0d0d"];
let colorIndex = 0;

if (changeColor) {
    changeColor.addEventListener("click", function () {
        document.body.style.backgroundColor = colors[colorIndex];

        colorIndex++;

        if (colorIndex === colors.length) {
            colorIndex = 0;
        }
    });
}
const dateTime = document.getElementById("dateTime");

if (dateTime) {
    function updateDateTime() {
        const now = new Date();

        dateTime.textContent = now.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);
}