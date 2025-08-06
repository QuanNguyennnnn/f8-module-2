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

                // Cập nhật giao diện
                renderAuthUI();

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
    const userAvatar = document.getElementById("user-avatar");
    const userDropdown = document.getElementById("userDropdown");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!userAvatar || !userDropdown || !logoutBtn) {
        console.error("User avatar or dropdown elements not found.");
        return;
    }

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

        // Xử lý đăng xuất
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        renderAuthUI(); // Cập nhật giao diện sau khi đăng xuất

        console.log("Logout clicked");
        // TODO: Students will implement logout logic here
    });
});

// Fetch và hiển thị thông tin người dùng
function updateCurrentUser(user) {
    console.log("user", user);
    const userName = document.querySelector("#user-name");
    const userAvatar = document.querySelector("#user-avatar");

    if (user.avatar_url && userAvatar) {
        userAvatar.src = user.avatar_url;
    }
    if (user.email && userName) {
        userName.textContent = user.email.split('@')[0]; // Hiển thị username từ email
    }
}

//Hàm cập nhật giao diện theo trạng thái đăng nhập
    function renderAuthUI() {
        const user = getItemStorage("currentUser");
        const authButton = document.querySelector(".auth-buttons");
        const userInfo = document.querySelector(".user-info");
        if(user) {
            updateCurrentUser(user);
            if (userInfo) {
                userInfo.style.display = "flex";                
            }
            if (authButton) {
                authButton.style.display = "none";
            }
            //Tooltip tên user
            tippy('#user-avatar', {
                content: user.display_name || user.email || 'User',
            });
        } else {
            if (userInfo) {
                userInfo.style.display = "none";
            }
            if (authButton) {
                authButton.style.display = "flex";
            }
        }
    }

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.toggle-password').forEach(function (eyeIcon) {
        eyeIcon.addEventListener('click', function () {
            const inputId = this.getAttribute('data-target');
            const inputField = document.getElementById(inputId);
            const icon = eyeIcon.querySelector('i');
            if(inputField) {
                if (inputField.type === 'password') {
                    inputField.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');    
                } else {
                    inputField.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });
});

// Render authentication UI on page load
document.addEventListener("DOMContentLoaded", function () {
    renderAuthUI();
});

async function fetchAndRenderArtists() {
  try {
    const res = await httpRequest.get('/artists?limit=20&offset=0');
    const artists = res.artists;

    // Tìm tới phần HTML để gắn dữ liệu
    const artistsGrid = document.querySelector('.artists-section .artists-grid');
    artistsGrid.innerHTML = ''; 

    // Duyệt qua từng nghệ sĩ
    artists.forEach(artist => {
      const card = document.createElement('div');
      card.className = 'artist-card';
      card.innerHTML = `
        <div class="artist-card-cover">
          <img src="${artist.image_url}" alt="${artist.name}" />
          <button class="artist-play-btn">
            <i class="fas fa-play"></i>
          </button>
        </div>
        <div class="artist-card-info">
          <h3 class="artist-card-name">${artist.name}</h3>
          <p class="artist-card-type">Artist</p>
        </div>
      `;
      artistsGrid.appendChild(card);
    });

  } catch (error) {
    console.error('Lỗi khi fetch nghệ sĩ:', error);
  }
}

fetchAndRenderArtists();