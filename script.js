const config = window.WEDDING_CONFIG;

const setConfigFields = () => {
  document.querySelectorAll("[data-field]").forEach((el) => {
    const value = config[el.dataset.field];
    if (value !== undefined) el.innerHTML = value;
  });
  document.getElementById("hero-image").src = config.heroImage;
  document.title = `${config.groomName} · ${config.brideName} 결혼합니다`;
};

const renderCalendar = () => {
  const wedding = new Date(config.weddingDate);
  const year = wedding.getFullYear();
  const month = wedding.getMonth();
  const targetDay = wedding.getDate();
  const calendar = document.getElementById("calendar");
  const names = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  calendar.innerHTML = names.map((name, index) => `<div class="day-name ${index === 0 ? "sun" : ""}">${name}</div>`).join("");
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  calendar.insertAdjacentHTML("beforeend", "<div></div>".repeat(firstDay));
  for (let day = 1; day <= lastDate; day += 1) {
    const dayOfWeek = new Date(year, month, day).getDay();
    const classes = [dayOfWeek === 0 ? "sun" : "", day === targetDay ? "wedding-day" : ""].filter(Boolean).join(" ");
    calendar.insertAdjacentHTML("beforeend", `<div class="${classes}">${day}</div>`);
  }
  const remaining = Math.ceil((wedding - new Date()) / 86400000);
  document.getElementById("d-day").textContent = remaining > 0 ? `D-${remaining}` : remaining === 0 ? "D-DAY" : `D+${Math.abs(remaining)}`;
};

const renderGallery = () => {
  const gallery = document.getElementById("gallery");
  config.gallery.forEach((photo, index) => {
    gallery.insertAdjacentHTML("beforeend", `<button type="button" class="${index > 5 ? "hidden" : ""}" data-index="${index}" aria-label="웨딩 사진 ${index + 1} 크게 보기"><img src="${photo.src}" style="object-position:${photo.position || "50% 50%"}" alt="웨딩 사진 ${index + 1}" loading="${index > 2 ? "lazy" : "eager"}"></button>`);
  });
  if (config.gallery.length <= 6) document.getElementById("gallery-more").hidden = true;
  gallery.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    document.getElementById("modal-image").src = config.gallery[Number(button.dataset.index)].src;
    document.getElementById("photo-modal").showModal();
  });
  document.getElementById("gallery-more").addEventListener("click", (event) => {
    const hidden = gallery.querySelectorAll(".hidden");
    hidden.forEach((item) => item.classList.remove("hidden"));
    event.currentTarget.hidden = true;
  });
  document.getElementById("modal-close").addEventListener("click", () => document.getElementById("photo-modal").close());
};

const renderAccounts = () => {
  const wrapper = document.getElementById("account-groups");
  config.accounts.forEach((group, groupIndex) => {
    const rows = group.people.map((person) => `<div class="account-item"><p><small>${person.relation} ${person.name}</small><br>${person.bank} ${person.number}</p><button class="copy-account" type="button" data-account="${person.number}">복사</button></div>`).join("");
    wrapper.insertAdjacentHTML("beforeend", `<div class="account-group"><button class="account-toggle" type="button" aria-expanded="false" aria-controls="accounts-${groupIndex}"><span>${group.label}</span><span>⌄</span></button><div id="accounts-${groupIndex}" class="account-list">${rows}</div></div>`);
  });
  wrapper.addEventListener("click", async (event) => {
    const toggle = event.target.closest(".account-toggle");
    if (toggle) {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      document.getElementById(toggle.getAttribute("aria-controls")).classList.toggle("open", !expanded);
    }
    const copyButton = event.target.closest(".copy-account");
    if (copyButton) await copyText(copyButton.dataset.account, "계좌번호를 복사했습니다.");
  });
};

const setupMap = () => {
  const { latitude: lat, longitude: lon, venueName, venueAddress } = config;
  const delta = 0.006;
  document.getElementById("map-iframe").src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-delta}%2C${lat-delta}%2C${lon+delta}%2C${lat+delta}&layer=mapnik&marker=${lat}%2C${lon}`;
  document.getElementById("kakao-map").href = config.kakaoMapUrl || `https://map.kakao.com/?q=${encodeURIComponent(venueName)}`;
  document.getElementById("naver-map").href = config.naverMapUrl || `https://map.naver.com/v5/search/${encodeURIComponent(venueAddress)}`;
  document.getElementById("tmap").href = `tmap://route?rGoName=${encodeURIComponent(venueName)}&rGoX=${lon}&rGoY=${lat}`;
};

const showToast = (message) => {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
};

const copyText = async (text, message) => {
  try { await navigator.clipboard.writeText(text); }
  catch { const input = document.createElement("textarea"); input.value = text; document.body.appendChild(input); input.select(); document.execCommand("copy"); input.remove(); }
  showToast(message);
};

const setupShare = () => {
  const shareUrl = config.publicUrl || location.href;
  const shareData = { title: document.title, text: `${config.dateText} · ${config.venueName}`, url: shareUrl };
  document.getElementById("copy-url").addEventListener("click", () => copyText(shareUrl, "초대장 링크를 복사했습니다."));
  document.getElementById("share-kakao").addEventListener("click", async () => {
    if (config.kakaoJavascriptKey && window.Kakao) {
      if (!Kakao.isInitialized()) Kakao.init(config.kakaoJavascriptKey);
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: `${config.groomName} · ${config.brideName} 결혼합니다`,
          description: `${config.dateText}\n${config.venueName} ${config.venueHall}`,
          imageUrl: config.shareImageUrl || new URL(config.heroImage, shareUrl).href,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl }
        },
        buttons: [{ title: "모바일 청첩장 보기", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }]
      });
      return;
    }
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
      return;
    }
    await copyText(shareUrl, "링크를 복사했습니다. 카카오톡에 붙여넣어 주세요.");
  });
  document.getElementById("share-native").addEventListener("click", async () => {
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
    } else {
      await copyText(shareUrl, "초대장 링크를 복사했습니다.");
    }
  });
};

const setupReveals = () => {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
};

setConfigFields();
renderCalendar();
renderGallery();
renderAccounts();
setupMap();
setupShare();
setupReveals();
