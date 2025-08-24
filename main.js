import httpRequest from "./utils/httpRequest.js";
import endpoints from "./utils/endpoints.js";
import toast from './utils/toast.js';
import { getItemStorage, setItemStorage } from "./utils/storage.js";

// Global variables for playlist editing
let currentEditingPlaylistId = null;
let uploadedImageUrl = null;

// Function to open Edit Details modal
function openEditDetailsModal(playlistId = null, playlistName = "My Playlist", playlistDescription = "", imageUrl = "placeholder.svg?height=160&width=160") {
    editDetailsModal.classList.add("show");
    document.body.style.overflow = "hidden";
    currentEditingPlaylistId = playlistId;
    uploadedImageUrl = imageUrl; // Initialize uploadedImageUrl with existing image

    playlistNameInput.value = playlistName;
    playlistDescriptionInput.value = playlistDescription;
    playlistImagePreview.src = imageUrl;
}

// Function to close Edit Details modal
function closeEditDetailsModal() {
    editDetailsModal.classList.remove("show");
    document.body.style.overflow = "auto";
    currentEditingPlaylistId = null; // Clear current editing playlist ID
    uploadedImageUrl = null; // Clear uploaded image URL
}

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

    // Edit Details Modal elements
    const editDetailsModal = document.getElementById("editDetailsModal");
    const editDetailsModalClose = document.getElementById("editDetailsModalClose");
    const playlistImagePreview = document.getElementById("playlistImagePreview");
    const choosePhotoButton = document.getElementById("choosePhotoButton");
    const playlistImageInput = document.getElementById("playlistImageInput");
    const playlistNameInput = document.getElementById("playlistNameInput");
    const playlistDescriptionInput = document.getElementById("playlistDescriptionInput");
    const savePlaylistDetailsBtn = document.getElementById("savePlaylistDetailsBtn");

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
                if (user && user.id) {
                    setItemStorage("userId", user.id);
                }

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
        localStorage.removeItem("userId"); // Ensure userId is removed on logout
        renderAuthUI(); // Cập nhật giao diện sau khi đăng xuất

        console.log("Logout clicked");
        // TODO: Students will implement logout logic here
    });

    // Event listener for Create Playlist button
    const createBtn = document.querySelector(".create-btn");
    if (createBtn) {
        createBtn.addEventListener("click", async () => {
            try {
                const defaultPlaylistName = "My Playlist";
                const newPlaylist = await httpRequest.post(endpoints.playlistCreate, { name: defaultPlaylistName });
                toast({ text: `Created playlist: ${newPlaylist.name || defaultPlaylistName}`, type: "success" });
                await renderMyPlaylists(); // Update sidebar playlists
                openEditDetailsModal(newPlaylist.id, newPlaylist.name, newPlaylist.description);
            } catch (error) {
                console.error("Error creating playlist:", error);
                toast({ text: "Failed to create playlist.", type: "error" });
            }
        });
    }

    // Event listeners for Edit Details Modal
    if (editDetailsModalClose) {
        editDetailsModalClose.addEventListener("click", closeEditDetailsModal);
    }
    if (editDetailsModal) {
        editDetailsModal.addEventListener("click", function (e) {
            if (e.target === editDetailsModal) {
                closeEditDetailsModal();
            }
        });
    }

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

// Helper function to create a sidebar playlist item
function createMyPlaylistItem(playlist) {
    const currentUser = getItemStorage("currentUser");
    const isOwner = currentUser && playlist.owner?.id === currentUser.id;

    const playlistItem = document.createElement("div");
    playlistItem.className = "library-item";
    playlistItem.dataset.playlistId = playlist.id;
    playlistItem.innerHTML = `
        <img src="${imgOrPlaceholder(playlist.image_url, 48)}" alt="${safeText(playlist.name)}" class="item-image" />
        <div class="item-info">
            <div class="item-title">${safeText(playlist.name)}</div>
            <div class="item-subtitle">Playlist • ${safeText(playlist.owner?.display_name || playlist.owner_name, "Unknown")}</div>
        </div>
        ${isOwner ? `<button class="delete-playlist-btn" data-playlist-id="${playlist.id}"><i class="fas fa-trash"></i></button>` : ''}
    `;

    playlistItem.addEventListener("click", (event) => {
        // Only navigate if not clicking the delete button
        if (!event.target.closest('.delete-playlist-btn')) {
            window.location.href = `details.html?playlistId=${playlist.id}`;
        }
    });

    // Add event listener for delete button if it exists
    const deleteBtn = playlistItem.querySelector('.delete-playlist-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async (event) => {
            event.stopPropagation(); // Prevent navigating to details page
            if (confirm(`Are you sure you want to delete the playlist "${safeText(playlist.name)}"?`)) {
                try {
                    await httpRequest.delete(endpoints.playlistDelete(playlist.id));
                    toast({ text: "Playlist deleted successfully!", type: "success" });
                    renderMyPlaylists(); // Re-render sidebar
                } catch (error) {
                    console.error("Error deleting playlist:", error);
                    toast({ text: `Failed to delete playlist: ${error.message || "Unknown error"}`, type: "error" });
                }
            }
        });
    }
    return playlistItem;
}

