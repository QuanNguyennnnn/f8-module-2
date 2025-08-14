// details.js
import httpRequest from "./utils/httpRequest.js";
import endpoints from "./utils/endpoints.js";
import toast from "./utils/toast.js";

// Ghép URL endpoint an toàn (tuỳ code endpoints của bạn)
const artistDetailUrl = (id) => {
  if (typeof endpoints.artistById === "function") return endpoints.artistById(id);
  if (typeof endpoints.artistsById === "function") return endpoints.artistsById(id);
  return `${endpoints.artists}/${id}`;
};
const artistTopTracksUrl = (id) => {
  if (typeof endpoints.artistTopTracks === "function") return endpoints.artistTopTracks(id);
  return `${endpoints.artists}/${id}/top-tracks`;
};

const toHttps = (u) => (typeof u === "string" ? u.replace(/^http:\/\//i, "https://") : u);

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

function renderArtistTopTracks(topTracks) {
  const list = document.querySelector(".popular-section .track-list");
  if (!list) return;
  list.innerHTML = "";
  const tracks = Array.isArray(topTracks?.items) ? topTracks.items : (topTracks || []);
  tracks.forEach((t, i) => list.appendChild(createTrackRow(t, i + 1)));
}

function createTrackRow(t, index) {
  const wrap = document.createElement("div");
  wrap.className = "track-item";
  const img = t.thumbnail || t.image || t.album?.images?.[0]?.url || "placeholder.svg?height=40&width=40";
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

async function loadArtist() {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artistId");
  if (!artistId) {
    // Không có id → quay về Home
    window.location.replace("index.html");
    return;
  }
  try {
    const [artist, topTracks] = await Promise.all([
      httpRequest.get(artistDetailUrl(artistId)),
      httpRequest.get(artistTopTracksUrl(artistId)),
    ]);
    updateArtistHero(artist);
    renderArtistTopTracks(topTracks);
  } catch (error) {
    console.error(error);
    toast && toast({ text: "Không tải được dữ liệu nghệ sĩ.", type: "error" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Nút Home → về index.html (giữ đúng bố cục ban đầu)
  const homeBtn = document.querySelector(".home-btn");
  if (homeBtn) homeBtn.addEventListener("click", () => { window.location.href = "index.html"; });
  // Tải dữ liệu chi tiết
  loadArtist();
});
