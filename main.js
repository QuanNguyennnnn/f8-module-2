import httpRequest from "./utils/httpRequest.js";
import endpoints from "./utils/endpoints.js";
import toast from './utils/toast.js';
import { getItemStorage, setItemStorage } from "./utils/storage.js";

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
    // Get DOM elements
    const signupBtn = document.querySelector(".signup-btn");
    const loginBtn = document.querySelector(".login-btn");
    const authModal = document.getElementById("authModal");
    const modalClose = document.getElementById("modalClose");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const showLoginBtn = document.getElementById("showLogin");
    const showSignupBtn = document.getElementById("showSignup");

    // Function to show signup form
    function showSignupForm() {
        signupForm.style.display = "block";
        loginForm.style.display = "none";
    }

    // Function to hide signup form
    function hideSignupForm() {
        signupForm.style.display = "none";
    }

    // Function to show login form
    function showLoginForm() {
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    }

    // Function to open modal
    function openModal() {
        authModal.classList.add("show");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    // Open modal with Sign Up form when clicking Sign Up button
    signupBtn.addEventListener("click", function () {
        showSignupForm();
        openModal();
    });

    // Open modal with Login form when clicking Login button
    loginBtn.addEventListener("click", function () {
        showLoginForm();
        openModal();
    });

    // Close modal function
    function closeModal() {
        authModal.classList.remove("show");
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    // Close modal when clicking close button
    modalClose.addEventListener("click", closeModal);

    // Close modal when clicking overlay (outside modal container)
    authModal.addEventListener("click", function (e) {
        if (e.target === authModal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && authModal.classList.contains("show")) {
            closeModal();
        }
    });

    // Switch to Login form
    showLoginBtn.addEventListener("click", function () {
        showLoginForm();
    });

    // Switch to Signup form
    showSignupBtn.addEventListener("click", async function () {
        showSignupForm();
    });

    signupForm.querySelector(".auth-form-content").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.querySelector("#signupEmail").value;
        const password = document.querySelector("#signupPassword").value;

        const credentials = {
            email,
            password,
        };

        try {
            const { user, access_token, message } = await httpRequest.post(endpoints.authRegister, credentials);

            if (user) {
                toast({
                    text: message,
                    type: "success"
                });

                setItemStorage("accessToken", access_token);
                setItemStorage("currentUser", user);

                // chuyển sang form đăng nhập
                hideSignupForm();
                showLoginForm();
            }


        } catch (error) {
            const errorCode = error?.response?.error?.code;
            const errorMessage = error?.response?.error?.message;

            if (errorCode === "EMAIL_EXISTS") {
                toast({
                    text: errorMessage,
                    type: "error"
                });
            }
        }
    });

    loginForm.querySelector(".auth-form-content").addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.querySelector("#loginEmail").value;
        const password = document.querySelector("#loginPassword").value;
        const authButton = document.querySelector(".auth-buttons");
        const userInfo = document.querySelector(".user-info");

        const credentials = {
            email,
            password,
        };

        try {
            const { user, access_token, message } = await httpRequest.post(endpoints.authLogin, credentials);

            if (user) {
                toast({
                    text: message,
                    type: "success"
                });

                setItemStorage("accessToken", access_token);
                setItemStorage("currentUser", user);

                updateCurrentUser(user);

                // Ẩn login/signup, hiện avatar
                document.querySelector(".auth-buttons").style.display = "none";
                document.querySelector(".user-info").style.display = "flex";

                // Tooltip tên user
                tippy('#user-avatar', {
                    content: user.display_name || user.email || 'User',
                });
                // Đóng modal
                closeModal();
            }
        } catch (error) {
            toast({ text: "Login failed. Please check your credentials.", type: "error" });
        }
    });
});

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
    const userAvatar = document.getElementById("userAvatar");
    const userDropdown = document.getElementById("userDropdown");
    const logoutBtn = document.getElementById("logoutBtn");

    // Toggle dropdown when clicking avatar
    userAvatar.addEventListener("click", function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        if (
            !userAvatar.contains(e.target) &&
            !userDropdown.contains(e.target)
        ) {
            userDropdown.classList.remove("show");
        }
    });

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && userDropdown.classList.contains("show")) {
            userDropdown.classList.remove("show");
        }
    });

    // Handle logout button click
    logoutBtn.addEventListener("click", function () {
        // Close dropdown first
        userDropdown.classList.remove("show");

        console.log("Logout clicked");
        // TODO: Students will implement logout logic here
    });
});

// Fetch và hiển thị thông tin người dùng
document.addEventListener("DOMContentLoaded", async () => {
    const authButton = document.querySelector(".auth-buttons");
    const userInfo = document.querySelector(".user-info");

    try {
        const { user } = await httpRequest.get('users/me');
        updateCurrentUser(user);
        userInfo.classList.add("show");
    } catch (error) {
        authButton.classList.add("show");
    }
});

function updateCurrentUser(user) {
    console.log("user", user);
    const userName = document.querySelector("#user-name");
    const userAvatar = document.querySelector("#user-avatar");

    if (user.avatar_url) {
        userAvatar.src = user.avatar_url;
    }
    if (user.email) {
        userName.textContent = user.email.split('@')[0]; // Hiển thị username từ email
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const user = getItemStorage("currentUser");
    const userAvatar = document.querySelector("#user-avatar");
    const userInfo = document.querySelector(".user-info");
    const authButton = document.querySelector(".auth-buttons");

    // Hiển thị thông tin người dùng nếu đã đăng nhập
    if (user) {
        updateCurrentUser(user);
        userInfo.classList.add("show");
        authButton.classList.remove("show");
        userAvatar.src = user.avatar_url;

        //Hiển thị tên người dùng khi hover vào avatar
        tippy('#user-avatar', {
        content: user.display_name || user.email || 'User' ,
    });
    } else {
        authButton.classList.add("show");
        userInfo.classList.remove("show");
    }
});