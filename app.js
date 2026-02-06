const grid = document.getElementById("grid");
const searchEl = document.getElementById("search");
const filterEl = document.getElementById("filter");

const herNameEl = document.getElementById("herName");
const topLineEl = document.getElementById("topLine");
const closingLineEl = document.getElementById("closingLine");

const metaCount = document.getElementById("metaCount");
const metaUpdated = document.getElementById("metaUpdated");

const lb = document.getElementById("lightbox");
const lbBackdrop = document.getElementById("lbBackdrop");
const lbClose = document.getElementById("lbClose");
const lbImg = document.getElementById("lbImg");
const lbVideo = document.getElementById("lbVideo");
const lbPill = document.getElementById("lbPill");
const lbTitle = document.getElementById("lbTitle");
const lbDate = document.getElementById("lbDate");
const lbStory = document.getElementById("lbStory");

const heartsWrap = document.getElementById("hearts");
const toggleHeartsBtn = document.getElementById("toggleHearts");

let ALL = [];

function prettyTag(tag){
  const map = { trip:"Trip", date:"Date", funny:"Funny", milestone:"Milestone" };
  return map[tag] || "Memory";
}
function typeIcon(type){
  return type === "video" ? "🎥" : "📸";
}

function escapeHTML(str){
  return (str ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function openLightbox(item){
  lb.classList.add("show");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  lbPill.textContent = `${typeIcon(item.type)} ${prettyTag(item.tag)}`;
  lbTitle.textContent = item.title || "";
  lbDate.textContent = item.date || "";
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

function render(items){
  grid.innerHTML = "";

  items.forEach((m) => {
    const card = document.createElement("article");
    card.className = "card";

    const title = escapeHTML(m.title);
    const preview = escapeHTML(m.preview);
    const pill = `${typeIcon(m.type)} ${prettyTag(m.tag)}`;

    // Video thumb: we still show a poster-like box using the first frame is not reliable on GH pages,
    // so we show a gradient + icon for video.
    const thumbHTML = (m.type === "video")
      ? `<div class="thumb" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, rgba(124,92,255,.28), rgba(255,79,161,.22));">
           <div style="text-align:center;">
             <div style="font-size:44px;line-height:1;">🎥</div>
             <div style="margin-top:6px;color:rgba(255,255,255,.8);font-size:12px;">Tap to play</div>
           </div>
         </div>`
      : `<img class="thumb" src="${m.src}" alt="${title}" loading="lazy" />`;

    card.innerHTML = `
      ${thumbHTML}
      <div class="card-body">
        <span class="pill">${pill} <span class="mini">• ${escapeHTML(m.date)}</span></span>
        <h3>${title}</h3>
        <p>${preview}</p>
      </div>
    `;

    card.addEventListener("click", () => openLightbox(m));
    grid.appendChild(card);
  });

  // reveal animation (classic)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) e.target.classList.add("show");
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".card").forEach(c => io.observe(c));
}

function applyFilters(){
  const q = (searchEl.value || "").toLowerCase().trim();
  const f = filterEl.value;

  const filtered = ALL.filter(m => {
    const matchFilter = (f === "all")
      ? true
      : (f === "image" || f === "video")
        ? m.type === f
        : m.tag === f;

    const hay = `${m.title} ${m.preview} ${m.story} ${m.date} ${m.tag} ${m.type}`.toLowerCase();
    const matchQuery = q ? hay.includes(q) : true;

    return matchFilter && matchQuery;
  });

  render(filtered);
  metaCount.textContent = `${filtered.length} memories`;
}

function spawnHearts(){
  if(!heartsWrap.classList.contains("on")) return;

  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = Math.random() > 0.5 ? "❤️" : "💖";

  const left = Math.random() * 100;
  const dur = 6 + Math.random() * 5; // seconds
  const size = 14 + Math.random() * 18;

  heart.style.left = `${left}vw`;
  heart.style.bottom = `-20px`;
  heart.style.fontSize = `${size}px`;
  heart.style.animationDuration = `${dur}s`;

  heartsWrap.appendChild(heart);
  setTimeout(() => heart.remove(), dur * 1000);
}

toggleHeartsBtn.addEventListener("click", () => {
  heartsWrap.classList.toggle("on");
});

lbBackdrop.addEventListener("click", closeLightbox);
lbClose.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeLightbox();
});

// load data
(async function init(){
  const res = await fetch("memories.json", { cache: "no-store" });
  const data = await res.json();

  herNameEl.textContent = data.site?.herName || "My Love";
  topLineEl.textContent = data.site?.topLine || "";
  closingLineEl.textContent = data.site?.closingLine || "";
  metaUpdated.textContent = data.site?.updated ? `updated ${data.site.updated}` : "updated";

  ALL = (data.items || []).slice().reverse(); // latest first
  metaCount.textContent = `${ALL.length} memories`;

  render(ALL);

  searchEl.addEventListener("input", applyFilters);
  filterEl.addEventListener("change", applyFilters);

  // hearts loop
  setInterval(spawnHearts, 550);
})();