// Render user's playlists in the sidebar
async function renderMyPlaylists() {
    const libraryContent = document.querySelector(".library-content");
    if (!libraryContent) return;

    try {
        const myPlaylists = await httpRequest.get(endpoints.myPlaylists);
        const playlistsToRender = Array.isArray(myPlaylists) ? myPlaylists : (myPlaylists?.playlists || []);

        // Clear existing dynamic playlists (keep Liked Songs static)
        libraryContent.querySelectorAll('.library-item[data-playlist-id]').forEach(item => item.remove());

        playlistsToRender.forEach(playlist => {
            const playlistItem = createMyPlaylistItem(playlist);
            libraryContent.appendChild(playlistItem);
        });
    } catch (error) {
        console.error("Error fetching user playlists:", error);
        // toast({ text: "Failed to load your playlists.", type: "error" });
        return []; // Ensure an empty array is returned on error
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
            renderMyPlaylists(); // Call renderMyPlaylists here
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

    // Image upload for playlist
    if (choosePhotoButton && playlistImageInput && playlistImagePreview) {
        choosePhotoButton.addEventListener("click", () => playlistImageInput.click());

        playlistImageInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => (playlistImagePreview.src = e.target.result);
                reader.readAsDataURL(file);

                const formData = new FormData();
                formData.append("avatar", file);

                try {
                    const uploadResponse = await httpRequest.post(endpoints.uploadAvatar, formData, { 'Content-Type': null }); // Set Content-Type to null for FormData
                    uploadedImageUrl = uploadResponse.avatar_url; // Assuming API returns { avatar_url: '...' }
                    toast({ text: "Image uploaded successfully!", type: "success" });
                } catch (error) {
                    console.error("Error uploading image:", error);
                    toast({ text: "Failed to upload image.", type: "error" });
                    uploadedImageUrl = null;
                }
            }
        });
    }

    // Save playlist details
    if (savePlaylistDetailsBtn) {
        savePlaylistDetailsBtn.addEventListener("click", async () => {
            const playlistId = savePlaylistDetailsBtn.dataset.playlistId;
            const name = playlistNameInput.value.trim();
            const description = playlistDescriptionInput.value.trim();

            if (!playlistId) {
                toast({ text: "No playlist selected for update.", type: "error" });
                return;
            }

            try {
                const updateData = { name, description };
                if (uploadedImageUrl) {
                    updateData.image_url = uploadedImageUrl;
                }

                await httpRequest.put(endpoints.playlistUpdate(playlistId), updateData);
                toast({ text: "Playlist updated successfully!", type: "success" });
                closeEditDetailsModal();
                renderMyPlaylists(); // Update sidebar playlists after saving
            } catch (error) {
                console.error("Error updating playlist:", error);
                toast({ text: "Failed to update playlist details.", type: "error" });
            }
        });
    }
});

// Render giao diện người dùng khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
    renderAuthUI();
});

// ======================= HOME DATA =======================
// Helpers (UI)
function safeText(t, fallback = "Unknown") {
  return (typeof t === "string" && t.trim()) ? t : fallback;
}
function imgOrPlaceholder(url, size = 160) {
  return url || `placeholder.svg?height=${size}&width=${size}`;
}

