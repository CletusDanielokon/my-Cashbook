// ===============================
// GET HTML ELEMENTS
// ===============================

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");

const subtitle = document.getElementById("subtitle");
const footer = document.getElementById("footer");
const message = document.getElementById("message");

// ===============================
// SWITCH BETWEEN LOGIN AND SIGN UP
// ===============================

function switchTab(tab) {
    message.textContent = "";

    if (tab === "login") {
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");

        loginTab.className =
            "w-1/2 bg-white text-navy rounded-md py-2 font-semibold shadow";
        signupTab.className =
            "w-1/2 text-slate-500 rounded-md py-2 font-semibold";

        subtitle.textContent = "Manage your daily cash flow";

        footer.innerHTML =
            'Don\'t have an account? ' +
            '<button id="footer-link" type="button" class="text-green font-semibold hover:underline ms-1">' +
            'Sign up' +
            '</button>';
    } else {
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");

        loginTab.className =
            "w-1/2 text-slate-500 rounded-md py-2 font-semibold";
        signupTab.className =
            "w-1/2 bg-white text-navy rounded-md py-2 font-semibold shadow";

        subtitle.textContent = "Create your CashBook account";

        footer.innerHTML =
            'Already have an account? ' +
            '<button id="footer-link" type="button" class="text-green font-semibold hover:underline ms-1">' +
            'Login' +
            '</button>';
    }
}

// Event delegation for dynamic footer link clicks
footer.addEventListener("click", function (event) {
    if (event.target && event.target.id === "footer-link") {
        const isLoginVisible = !loginForm.classList.contains("hidden");
        switchTab(isLoginVisible ? "signup" : "login");
    }
});

// ===============================
// TAB BUTTONS
// ===============================

loginTab.addEventListener("click", function () {
    switchTab("login");
});

signupTab.addEventListener("click", function () {
    switchTab("signup");
});

// ===============================
// SHOW / HIDE PASSWORD
// ===============================

const passwordButtons = document.querySelectorAll(".password-toggle");

passwordButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const fieldId = button.dataset.target;
        const field = document.getElementById(fieldId);
        const icon = button.querySelector("svg");

        if (field.type === "password") {
            field.type = "text";
            icon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8 a18.45 18.45 0 0 1 5.06-5.94 M9.9 4.24A9.12 9.12 0 0 1 12 4 c7 0 11 8 11 8 a18.5 18.5 0 0 1-2.16 3.19 m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            field.type = "password";
            icon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    });
});

// ===============================
// SIGN UP
// ===============================

// ===============================
// SIGN UP
// ===============================
signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const fullName = document.getElementById("signup-name").value.trim();
    const mobile = document.getElementById("signup-mobile").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const book = document.getElementById("signup-book").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Check passwords
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.className =
            "text-center text-sm mb-4 text-red-500 font-semibold";
        return;
    }

    // Check password length
    if (password.length < 6) {
        message.textContent =
            "Password must be at least 6 characters.";
        message.className =
            "text-center text-sm mb-4 text-red-500 font-semibold";
        return;
    }

    // Send registration data to backend
    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName: fullName,
                    mobile: mobile,
                    email: email,
                    book: book,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent =
                data.message || "Registration failed.";

            message.className =
                "text-center text-sm mb-4 text-red-500 font-semibold";

            return;
        }

        // Save JWT token so the user is logged in after registering
        if (data.token) {
            localStorage.setItem("cashbookToken", data.token);
        }

        // Save only safe user information in the browser
        localStorage.setItem(
            "cashbookUser",
            JSON.stringify(data.user)
        );

        message.textContent =
            "Account created successfully!";

        message.className =
            "text-center text-sm mb-4 text-green font-semibold";

        setTimeout(function () {
            window.location.href = "welcome.html";
        }, 1000);

    } catch (error) {
        console.error("Registration error:", error);

        message.textContent =
            "Unable to connect to the server.";

        message.className =
            "text-center text-sm mb-4 text-red-500 font-semibold";
    }
});

// ===============================
// LOGIN
// ===============================
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const identifier = document
        .getElementById("login-identifier")
        .value
        .trim();

    const password = document
        .getElementById("login-password")
        .value;

    // Check that both fields were entered
    if (!identifier || !password) {
        message.textContent =
            "Please enter your email/phone number and password.";

        message.className =
            "text-center text-sm mb-4 text-red-500 font-semibold";

        return;
    }

    try {
        // Send login details to backend
        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    identifier: identifier,
                    password: password
                })
            }
        );

        const data = await response.json();

        // Login failed
        if (!response.ok) {
            message.textContent =
                data.message || "Login failed.";

            message.className =
                "text-center text-sm mb-4 text-red-500 font-semibold";

            return;
        }

        // Save JWT token
        localStorage.setItem(
            "cashbookToken",
            data.token
        );

        // Save safe user information
        localStorage.setItem(
            "cashbookUser",
            JSON.stringify(data.user)
        );

        message.textContent =
            "Login successful!";

        message.className =
            "text-center text-sm mb-4 text-green font-semibold";

        // Go to welcome page
        setTimeout(function () {
            window.location.href = "welcome.html";
        }, 1000);

    } catch (error) {
        console.error("Login error:", error);

        message.textContent =
            "Unable to connect to the server.";

        message.className =
            "text-center text-sm mb-4 text-red-500 font-semibold";
    }
});

// ===============================
// FORGOT PASSWORD & GOOGLE LOGIN
// ===============================

const forgotPassword = document.getElementById("forgot-password");
if (forgotPassword) {
    forgotPassword.addEventListener("click", function () {
        message.textContent = "Password reset will be connected to your backend.";
        message.className = "text-center text-sm mb-4 text-green font-semibold";
    });
}

const googleLogin = document.getElementById("google-login");
if (googleLogin) {
    googleLogin.addEventListener("click", function () {
        message.textContent = "Google login will be connected to your backend.";
        message.className = "text-center text-sm mb-4 text-green font-semibold";
    });
}