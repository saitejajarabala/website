// Elements
const lock = document.getElementById("lock");
const pinInput = document.getElementById("pin");
const unlockBtn = document.getElementById("unlockBtn");
const lockHint = document.getElementById("lockHint");

const herNameEl = document.getElementById("herName");
const topLineEl = document.getElementById("topLine");
const metaCount = document.getElementById("metaCount");
const metaUpdated = document.getElementById("metaUpdated");

const timelineView = document.getElementById("timelineView");
const galleryView = document.getElementById("galleryView");
const timelineEl = document.getElementById("timeline");
const grid = document.getElementById("grid");

const modeTimeline = document.getElementById("modeTimeline");
const modeGallery = document.getElementById("modeGallery");

const searchT = document.getElementById("searchT");
const filterT = document.getElementById("filterT");
const searchG = document.getElementById("searchG");
const filterG = document.getElementById("filterG");

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

let SITE = {};
let ALL = [];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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

  // reset media
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

// Views
function showTimeline(){
  timelineView.classList.remove("hidden");
  galleryView.classList.add("hidden");
  modeTimeline.classList.remove("ghost");
  modeGallery.classList.add("ghost");
}
function showGallery(){
  galleryView.classList.remove("hidden");
  timelineView.classList.add("hidden");
  modeGallery.classList.remove("ghost");
  modeTimeline.classList.add("ghost");
}
modeTimeline.addEventListener("click", showTimeline);
modeGallery.addEventListener("click", showGallery);

// Card builder
function cardHTML(m){
  const pill = `${typeIcon(m.type)} ${prettyTag(m.tag)} • ${m.month} ${m.year}`;

  const thumbHTML = (m.type === "video")
    ? `<div class="thumb" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, rgba(255,47,109,.22), rgba(255,122,166,.18));">
         <div style="text-align:center;">
           <div style="font-size:44px;line-height:1;">🎥</div>
           <div style="margin-top:6px;color:rgba(255,255,255,.8);font-size:12px;">Tap to play</div>
         </div>
       </div>`
    : `<img class="thumb" src="${m.src}" alt="${m.title}" loading="lazy" />`;

  return `
    ${thumbHTML}
    <div class="card-body">
      <span class="pill"><span>${pill}</span></span>
      <h3>${m.title}</h3>
      <p>${m.preview || ""}</p>
    </div>
  `;
}

function revealCards(root){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("show"); });
  }, { threshold: 0.12 });

  root.querySelectorAll(".card").forEach(c => io.observe(c));
}

// Timeline render
function renderTimeline(items){
  timelineEl.innerHTML = "";

  // group by year then month (in calendar order)
  const byYear = new Map();
  for(const m of items){
    if(!byYear.has(m.year)) byYear.set(m.year, []);
    byYear.get(m.year).push(m);
  }

  const years = Array.from(byYear.keys()).sort((a,b) => b-a); // latest year first

  for(const y of years){
    const yearBox = document.createElement("div");
    yearBox.className = "year";

    const head = document.createElement("div");
    head.className = "year-head";
    head.innerHTML = `<h2 class="year-title">${y}</h2><span style="color:rgba(255,255,255,.65);font-size:13px;">${byYear.get(y).length} items</span>`;
    yearBox.appendChild(head);

    const list = byYear.get(y);

    // group by month name
    const byMonth = new Map();
    for(const m of list){
      const mon = m.month || "Unknown";
      if(!byMonth.has(mon)) byMonth.set(mon, []);
      byMonth.get(mon).push(m);
    }

    // month order using MONTHS list
    const months = Array.from(byMonth.keys()).sort((a,b) => MONTHS.indexOf(a) - MONTHS.indexOf(b));

    for(const mon of months){
      const sec = document.createElement("div");
      sec.className = "month";
      sec.innerHTML = `<h3>${mon}</h3><div class="month-grid"></div>`;
      const mg = sec.querySelector(".month-grid");

      byMonth.get(mon).forEach(m => {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = cardHTML(m);
        card.addEventListener("click", () => openLightbox(m));
        mg.appendChild(card);
      });

      yearBox.appendChild(sec);
      revealCards(yearBox);
    }

    timelineEl.appendChild(yearBox);
  }
}

// Gallery render
function renderGallery(items){
  grid.innerHTML = "";
  items.forEach(m => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = cardHTML(m);
    card.addEventListener("click", () => openLightbox(m));
    grid.appendChild(card);
  });
  revealCards(galleryView);
}

// Filters
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
function applyGalleryFilters(){
  const items = filterItems(searchG.value, filterG.value);
  renderGallery(items);
  metaCount.textContent = `${items.length} memories`;
}

searchT.addEventListener("input", applyTimelineFilters);
filterT.addEventListener("change", applyTimelineFilters);
searchG.addEventListener("input", applyGalleryFilters);
filterG.addEventListener("change", applyGalleryFilters);

// Music (requires user click)
musicBtn.addEventListener("click", async () => {
  try{
    if(!audio.src) audio.src = SITE.audioSrc || "";
    if(audio.paused){
      await audio.play();
      musicIcon.textContent = "⏸";
    } else {
      audio.pause();
      musicIcon.textContent = "▶";
    }
  } catch(e){
    // usually autoplay/permission issues
    alert("Tap again to allow audio playback.");
  }
});

// Hearts
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

// PIN (simple + classy; NOT real security)
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

// Init
(async function init(){
  const res = await fetch("memories.json", { cache: "no-store" });
  const data = await res.json();

  SITE = data.site || {};
  ALL = (data.items || []).slice();

  // Sort by time (year desc, month order desc)
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

  // Default: timeline first
  showTimeline();
  renderTimeline(ALL);
  renderGallery(ALL);

  // Lock check
  if(sessionStorage.getItem("opened") === "1"){
    lock.classList.add("hidden");
  } else {
    // set lock title name too
    const lockTitle = document.querySelector(".lock-title");
    if(lockTitle) lockTitle.innerHTML = `For <span class="accent">${SITE.herName || "My Love"}</span> ❤️`;
  }
})();
