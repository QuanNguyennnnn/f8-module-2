// details.js
import httpRequest from "./httpRequest.js";
import endpoints from "./endpoints.js";
import toast from "./toast.js";

// Ghép URL endpoint an toàn (tuỳ code endpoints của bạn)
const getDetailUrl = (type, id) => {
  if (type === 'artist') {
    if (typeof endpoints.artistById === "function") return endpoints.artistById(id);
    if (typeof endpoints.artistsById === "function") return endpoints.artistsById(id);
    return `${endpoints.artists}/${id}`;
  } else if (type === 'playlist') {
    if (typeof endpoints.playlistsById === "function") return endpoints.playlistsById(id);
    return `${endpoints.playlists}/${id}`;
  }
  return '';
};

const getTracksUrl = (type, id) => {
  if (type === 'artist') {
    if (typeof endpoints.artistTopTracks === "function") return endpoints.artistTopTracks(id);
    return `${endpoints.artists}/${id}/top-tracks`;
  } else if (type === 'playlist') {
    return `${endpoints.playlists}/${id}/tracks`;
  }
  return '';
};

const toHttps = (u) => (typeof u === "string" ? u.replace(/^http:\/\//i, "https://") : u);

function updateHeroSection(data, type) {
  if (!data) return;
  const nameEl = document.querySelector(".hero-name");
  const typeEl = document.querySelector(".hero-type");
  const statsEl = document.querySelector(".hero-stats");
  const descEl = document.querySelector(".hero-description");

  if (type === 'artist') {
    if (nameEl) nameEl.textContent = data.name || "Unknown Artist";
    if (typeEl) typeEl.textContent = "Verified Artist";
    if (statsEl) statsEl.textContent = `${Number(data.monthly_listeners || 0).toLocaleString("en-US")} monthly listeners`;
    if (descEl) descEl.textContent = ''; // Clear description for artists
  } else if (type === 'playlist') {
    if (nameEl) nameEl.textContent = data.name || "Unknown Playlist";
    if (typeEl) typeEl.textContent = `Playlist by ${data.owner?.display_name || 'Unknown'}`;
    if (statsEl) statsEl.textContent = `${Number(data.followers?.total || 0).toLocaleString("en-US")} followers, ${Number(data.tracks?.total || 0).toLocaleString("en-US")} songs`;
    if (descEl) descEl.textContent = data.description || '';
  }

  const url = toHttps(data.background_image_url || data.image_url || data.images?.[0]?.url) || "placeholder.svg";
  const heroBg = document.querySelector(".details-hero");
  if (heroBg) heroBg.style.backgroundImage = `url("${url}")`;
  const heroImg = document.querySelector(".hero-image");
  if (heroImg) { heroImg.src = url; heroImg.alt = data.name || (type === 'artist' ? "Artist" : "Playlist"); }
}

function renderTracks(tracksData, type) {
  const list = document.querySelector(".track-section .track-list");
  const sectionTitle = document.querySelector(".track-section .section-title");
  if (!list || !sectionTitle) return;

  list.innerHTML = "";
  const tracks = Array.isArray(tracksData?.items) ? tracksData.items : (Array.isArray(tracksData?.tracks) ? tracksData.tracks : (tracksData || []));
  if (type === 'playlist') {
    sectionTitle.textContent = "Songs";
    tracks.forEach((item, i) => {
      if (item && item.track) {
        list.appendChild(createTrackRow(item.track, i + 1));
      }
    });
  } else {
    sectionTitle.textContent = "Popular";
    tracks.forEach((t, i) => list.appendChild(createTrackRow(t, i + 1)));
  }
}

function createTrackRow(t, index) {
  const wrap = document.createElement("div");
  wrap.className = "track-item";
  const img = t.thumbnail || t.image || t.album?.images?.[0]?.url || t.images?.[0]?.url || "placeholder.svg?height=40&width=40";
  const name = t.name || t.title || "Unknown";
  const plays = t.playCount || t.play_count || t.streams || 0;
  const durationMs = t.duration_ms ?? t.duration ?? 0;
  wrap.innerHTML = `
    <div class="track-number">${index}</div>
    <div class="track-image"><img src="${img}" alt="${name}"></div>
    <div class="track-info"><div class="track-name">${name}</div></div>
    <div class="track-plays">${Number(plays).toLocaleString("en-US")}</div>
    <div class="track-duration">${formatDuration(durationMs)}</div>
    <button class="track-menu-btn"><i class="fas fa-ellipsis-h"></i></button>
  `;
  return wrap;
}

function formatDuration(ms) {
  const total = Math.floor((ms || 0) / 1000);
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

let detailType = '';
let detailId = '';
let isFollowing = false;
const followBtn = document.querySelector(".follow-btn");

async function checkFollowStatus() {
  if (!detailId) return;
  const userId = localStorage.getItem('userId');
  if (!userId) return; // Cannot check follow status without userId
  try {
    let response;
    if (detailType === 'playlist') {
      response = await httpRequest.get(`${endpoints.playlists}/${detailId}/followers/contains?ids=${userId}`);
    } else if (detailType === 'artist') {
      response = await httpRequest.get(`${endpoints.artists}/${detailId}/followers/contains?ids=${userId}`);
    }
    if (response) {
    isFollowing = response[0];
    updateFollowButton();
    }
  } catch (error) {
    console.error("Error checking follow status:", error);
  }
}

function updateFollowButton() {
  if (!followBtn) return;
  if (isFollowing) {
    followBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Unfollow';
    followBtn.classList.add('following');
  } else {
    followBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Follow';
    followBtn.classList.remove('following');
  }
}

async function toggleFollow() {
  if (!detailId) return;

  try {
    if (isFollowing) {
      if (detailType === 'playlist') {
        await httpRequest.delete(endpoints.playlistUnfollow(detailId));
        toast && toast({ text: "Playlist unfollowed!", type: "success" });
      } else if (detailType === 'artist') {
        await httpRequest.delete(endpoints.artistUnfollow(detailId));
        toast && toast({ text: "Artist unfollowed!", type: "success" });
      }
    } else {
      if (detailType === 'playlist') {
        await httpRequest.post(endpoints.playlistFollow(detailId));
        toast && toast({ text: "Playlist followed!", type: "success" });
      } else if (detailType === 'artist') {
        await httpRequest.put(endpoints.artistFollow(detailId)); // Artist follow uses PUT
        toast && toast({ text: "Artist followed!", type: "success" });
      }
    }
    isFollowing = !isFollowing;
    updateFollowButton();
  } catch (error) {
    console.error("Error toggling follow status:", error);
    toast && toast({ text: "Failed to update follow status.", type: "error" });
  }
}

async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artistId");
  const playlistId = params.get("playlistId");

  if (artistId) {
    detailType = 'artist';
    detailId = artistId;
  } else if (playlistId) {
    detailType = 'playlist';
    detailId = playlistId;
  } else {
    window.location.replace("index.html");
    return;
  }

  // Show/hide follow button based on type
  if (followBtn) {
    if (detailType === 'playlist' || detailType === 'artist') {
      followBtn.style.display = 'inline-block';
      checkFollowStatus();
    } else {
      followBtn.style.display = 'none';
    }
  }

  try {
    const [details, tracksData] = await Promise.all([
      httpRequest.get(getDetailUrl(detailType, detailId)),
      httpRequest.get(getTracksUrl(detailType, detailId)),
    ]);
    updateHeroSection(details, detailType);
    renderTracks(tracksData, detailType);
  } catch (error) {
    console.error(error);
    toast && toast({ text: `Không tải được dữ liệu ${detailType === 'artist' ? 'nghệ sĩ' : 'playlist'}.`, type: "error" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Nút Home → về index.html (giữ đúng bố cục ban đầu)
  const homeBtn = document.querySelector(".home-btn");
  if (homeBtn) homeBtn.addEventListener("click", () => { window.location.href = "index.html"; });

  if (followBtn) followBtn.addEventListener("click", toggleFollow);

  // Tải dữ liệu chi tiết
  loadDetails();
});
