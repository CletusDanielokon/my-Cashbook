// ========================================
// CASHBOOK SETTINGS
// ========================================


// ========================================
// GET USER
// ========================================

let user = JSON.parse(
    localStorage.getItem("cashbookUser")
);


// If no user is logged in
if (!user) {

    window.location.href = "index.html";

}


// ========================================
// USER INFORMATION
// ========================================

function getFullName() {

    return (
        user.fullName ||
        user.name ||
        user.username ||
        "CashBook User"
    );

}


function getInitials(name) {

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {

        return words[0].charAt(0).toUpperCase();

    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}


// ========================================
// DISPLAY USER
// ========================================

function displayUser() {

    const fullName = getFullName();

    const email =
        user.email ||
        "No email available";


    const initials =
        getInitials(fullName);


    // Sidebar
    document.getElementById("sidebar-initials").textContent =
        initials;

    document.getElementById("sidebar-name").textContent =
        fullName;


    // Header
    document.getElementById("header-initials").textContent =
        initials;

    document.getElementById("header-name").textContent =
        fullName;


    // Settings profile
    document.getElementById("settings-profile-name").textContent =
        fullName;

    document.getElementById("settings-profile-email").textContent =
        email;

}


displayUser();


// ========================================
// NAVIGATION
// ========================================

function goTo(page) {

    window.location.href = page;

}


// ========================================
// MOBILE MENU
// ========================================

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("mobile-overlay");

const openMenu =
    document.getElementById("open-menu");


function openSidebar() {

    sidebar.classList.remove("-translate-x-full");

    overlay.classList.remove("hidden");

}


function closeSidebar() {

    sidebar.classList.add("-translate-x-full");

    overlay.classList.add("hidden");

}


openMenu.addEventListener(
    "click",
    openSidebar
);


overlay.addEventListener(
    "click",
    closeSidebar
);


// ========================================
// DARK / LIGHT MODE
// ========================================

const themeToggle =
    document.getElementById("theme-toggle");

const themeCircle =
    document.getElementById("theme-toggle-circle");

const themeIcon =
    document.getElementById("theme-icon");

const themeDescription =
    document.getElementById("theme-description");


// Get saved theme
const savedTheme =
    localStorage.getItem("cashbookTheme");


// Apply saved theme
if (savedTheme === "dark") {

    document.documentElement.classList.add("dark");

    updateThemeButton(true);

} else {

    document.documentElement.classList.remove("dark");

    updateThemeButton(false);

}


// Toggle theme
themeToggle.addEventListener(
    "click",
    function () {

        const isDark =
            document.documentElement.classList.toggle("dark");


        if (isDark) {

            localStorage.setItem(
                "cashbookTheme",
                "dark"
            );

        } else {

            localStorage.setItem(
                "cashbookTheme",
                "light"
            );

        }


        updateThemeButton(isDark);

    }
);


// Update theme button
function updateThemeButton(isDark) {

    if (isDark) {

        themeToggle.classList.add("bg-green");

        themeToggle.classList.remove("bg-slate-300");

        themeCircle.classList.add("translate-x-7");

        themeIcon.className =
            "fas fa-moon";

        themeDescription.textContent =
            "Dark mode is currently enabled.";

    } else {

        themeToggle.classList.remove("bg-green");

        themeToggle.classList.add("bg-slate-300");

        themeCircle.classList.remove("translate-x-7");

        themeIcon.className =
            "fas fa-sun";

        themeDescription.textContent =
            "Light mode is currently enabled.";

    }

}


// ========================================
// EDIT PROFILE MODAL
// ========================================

const editProfileModal =
    document.getElementById("edit-profile-modal");


function openEditProfileModal() {

    // Put existing information into the form

    document.getElementById("edit-full-name").value =
        user.fullName || "";


    document.getElementById("edit-mobile").value =
        user.mobile || "";


    document.getElementById("edit-email").value =
        user.email || "";


    document.getElementById("edit-book").value =
        user.book || "";


    editProfileModal.classList.remove("hidden");

    editProfileModal.classList.add("flex");

}


function closeEditProfileModal() {

    editProfileModal.classList.add("hidden");

    editProfileModal.classList.remove("flex");

}


// ========================================
// SAVE PROFILE CHANGES
// ========================================

const editProfileForm =
    document.getElementById("edit-profile-form");


editProfileForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // Get new information

        const fullName =
            document.getElementById("edit-full-name")
                .value.trim();


        const mobile =
            document.getElementById("edit-mobile")
                .value.trim();


        const email =
            document.getElementById("edit-email")
                .value.trim();


        const book =
            document.getElementById("edit-book")
                .value.trim();


        // Update user

        user.fullName =
            fullName;

        user.firstName =
            fullName.split(" ")[0];

        user.mobile =
            mobile;

        user.email =
            email;

        user.book =
            book;


        // Save updated user

        localStorage.setItem(
            "cashbookUser",
            JSON.stringify(user)
        );


        // Update page

        displayUser();


        // Close modal

        closeEditProfileModal();


        alert("Profile updated successfully.");

    }
);


// ========================================
// PASSWORD RESET MODAL
// ========================================

const passwordModal =
    document.getElementById("password-modal");


function openPasswordModal() {

    document.getElementById(
        "password-reset-email"
    ).value = user.email || "";


    passwordModal.classList.remove("hidden");

    passwordModal.classList.add("flex");

}


function closePasswordModal() {

    passwordModal.classList.add("hidden");

    passwordModal.classList.remove("flex");

}


// ========================================
// SEND PASSWORD RESET
// ========================================

function sendPasswordReset() {

    const email =
        document.getElementById(
            "password-reset-email"
        ).value;


    if (!email) {

        alert(
            "No email address is associated with this account."
        );

        return;

    }


    /*
        IMPORTANT:

        The actual email must be sent from
        your backend.

        Do NOT send or store passwords
        from the browser.

        Later, your Node.js + Express
        backend can use Nodemailer/SMTP
        to send the reset link.
    */


    alert(
        "Password reset request created for " +
        email +
        ". Connect this button to your backend email service to send the reset link."
    );


    closePasswordModal();

}


// ========================================
// LOGOUT
// ========================================

function logout() {

    localStorage.removeItem(
        "cashbookUser"
    );

    window.location.href =
        "index.html";

}