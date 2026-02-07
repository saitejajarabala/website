// ===== Elements =====
const lock = document.getElementById("lock");
const pinInput = document.getElementById("pin");
const unlockBtn = document.getElementById("unlockBtn");
const lockHint = document.getElementById("lockHint");

const herNameEl = document.getElementById("herName");
const topLineEl = document.getElementById("topLine");
const metaCount = document.getElementById("metaCount");
const metaUpdated = document.getElementById("metaUpdated");

const searchT = document.getElementById("searchT");
const filterT = document.getElementById("filterT");

const letterTitle = document.getElementById("letterTitle");
const letterBody = document.getElementById("letterBody");
const letterSign = document.getElementById("letterSign");

const lb = document.getElementById("lightbox");
const lbBackdrop = document.getElementById("lbBackdrop");
const lbClose = document.getElementById("lbClose");
const lbImg = document.getElementById("lbImg");
const lbVideo = document.getElementById("lbVideo");
const lbPill = document.getElementById("lbPill");
const lbTitle = document.getElementById("lbTitle");
const lbDate = document.getElementById("lbDate");
const lbStory = document.getElementById("lbStory");

const audio = document.getElementById("audio");
const musicBtn = document.getElementById("musicBtn");
const musicIcon = document.getElementById("musicIcon");

const heartsWrap = document.getElementById("hearts");

const timelineEl = document.getElementById("timeline");
const slidesEl = document.getElementById("slides");
const railFill = document.getElementById("railFill");

let SITE = {};
let ALL = [];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ===== Helpers =====
function prettyTag(tag){
  const map = { trip:"Trip", date:"Date", funny:"Funny", milestone:"Milestone" };
  return map[tag] || "Memory";
}
function typeIcon(type){ return type === "video" ? "🎥" : "📸"; }

function openLightbox(item){
  lb.classList.add("show");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  lbPill.textContent = `${typeIcon(item.type)} ${prettyTag(item.tag)}`;
  lbTitle.textContent = item.title || "";
  lbDate.textContent = `${item.month} ${item.year}`;
  lbStory.textContent = item.story || "";

  lbImg.style.display = "none";
  lbVideo.style.display = "none";
  lbVideo.pause();
  lbVideo.removeAttribute("src");
  lbVideo.load();

  if(item.type === "video"){
    lbVideo.style.display = "block";
    lbVideo.src = item.src;
  } else {
    lbImg.style.display = "block";
    lbImg.src = item.src;
    lbImg.alt = item.title || "memory";
  }
}

function closeLightbox(){
  lb.classList.remove("show");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lbVideo.pause();
}

lbBackdrop.addEventListener("click", closeLightbox);
lbClose.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => { if(e.key === "Escape") closeLightbox(); });

// ===== Filters =====
function filterItems(q, f){
  q = (q || "").toLowerCase().trim();

  return ALL.filter(m => {
    const matchFilter = (f === "all")
      ? true
      : (f === "image" || f === "video")
        ? m.type === f
        : m.tag === f;

    const hay = `${m.title} ${m.preview} ${m.story} ${m.year} ${m.month} ${m.tag} ${m.type}`.toLowerCase();
    const matchQ = q ? hay.includes(q) : true;

    return matchFilter && matchQ;
  });
}

function applyTimelineFilters(){
  const items = filterItems(searchT.value, filterT.value);
  renderTimeline(items);
  metaCount.textContent = `${items.length} memories`;
}

searchT.addEventListener("input", applyTimelineFilters);
filterT.addEventListener("change", applyTimelineFilters);

// ===== Music =====
musicBtn.addEventListener("click", async () => {
  try{
    if(!audio.src) audio.src = SITE.audioSrc || "";
    if(!audio.src) return;

    if(audio.paused){
      await audio.play();
      musicIcon.textContent = "⏸";
    } else {
      audio.pause();
      musicIcon.textContent = "▶";
    }
  } catch(e){
    alert("Tap again to allow audio playback.");
  }
});

// ===== Hearts =====
function spawnHearts(){
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = Math.random() > 0.5 ? "❤️" : "💖";

  const left = Math.random() * 100;
  const dur = 6 + Math.random() * 5;
  const size = 14 + Math.random() * 18;

  heart.style.left = `${left}vw`;
  heart.style.bottom = `-20px`;
  heart.style.fontSize = `${size}px`;
  heart.style.animationDuration = `${dur}s`;

  heartsWrap.appendChild(heart);
  setTimeout(() => heart.remove(), dur * 1000);
}
setInterval(spawnHearts, 650);

