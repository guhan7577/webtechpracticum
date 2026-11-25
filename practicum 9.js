/* =========================================================
   NovaMotion Robotics - script.js

   OBJECTIVE:
   Develop meaningful animated sequences within the existing industry-specific
   website. Animations should respond to user interactions, such as button clicks,
   displaying information cards, notifications, and opening or closing content
   sections.
   ========================================================= */

/* ===== Animations & interactions ===== */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 1. Scroll reveal: elements fade up when they enter the screen */
  var targets = $$(".section-head, .card, .gallery figure, .app-item, .benefits, .media-box, .table-wrap, .form-box, .explore-card, .acc-item");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var el = entry.target;
        el.classList.remove("reveal-pending");
        el.classList.add("reveal-in");
        io.unobserve(el);
        setTimeout(function () { el.classList.remove("reveal-in"); }, 1200);
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el, i) {
      el.classList.add("reveal-pending");
      el.style.animationDelay = (i % 4) * 90 + "ms";
      io.observe(el);
    });
  }

  /* 2. Button click feedback (pop animation) */
  $$(".btn, .acc-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.classList.add("clicked");
      setTimeout(function () { btn.classList.remove("clicked"); }, 450);
    });
  });

  /* 3. Information cards: open / close with "Show details" */
  $$(".toggle-info").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".explore-card");
      var open = card.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Hide details" : "Show details";
    });
  });

  /* 4. Accordion: open / close content sections */
  $$(".acc-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".acc-item");
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* 5. Notifications (toast): slide in, then slide out after 3 seconds */
  var stack = $("#toast-stack");
  var icons = { success: "\u2714", info: "\u2139", warn: "\u26A0" };
  function showToast(message, type) {
    var toast = document.createElement("div");
    toast.className = "toast " + (type || "info");
    var icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.textContent = icons[type] || icons.info;
    var text = document.createElement("span");
    text.textContent = message;
    toast.appendChild(icon);
    toast.appendChild(text);
    stack.appendChild(toast);
    setTimeout(function () { toast.classList.add("show"); }, 30);
    setTimeout(function () { toast.classList.remove("show"); }, 3200);
    setTimeout(function () { if (toast.parentNode) { toast.parentNode.removeChild(toast); } }, 3700);
  }
  $$(".notify-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showToast(btn.getAttribute("data-msg"), btn.getAttribute("data-type"));
    });
  });

  /* 6. Popup card (modal): open / close */
  var modal = $("#modal");
  var lastFocus = null;
  function openModal(card) {
    lastFocus = document.activeElement;
    $("#modal-img").src = $("img", card).src;
    $("#modal-img").alt = $("img", card).alt;
    $("#modal-title").textContent = card.getAttribute("data-title");
    $("#modal-text").textContent = card.getAttribute("data-text");
    var chips = $("#modal-chips");
    chips.innerHTML = "";
    $$(".chip", card).forEach(function (c) {
      var s = document.createElement("span");
      s.className = "chip";
      s.textContent = c.textContent;
      chips.appendChild(s);
    });
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(function () { $(".modal-close", modal).focus(); }, 50);
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (lastFocus) { lastFocus.focus(); }
  }
  $$(".quick-view").forEach(function (btn) {
    btn.addEventListener("click", function () { openModal(btn.closest(".explore-card")); });
  });
  $(".modal-close", modal).addEventListener("click", closeModal);
  $("#modal-cta").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) { closeModal(); } });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) { closeModal(); }
  });

  /* 7. Enquiry form: show a notification when the form is valid and submitted */
  var form = $(".form-box");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast("Thank you! Your request has been submitted.", "success");
      form.reset();
    });
  }
})();