const toHttps = (u) => (typeof u === "string" ? u.replace(/^http:\/\//i, "https://") : u);

// Playlist card (Today's biggest hits)
function createHitCard(playlist) {
  const cover = imgOrPlaceholder(playlist?.image_url, 160);
  const title = safeText(playlist?.name, "Untitled");
  const sub = safeText(playlist?.owner?.display_name || playlist?.owner_name || "Playlist", "Playlist");

  const div = document.createElement("div");
  div.className = "hit-card";
  div.dataset.id = playlist.id; // Add data-id to playlist card
  div.innerHTML = `
    <div class="hit-card-cover">
      <img src="${cover}" alt="${title}" />
      <button class="hit-play-btn"><i class="fas fa-play"></i></button>
    </div>
    <div class="hit-card-info">
      <h3 class="hit-card-title">${title}</h3>
      <p class="hit-card-artist">${sub}</p>
    </div>
  `;
  return div;
}

// Artist card (Popular artists)
function createArtistCard(artist) {
  const cover = imgOrPlaceholder(artist?.image_url, 160);
  const name = safeText(artist?.name, "Unknown Artist");

  const div = document.createElement("div");
  div.className = "artist-card";
  div.dataset.id = artist.id;  // lưu id vào data-attribute

  div.innerHTML = `
    <div class="artist-card-cover">
      <img src="${cover}" alt="${name}" />
      <button class="artist-play-btn"><i class="fas fa-play"></i></button>
    </div>
    <div class="artist-card-info">
      <h3 class="artist-card-name">${name}</h3>
      <p class="artist-card-type">Artist</p>
    </div>
  `;
  return div;
}

//Update Hero Section
function updateArtistHero(a) {
  if (!a) return;
  const name = document.querySelector(".artist-name");
  const mons = document.querySelector(".monthly-listeners");
  if (name) name.textContent = a.name || "Unknown Artist";
  if (mons) mons.textContent = `${Number(a.monthly_listeners || 0).toLocaleString("en-US")} monthly listeners`;

  const url = toHttps(a.background_image_url || a.image_url) || "placeholder.svg";
  const heroBg = document.querySelector(".artist-hero");
  if (heroBg) heroBg.style.backgroundImage = `url("${url}")`;
  const heroImg = document.querySelector(".hero-image");
  if (heroImg) { heroImg.src = url; heroImg.alt = a.name || "Artist"; }
}

// Fetch Data
async function fetchPlaylists(limit = 20, offset = 0) {
  try {
    const res = await httpRequest.get(`${endpoints.playlists}?limit=${limit}&offset=${offset}`);
    // API có thể trả về { playlists: [...] } hoặc mảng trực tiếp
    return Array.isArray(res) ? res : (res?.playlists ?? []);
  } catch (error) {
    console.error("Error fetching all playlists:", error); // Improved error logging
    return [];
  }
}

async function fetchArtists(limit = 20, offset = 0) {
  try {
    const res = await httpRequest.get(`${endpoints.artists}?limit=${limit}&offset=${offset}`);
    // API của bạn đang trả về { artists: [...] }
    return Array.isArray(res) ? res : (res?.artists ?? []);
  } catch (_) {
    return [];
  }
}

// Render
// async function renderTodaysBiggestHits() {
//   const container = document.querySelector(".hits-grid");
//   if (!container) return;

//   container.innerHTML = ""; // clear mẫu tĩnh
//   const playlists = await fetchPlaylists(20, 0);
//   // Lấy 6 cái đầu để đúng layout như ảnh yêu cầu
//   playlists.slice(0, 6).forEach((pl) => container.appendChild(createHitCard(pl)));
// }

let POPULAR = [];
async function renderPopularArtists() {
  const c = document.querySelector(".artists-grid"); if (!c) return;
  POPULAR = (await fetchArtists(20, 0)).slice(0, 5);
  c.innerHTML = "";
  POPULAR.forEach((a, i) => { const card = createArtistCard(a); card.dataset.i = i; c.appendChild(card); });
  c.onclick = (e) => { const el = e.target.closest(".artist-card"); if (!el) return; updateArtistHero(POPULAR[+el.dataset.i]); };
  if (POPULAR.length) updateArtistHero(POPULAR[0]); // auto fill hero
}

document.addEventListener("DOMContentLoaded", () => {
  // gọi cùng lúc, không chờ nhau
  // renderTodaysBiggestHits(); // Tạm thời comment do lỗi 404
  renderPopularArtists();

  // Get DOM elements for sections
  const hitsSection = document.getElementById("hits-section");
  const artistsSection = document.getElementById("artists-section");
  const artistDetailsSection = document.getElementById("artist-details-section");
  const artistControlsSection = document.getElementById("artist-controls-section");
  const popularTracksSection = document.getElementById("popular-tracks-section");
  const homeBtn = document.querySelector(".home-btn");

  // Event listener for playlist cards
  const hitsGrid = document.querySelector(".hits-grid");
  if (hitsGrid) {
    hitsGrid.addEventListener("click", (e) => {
      const playlistCard = e.target.closest(".hit-card");
      if (playlistCard) {
        const playlistId = playlistCard.dataset.id;
        window.location.href = `details.html?playlistId=${playlistId}`;
      }
    });
  }

  // Ẩn artist và show Home
  function showHomeSections() {
    hitsSection.style.display = "block";
    artistsSection.style.display = "block";
    artistDetailsSection.style.display = "none";
    artistControlsSection.style.display = "none";
    popularTracksSection.style.display = "none";
  }

  // Show artist và ẩn home
  function showArtistDetailsSections() {
    hitsSection.style.display = "none";
    artistsSection.style.display = "none";
    artistDetailsSection.style.display = "block";
    artistControlsSection.style.display = "block";
    popularTracksSection.style.display = "block";
  }

  // Initial call to show home sections
  showHomeSections();

  // Xử lý khi ấn popular artist
  const artistGrids = document.querySelector(".artists-grid");
  if (artistGrids) {
    artistGrids.addEventListener("click", async (e) => {
      const artistCard = e.target.closest(".artist-card");
      if (artistCard) {
        const artistId = artistCard.dataset.id;
        showArtistDetailsSections();
        await fetchAndRenderArtistDetails(artistId);
      }
    });
  }

  // Xử lý nút home
  if (homeBtn) {
    homeBtn.addEventListener("click", showHomeSections);
  }

  // Fetch và render dữ liệu nghệ sĩ 
  async function fetchAndRenderArtistDetails(artistId) {
    try {
      const artist = await httpRequest.get(endpoints.artistsById(artistId));
      updateArtistHero(artist);

      let popularTracks = await httpRequest.get(endpoints.artistTopTracks(artistId));

      // If artist-specific top tracks are empty, fetch general popular tracks as a fallback
      if (!popularTracks || popularTracks.length === 0) {
          console.warn("No artist-specific top tracks found. Fetching general popular tracks.");
          const generalPopularTracksResponse = await httpRequest.get(`${endpoints.tracks}/popular?limit=10`);
          popularTracks = Array.isArray(generalPopularTracksResponse) ? generalPopularTracksResponse : (generalPopularTracksResponse?.tracks ?? []);
      }

      renderPopularTracks(Array.isArray(popularTracks) ? popularTracks : (popularTracks?.tracks ?? []));

    } catch (error) {
      console.error("Error fetching artist details:", error);
      toast({ text: "Failed to load artist details.", type: "error" });
      showHomeSections(); // Fallback to home if error
    }
  }

  // Render Popular tracks
  function renderPopularTracks(tracks) {
    console.log("Tracks received (after fallback):", tracks);
    if (tracks.length > 0) {
      console.log("First track (after fallback):", tracks[0]);
    }
    const trackListContainer = document.querySelector("#popular-tracks-section .track-list");
    if (!trackListContainer) return;

    trackListContainer.innerHTML = "";

    tracks.forEach((track, index) => {
      const trackItem = document.createElement("div");
      trackItem.className = "track-item";
      trackItem.innerHTML = `
        <div class="track-number">${index + 1}</div>
        <div class="track-image">
          <img src="${imgOrPlaceholder(track.image_url, 40)}" alt="${safeText(track.name)}" />
        </div>
        <div class="track-info">
          <div class="track-name">${safeText(track.name)}</div>
        </div>
        <div class="track-plays">${Number(track.play_count || 0).toLocaleString("en-US")}</div>
        <div class="track-duration">${track.duration || "0:00"}</div>
        <button class="track-menu-btn">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      `;
      trackListContainer.appendChild(trackItem);
    });
  }
});