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

let SITE = {};
let ALL = [];
let galleryRendered = false;

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function prettyTag(tag){
  const map = { trip:"Trip", date:"Date", funny:"Funny", milestone:"Milestone" };
  return map[tag] || "Memory";
}
function typeIcon(type){ return type === "video" ? "🎥" : "📸"; }

/* ---------------- Lightbox ---------------- */
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

/* ---------------- Views ---------------- */
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

  if(!galleryRendered){
    renderGallery(ALL);
    galleryRendered = true;
  }
}
modeTimeline.addEventListener("click", showTimeline);
modeGallery.addEventListener("click", showGallery);

/* ---------------- Card HTML ---------------- */
function cardHTML(m){
  const pill = `${typeIcon(m.type)} ${prettyTag(m.tag)} • ${m.month} ${m.year}`;

  const thumbHTML = (m.type === "video")
    ? `<div class="thumb" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, rgba(122,166,255,.18), rgba(167,139,250,.12));">
         <div style="text-align:center;">
           <div style="font-size:42px;line-height:1;">🎥</div>
           <div style="margin-top:6px;color:rgba(255,255,255,.75);font-size:12px;">Tap to play</div>
         </div>
       </div>`
    : `<img class="thumb" src="${m.src}" alt="${m.title || "memory"}" loading="lazy" />`;

  return `
    ${thumbHTML}
    <div class="card-body">
      <span class="pill">${pill}</span>
      <h3>${m.title || ""}</h3>
      <p>${m.preview || ""}</p>
    </div>
  `;
}

/* ---------------- Reveal (stagger) ---------------- */
function revealStagger(root){
  const groups = root.querySelectorAll(".month-grid, .grid");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;

      const cards = Array.from(entry.target.querySelectorAll(".card"));
      cards.forEach((c, i) => {
        c.style.transitionDelay = `${Math.min(i * 60, 420)}ms`;
        c.classList.add("show");
      });

      io.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  groups.forEach(g => io.observe(g));
}

/* ---------------- Smart portrait/landscape ---------------- */
function markLandscapeCards(root=document){
  root.querySelectorAll("img.thumb").forEach(img => {
    const mark = () => {
      const card = img.closest(".card");
      if(!card) return;
      if(img.naturalWidth > img.naturalHeight) card.classList.add("landscape");
    };
    if(img.complete) mark();
    else img.addEventListener("load", mark, { once:true });
  });
}

/* ---------------- Roadmap progress fill ---------------- */
let progressBound = false;

function updateRoadmapProgress(){
  const grids = Array.from(document.querySelectorAll(".month-grid"));
  if(!grids.length) return;

  const vh = window.innerHeight;

  grids.forEach(g => {
    const r = g.getBoundingClientRect();
    const start = vh * 0.85;   // starts filling
    const end   = vh * 0.15;   // near-complete

    const t = (start - r.top) / (start - end); // 0..1
    const clamped = Math.max(0, Math.min(1, t));
    g.style.setProperty("--progress", `${Math.round(clamped * 100)}%`);
  });
}

function bindRoadmapProgress(){
  if(progressBound) return;
  progressBound = true;

  updateRoadmapProgress();
  window.addEventListener("scroll", updateRoadmapProgress, { passive:true });
  window.addEventListener("resize", updateRoadmapProgress);
}

/* ---------------- Timeline render ---------------- */
function renderTimeline(items){
  timelineEl.innerHTML = "";

  const byYear = new Map();
  for(const m of items){
    if(!byYear.has(m.year)) byYear.set(m.year, []);
    byYear.get(m.year).push(m);
  }

  const years = Array.from(byYear.keys()).sort((a,b) => b-a);

  for(const y of years){
    const yearBox = document.createElement("div");
    yearBox.className = "year";

    const head = document.createElement("div");
    head.className = "year-head";
    head.innerHTML = `<h2 class="year-title">${y}</h2>
                      <span style="color:rgba(255,255,255,.65);font-size:13px;">${byYear.get(y).length} items</span>`;
    yearBox.appendChild(head);

    const list = byYear.get(y);

    const byMonth = new Map();
    for(const m of list){
      const mon = m.month || "Unknown";
      if(!byMonth.has(mon)) byMonth.set(mon, []);
      byMonth.get(mon).push(m);
    }

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
    }

    timelineEl.appendChild(yearBox);
  }

  markLandscapeCards(timelineEl);
  revealStagger(timelineEl);

  // progress should update after DOM paint
  requestAnimationFrame(updateRoadmapProgress);
  bindRoadmapProgress();
}

/* ---------------- Gallery render ---------------- */
function renderGallery(items){
  grid.innerHTML = "";
  items.forEach(m => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = cardHTML(m);
    card.addEventListener("click", () => openLightbox(m));
    grid.appendChild(card);
  });

  markLandscapeCards(grid);
  revealStagger(galleryView);
}

/* ---------------- Filters ---------------- */
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
  if(!galleryRendered) showGallery();
  renderGallery(items);
  metaCount.textContent = `${items.length} memories`;
}

searchT.addEventListener("input", applyTimelineFilters);
filterT.addEventListener("change", applyTimelineFilters);
searchG.addEventListener("input", applyGalleryFilters);
filterG.addEventListener("change", applyGalleryFilters);

/* ---------------- Music ---------------- */
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

/* ---------------- PIN ---------------- */
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

/* ---------------- Init ---------------- */
(async function init(){
  const res = await fetch("memories.json", { cache: "no-store" });
  const data = await res.json();

  SITE = data.site || {};
  ALL = (data.items || []).slice();

  // Sort: year desc then month desc (calendar)
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

  letterTitle.textContent = SITE.letterTitle || "To my favorite person ✨";
  letterBody.textContent = SITE.letterBody || "";
  letterSign.textContent = SITE.letterSign || "— Yours";

  const lockTitle = document.querySelector(".lock-title");
  if(lockTitle) lockTitle.innerHTML = `For <span class="accent">${SITE.herName || "My Love"}</span> ✨`;

  showTimeline();
  renderTimeline(ALL);

  if(sessionStorage.getItem("opened") === "1"){
    lock.classList.add("hidden");
  }
})();
