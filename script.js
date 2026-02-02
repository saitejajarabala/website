const memories = [
  {
    title: "Our First Picture",
    date: "June 2024",
    image: "images/memory1.jpg",
    story: "This was the moment I realized you were going to be important to me. I still feel the same happiness every time I see this photo."
  },
  {
    title: "That Perfect Day",
    date: "August 2024",
    image: "images/memory2.jpg",
    story: "Nothing special on paper, but everything felt right because I was with you. I wish I could relive this day."
  },
  {
    title: "My Favorite Smile",
    date: "December 2024",
    image: "images/memory3.jpg",
    story: "I saved this because it reminds me how lucky I am. Your smile is still my favorite thing."
  }
];

const gallery = document.getElementById("gallery");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalStory = document.getElementById("modalStory");
const closeBtn = document.getElementById("closeBtn");

memories.forEach(mem => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${mem.image}" />
    <h3>${mem.title}</h3>
  `;
  card.onclick = () => {
    modalImg.src = mem.image;
    modalTitle.textContent = mem.title;
    modalDate.textContent = mem.date;
    modalStory.textContent = mem.story;
    modal.style.display = "block";
  };
  gallery.appendChild(card);
});

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};