// ===== PIN =====
function unlockIfCorrect(){
  const entered = (pinInput.value || "").trim();
  if(entered === SITE.pin){
    sessionStorage.setItem("opened", "1");
    lock.classList.add("hidden");
    pinInput.value = "";
    lockHint.textContent = "";
    return;
  }
  lockHint.textContent = "Wrong PIN 🙂";
}
unlockBtn.addEventListener("click", unlockIfCorrect);
pinInput.addEventListener("keydown", (e) => { if(e.key === "Enter") unlockIfCorrect(); });

// ===== Cinematic Render =====
function renderTimeline(items){
  timelineEl.innerHTML = "";

  items.forEach((m, idx) => {
    const slide = document.createElement("section");
    slide.className = "slide";
    slide.dataset.index = String(idx);

    const pill = `${typeIcon(m.type)} ${prettyTag(m.tag)}`;
    const when = `${m.month} ${m.year}`;

    const mediaHTML = (m.type === "video")
      ? `<video class="parallax" muted playsinline preload="metadata" src="${m.src}"></video>`
      : `<img class="parallax" src="${m.src}" alt="${m.title}" loading="lazy" />`;

    slide.innerHTML = `
      <article class="cine-card">
        <div class="cine-media">
          ${mediaHTML}
          <div class="cine-overlay">
            <span class="cine-pill">${pill}</span>
            <span class="cine-pill">${when}</span>
          </div>
        </div>
        <div class="cine-body">
          <h3 class="cine-title">${m.title}</h3>
          <div class="cine-date">${when}</div>
          <p class="cine-preview">${m.preview || ""}</p>
        </div>
      </article>
    `;

    slide.querySelector(".cine-card").addEventListener("click", () => openLightbox(m));
    timelineEl.appendChild(slide);
  });

  setupCinematicScroll();
}

function setupCinematicScroll(){
  const slides = Array.from(timelineEl.querySelectorAll(".slide"));
  if(!slides.length){
    railFill.style.height = "0%";
    return;
  }

  // reveal first
  requestAnimationFrame(() => {
    const first = slides[0].querySelector(".cine-card");
    if(first) first.classList.add("show");
  });

  // intersection observer to reveal + update rail + play/pause video
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(!e.isIntersecting) return;

      const card = e.target.querySelector(".cine-card");
      if(card) card.classList.add("show");

      const idx = Number(e.target.dataset.index || 0);
      const pct = slides.length <= 1 ? 100 : (idx / (slides.length - 1)) * 100;
      railFill.style.height = `${pct}%`;

      slides.forEach(s => {
        const v = s.querySelector("video");
        if(!v) return;
        if(s === e.target){
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    });
  }, { threshold: 0.55 });

  slides.forEach(s => io.observe(s));

  // parallax on scroll inside slides container
  const scroller = slidesEl;
  const parallaxTick = () => {
    const rect = scroller.getBoundingClientRect();
    slides.forEach(s => {
      const media = s.querySelector(".parallax");
      if(!media) return;

      const sr = s.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = (sr.top + sr.height/2) - center;
      const translate = Math.max(-18, Math.min(18, dist * 0.03));
      media.style.setProperty("--py", `${translate}px`);
    });
  };

  scroller.addEventListener("scroll", () => requestAnimationFrame(parallaxTick));
  requestAnimationFrame(parallaxTick);
}

// ===== Init =====
(async function init(){
  const res = await fetch("memories.json", { cache: "no-store" });
  const data = await res.json();

  SITE = data.site || {};
  ALL = (data.items || []).slice();

  // sort by time (latest first)
  ALL.sort((a,b) => {
    const ay = a.year ?? 0, by = b.year ?? 0;
    if(by !== ay) return by - ay;
    const am = MONTHS.indexOf(a.month), bm = MONTHS.indexOf(b.month);
    return bm - am;
  });

  herNameEl.textContent = SITE.herName || "My Love";
  topLineEl.textContent = SITE.topLine || "";
  metaUpdated.textContent = SITE.updated ? `updated ${SITE.updated}` : "updated";
  metaCount.textContent = `${ALL.length} memories`;

  letterTitle.textContent = SITE.letterTitle || "To my favorite person ❤️";
  letterBody.textContent = SITE.letterBody || "";
  letterSign.textContent = SITE.letterSign || "— Yours";

  // set lock title
  const lockTitle = document.querySelector(".lock-title");
  if(lockTitle) lockTitle.innerHTML = `For <span class="accent">${SITE.herName || "My Love"}</span> ❤️`;

  // render roadmap
  renderTimeline(ALL);

  // lock gate
  if(sessionStorage.getItem("opened") === "1"){
    lock.classList.add("hidden");
  }
})();
