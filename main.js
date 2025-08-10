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

// Render giao diện người dùng khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
    renderAuthUI();
});

// =================== ARTISTS (Popular) + HERO ===================

// Fetch & render danh sách nghệ sĩ vào grid hiện có
async function fetchArtists(limit = 20, offset = 0) {
  const grid = document.querySelector('.artists-section .artists-grid');
  if (!grid) return;

  // Xóa mọi thẻ demo cứng trong HTML (nếu còn)
  grid.innerHTML = '';

  // Skeleton đơn giản khi đang tải (không bắt buộc)
  grid.innerHTML = Array.from({ length: 8 })
    .map(
      () =>
        `<div class="artist-card" style="height:220px;border-radius:12px;background:linear-gradient(90deg,#2a2a2a 25%,#333 37%,#2a2a2a 63%);background-size:400% 100%;animation:shine 1.1s infinite"></div>`
    )
    .join('');

  try {
    // Gọi API lấy artists
    const res = await httpRequest.get(`/artists?limit=${limit}&offset=${offset}`);
    const artists = res?.artists ?? [];

    grid.innerHTML = '';
    artists.forEach((artist) => grid.appendChild(createArtistCard(artist)));

    // Lần đầu: set hero = artist đầu tiên
    if (artists.length) updateArtistHero(artists[0]);
  } catch (err) {
    console.error('Fetch artists error:', err);
    grid.innerHTML = `<p style="color:var(--text-secondary)">Không tải được danh sách nghệ sĩ.</p>`;
  }
}

// Tạo card nghệ sĩ
function createArtistCard(artist) {
  const card = document.createElement('div');
  card.className = 'artist-card';

  card.innerHTML = `
    <div class="artist-card-cover" style="border-radius:50%;overflow:hidden;position:relative;">
      <img loading="lazy" src="${artist.image_url}" alt="${artist.name}" />
      <button class="artist-play-btn" aria-label="Play ${artist.name}">
        <i class="fas fa-play"></i>
      </button>
    </div>
    <div class="artist-card-info">
      <h3 class="artist-card-name" title="${artist.name}">${artist.name}</h3>
      <p class="artist-card-type">Artist</p>
    </div>
  `;

  // Click card -> cập nhật hero
  card.addEventListener('click', () => updateArtistHero(artist));

  // Chặn nổi bọt khi bấm nút play (sau này gắn player thật)
  card.querySelector('.artist-play-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    // TODO: play nhạc của artist (nếu có player)
  });

  return card;
}

// Cập nhật Hero theo artist
function updateArtistHero(artist) {
  const hero = document.querySelector('.artist-hero');
  if (!hero) return;

  const img = hero.querySelector('.hero-image');
  const name = hero.querySelector('.artist-name');
  const listeners = hero.querySelector('.monthly-listeners');
  const verified = hero.querySelector('.verified-badge');

  if (img) {
    img.src = artist.background_image_url || artist.image_url;
    img.alt = `${artist.name} artist background`;
  }
  if (name) name.textContent = artist.name || 'Artist';
  if (listeners) {
    const count = Number(artist.monthly_listeners || 0).toLocaleString();
    listeners.textContent = `${count} monthly listeners`;
  }
  if (verified) verified.style.display = artist.is_verified ? 'flex' : 'none';
}

// Khởi động: chỉ gọi Popular artists
document.addEventListener('DOMContentLoaded', () => {
  // Dọn grid trước khi render (nếu còn phần cứng)
  const grid = document.querySelector('.artists-section .artists-grid');
  if (grid) grid.innerHTML = '';

  fetchArtists();
});
