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
  const tmap = document.getElementById("tmap");
  const destination = `rGoName=${encodeURIComponent(venueName)}&rGoX=${lon}&rGoY=${lat}`;
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  tmap.href = isAndroid
    ? `intent://?${destination}#Intent;scheme=tmap;package=com.skt.tmap.ku;S.browser_fallback_url=https%3A%2F%2Fwww.tmapmobility.com%2F;end`
    : `tmap://?${destination}`;
  tmap.addEventListener("click", (event) => {
    if (!isMobile) {
      event.preventDefault();
      showToast("티맵 길찾기는 휴대폰에서 이용해 주세요.");
    }
  });
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

const setupBgm = () => {
  const control = document.getElementById("bgm-control");
  const player = document.getElementById("bgm-player");
  const toggle = document.getElementById("bgm-toggle");
  if (!control || !player || !toggle || !config.bgmVideoId) return;

  const buildSrc = () => {
    const params = new URLSearchParams({
      autoplay: "1",
      playsinline: "1",
      rel: "0"
    });
    if (Number(config.bgmStartSeconds) > 0) params.set("start", String(Number(config.bgmStartSeconds)));
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(config.bgmVideoId)}?${params.toString()}`;
  };

  toggle.addEventListener("click", () => {
    const isPlaying = control.classList.toggle("is-playing");
    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggle.textContent = isPlaying ? "♪ BGM 끄기" : "♪ BGM 켜기";
    player.innerHTML = isPlaying
      ? `<iframe src="${buildSrc()}" title="Die With A Smile 공식 뮤직비디오 배경음악" allow="autoplay; encrypted-media; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
      : "";
  });
};

const setupReveals = () => {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
};

const setupRsvp = () => {
  const modal = document.getElementById("rsvp-modal");
  const form = document.getElementById("rsvp-form");
  document.getElementById("rsvp-open").addEventListener("click", () => modal.showModal());
  document.getElementById("rsvp-close").addEventListener("click", () => modal.close());
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const response = [`[최승호 · 이샘 결혼식 참석 여부]`, `성함: ${data.get("guestName")}`, `구분: ${data.get("side")}`, `참석 여부: ${data.get("attendance")}`, `참석 인원: ${data.get("guests")}`, `예식: ${data.get("session")}`, data.get("note") ? `전하실 말씀: ${data.get("note")}` : ""].filter(Boolean).join("\n");
    modal.close();
    await copyText(response, "참석 응답을 복사했습니다. 신랑·신부에게 전달해 주세요.");
    if (navigator.share) {
      await navigator.share({ title: "결혼식 참석 여부", text: response }).catch(() => {});
    }
  });
};

const setupGuestbook = () => {
  const key = "wedding-tradi-guestbook";
  const form = document.getElementById("guestbook-form");
  const list = document.getElementById("guestbook-list");
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
  const loadEntries = () => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  };
  const renderEntries = () => {
    const entries = loadEntries();
    list.innerHTML = entries.length
      ? entries.map((entry) => `<li><strong>${escapeHtml(entry.name)}</strong><time>${escapeHtml(entry.date)}</time><p>${escapeHtml(entry.message)}</p></li>`).join("")
      : `<li class="guestbook-empty">첫 번째 축하 메시지를 남겨주세요.</li>`;
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("guestbook-name").value.trim();
    const message = document.getElementById("guestbook-message").value.trim();
    if (!name || !message) return;
    const entries = loadEntries();
    entries.unshift({ name, message, date: new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" }).format(new Date()) });
    localStorage.setItem(key, JSON.stringify(entries.slice(0, 30)));
    form.reset();
    renderEntries();
    showToast("축하 메시지를 저장했습니다.");
  });
  renderEntries();
};

setConfigFields();
renderCalendar();
renderGallery();
renderAccounts();
setupMap();
setupShare();
setupBgm();
setupReveals();
setupRsvp();
setupGuestbook();
document.getElementById("to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
