/* =========================================================
   NovaMotion Robotics - script.js

   OBJECTIVE:
   Develop meaningful animated sequences within the existing industry-specific
   website. Animations should respond to user interactions, such as button clicks,
   displaying information cards, notifications, and opening or closing content
   sections.

   OBJECTIVE:
   Develop dynamic webpage interactions to add, modify, display and remove
   industry-specific information using DOM manipulation without reloading the page.

   OBJECTIVE:
   Develop an industry-specific form with appropriate input constraints and
   validation, with error messages and a success message.
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

  /* 7. Enquiry form: constraint validation with error and success messages */
  var form = document.getElementById("enquiry-form");
  if (form) {
    var summary = document.getElementById("form-summary");
    var successBox = document.getElementById("form-success");
    var successText = document.getElementById("form-success-text");
    var details = form.elements.details;
    var resetting = false;

    /* Demo date: tomorrow at the earliest (set from today's date) */
    var d = new Date();
    d.setDate(d.getDate() + 1);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    form.elements.demodate.setAttribute("min", d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()));

    /* Which controls get an error message, and where it is placed */
    var names = ["fullname", "email", "phone", "password", "company", "industry", "quantity",
                 "demodate", "enquirytype", "robots", "details", "spec", "terms"];
    var groupOf = function (name) { return $$('[name="' + name + '"]', form); };
    var errors = {};
    names.forEach(function (name) {
      var group = groupOf(name);
      var last = group[group.length - 1];
      var anchor = (last.type === "radio" || last.type === "checkbox") ? last.closest("label") : last;
      var msg = document.createElement("small");
      msg.className = "field-error";
      msg.id = "err-" + name;
      anchor.parentNode.insertBefore(msg, anchor.nextSibling);
      errors[name] = msg;
      group.forEach(function (c) { c.setAttribute("aria-describedby", msg.id); });
    });

    /* Live character counter for the description */
    var counter = document.createElement("small");
    counter.className = "field-counter";
    details.parentNode.insertBefore(counter, errors.details);
    function updateCounter() {
      var n = details.value.length;
      counter.textContent = n + " / " + details.maxLength + " characters (minimum " + details.minLength + ")";
      counter.classList.toggle("limit", n >= details.maxLength);
    }

    /* Extra business rules, applied with setCustomValidity() */
    var freeMail = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com", "icloud.com"];
    var rules = {
      email: function (el) {
        var domain = el.value.split("@")[1];
        return domain && freeMail.indexOf(domain.toLowerCase()) !== -1 ? "Use your company email address, not a free mail account." : "";
      },
      demodate: function (el) {
        if (!el.value) { return ""; }
        var day = new Date(el.value + "T00:00:00").getDay();
        return day === 0 || day === 6 ? "Demos run Monday to Friday. Choose a weekday." : "";
      },
      details: function (el) {
        return el.value && el.value.trim().length < el.minLength ? "Describe your application in at least " + el.minLength + " characters." : "";
      },
      robots: function (el) {
        var type = form.elements.enquirytype.value;
        var picked = groupOf("robots").some(function (c) { return c.checked; });
        return (type === "demo" || type === "quote") && !picked ? "Select at least one robot type for a demo or quotation." : "";
      },
      spec: function (el) {
        var file = el.files && el.files[0];
        if (!file) { return ""; }
        if (!/\.(pdf|docx?|png|jpe?g)$/i.test(file.name)) { return "Upload a PDF, Word, PNG or JPG file."; }
        return file.size > 5 * 1024 * 1024 ? "The file is too large. Maximum size is 5 MB." : "";
      }
    };

    /* Friendly text for each kind of failure */
    var required = {
      fullname: "Enter your full name.", email: "Enter your email address.", password: "Create a password.",
      company: "Enter your company name.", industry: "Select your industry.", quantity: "Enter how many robots you need.",
      demodate: "Choose a preferred demo date.", enquirytype: "Choose an enquiry type.",
      details: "Describe your application.", terms: "You must accept the terms and privacy policy."
    };
    var pattern = {
      fullname: "Use letters, spaces, dots and hyphens only.",
      phone: "Enter a valid 10-digit Indian mobile number starting with 6 to 9.",
      password: "Use at least 8 characters with both letters and numbers."
    };
    function messageFor(el) {
      var v = el.validity;
      if (v.customError) { return el.validationMessage; }
      if (v.valueMissing) { return required[el.name]; }
      if (v.typeMismatch) { return "Enter a valid email address, for example name@company.com."; }
      if (v.patternMismatch) { return pattern[el.name]; }
      if (v.tooShort) { return "Enter at least " + el.minLength + " characters."; }
      if (v.rangeUnderflow) { return el.type === "date" ? "Choose a date from " + el.min + " onwards." : "The minimum is " + el.min + "."; }
      if (v.rangeOverflow) { return el.type === "date" ? "Choose a date before " + el.max + "." : "The maximum is " + el.max + " per enquiry."; }
      if (v.stepMismatch || v.badInput) { return "Enter a whole number."; }
      return el.validationMessage;
    }

    /* Validate one field (or radio/checkbox group) and show or clear its message */
    function checkField(name) {
      var group = groupOf(name);
      var first = group[0];
      group.forEach(function (c) { c.setCustomValidity(""); });
      if (rules[name]) { first.setCustomValidity(rules[name](first)); }
      var bad = group.filter(function (c) { return !c.validity.valid; })[0];
      var text = bad ? messageFor(bad) : "";
      group.forEach(function (c) {
        c.classList.add("touched");
        c.setAttribute("aria-invalid", bad ? "true" : "false");
      });
      errors[name].textContent = text;
      errors[name].classList.toggle("show", !!text);
      return !bad;
    }

    /* Check while the person fills in the form */
    names.forEach(function (name) {
      groupOf(name).forEach(function (c) {
        c.addEventListener("blur", function () { checkField(name); });
        c.addEventListener("input", function () { if (c.classList.contains("touched")) { checkField(name); } });
        c.addEventListener("change", function () { checkField(name); });
      });
    });
    groupOf("enquirytype").forEach(function (r) {
      r.addEventListener("change", function () { if (groupOf("robots")[0].classList.contains("touched")) { checkField("robots"); } });
    });
    details.addEventListener("input", updateCounter);
    form.addEventListener("input", function () { if (successBox.hidden === false) { successBox.hidden = true; } });
    document.getElementById("form-success-close").addEventListener("click", function () { successBox.hidden = true; });

    /* Submit: stop the browser, validate everything, then show success or errors */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      successBox.hidden = true;
      names.forEach(checkField);

      if (!form.checkValidity()) {
        var invalid = $$("input, select, textarea", form).filter(function (c) { return !c.validity.valid; });
        var count = names.filter(function (n) { return groupOf(n).some(function (c) { return !c.validity.valid; }); }).length;
        summary.textContent = "Please fix " + count + (count === 1 ? " field" : " fields") + " before submitting.";
        summary.hidden = false;
        summary.classList.remove("shake");
        void summary.offsetWidth;
        summary.classList.add("shake");
        invalid[0].reportValidity();
        showToast("Some details need your attention.", "warn");
        return;
      }

      /* Success */
      var kinds = { demo: "product demo", quote: "price quotation", support: "technical support" };
      var firstName = form.elements.fullname.value.trim().split(" ")[0];
      var ref = "NM-" + Math.floor(100000 + Math.random() * 900000);
      successText.textContent = "Thank you, " + firstName + ". Your " + kinds[form.elements.enquirytype.value] +
        " request (reference " + ref + ") has been received. We will contact you by " +
        form.elements.contact.value + " within one working day.";
      summary.hidden = true;
      resetting = true;
      form.reset();
      resetting = false;
      names.forEach(function (n) {
        groupOf(n).forEach(function (c) { c.classList.remove("touched"); c.removeAttribute("aria-invalid"); });
        errors[n].textContent = "";
        errors[n].classList.remove("show");
      });
      updateCounter();
      successBox.hidden = false;
      successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("Request " + ref + " submitted successfully.", "success");
    });

    /* Reset button: clear every message */
    form.addEventListener("reset", function () {
      if (!resetting) { successBox.hidden = true; }
      summary.hidden = true;
      names.forEach(function (n) {
        groupOf(n).forEach(function (c) { c.setCustomValidity(""); c.classList.remove("touched"); c.removeAttribute("aria-invalid"); });
        errors[n].textContent = "";
        errors[n].classList.remove("show");
      });
      setTimeout(updateCounter, 0);
    });
    updateCounter();
  }

  /* =========================================================
     8. ROBOT FLEET MANAGER: add, edit, display and remove robots
        using DOM manipulation (no page reload)
     ========================================================= */
  var fleet = [];            /* data for every robot */
  var nextId = 1;
  var editingId = null;      /* id of the robot being edited, or null */

  var listEl   = document.getElementById("fleet-list");
  var emptyEl  = document.getElementById("fleet-empty");
  var nameIn   = document.getElementById("fleet-name");
  var typeIn   = document.getElementById("fleet-type");
  var loadIn   = document.getElementById("fleet-payload");
  var statusIn = document.getElementById("fleet-status");
  var errorEl  = document.getElementById("fleet-error");
  var saveBtn  = document.getElementById("fleet-save");
  var cancelBtn = document.getElementById("fleet-cancel");
  var searchIn = document.getElementById("fleet-search");
  var formBox  = document.getElementById("fleet-form");
  var statuses = ["Active", "Idle", "Maintenance"];

  /* Create a small button */
  function makeButton(label, cls, action) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn-sm " + cls;
    b.setAttribute("data-action", action);
    b.textContent = label;
    return b;
  }

  /* Fill (or refill) a list item with a robot's data */
  function fillItem(li, robot) {
    li.innerHTML = "";
    li.setAttribute("data-id", robot.id);

    var row = document.createElement("div");
    row.className = "fleet-row";

    var info = document.createElement("div");
    var name = document.createElement("span");
    name.className = "fleet-name";
    name.textContent = robot.name;
    var type = document.createElement("span");
    type.className = "fleet-type";
    type.textContent = robot.type + " \u00B7 " + robot.payload + " kg";
    info.appendChild(name);
    info.appendChild(type);

    var status = document.createElement("button");
    status.type = "button";
    status.className = "status " + robot.status;
    status.setAttribute("data-action", "status");
    status.setAttribute("title", "Click to change status");
    status.textContent = robot.status;

    var actions = document.createElement("div");
    actions.className = "fleet-actions";
    actions.appendChild(makeButton("Details", "btn-blue", "details"));
    actions.appendChild(makeButton("Edit", "btn-grey", "edit"));
    actions.appendChild(makeButton("Remove", "btn-danger", "remove"));

    row.appendChild(info);
    row.appendChild(status);
    row.appendChild(actions);

    var details = document.createElement("div");
    details.className = "fleet-details";
    var inner = document.createElement("div");
    var p = document.createElement("p");
    p.textContent = "Added at " + robot.added + ". Carries up to " + robot.payload + " kg. Current status: " + robot.status + ".";
    inner.appendChild(p);
    details.appendChild(inner);

    li.appendChild(row);
    li.appendChild(details);
  }

  function findRobot(id) {
    return fleet.filter(function (r) { return r.id === id; })[0];
  }

  /* Update the counters and the empty-state message */
  function refreshSummary() {
    var active = fleet.filter(function (r) { return r.status === "Active"; }).length;
    var maint = fleet.filter(function (r) { return r.status === "Maintenance"; }).length;
    var payload = fleet.reduce(function (sum, r) { return sum + r.payload; }, 0);
    var values = {
      "stat-total": fleet.length, "stat-active": active,
      "stat-maint": maint, "stat-payload": payload + " kg"
    };
    Object.keys(values).forEach(function (id) {
      var el = document.getElementById(id);
      if (el.textContent !== String(values[id])) {
        el.textContent = values[id];
        el.classList.remove("bump");
        void el.offsetWidth;            /* restart the animation */
        el.classList.add("bump");
      }
    });
    emptyEl.innerHTML = fleet.length === 0
      ? "<p>No robots in your fleet yet. Use the form to add your first robot.</p>" : "";
    applySearch();
  }

  /* Show only the robots that match the search box */
  function applySearch() {
    var q = searchIn.value.trim().toLowerCase();
    var shown = 0;
    $$(".fleet-item", listEl).forEach(function (li) {
      var r = findRobot(Number(li.getAttribute("data-id")));
      var match = !q || (r.name + " " + r.type).toLowerCase().indexOf(q) !== -1;
      li.style.display = match ? "" : "none";
      if (match) { shown++; }
    });
    if (fleet.length > 0 && shown === 0) {
      emptyEl.innerHTML = "<p></p>";
      emptyEl.querySelector("p").textContent = "No robots match your search.";
    }
  }

  /* Check the form; returns an error message or "" */
  function validate() {
    var name = nameIn.value.trim();
    var payload = Number(loadIn.value);
    if (name.length < 3) { return "Enter a robot name with at least 3 characters."; }
    if (!loadIn.value || payload < 1 || payload > 1000 || payload % 1 !== 0) {
      return "Payload must be a whole number from 1 to 1000 kg.";
    }
    var duplicate = fleet.some(function (r) {
      return r.id !== editingId && r.name.toLowerCase() === name.toLowerCase();
    });
    return duplicate ? "A robot named \u201C" + name + "\u201D already exists." : "";
  }

  function showError(msg) {
    errorEl.textContent = msg;
    nameIn.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) {
      formBox.classList.remove("shake");
      void formBox.offsetWidth;
      formBox.classList.add("shake");
    }
  }

  /* Put the form back into "Add" mode */
  function resetForm() {
    editingId = null;
    nameIn.value = "";
    loadIn.value = 10;
    typeIn.selectedIndex = 0;
    statusIn.selectedIndex = 0;
    saveBtn.textContent = "Add robot";
    cancelBtn.hidden = true;
    formBox.classList.remove("editing");
    document.getElementById("fleet-form-title").textContent = "Add a robot";
    showError("");
  }

  /* ADD a new robot, or MODIFY the one being edited */
  function saveRobot() {
    var msg = validate();
    showError(msg);
    if (msg) { return; }

    var data = {
      name: nameIn.value.trim(), type: typeIn.value,
      payload: Number(loadIn.value), status: statusIn.value
    };

    if (editingId === null) {
      var robot = { id: nextId++, added: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      Object.keys(data).forEach(function (k) { robot[k] = data[k]; });
      fleet.push(robot);
      var li = document.createElement("li");
      li.className = "fleet-item";
      fillItem(li, robot);
      listEl.appendChild(li);
      showToast(robot.name + " added to your fleet.", "success");
    } else {
      var existing = findRobot(editingId);
      Object.keys(data).forEach(function (k) { existing[k] = data[k]; });
      var item = listEl.querySelector('[data-id="' + editingId + '"]');
      fillItem(item, existing);
      item.classList.remove("edited");
      void item.offsetWidth;
      item.classList.add("edited");
      showToast(existing.name + " updated.", "info");
    }
    resetForm();
    refreshSummary();
  }

  /* Click handling for every button inside the list (event delegation) */
  listEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) { return; }
    var li = btn.closest(".fleet-item");
    var robot = findRobot(Number(li.getAttribute("data-id")));
    var action = btn.getAttribute("data-action");

    if (action === "details") {                       /* DISPLAY */
      var open = li.classList.toggle("open");
      btn.textContent = open ? "Hide" : "Details";
    } else if (action === "edit") {                   /* MODIFY: load into the form */
      editingId = robot.id;
      nameIn.value = robot.name;
      typeIn.value = robot.type;
      loadIn.value = robot.payload;
      statusIn.value = robot.status;
      saveBtn.textContent = "Save changes";
      cancelBtn.hidden = false;
      formBox.classList.add("editing");
      document.getElementById("fleet-form-title").textContent = "Edit " + robot.name;
      showError("");
      nameIn.focus();
    } else if (action === "status") {                 /* MODIFY: cycle status */
      robot.status = statuses[(statuses.indexOf(robot.status) + 1) % statuses.length];
      var wasOpen = li.classList.contains("open");
      fillItem(li, robot);
      if (wasOpen) { li.classList.add("open"); $('[data-action="details"]', li).textContent = "Hide"; }
      showToast(robot.name + " is now " + robot.status.toLowerCase() + ".", robot.status === "Maintenance" ? "warn" : "info");
      refreshSummary();
    } else if (action === "remove") {                 /* REMOVE */
      li.classList.add("removing");
      fleet = fleet.filter(function (r) { return r.id !== robot.id; });
      if (editingId === robot.id) { resetForm(); }
      setTimeout(function () { li.remove(); refreshSummary(); }, 400);
      showToast(robot.name + " removed from your fleet.", "warn");
    }
  });

  saveBtn.addEventListener("click", saveRobot);
  cancelBtn.addEventListener("click", function () { resetForm(); showToast("Edit cancelled.", "info"); });
  searchIn.addEventListener("input", applySearch);
  [nameIn, loadIn].forEach(function (input) {
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { saveRobot(); } });
    input.addEventListener("input", function () { if (errorEl.textContent) { showError(""); } });
  });

  /* Start with three sample robots so the list is not empty */
  [["Welder Line 1", "Robotic Arm", 250, "Active"],
   ["Packing Cobot", "Cobot", 10, "Idle"],
   ["Pallet Runner", "AMR", 800, "Maintenance"]].forEach(function (s) {
    var robot = { id: nextId++, name: s[0], type: s[1], payload: s[2], status: s[3], added: "start-up" };
    fleet.push(robot);
    var li = document.createElement("li");
    li.className = "fleet-item";
    fillItem(li, robot);
    listEl.appendChild(li);
  });
  refreshSummary();
})();