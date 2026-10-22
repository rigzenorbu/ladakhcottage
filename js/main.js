// Gyapthago Heritage Home — small enhancements
(function () {
  var PHONE = "919186191323";

  function waLink(text) {
    return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);
  }

  // Mobile menu
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  document.querySelectorAll(".nav__links a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Prefilled WhatsApp messages on option buttons
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waLink("Julley! " + a.dataset.wa);
  });

  // Enquiry form → WhatsApp
  var form = document.getElementById("enquiry");
  var select = document.getElementById("opt-select");
  var mapField = form.querySelector(".js-map");

  function syncFields() {
    mapField.hidden = select.value.indexOf("MAP") === -1;
  }
  select.addEventListener("change", syncFields);
  syncFields();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var v = select.value;
    var lines = [
      "Julley! Booking enquiry for Gyapthago Heritage Home",
      "Name: " + f.name.value,
      "Option: " + v,
      "Date: " + f.date.value
    ];
    lines.push("Nights: " + f.nights.value);
    lines.push("Guests: " + f.guests.value);
    if (!mapField.hidden) {
      lines.push("Meal plan: MAP (breakfast & dinner)" + (f.addLunch.checked ? " + lunch" : ""));
    }
    if (f.note.value.trim()) lines.push("Note: " + f.note.value.trim());
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // Date input: no past dates
  form.elements.date.min = new Date().toISOString().slice(0, 10);

  // Room photo sliders + full-screen viewer
  var box = document.createElement("dialog");
  box.className = "lightbox";
  box.innerHTML =
    '<img alt="">' +
    '<button class="slider__btn slider__btn--prev" aria-label="Previous photo">‹</button>' +
    '<button class="slider__btn slider__btn--next" aria-label="Next photo">›</button>' +
    '<button class="slider__btn lightbox__close" aria-label="Close">×</button>' +
    '<p class="lightbox__count"></p>';
  document.body.appendChild(box);
  var boxImg = box.querySelector("img");
  var boxCount = box.querySelector(".lightbox__count");
  var boxPhotos = [], boxIndex = 0;

  // photos: list of {src, alt} (an <img> works too)
  function showInBox(i) {
    boxIndex = (i + boxPhotos.length) % boxPhotos.length;
    boxImg.src = boxPhotos[boxIndex].src;
    boxImg.alt = boxPhotos[boxIndex].alt;
    var count = boxPhotos.length > 1 ? (boxIndex + 1) + " / " + boxPhotos.length : "";
    boxCount.textContent = [boxImg.alt, count].filter(Boolean).join("  ·  ");
    box.classList.toggle("is-single", boxPhotos.length < 2);
  }
  function openBox(photos, i) {
    boxPhotos = photos;
    showInBox(i);
    box.showModal();
  }
  box.querySelector(".slider__btn--prev").addEventListener("click", function () { showInBox(boxIndex - 1); });
  box.querySelector(".slider__btn--next").addEventListener("click", function () { showInBox(boxIndex + 1); });
  box.querySelector(".lightbox__close").addEventListener("click", function () { box.close(); });
  box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") showInBox(boxIndex - 1);
    if (e.key === "ArrowRight") showInBox(boxIndex + 1);
  });

  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var track = slider.querySelector(".slider__track");
    var photos = Array.prototype.slice.call(track.querySelectorAll("img"));

    photos.forEach(function (img, i) {
      img.addEventListener("click", function () { openBox(photos, i); });
    });
    if (photos.length < 2) return;

    var frame = slider.querySelector(".lwin");
    var prev = document.createElement("button");
    var next = document.createElement("button");
    var count = document.createElement("span");
    var thumbs = document.createElement("div");
    prev.className = "slider__btn slider__btn--prev";
    next.className = "slider__btn slider__btn--next";
    prev.setAttribute("aria-label", "Previous photo");
    next.setAttribute("aria-label", "Next photo");
    prev.textContent = "‹";
    next.textContent = "›";
    count.className = "slider__count";
    thumbs.className = "slider__thumbs";
    frame.append(prev, next, count);
    slider.appendChild(thumbs);

    var current = 0;
    function go(i) {
      i = (i + photos.length) % photos.length;
      track.scrollTo({ left: i * track.clientWidth });
    }
    function mark(i) {
      current = i;
      count.textContent = (i + 1) + " / " + photos.length;
      thumbs.querySelectorAll("button").forEach(function (b, j) {
        b.setAttribute("aria-current", j === i);
      });
    }
    photos.forEach(function (img, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show photo " + (i + 1));
      b.innerHTML = '<img src="' + img.getAttribute("src") + '" alt="" loading="lazy">';
      b.addEventListener("click", function () { go(i); });
      thumbs.appendChild(b);
    });
    prev.addEventListener("click", function () { go(current - 1); });
    next.addEventListener("click", function () { go(current + 1); });
    track.addEventListener("scroll", function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== current) mark(i);
    }, { passive: true });
    mark(0);
  });

  // Photo galleries (home tour, dishes): tap a photo to browse them full screen
  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    var photos = Array.prototype.slice.call(gallery.querySelectorAll("img"));
    photos.forEach(function (img, i) {
      img.addEventListener("click", function () { openBox(photos, i); });
    });
  });

  // Single image links (e.g. the brochure) open in the viewer instead of a new tab
  document.querySelectorAll("[data-zoom]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      openBox([{ src: a.href, alt: a.dataset.zoom }], 0);
    });
  });

  // Reveal on scroll
  var els = document.querySelectorAll(".sec-head, .pillar, .room, .opt, .day li, .lwin, .gal img, .dishes, .gift, .tour__item, .plates figure");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
