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

const theme = {
    colors: ["#182535", "#283524", "#352438", "#0d0d0d"],
    index: 0,

    change: function() {
    const color = this.colors[this.index];

    document.body.style.backgroundColor = color;
    document.querySelector(".navbar").style.backgroundColor = color;
    document.querySelector("footer").style.backgroundColor = color;

    localStorage.setItem("clubColor", color);

    this.index++;

    if (this.index === this.colors.length) {
        this.index = 0;
    }
}
};

const changeColor = document.getElementById("changeColor");

if (changeColor) {
    changeColor.addEventListener("click", function() {
        theme.change();
         playSound();
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

const links = document.querySelectorAll(".navbar-nav a");
links.forEach(function(link,i){
    link.addEventListener("keydown", function(e){
        switch(e.key){
            case "ArrowRight":
                e.preventDefault();
                links[(i+1)%links.length].focus();
                break;
            case "ArrowLeft":
                e.preventDefault();
                links[(i-1 + links.length)%links.length].focus();
                break;
        }
    });
});

const step1=document.getElementById("step1");
const step2=document.getElementById("step2");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
if (step1 && step2 && nextBtn && backBtn) {

    function nextStep() {
        step1.classList.add("d-none");
        step2.classList.remove("d-none");
    }

    function backStep() {
        step2.classList.add("d-none");
        step1.classList.remove("d-none");
    }

    nextBtn.addEventListener("click", nextStep);
    backBtn.addEventListener("click", backStep);
}

const trainings = [
    {day: "Monday", name: "Strength Training", time: "18:00"},
    {day: "Wednesday", name: "Technique Training", time: "18:00"},
    {day: "Friday", name: "Practice Matches", time: "18:00"}
];

const trainingTable = document.getElementById("trainingTable");

if (trainingTable) {
    trainingTable.innerHTML = "";

    for (let i = 0; i < trainings.length; i++) {
        trainingTable.innerHTML += `
            <tr>
                <td>${trainings[i].day}</td>
                <td>${trainings[i].name}</td>
                <td>${trainings[i].time}</td>
            </tr>
        `;
    }
}
let soundPlaying = false;

function playSound() {
    if (soundPlaying) return;

    soundPlaying = true;

    const audio = new AudioContext();
    const sound = audio.createOscillator();
    const volume = audio.createGain();

    sound.frequency.value = 600;
    volume.gain.value = 0.05;

    sound.connect(volume);
    volume.connect(audio.destination);

    sound.start();
    sound.stop(audio.currentTime + 0.1);

    sound.onended = function() {
        soundPlaying = false;
        audio.close();
    };
}
const readMoreBtn = document.getElementById("readMoreBtn");
const moreInfo = document.getElementById("moreInfo");

if (readMoreBtn && moreInfo) {
    readMoreBtn.addEventListener("click", function() {
        if (moreInfo.style.display === "block") {
            moreInfo.style.display = "none";
            readMoreBtn.textContent = "Read More";
        } else {
            moreInfo.style.display = "block";
            readMoreBtn.textContent = "Read Less";
        }
    });
}