/* =========================================================
   GG Robots - script.js

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

   OBJECTIVE:
   Develop an API-integrated webpage that retrieves industry-specific information from an
   endpoint and displays the JSON data with loading indicators and error handling.
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
    var modalArt = $("#modal-art");
    modalArt.innerHTML = $(".art", card).innerHTML;      /* copy the animated robot scene */
    modalArt.classList.add("live");
    modalArt.setAttribute("aria-label", $(".art", card).getAttribute("aria-label"));
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

  /* =========================================================
     9. LIVE ROBOT DATA: fetch JSON from an endpoint and display it
        with a loading indicator and error handling
     ========================================================= */
  /* The JSON data (this is what an API would send back) */
  var ROBOT_DATA = {
    "company": "GG Robots",
    "updated": "2026-11-18T09:30:00+05:30",
    "robots": [
      {
        "model": "NM-A500",
        "name": "Heavy Arm",
        "category": "Robotic Arm",
        "payload_kg": 500,
        "reach": "3.2 m",
        "uptime": 99.2,
        "units": 148,
        "price_lakh": 62.0,
        "availability": "In stock"
      },
      {
        "model": "NM-A120",
        "name": "Weld Master",
        "category": "Robotic Arm",
        "payload_kg": 120,
        "reach": "2.4 m",
        "uptime": 98.6,
        "units": 212,
        "price_lakh": 34.5,
        "availability": "In stock"
      },
      {
        "model": "NM-A20",
        "name": "Paint Pro",
        "category": "Robotic Arm",
        "payload_kg": 20,
        "reach": "1.7 m",
        "uptime": 97.9,
        "units": 96,
        "price_lakh": 18.0,
        "availability": "Limited"
      },
      {
        "model": "NM-C10",
        "name": "Co-Worker 10",
        "category": "Cobot",
        "payload_kg": 10,
        "reach": "1.3 m",
        "uptime": 99.0,
        "units": 340,
        "price_lakh": 11.8,
        "availability": "In stock"
      },
      {
        "model": "NM-C20",
        "name": "Co-Worker 20",
        "category": "Cobot",
        "payload_kg": 20,
        "reach": "1.7 m",
        "uptime": 98.4,
        "units": 175,
        "price_lakh": 15.6,
        "availability": "Limited"
      },
      {
        "model": "NM-M1000",
        "name": "Pallet Runner",
        "category": "AMR",
        "payload_kg": 1000,
        "reach": "2.0 m/s",
        "uptime": 96.8,
        "units": 87,
        "price_lakh": 28.0,
        "availability": "In stock"
      },
      {
        "model": "NM-M300",
        "name": "Shelf Scout",
        "category": "AMR",
        "payload_kg": 300,
        "reach": "1.5 m/s",
        "uptime": 97.5,
        "units": 130,
        "price_lakh": 16.4,
        "availability": "Pre-order"
      },
      {
        "model": "NM-D200",
        "name": "Speed Packer",
        "category": "Delta Robot",
        "payload_kg": 1,
        "reach": "200 picks/min",
        "uptime": 99.4,
        "units": 264,
        "price_lakh": 9.5,
        "availability": "In stock"
      }
    ]
  };

  /* The endpoint. fetch() reads the JSON above through a Blob URL, so the page works without a server.
     To use a real API instead, replace this line with:  var API_URL = "https://your-api.example.com/robots";  */
  var API_URL = URL.createObjectURL(new Blob([JSON.stringify(ROBOT_DATA)], { type: "application/json" }));
  var apiBody = document.getElementById("api-body");
  var apiState = document.getElementById("api-state");
  var apiCards = document.getElementById("api-cards");
  var apiFilters = document.getElementById("api-filters");
  var apiWrap = document.getElementById("api-table-wrap");
  var apiUpdated = document.getElementById("api-updated");
  var loadBtn = document.getElementById("api-load");
  var failBtn = document.getElementById("api-fail");
  var apiRobots = [];                    /* rows received from the API */
  var apiFilter = "All";
  var apiSort = { key: null, dir: 1 };

  /* Show a message box: type is "loading", "error" or "info" */
  function setState(type, title, text, retry) {
    apiState.innerHTML = "";
    apiState.className = "api-state" + (type === "error" ? " is-error" : "");
    if (!title) { return; }
    if (type === "loading") {
      var spin = document.createElement("div");
      spin.className = "spinner";
      apiState.appendChild(spin);
    }
    var h = document.createElement("h3");
    h.textContent = title;
    var p = document.createElement("p");
    p.textContent = text;
    apiState.appendChild(h);
    apiState.appendChild(p);
    if (retry) {
      var b = makeButton("Try again", "btn-blue", "retry");
      b.addEventListener("click", function () { loadRobots(API_URL); });
      apiState.appendChild(b);
    }
  }

  /* Grey placeholder rows shown while the request is in progress */
  function showSkeleton() {
    apiBody.innerHTML = "";
    for (var r = 0; r < 5; r++) {
      var tr = document.createElement("tr");
      tr.className = "skeleton";
      for (var c = 0; c < 8; c++) {
        var td = document.createElement("td");
        td.appendChild(document.createElement("div"));
        tr.appendChild(td);
      }
      apiBody.appendChild(tr);
    }
    apiWrap.hidden = false;
  }

  /* Request the JSON. async/await with try, catch and finally */
  async function loadRobots(url) {
    loadBtn.classList.add("is-loading");
    failBtn.classList.add("is-loading");
    apiCards.innerHTML = "";
    apiFilters.hidden = true;
    apiUpdated.textContent = "";
    setState("loading", "Loading robot data\u2026", "Contacting the data service.");
    showSkeleton();

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 8000);   /* give up after 8 seconds */
    try {
      await new Promise(function (resolve) { setTimeout(resolve, 700); }); /* short pause so the loader is visible */
      var response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error("The server answered with status " + response.status + " (" + (response.statusText || "error") + ").");
      }
      var data = await response.json();
      if (!data || !Array.isArray(data.robots)) {
        throw new Error("The response did not contain a list of robots.");
      }
      apiRobots = data.robots;
      apiFilter = "All";
      apiSort = { key: null, dir: 1 };
      apiUpdated.textContent = "Data updated " + new Date(data.updated).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
      buildFilters();
      renderCards();
      renderTable();
      showToast(apiRobots.length + " robots loaded.", "success");
    } catch (err) {
      apiWrap.hidden = true;
      apiBody.innerHTML = "";
      var reason;
      if (err.name === "AbortError") {
        reason = "The request took too long and was cancelled.";
      } else if (location.protocol === "file:") {
        reason = "Browsers block data requests from files. Open this page through a local server (for example VS Code Live Server, or run \"python -m http.server\" in this folder).";
      } else if (err instanceof SyntaxError) {
        reason = "The data could not be read because it is not valid JSON.";
      } else {
        reason = err.message;
      }
      setState("error", "Could not load robot data", reason, true);
      showToast("Loading failed. See the message in the catalogue.", "warn");
    } finally {
      clearTimeout(timer);
      loadBtn.classList.remove("is-loading");
      failBtn.classList.remove("is-loading");
      loadBtn.textContent = "Refresh data";
    }
  }

  /* Summary figures worked out from the received data */
  function renderCards() {
    var units = apiRobots.reduce(function (s, r) { return s + r.units; }, 0);
    var uptime = apiRobots.reduce(function (s, r) { return s + r.uptime; }, 0) / apiRobots.length;
    var top = apiRobots.slice().sort(function (a, b) { return b.units - a.units; })[0];
    var items = [
      [apiRobots.length, "Models available"],
      [units.toLocaleString(), "Units deployed"],
      [uptime.toFixed(1) + "%", "Average uptime"],
      [top.model, "Most deployed model"]
    ];
    apiCards.innerHTML = "";
    items.forEach(function (it, i) {
      var card = document.createElement("div");
      card.className = "api-card";
      card.style.animationDelay = i * 80 + "ms";
      var big = document.createElement("strong");
      big.textContent = it[0];
      var small = document.createElement("span");
      small.textContent = it[1];
      card.appendChild(big);
      card.appendChild(small);
      apiCards.appendChild(card);
    });
  }

  /* One filter button per category found in the data */
  function buildFilters() {
    var cats = ["All"];
    apiRobots.forEach(function (r) { if (cats.indexOf(r.category) === -1) { cats.push(r.category); } });
    apiFilters.innerHTML = "";
    cats.forEach(function (cat) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-btn" + (cat === apiFilter ? " active" : "");
      b.textContent = cat;
      b.addEventListener("click", function () {
        apiFilter = cat;
        $$(".filter-btn", apiFilters).forEach(function (x) { x.classList.toggle("active", x === b); });
        renderTable();
      });
      apiFilters.appendChild(b);
    });
    apiFilters.hidden = false;
  }

  /* Build one table cell */
  function cell(tr, text) {
    var td = document.createElement("td");
    td.textContent = text;
    tr.appendChild(td);
    return td;
  }

  /* Draw the table rows from the data (filtered and sorted) */
  function renderTable() {
    var rows = apiRobots.filter(function (r) { return apiFilter === "All" || r.category === apiFilter; });
    if (apiSort.key) {
      rows.sort(function (a, b) {
        var x = a[apiSort.key], y = b[apiSort.key];
        return (typeof x === "string" ? x.localeCompare(y) : x - y) * apiSort.dir;
      });
    }
    apiBody.innerHTML = "";
    apiWrap.hidden = false;
    setState(rows.length ? "info" : "info", rows.length ? "" : "No robots found", rows.length ? "" : "No robots match this filter.");
    rows.forEach(function (r, i) {
      var tr = document.createElement("tr");
      tr.style.animationDelay = i * 40 + "ms";
      cell(tr, r.model + " \u2013 " + r.name).style.fontWeight = "700";
      cell(tr, r.category);
      cell(tr, r.payload_kg.toLocaleString() + " kg");
      cell(tr, r.reach);

      var up = document.createElement("td");
      var wrap = document.createElement("div");
      wrap.className = "uptime";
      var bar = document.createElement("div");
      bar.className = "uptime-bar";
      var fill = document.createElement("span");
      fill.style.width = r.uptime + "%";
      bar.appendChild(fill);
      var label = document.createElement("span");
      label.textContent = r.uptime.toFixed(1) + "%";
      wrap.appendChild(bar);
      wrap.appendChild(label);
      up.appendChild(wrap);
      tr.appendChild(up);

      cell(tr, r.units.toLocaleString());
      cell(tr, "\u20B9" + r.price_lakh.toFixed(1) + " lakh");

      var av = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "avail " + r.availability.toLowerCase().replace(/\s+/g, "-");
      badge.textContent = r.availability;
      av.appendChild(badge);
      tr.appendChild(av);
      apiBody.appendChild(tr);
    });
  }

  /* Sort when a column heading is clicked */
  $$(".sort-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!apiRobots.length) { return; }
      var key = btn.getAttribute("data-key");
      apiSort.dir = apiSort.key === key ? -apiSort.dir : 1;
      apiSort.key = key;
      $$(".sort-btn").forEach(function (b) { b.classList.remove("asc", "desc"); });
      btn.classList.add(apiSort.dir === 1 ? "asc" : "desc");
      renderTable();
    });
  });

  loadBtn.addEventListener("click", function () { loadRobots(API_URL); });
  failBtn.addEventListener("click", function () { loadRobots("no-such-endpoint.json"); });   /* a URL that does not exist, to show the error state */
})();

/* =========================================================
   ROBOT MAINTENANCE TASK MANAGER (CRUD + Local Storage)
   ADD THIS TO THE END OF script.js (or load it as its own file
   with <script src="task-manager.js"></script> after script.js)
   ========================================================= */
(function () {
  var STORAGE_KEY = "novamotion.tasks";
  var tasks = [];
  var editingId = null;
  var activeFilter = "All";

  var form     = document.getElementById("tm-form");
  if (!form) { return; }
  var titleIn  = document.getElementById("tm-title");
  var robotIn  = document.getElementById("tm-robot");
  var prioIn   = document.getElementById("tm-priority");
  var dueIn    = document.getElementById("tm-due");
  var statusIn = document.getElementById("tm-status");
  var notesIn  = document.getElementById("tm-notes");
  var errorEl  = document.getElementById("tm-error");
  var saveBtn  = document.getElementById("tm-save");
  var cancelBtn = document.getElementById("tm-cancel");
  var searchIn = document.getElementById("tm-search");
  var filters  = document.getElementById("tm-filters");
  var bodyEl   = document.getElementById("tm-body");
  var emptyEl  = document.getElementById("tm-empty");
  var msgEl    = document.getElementById("tm-message");
  var msgTimer = null;

  /* ---------- LOCAL STORAGE ---------- */
  function saveTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch (e) { showMessage("Could not save to browser storage."); }
  }

  function loadTasks() {
    var raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { raw = null; }
    if (raw !== null) {
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) { return parsed; }
      } catch (e) { /* damaged data: fall through to the samples */ }
    }
    return null;
  }

  /* ---------- HELPERS ---------- */
  function todayString() {
    var d = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function dayOffset(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function showMessage(text) {
    msgEl.textContent = text;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () { msgEl.textContent = ""; }, 3000);
  }

  function showError(text) {
    errorEl.textContent = text;
    titleIn.setAttribute("aria-invalid", text ? "true" : "false");
    if (text) {
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
    }
  }

  function findTask(id) {
    return tasks.find(function (t) { return t.id === id; });
  }

  function formatDate(value) {
    var d = new Date(value + "T00:00:00");
    return d.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
  }

  /* ---------- READ: draw the table ---------- */
  function buildRow(task) {
    var tr = document.createElement("tr");
    tr.setAttribute("data-id", task.id);
    if (task.status === "Completed") { tr.classList.add("done"); }

    /* Task title + notes */
    var tdTask = document.createElement("td");
    var title = document.createElement("span");
    title.className = "tm-title";
    title.textContent = task.title;
    tdTask.appendChild(title);
    if (task.notes) {
      var note = document.createElement("span");
      note.className = "tm-note";
      note.textContent = task.notes;
      tdTask.appendChild(note);
    }
    tr.appendChild(tdTask);

    /* Robot type */
    var tdRobot = document.createElement("td");
    tdRobot.textContent = task.robot;
    tr.appendChild(tdRobot);

    /* Priority */
    var tdPrio = document.createElement("td");
    var pill = document.createElement("span");
    pill.className = "tm-pill " + task.priority;
    pill.textContent = task.priority;
    tdPrio.appendChild(pill);
    tr.appendChild(tdPrio);

    /* Due date (overdue highlighted) */
    var tdDue = document.createElement("td");
    tdDue.textContent = formatDate(task.due);
    if (task.status !== "Completed" && task.due < todayString()) {
      tdDue.classList.add("tm-overdue");
      tdDue.textContent += " (overdue)";
    }
    tr.appendChild(tdDue);

    /* Status: dropdown that updates the task straight away */
    var tdStatus = document.createElement("td");
    var select = document.createElement("select");
    select.className = "tm-status-select " + task.status.replace(/\s+/g, "-");
    select.setAttribute("data-action", "status");
    select.setAttribute("aria-label", "Status for " + task.title);
    ["Pending", "In Progress", "Completed"].forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === task.status) { opt.selected = true; }
      select.appendChild(opt);
    });
    tdStatus.appendChild(select);
    tr.appendChild(tdStatus);

    /* Edit and Delete buttons */
    var tdActions = document.createElement("td");
    var actions = document.createElement("div");
    actions.className = "tm-actions";
    [["Edit", "btn-grey", "edit"], ["Delete", "btn-danger", "delete"]].forEach(function (b) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-sm " + b[1];
      btn.setAttribute("data-action", b[2]);
      btn.textContent = b[0];
      actions.appendChild(btn);
    });
    tdActions.appendChild(actions);
    tr.appendChild(tdActions);

    return tr;
  }

  function updateCounters() {
    var count = function (s) { return tasks.filter(function (t) { return t.status === s; }).length; };
    document.getElementById("tm-total").textContent = tasks.length;
    document.getElementById("tm-pending").textContent = count("Pending");
    document.getElementById("tm-progress").textContent = count("In Progress");
    document.getElementById("tm-done").textContent = count("Completed");
  }

  function render(flashId) {
    var q = searchIn.value.trim().toLowerCase();
    var visible = tasks.filter(function (t) {
      var matchStatus = activeFilter === "All" || t.status === activeFilter;
      var matchText = !q || (t.title + " " + t.robot + " " + t.notes).toLowerCase().indexOf(q) !== -1;
      return matchStatus && matchText;
    });

    bodyEl.innerHTML = "";
    visible.forEach(function (t) {
      var row = buildRow(t);
      if (t.id === flashId) { row.classList.add("edited"); }
      bodyEl.appendChild(row);
    });

    if (tasks.length === 0) {
      emptyEl.textContent = "No tasks yet. Use the form to add your first maintenance task.";
    } else if (visible.length === 0) {
      emptyEl.textContent = "No tasks match your search or filter.";
    } else {
      emptyEl.textContent = "";
    }
    updateCounters();
  }

  /* ---------- Form helpers ---------- */
  function validate() {
    var title = titleIn.value.trim();
    if (title.length < 3) { return "Enter a task title with at least 3 characters."; }
    if (!dueIn.value) { return "Choose a due date."; }
    var duplicate = tasks.some(function (t) {
      return t.id !== editingId && t.title.toLowerCase() === title.toLowerCase() && t.robot === robotIn.value;
    });
    return duplicate ? "This task already exists for the selected robot type." : "";
  }

  function resetForm() {
    editingId = null;
    form.reset();
    dueIn.value = dayOffset(7);
    prioIn.value = "Medium";
    saveBtn.textContent = "Add task";
    cancelBtn.hidden = true;
    form.classList.remove("editing");
    document.getElementById("tm-form-title").textContent = "Add a task";
    showError("");
  }

  /* ---------- CREATE and UPDATE ---------- */
  function saveTask(e) {
    e.preventDefault();
    var msg = validate();
    showError(msg);
    if (msg) { return; }

    var data = {
      title: titleIn.value.trim(),
      robot: robotIn.value,
      priority: prioIn.value,
      due: dueIn.value,
      status: statusIn.value,
      notes: notesIn.value.trim()
    };

    var flashId = null;
    if (editingId === null) {
      var task = { id: Date.now() };
      Object.keys(data).forEach(function (k) { task[k] = data[k]; });
      tasks.push(task);
      flashId = task.id;
      showMessage("Task added.");
    } else {
      var existing = findTask(editingId);
      Object.keys(data).forEach(function (k) { existing[k] = data[k]; });
      flashId = existing.id;
      showMessage("Task updated.");
    }
    saveTasks();
    resetForm();
    render(flashId);
  }

  /* ---------- Buttons inside the table (event delegation) ---------- */
  bodyEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) { return; }
    var tr = btn.closest("tr");
    var task = findTask(Number(tr.getAttribute("data-id")));
    var action = btn.getAttribute("data-action");

    if (action === "edit") {
      editingId = task.id;
      titleIn.value = task.title;
      robotIn.value = task.robot;
      prioIn.value = task.priority;
      dueIn.value = task.due;
      statusIn.value = task.status;
      notesIn.value = task.notes;
      saveBtn.textContent = "Save changes";
      cancelBtn.hidden = false;
      form.classList.add("editing");
      document.getElementById("tm-form-title").textContent = "Edit task";
      showError("");
      titleIn.focus();
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (action === "delete") {
      if (!window.confirm("Delete the task \u201C" + task.title + "\u201D?")) { return; }
      tasks = tasks.filter(function (t) { return t.id !== task.id; });
      if (editingId === task.id) { resetForm(); }
      saveTasks();
      tr.classList.add("removing");
      setTimeout(function () { tr.remove(); render(); }, 350);
      showMessage("Task deleted.");
    }
  });

  /* UPDATE status from the dropdown in a row */
  bodyEl.addEventListener("change", function (e) {
    var select = e.target.closest("select[data-action='status']");
    if (!select) { return; }
    var task = findTask(Number(select.closest("tr").getAttribute("data-id")));
    task.status = select.value;
    saveTasks();
    render(task.id);
    showMessage("\u201C" + task.title + "\u201D is now " + task.status.toLowerCase() + ".");
  });

  /* Filter buttons and search box */
  filters.addEventListener("click", function (e) {
    var btn = e.target.closest(".tm-filter");
    if (!btn) { return; }
    activeFilter = btn.getAttribute("data-filter");
    Array.prototype.slice.call(filters.querySelectorAll(".tm-filter")).forEach(function (b) {
      b.classList.toggle("active", b === btn);
    });
    render();
  });
  searchIn.addEventListener("input", function () { render(); });

  form.addEventListener("submit", saveTask);
  cancelBtn.addEventListener("click", function () { resetForm(); showMessage("Edit cancelled."); });
  titleIn.addEventListener("input", function () { if (errorEl.textContent) { showError(""); } });

  /* ---------- START: load saved tasks (or sample tasks the first time) ---------- */
  var saved = loadTasks();
  if (saved) {
    tasks = saved;
  } else {
    tasks = [
      { id: 1, title: "Replace gripper pads", robot: "Robotic Arm", priority: "High", due: dayOffset(2), status: "In Progress", notes: "Welder Line 1" },
      { id: 2, title: "Calibrate force sensors", robot: "Cobot", priority: "Medium", due: dayOffset(5), status: "Pending", notes: "" },
      { id: 3, title: "Update LiDAR firmware", robot: "AMR", priority: "Low", due: dayOffset(10), status: "Completed", notes: "Warehouse fleet" }
    ];
    saveTasks();
  }
  resetForm();
  render();
})();
/* =========================================================
   HERO ROBOT: eyes follow the cursor, click to wave + talk
   ========================================================= */
(function () {
  var robot = document.getElementById("hero-robot");
  if (!robot) { return; }
  var eyes = document.getElementById("hr-eyes");
  var bubble = document.getElementById("hr-bubble");
  var lines = [
    "Hi! I'm GG-1. Click me!",
    "I can lift 500 kg without a coffee break.",
    "Welding, packing, painting. I do it all.",
    "99.2% uptime. Sleep is not in my code.",
    "Want a demo? Tap Request a Demo!",
    "Beep boop. Safety first, always."
  ];
  var n = 0, waveTimer = null, jumpTimer = null;

  /* Eyes look toward the pointer (limited to a few pixels) */
  document.addEventListener("pointermove", function (e) {
    var box = robot.getBoundingClientRect();
    var dx = e.clientX - (box.left + box.width / 2);
    var dy = e.clientY - (box.top + box.height * 0.3);
    var dist = Math.max(Math.hypot(dx, dy), 1);
    var k = Math.min(dist / 250, 1);              /* gentle when far away */
    eyes.style.transform = "translate(" + (dx / dist * 9 * k).toFixed(1) + "px," + (dy / dist * 6 * k).toFixed(1) + "px)";
  });

  /* Click / Enter: wave, jump, smile and say something new */
  function react() {
    if (window.GGTalk) { window.GGTalk.next(); return; }   /* enhance.js: speak out loud */
    n = (n + 1) % lines.length;
    bubble.textContent = lines[n];
    bubble.classList.remove("pop");
    void bubble.offsetWidth;
    bubble.classList.add("pop");
    robot.classList.remove("waving", "jump", "happy");
    void robot.offsetWidth;
    robot.classList.add("waving", "jump", "happy");
    clearTimeout(waveTimer);
    waveTimer = setTimeout(function () { robot.classList.remove("waving", "jump", "happy"); }, 2800);
  }
  robot.setAttribute("tabindex", "0");
  robot.addEventListener("click", react);
  robot.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); react(); } });

  /* Wave hello once, shortly after the page loads */
  setTimeout(function () { robot.classList.add("waving"); setTimeout(function () { robot.classList.remove("waving"); }, 2800); }, 1400);
})();

/* =========================================================
   ROBOT ART: run each animated scene only while it is on screen
   ========================================================= */
(function () {
  var scenes = Array.prototype.slice.call(document.querySelectorAll(".art"));
  if (!("IntersectionObserver" in window)) { return; }        /* no observer: scenes simply keep running */
  document.body.classList.add("art-ready");
  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { entry.target.classList.toggle("live", entry.isIntersecting); });
  }, { threshold: 0.05 });
  scenes.forEach(function (el) { if (el.id !== "modal-art") { watcher.observe(el); } });
})();

/* =========================================================
   ROBOT FINDER & COMPARISON TOOL

   OBJECTIVE:
   Develop an industry-specific interactive component (search and filter
   system with a comparison tool) that responds dynamically to user input.
   ========================================================= */
(function () {
  var root = document.querySelector("#finder");
  if (!root) { return; }

  /* ---------- DATA ---------- */
  var ROBOTS = [
    { id: 1, model: "NM-A500", name: "Heavy Arm", category: "Robotic Arm", payload: 500, reach: "3.2 m", repeat: "\u00B10.05 mm", uptime: 99.2, price: 62.0, availability: "In stock", industries: ["Automotive", "Logistics"] },
    { id: 2, model: "NM-A120", name: "Weld Master", category: "Robotic Arm", payload: 120, reach: "2.4 m", repeat: "\u00B10.05 mm", uptime: 98.6, price: 34.5, availability: "In stock", industries: ["Automotive"] },
    { id: 3, model: "NM-A20", name: "Paint Pro", category: "Robotic Arm", payload: 20, reach: "1.7 m", repeat: "\u00B10.04 mm", uptime: 97.9, price: 18.0, availability: "Limited", industries: ["Automotive", "Electronics"] },
    { id: 4, model: "NM-C10", name: "Co-Worker 10", category: "Cobot", payload: 10, reach: "1.3 m", repeat: "\u00B10.03 mm", uptime: 99.0, price: 11.8, availability: "In stock", industries: ["Electronics", "Food", "Healthcare"] },
    { id: 5, model: "NM-C20", name: "Co-Worker 20", category: "Cobot", payload: 20, reach: "1.7 m", repeat: "\u00B10.03 mm", uptime: 98.4, price: 15.6, availability: "Limited", industries: ["Automotive", "Food", "Logistics"] },
    { id: 6, model: "NM-M1000", name: "Pallet Runner", category: "AMR", payload: 1000, reach: "2.0 m/s", repeat: "\u00B110 mm", uptime: 96.8, price: 28.0, availability: "In stock", industries: ["Logistics", "Automotive"] },
    { id: 7, model: "NM-M300", name: "Shelf Scout", category: "AMR", payload: 300, reach: "1.5 m/s", repeat: "\u00B110 mm", uptime: 97.5, price: 16.4, availability: "Pre-order", industries: ["Logistics", "Healthcare"] },
    { id: 8, model: "NM-D200", name: "Speed Packer", category: "Delta Robot", payload: 1, reach: "200 picks/min", repeat: "\u00B10.1 mm", uptime: 99.4, price: 9.5, availability: "In stock", industries: ["Food", "Electronics"] }
  ];
  var INDUSTRY_LABEL = { Automotive: "Automotive", Electronics: "Electronics", Logistics: "Logistics & Warehousing", Food: "Food & Packaging", Healthcare: "Healthcare" };
  var MAX_COMPARE = 3;

  /* ---------- STATE ---------- */
  var compareIds = [];
  var state = { query: "", category: "All", industry: "All", sort: "recommended", maxPrice: 70, stockOnly: false };
  var noticeTimer = null;

  /* ---------- ELEMENTS ---------- */
  var searchIn = root.querySelector("#finder-search");
  var categorySel = root.querySelector("#finder-category");
  var industrySel = root.querySelector("#finder-industry");
  var sortSel = root.querySelector("#finder-sort");
  var priceIn = root.querySelector("#finder-price");
  var priceOut = root.querySelector("#finder-price-out");
  var stockBtn = root.querySelector("#finder-stock");
  var resetBtn = root.querySelector("#finder-reset");
  var emptyResetBtn = root.querySelector("#finder-empty-reset");
  var countEl = root.querySelector("#finder-count");
  var noticeEl = root.querySelector("#finder-notice");
  var gridEl = root.querySelector("#finder-grid");
  var emptyEl = root.querySelector("#finder-empty");
  var cmpCount = root.querySelector("#compare-count");
  var cmpBody = root.querySelector("#compare-body");
  var cmpClear = root.querySelector("#compare-clear");
  var cmpQuote = root.querySelector("#compare-quote");

  /* ---------- HELPERS ---------- */
  function make(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }

  function findRobot(id) {
    return ROBOTS.find(function (r) { return r.id === id; });
  }

  function money(value) { return "\u20B9" + value.toFixed(1) + " lakh"; }

  function showNotice(text) {
    noticeEl.textContent = text;
    noticeEl.classList.add("show");
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(function () {
      noticeEl.classList.remove("show");
      noticeEl.textContent = "";
    }, 3200);
  }

  /* Small robot pictures drawn as SVG, used inside <img> tags (no files needed) */
  var artCache = {};
  var SHAPES = {
    "Robotic Arm":
      '<rect x="68" y="112" width="64" height="12" rx="4" fill="#1b3a7a"/>' +
      '<rect x="92" y="54" width="16" height="64" rx="8" fill="#ff8a1f" transform="rotate(-25 100 112)"/>' +
      '<rect x="68.5" y="8" width="14" height="58" rx="7" fill="#cfdcf7" transform="rotate(60 75.5 59.4)"/>' +
      '<circle cx="100" cy="112" r="8" fill="#0d1f4d"/><circle cx="75.5" cy="59.4" r="7" fill="#0d1f4d"/>' +
      '<circle cx="120" cy="34" r="5" fill="#ffd34d"/>',
    "Cobot":
      '<rect x="68" y="112" width="64" height="12" rx="4" fill="#1b3a7a"/>' +
      '<rect x="92" y="54" width="16" height="64" rx="8" fill="#ffffff" transform="rotate(15 100 112)"/>' +
      '<rect x="108" y="5" width="14" height="58" rx="7" fill="#dbe6ff" transform="rotate(-70 115 56)"/>' +
      '<circle cx="100" cy="112" r="8" fill="#0d1f4d"/><circle cx="115" cy="56" r="7" fill="#0d1f4d"/>' +
      '<circle cx="115" cy="56" r="12" fill="none" stroke="#4ff0c0" stroke-width="2.5"/>' +
      '<circle cx="67" cy="38" r="5" fill="#ff8a1f"/>',
    "AMR":
      '<rect x="46" y="80" width="108" height="8" rx="3" fill="#9fb6e0"/>' +
      '<rect x="54" y="52" width="30" height="28" rx="3" fill="#ff8a1f"/>' +
      '<rect x="88" y="60" width="30" height="20" rx="3" fill="#ffb04d"/>' +
      '<rect x="122" y="50" width="26" height="30" rx="3" fill="#ff8a1f"/>' +
      '<rect x="40" y="86" width="120" height="22" rx="10" fill="#0d1f4d"/>' +
      '<rect x="52" y="94" width="96" height="4" rx="2" fill="#ff8a1f"/>' +
      '<circle cx="64" cy="112" r="10" fill="#06122e"/><circle cx="64" cy="112" r="4" fill="#8fb5ff"/>' +
      '<circle cx="136" cy="112" r="10" fill="#06122e"/><circle cx="136" cy="112" r="4" fill="#8fb5ff"/>' +
      '<circle cx="154" cy="84" r="4" fill="#ff4d4d"/>',
    "Delta Robot":
      '<rect x="40" y="10" width="120" height="10" rx="4" fill="#2a4a8f"/>' +
      '<line x1="60" y1="20" x2="92" y2="84" stroke="#cfdcf7" stroke-width="4" stroke-linecap="round"/>' +
      '<line x1="100" y1="20" x2="100" y2="84" stroke="#cfdcf7" stroke-width="4" stroke-linecap="round"/>' +
      '<line x1="140" y1="20" x2="108" y2="84" stroke="#cfdcf7" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="82" y="82" width="36" height="9" rx="4" fill="#ff8a1f"/>' +
      '<rect x="98" y="91" width="4" height="10" fill="#0d1f4d"/><ellipse cx="100" cy="103" rx="8" ry="3" fill="#4ff0c0"/>' +
      '<rect x="30" y="110" width="140" height="10" rx="5" fill="#0d1f4d"/>' +
      '<circle cx="60" cy="107" r="5" fill="#ffd34d"/><circle cx="140" cy="107" r="5" fill="#4ff0c0"/>'
  };
  function artFor(category) {
    if (!artCache[category]) {
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14489f"/><stop offset="1" stop-color="#0a2a66"/></linearGradient></defs>' +
        '<rect width="200" height="140" fill="url(#g)"/><rect y="122" width="200" height="18" fill="#071a42"/>' +
        SHAPES[category] + '</svg>';
      artCache[category] = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }
    return artCache[category];
  }

  function makeImage(robot) {
    var img = document.createElement("img");
    img.src = artFor(robot.category);
    img.alt = robot.model + " " + robot.name + " (" + robot.category + ")";
    img.width = 200;
    img.height = 140;
    return img;
  }

  /* ---------- FILTER + SORT ---------- */
  function getResults() {
    var q = state.query.trim().toLowerCase();

    var list = ROBOTS.filter(function (r) {
      var text = (r.model + " " + r.name + " " + r.category).toLowerCase();
      var matchText = !q || text.indexOf(q) !== -1;
      var matchCategory = state.category === "All" || r.category === state.category;
      var matchIndustry = state.industry === "All" || r.industries.indexOf(state.industry) !== -1;
      var matchPrice = r.price <= state.maxPrice;
      var matchStock = !state.stockOnly || r.availability === "In stock";
      return matchText && matchCategory && matchIndustry && matchPrice && matchStock;
    });

    if (state.sort === "payload") { list.sort(function (a, b) { return b.payload - a.payload; }); }
    if (state.sort === "price")   { list.sort(function (a, b) { return a.price - b.price; }); }
    if (state.sort === "uptime")  { list.sort(function (a, b) { return b.uptime - a.uptime; }); }
    return list;
  }

  /* ---------- RESULT CARDS ---------- */
  function buildCard(robot, index) {
    var li = make("li", "finder-card");
    li.setAttribute("data-id", robot.id);
    li.style.animationDelay = index * 60 + "ms";
    if (compareIds.indexOf(robot.id) !== -1) { li.classList.add("selected"); }

    var tag = make("span", "finder-tag", robot.category);
    var figure = make("div", "finder-pic");
    figure.appendChild(makeImage(robot));
    figure.appendChild(tag);

    var body = make("div", "finder-body");
    body.appendChild(make("h3", "", robot.model + " \u2013 " + robot.name));

    var specs = make("ul", "finder-specs");
    [["Payload", robot.payload.toLocaleString() + " kg"],
     ["Reach / Speed", robot.reach],
     ["Uptime", robot.uptime.toFixed(1) + "%"],
     ["Price", money(robot.price)]].forEach(function (pair) {
      var item = make("li");
      item.appendChild(make("span", "", pair[0]));
      item.appendChild(make("strong", "", pair[1]));
      specs.appendChild(item);
    });
    body.appendChild(specs);

    var stock = make("span", "avail " + robot.availability.toLowerCase().replace(/\s+/g, "-"), robot.availability);
    body.appendChild(stock);

    /* Expandable full specifications */
    var more = make("details", "finder-more");
    more.appendChild(make("summary", "", "Full specifications"));
    var moreList = make("ul");
    [["Repeatability", robot.repeat],
     ["Best for", robot.industries.map(function (k) { return INDUSTRY_LABEL[k]; }).join(", ")]].forEach(function (pair) {
      var item = make("li");
      item.appendChild(make("span", "", pair[0] + ": "));
      item.appendChild(make("strong", "", pair[1]));
      moreList.appendChild(item);
    });
    more.appendChild(moreList);
    body.appendChild(more);

    var btn = make("button", "btn btn-sm btn-blue finder-compare-btn");
    btn.type = "button";
    btn.setAttribute("data-action", "compare");
    body.appendChild(btn);

    li.appendChild(figure);
    li.appendChild(body);
    paintCompareButton(li);
    return li;
  }

  /* Make a card's button and outline match whether it is being compared */
  function paintCompareButton(card) {
    var id = Number(card.getAttribute("data-id"));
    var on = compareIds.indexOf(id) !== -1;
    var btn = card.querySelector(".finder-compare-btn");
    card.classList.toggle("selected", on);
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "\u2713 Added to compare" : "Add to compare";
  }

  function renderResults() {
    var results = getResults();
    gridEl.innerHTML = "";
    results.forEach(function (robot, i) { gridEl.appendChild(buildCard(robot, i)); });

    emptyEl.hidden = results.length !== 0;
    gridEl.hidden = results.length === 0;
    countEl.textContent = "Showing " + results.length + " of " + ROBOTS.length + " robots";
  }

  /* ---------- COMPARISON TABLE ---------- */
  var ROWS = [
    { label: "Category",      text: function (r) { return r.category; } },
    { label: "Payload",       text: function (r) { return r.payload.toLocaleString() + " kg"; }, num: function (r) { return r.payload; }, best: "max" },
    { label: "Reach / Speed", text: function (r) { return r.reach; } },
    { label: "Repeatability", text: function (r) { return r.repeat; } },
    { label: "Uptime",        text: function (r) { return r.uptime.toFixed(1) + "%"; }, num: function (r) { return r.uptime; }, best: "max" },
    { label: "Price",         text: function (r) { return money(r.price); }, num: function (r) { return r.price; }, best: "min" },
    { label: "Availability",  text: function (r) { return r.availability; } }
  ];

  function renderCompare() {
    var chosen = compareIds.map(findRobot);
    cmpCount.textContent = chosen.length + " / " + MAX_COMPARE;
    cmpClear.hidden = chosen.length === 0;
    cmpQuote.hidden = chosen.length === 0;
    cmpBody.innerHTML = "";

    if (chosen.length === 0) {
      cmpBody.appendChild(make("p", "compare-hint", "No robots selected yet. Press \u201CAdd to compare\u201D on up to three robots above."));
      return;
    }

    var table = make("div", "cmp-table");
    table.style.setProperty("--cols", chosen.length);

    /* Header row: picture, name and a remove button for every robot */
    var head = make("div", "cmp-row cmp-head");
    head.appendChild(make("div", "cmp-label", ""));
    chosen.forEach(function (robot) {
      var cell = make("div", "cmp-cell cmp-robot");
      var remove = make("button", "cmp-remove", "\u00D7");
      remove.type = "button";
      remove.setAttribute("data-remove", robot.id);
      remove.setAttribute("aria-label", "Remove " + robot.model + " from comparison");
      cell.appendChild(remove);
      cell.appendChild(makeImage(robot));
      cell.appendChild(make("strong", "", robot.model));
      cell.appendChild(make("span", "", robot.name));
      head.appendChild(cell);
    });
    table.appendChild(head);

    /* One row per specification; the best value is highlighted when 2+ robots are chosen */
    ROWS.forEach(function (row, rowIndex) {
      var tr = make("div", "cmp-row");
      tr.style.animationDelay = rowIndex * 40 + "ms";
      tr.appendChild(make("div", "cmp-label", row.label));

      var bestValue = null;
      if (row.num && chosen.length > 1) {
        var values = chosen.map(row.num);
        bestValue = row.best === "max" ? Math.max.apply(null, values) : Math.min.apply(null, values);
      }
      chosen.forEach(function (robot) {
        var cell = make("div", "cmp-cell", row.text(robot));
        if (bestValue !== null && row.num(robot) === bestValue) { cell.classList.add("best"); }
        tr.appendChild(cell);
      });
      table.appendChild(tr);
    });

    var scroller = make("div", "cmp-scroll");
    scroller.appendChild(table);
    cmpBody.appendChild(scroller);

    if (chosen.length > 1) {
      var topLoad = chosen.find(function (r) { return r.payload === Math.max.apply(null, chosen.map(function (x) { return x.payload; })); });
      var topUp = chosen.find(function (r) { return r.uptime === Math.max.apply(null, chosen.map(function (x) { return x.uptime; })); });
      var cheapest = chosen.find(function (r) { return r.price === Math.min.apply(null, chosen.map(function (x) { return x.price; })); });
      cmpBody.appendChild(make("p", "cmp-summary",
        "Highest payload: " + topLoad.model + "  \u00B7  Best uptime: " + topUp.model + "  \u00B7  Lowest price: " + cheapest.model));
    }
  }

  /* ---------- ADD / REMOVE FROM COMPARISON ---------- */
  function toggleCompare(id) {
    var at = compareIds.indexOf(id);
    if (at !== -1) {
      compareIds.splice(at, 1);
    } else if (compareIds.length >= MAX_COMPARE) {
      showNotice("You can compare up to " + MAX_COMPARE + " robots. Remove one first.");
      return;
    } else {
      compareIds.push(id);
    }
    root.querySelectorAll(".finder-card").forEach(paintCompareButton);
    renderCompare();
  }

  /* ---------- EVENTS ---------- */
  gridEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action='compare']");
    if (!btn) { return; }
    toggleCompare(Number(btn.closest(".finder-card").getAttribute("data-id")));
  });

  cmpBody.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-remove]");
    if (!btn) { return; }
    toggleCompare(Number(btn.getAttribute("data-remove")));
  });

  cmpClear.addEventListener("click", function () {
    compareIds = [];
    root.querySelectorAll(".finder-card").forEach(paintCompareButton);
    renderCompare();
  });

  searchIn.addEventListener("input", function () { state.query = searchIn.value; renderResults(); });
  categorySel.addEventListener("change", function () { state.category = categorySel.value; renderResults(); });
  industrySel.addEventListener("change", function () { state.industry = industrySel.value; renderResults(); });
  sortSel.addEventListener("change", function () { state.sort = sortSel.value; renderResults(); });

  priceIn.addEventListener("input", function () {
    state.maxPrice = Number(priceIn.value);
    priceOut.textContent = "\u20B9" + state.maxPrice + " lakh";
    renderResults();
  });

  stockBtn.addEventListener("click", function () {
    state.stockOnly = !state.stockOnly;
    stockBtn.classList.toggle("active", state.stockOnly);
    stockBtn.setAttribute("aria-pressed", state.stockOnly ? "true" : "false");
    renderResults();
  });

  function resetFilters() {
    state = { query: "", category: "All", industry: "All", sort: "recommended", maxPrice: 70, stockOnly: false };
    searchIn.value = "";
    categorySel.value = "All";
    industrySel.value = "All";
    sortSel.value = "recommended";
    priceIn.value = 70;
    priceOut.textContent = "\u20B970 lakh";
    stockBtn.classList.remove("active");
    stockBtn.setAttribute("aria-pressed", "false");
    renderResults();
  }
  resetBtn.addEventListener("click", resetFilters);
  emptyResetBtn.addEventListener("click", resetFilters);

  /* ---------- START ---------- */
  renderResults();
  renderCompare();
})();

/* =========================================================
   ROBOT CELL SETTINGS: custom toggle switch + Local Storage

   OBJECTIVE:
   Develop a custom-designed toggle switch to enable or disable an
   industry-specific application setting. Update the application behaviour
   based on the toggle state and retain the selected setting using Local Storage.
   ========================================================= */
(function () {
  var STORAGE_KEY = "novamotion.safeMode";

  var toggle = document.querySelector("#safe-toggle");
  if (!toggle) { return; }
  var card = document.querySelector("#setting-card");
  var panel = document.querySelector("#cell-panel");
  var stateEl = document.querySelector("#safe-state");
  var statusEl = document.querySelector("#safe-status");
  var savedEl = document.querySelector("#safe-saved");
  var noteEl = document.querySelector("#cell-note");

  /* What changes in each mode */
  var MODES = {
    on: {
      mode: "Safe collaboration", speed: "250 mm/s", force: "80 N", zone: "1.5 m safety zone", rate: "40 picks/min",
      status: "Safe collaboration mode is ON. Robots are slowed and force-limited.",
      note: "Speed and force are limited, so people can work beside the robots."
    },
    off: {
      mode: "Full-speed production", speed: "1,500 mm/s", force: "250 N", zone: "Light curtain only", rate: "120 picks/min",
      status: "Safe collaboration mode is OFF. Robots run at full production speed.",
      note: "Robots run at full speed. Keep people outside the cell."
    }
  };
  var FIELDS = { mode: "#cell-mode", speed: "#cell-speed", force: "#cell-force", zone: "#cell-zone", rate: "#cell-rate" };

  /* ---------- LOCAL STORAGE ---------- */
  function readSetting() {
    try { return localStorage.getItem(STORAGE_KEY); }     /* "on", "off" or null */
    catch (e) { return null; }
  }

  function saveSetting(isOn) {
    try {
      localStorage.setItem(STORAGE_KEY, isOn ? "on" : "off");
      savedEl.textContent = "Setting saved in this browser.";
    } catch (e) {
      savedEl.textContent = "Could not save the setting (browser storage is unavailable).";
    }
  }

  /* ---------- UPDATE THE APPLICATION BEHAVIOUR ---------- */
  function applyMode(isOn, animate) {
    var mode = isOn ? MODES.on : MODES.off;

    /* 1. classes switch the whole page: the robot animations slow down in safe mode */
    document.body.classList.toggle("safe-mode", isOn);
    panel.classList.toggle("is-safe", isOn);
    card.classList.toggle("is-on", isOn);

    /* 2. text and readout values */
    stateEl.textContent = isOn ? "ON" : "OFF";
    statusEl.textContent = mode.status;
    noteEl.textContent = mode.note;
    Object.keys(FIELDS).forEach(function (key) {
      var el = document.querySelector(FIELDS[key]);
      el.textContent = mode[key];
      if (animate) {
        el.classList.remove("bump");
        void el.offsetWidth;                /* restart the animation */
        el.classList.add("bump");
      }
    });
  }

  /* ---------- START: restore the saved setting ---------- */
  var saved = readSetting();
  toggle.checked = saved === "on";
  applyMode(toggle.checked, false);
  if (saved !== null) { savedEl.textContent = "Restored your saved setting."; }

  /* ---------- EVENT: the person flips the switch ---------- */
  toggle.addEventListener("change", function () {
    applyMode(toggle.checked, true);
    saveSetting(toggle.checked);
  });
})();

/* =========================================================
   GG Robots - "power-on" entry sequence with sound

   Everything is made in the browser: the sound is generated with the
   Web Audio API (no audio files needed) and the picture is SVG + canvas.
   Browsers only allow sound after a click, so the intro starts with a
   power button. Skip button and Escape key leave at any time.
   ========================================================= */
(function () {
  var intro = document.getElementById("intro");
  if (!intro) { return; }
  var body = document.body;
  function $(sel) { return intro.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(intro.querySelectorAll(sel)); }

  /* People who prefer reduced motion go straight to the site */
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    intro.classList.add("gone");
    return;
  }
  body.classList.add("intro-active");
  intro.classList.add("ready");

  /* Keep keyboard focus inside the intro while it is open */
  var inerted = [];
  Array.prototype.slice.call(body.children).forEach(function (el) {
    if (el !== intro && el.tagName !== "SCRIPT" && !el.inert) { el.inert = true; inerted.push(el); }
  });
  function release() { inerted.forEach(function (el) { el.inert = false; }); inerted = []; }

  /* ---------- timeline (seconds after the power button is pressed) ---------- */
  var TL = {
    boot: [0.9, 1.45, 2.0, 2.55, 3.1],   /* five boot messages */
    bootOff: 3.9,                         /* boot text fades out */
    eyes: 4.3,                            /* eyes open */
    lookL: 5.6, lookR: 6.2, lookC: 6.8,   /* eyes look left, right, at you */
    blink: 7.15,                          /* double blink */
    charge: 6.7,                          /* eyes charge up (riser sound) */
    impact: 9.0,                          /* BOOM: eyes become the GG logo */
    word: 10.2,                           /* R-O-B-O-T-S stamped in */
    weld: 11.45,                          /* weld line under the name */
    tag: 11.8,                            /* tagline + chime */
    leave: 13.6                           /* content fades, doors open */
  };
  var WORD = "ROBOTS";
  var BOOT_HTML = [
    "<span>&gt; POWER CORE</span><i></i><b>OK</b>",
    "<span>&gt; SERVO ARRAYS</span><i></i><b>OK</b>",
    "<span>&gt; VISION SYSTEM</span><i></i><b>OK</b>",
    "<span>&gt; SAFETY LOCKS</span><i></i><b>OK</b>",
    "<span>&gt; WAKING UP</span><i></i><b>GG ROBOTS</b>"
  ];

  var timers = [], started = false, finished = false, muted = false;
  var audio = null, raf = 0, weldT0 = 0;
  var mark = $(".gg-mark");
  var bootEl = $(".gg-boot");
  var weldEl = $(".gg-weld");
  var soundBtn = $(".gg-sound");

  /* the letters of ROBOTS */
  WORD.split("").forEach(function (ch, i) {
    var s = document.createElement("span");
    s.textContent = ch;
    s.style.setProperty("--i", i);
    $(".gg-word").appendChild(s);
  });

  /* =========================================================
     SOUND ENGINE (Web Audio API)
     ========================================================= */
  function makeAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { return null; }
    try {
      var ctx = new AC();
      if (ctx.state === "suspended") { ctx.resume(); }

      /* bus (scheduled sounds) and sfx (skip sound) -> compressor -> analyser -> out -> speakers */
      var bus = ctx.createGain();   bus.gain.value = 0.85;
      var sfx = ctx.createGain();   sfx.gain.value = 0.85;
      var comp = ctx.createDynamicsCompressor();
      var analyser = ctx.createAnalyser();
      analyser.fftSize = 512; analyser.smoothingTimeConstant = 0.78;
      var out = ctx.createGain();   out.gain.value = 0.9;
      bus.connect(comp); sfx.connect(comp); comp.connect(analyser); analyser.connect(out); out.connect(ctx.destination);

      /* two seconds of white noise, reused by every whoosh, click and spark */
      var nbuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      var data = nbuf.getChannelData(0);
      for (var n = 0; n < data.length; n++) { data[n] = Math.random() * 2 - 1; }

      var cur = bus;   /* where the helpers below send their sound */

      /* a simple note: frequency f0 gliding to f1 */
      function tone(t, dur, type, f0, f1, vol, attack) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f0, t);
        if (f1 && f1 !== f0) { o.frequency.exponentialRampToValueAtTime(f1, t + dur); }
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.01));
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(cur);
        o.start(t); o.stop(t + dur + 0.05);
      }
      /* filtered noise: whooshes, sizzle, clicks */
      function noise(t, dur, f0, f1, q, vol, type) {
        var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = nbuf; s.loop = true;
        f.type = type || "bandpass"; f.Q.value = q || 1;
        f.frequency.setValueAtTime(f0, t);
        if (f1) { f.frequency.exponentialRampToValueAtTime(f1, t + dur); }
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.05, dur / 3));
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(cur);
        s.start(t); s.stop(t + dur + 0.05);
      }
      function kick(t, vol) { tone(t, 0.5, "sine", 150, 40, vol || 1, 0.005); }
      function boom(t) {
        kick(t, 0.95);
        tone(t, 2.2, "sine", 55, 28, 0.7, 0.01);
        noise(t, 1.6, 2000, 120, 0.7, 0.5, "lowpass");
      }
      function click(t, vol) {
        vol = vol || 0.3;
        noise(t, 0.05, 3500, 1500, 3, vol, "bandpass");
        tone(t, 0.04, "square", 240, 110, vol * 0.4, 0.002);
      }
      function beep(t, f, dur, vol) { tone(t, dur || 0.1, "square", f, f, vol || 0.12, 0.004); }
      /* servo motor whirr: a buzzing saw with a fast wobble */
      function servo(t, dur, f0, f1, vol) {
        var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        var lfo = ctx.createOscillator(), lg = ctx.createGain();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(f0, t);
        o.frequency.linearRampToValueAtTime(f1, t + dur);
        f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 4;
        lfo.frequency.value = 28; lg.gain.value = f0 * 0.06;
        lfo.connect(lg); lg.connect(o.frequency);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vol, t + dur * 0.25);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        o.connect(f); f.connect(g); g.connect(cur);
        o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
      }
      /* low electrical hum that runs under the whole intro */
      function hum(t, dur) {
        var f = ctx.createBiquadFilter(), g = ctx.createGain();
        f.type = "lowpass"; f.frequency.value = 260;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.07, t + 1.5);
        g.gain.setValueAtTime(0.07, t + dur - 1.2);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        [55, 55.6, 110].forEach(function (fr) {
          var o = ctx.createOscillator();
          o.type = "sawtooth"; o.frequency.value = fr;
          o.connect(f); o.start(t); o.stop(t + dur + 0.1);
        });
        f.connect(g); g.connect(cur);
      }
      /* soft chord for the finale */
      function pad(t, freqs, dur) {
        freqs.forEach(function (fr) {
          var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
          o.type = "sawtooth"; o.frequency.value = fr; o.detune.value = (Math.random() - 0.5) * 14;
          f.type = "lowpass";
          f.frequency.setValueAtTime(400, t);
          f.frequency.exponentialRampToValueAtTime(2200, t + 1.2);
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.05, t + 0.8);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.connect(f); f.connect(g); g.connect(cur);
          o.start(t); o.stop(t + dur + 0.1);
        });
      }
      /* hydraulic hiss + motor for the doors */
      function doors(t, useSfx) {
        var prev = cur;
        cur = useSfx ? sfx : bus;
        noise(t, 1.2, 300, 4500, 0.8, 0.35);
        noise(t, 0.6, 5000, 9000, 0.7, 0.12, "highpass");
        servo(t, 1.1, 80, 260, 0.2);
        kick(t + 0.02, 0.5);
        cur = prev;
      }

      /* the whole soundtrack, placed on the audio clock */
      function schedule(t0) {
        cur = bus;
        var T = function (s) { return t0 + s; };
        var i;

        /* power on: thump, rising sweep, hum */
        kick(T(0), 1);
        tone(T(0), 1.5, "sine", 45, 520, 0.22, 0.05);
        noise(T(0), 1.4, 200, 7000, 1.2, 0.28);
        hum(T(0.2), 13.0);

        /* boot messages */
        var notes = [523, 622, 740, 880, 1046];
        TL.boot.forEach(function (s, k) {
          beep(T(s), notes[k], 0.1, 0.13);
          if (k === TL.boot.length - 1) { beep(T(s + 0.14), 1568, 0.14, 0.13); }
        });

        /* eyes wake up */
        servo(T(TL.eyes - 0.5), 1.0, 90, 360, 0.18);
        tone(T(TL.eyes + 0.3), 0.25, "sine", 880, 880, 0.14, 0.01);
        tone(T(TL.eyes + 0.5), 0.35, "sine", 1320, 1320, 0.12, 0.01);

        /* looking around */
        servo(T(TL.lookL), 0.35, 220, 300, 0.12);
        servo(T(TL.lookR), 0.5, 300, 200, 0.12);
        click(T(TL.lookC), 0.3);

        /* double blink */
        click(T(TL.blink), 0.35);
        click(T(TL.blink + 0.14), 0.3);

        /* charge-up riser with accelerating ticks */
        noise(T(TL.charge), TL.impact - TL.charge, 250, 8000, 1.5, 0.4);
        tone(T(TL.charge), TL.impact - TL.charge, "sawtooth", 70, 1100, 0.1, 0.5);
        [0, 0.55, 1.0, 1.4, 1.7, 1.95, 2.1, 2.2].forEach(function (d) { click(T(TL.charge + d), 0.3); });

        /* impact + welding sizzle + crackling sparks */
        boom(T(TL.impact));
        noise(T(TL.impact + 0.1), 1.2, 4000, 9000, 0.7, 0.12, "highpass");
        for (i = 0; i < 14; i++) { click(T(TL.impact + 0.1 + Math.random() * 1.1), 0.1 + Math.random() * 0.15); }

        /* R-O-B-O-T-S: a click and a thud for each letter */
        for (i = 0; i < WORD.length; i++) {
          click(T(TL.word + i * 0.16), 0.4);
          tone(T(TL.word + i * 0.16), 0.16, "sine", 140, 60, 0.5, 0.003);
        }

        /* weld line */
        noise(T(TL.weld), 1.0, 2500, 6000, 1, 0.18, "highpass");
        tone(T(TL.weld), 1.0, "sawtooth", 300, 1500, 0.05, 0.1);

        /* tagline: bright arpeggio + pad */
        [523.25, 659.25, 783.99, 1046.5].forEach(function (f, k) {
          tone(T(TL.tag + k * 0.14), 1.6, "triangle", f, f, 0.16, 0.01);
          tone(T(TL.tag + k * 0.14), 2.2, "sine", f * 2, f * 2, 0.05, 0.01);
        });
        pad(T(TL.tag), [130.81, 196, 329.63], 3.5);

        /* doors open */
        doors(T(TL.leave + 0.5), false);
      }

      return {
        ctx: ctx,
        analyser: analyser,
        schedule: schedule,
        doors: doors,
        mute: function (m) { out.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.03); },
        killScheduled: function () {
          bus.gain.cancelScheduledValues(ctx.currentTime);
          bus.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
        },
        close: function () { try { ctx.close(); } catch (e) { /* ignore */ } }
      };
    } catch (err) {
      return null;
    }
  }

  /* robot voice (speech synthesis): says the name and the tagline */
  function speak() {
    if (window.GGI18N && window.GGI18N.lang() === "ta") { if (!muted) { window.GGI18N.introSpeak("word"); } return; }
    if (muted || !("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) { return; }
    try {
      var u = new SpeechSynthesisUtterance("G G Robots. Smart robots for modern industry.");
      var voices = window.speechSynthesis.getVoices() || [];
      var v = voices.filter(function (x) { return /^en/i.test(x.lang); })[0];
      if (v) { u.voice = v; }
      u.lang = "en-US"; u.rate = 0.82; u.pitch = 0.3; u.volume = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
  function stopVoice() {
    try { if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); } } catch (e) { /* ignore */ }
  }

  /* =========================================================
     CANVAS: drifting embers, sound-reactive ring, sparks, weld torch
     ========================================================= */
  var cv = $(".gg-canvas");
  var cx = cv.getContext("2d");
  var W = 0, H = 0, parts = [], sparks = [], ring = 0, freq = null;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = W < 600 ? 36 : 70;
    parts = [];
    for (var i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + 0.4,
        v: Math.random() * 0.35 + 0.1, a: Math.random() * 0.6 + 0.2,
        c: Math.random() < 0.35 ? "255,138,31" : "143,181,255"
      });
    }
  }
  function geo() {
    var r = mark.getBoundingClientRect(), k = r.width / 640;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, g1: r.left + 200 * k, g2: r.left + 440 * k, r: 90 * k };
  }
  function burst(x, y, n, power) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, s = (Math.random() * 0.7 + 0.3) * power;
      sparks.push({
        x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5, life: 1,
        d: Math.random() * 0.02 + 0.012, c: Math.random() < 0.5 ? "255,176,77" : "255,255,255"
      });
    }
  }
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }

  function frame(now) {
    raf = window.requestAnimationFrame(frame);
    var t = now / 1000, i;
    cx.clearRect(0, 0, W, H);

    /* embers */
    for (i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y -= p.v;
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      cx.fillStyle = "rgba(" + p.c + "," + (p.a * (0.6 + 0.4 * Math.sin(t * 2 + p.x))).toFixed(3) + ")";
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.2832); cx.fill();
    }

    /* ring of bars around the logo, driven by the real sound (or a gentle idle wave) */
    var live = started && audio && !finished;
    if (live) { audio.analyser.getByteFrequencyData(freq); }
    var target = (intro.classList.contains("s-eyes") && !intro.classList.contains("leave")) ? 1 : 0;
    ring += (target - ring) * 0.05;
    if (ring > 0.01) {
      var g = geo(), R = Math.max(110, Math.min(W, H) * 0.34), N = 96, half = N / 2;
      cx.lineWidth = Math.max(2, W / 420); cx.lineCap = "round";
      for (i = 0; i < N; i++) {
        var idx = i < half ? i : N - 1 - i;
        var v = live ? freq[1 + Math.floor(idx * 0.6)] / 255 : (Math.sin(t * 3 + i * 0.35) + 1) * 0.07;
        var a = i / N * 6.2832 - 1.5708, r1 = R + 5 + v * 80 * ring;
        cx.strokeStyle = "rgba(" + (v > 0.55 ? "255,138,31" : "143,181,255") + "," + ((0.18 + 0.7 * v) * ring).toFixed(3) + ")";
        cx.beginPath();
        cx.moveTo(g.x + Math.cos(a) * R, g.y + Math.sin(a) * R);
        cx.lineTo(g.x + Math.cos(a) * r1, g.y + Math.sin(a) * r1);
        cx.stroke();
      }
    }

    /* weld torch: draws the line under ROBOTS and throws sparks */
    if (weldT0) {
      var wp = Math.min((performance.now() - weldT0) / 1050, 1);
      var wr = weldEl.getBoundingClientRect();
      var inset = 100 - ease(wp) * 100;
      weldEl.style.clipPath = "inset(-20px " + inset.toFixed(2) + "% -20px 0)";
      if (wp < 1) {
        var hx = wr.left + wr.width * ease(wp), hy = wr.top + wr.height / 2;
        burst(hx, hy, 2, 3.6);
        cx.save();
        cx.shadowBlur = 22; cx.shadowColor = "#ff8a1f"; cx.fillStyle = "#fff";
        cx.beginPath(); cx.arc(hx, hy, 4, 0, 6.2832); cx.fill();
        cx.restore();
      } else {
        weldEl.style.clipPath = "inset(-20px 0% -20px 0)";
        weldT0 = 0;
      }
    }

    /* sparks */
    for (i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += 0.08; s.vx *= 0.99; s.life -= s.d;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      cx.strokeStyle = "rgba(" + s.c + "," + s.life.toFixed(2) + ")";
      cx.lineWidth = 1.6;
      cx.beginPath(); cx.moveTo(s.x, s.y); cx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2); cx.stroke();
    }
  }

  /* =========================================================
     SEQUENCE
     ========================================================= */
  function add(c) { intro.classList.add(c); }
  function rm(c) { intro.classList.remove(c); }
  function look(x, y) { mark.style.setProperty("--lx", x + "px"); mark.style.setProperty("--ly", y + "px"); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function run(lag) {
    function cue(sec, fn) { timers.push(setTimeout(fn, (sec + lag) * 1000)); }

    cue(0, function () { add("s-power"); });
    TL.boot.forEach(function (s, i) {
      cue(s, function () {
        var d = document.createElement("div");
        d.innerHTML = BOOT_HTML[i];
        if (i === BOOT_HTML.length - 1) { d.className = "hot"; }
        bootEl.appendChild(d);
      });
    });
    cue(TL.bootOff, function () { add("s-bootoff"); });
    cue(TL.eyes, function () { add("s-eyes"); });
    cue(TL.lookL, function () { look(-24, -2); });
    cue(TL.lookR, function () { look(24, 3); });
    cue(TL.lookC, function () { look(0, 0); });
    cue(TL.blink, function () { add("blink"); setTimeout(function () { rm("blink"); }, 800); });
    cue(TL.charge, function () { add("s-charge"); });
    cue(TL.impact, function () {
      rm("s-charge"); add("s-gg");
      var g = geo();
      burst(g.x, g.y, 110, 7.5);
      burst(g.g1, g.y, 40, 5);
      timers.push(setTimeout(function () { var h = geo(); burst(h.g2, h.y, 45, 5); burst(h.g2 + h.r, h.y, 40, 6); }, 550));
    });
    cue(TL.word, function () { add("s-word"); speak(); });
    cue(TL.weld, function () { add("s-weld"); weldT0 = performance.now(); });
    cue(TL.tag, function () { add("s-tag"); add("s-done"); });
    cue(TL.leave, function () { leave(false); });
  }

  /* start: called by the power button (the click unlocks the sound) */
  function start() {
    if (started || finished) { return; }
    started = true;
    audio = makeAudio();
    var lag = 0;
    if (audio) {
      freq = new Uint8Array(audio.analyser.frequencyBinCount);
      lag = 0.15;
      audio.schedule(audio.ctx.currentTime + lag);
    } else {
      soundBtn.hidden = true;
    }
    add("started");
    run(lag);
    var skip = $(".gg-bottom .gg-skip");
    if (skip) { skip.focus(); }
  }

  /* leave: normal ending (doors open) or quick exit when skipped */
  function leave(quick) {
    if (finished) { return; }
    finished = true;
    clearTimers();
    document.removeEventListener("keydown", onKey);
    if (quick) {
      stopVoice();
      if (audio) { audio.killScheduled(); audio.doors(audio.ctx.currentTime + 0.25, true); }
      add("quick");
    }
    add("leave");
    setTimeout(function () { add("open"); }, quick ? 250 : 500);
    setTimeout(function () { body.classList.remove("intro-active"); release(); }, quick ? 600 : 1100);
    setTimeout(function () {
      add("gone");
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (audio) { audio.close(); }
    }, quick ? 1200 : 2000);
  }
  function onKey(e) { if (e.key === "Escape") { leave(true); } }

  /* ---------- wire everything up ---------- */
  resize();
  window.addEventListener("resize", resize);
  raf = window.requestAnimationFrame(frame);
  document.addEventListener("keydown", onKey);
  $(".gg-power").addEventListener("click", start);
  $$(".gg-skip").forEach(function (b) { b.addEventListener("click", function () { leave(true); }); });
  soundBtn.addEventListener("click", function () {
    muted = !muted;
    soundBtn.textContent = muted ? "Sound off" : "Sound on";
    if (audio) { audio.mute(muted); }
    if (muted) { stopVoice(); }
  });
  $(".gg-power").focus();
})();

/* =========================================================
   ENHANCEMENTS (customizer, talking robot, intro HUD, effects)
   ========================================================= */
/* =========================================================
   GG Robots - enhance.js
   Layered on top of script.js:
   1. Customizer panel (theme, accent, dark mode, text, voice) saved in Local Storage
   2. Talking hero robot (tap / ask / speak) with Web Speech API
   3. Richer intro (HUD, percentage, floor grid, orbit rings) and a spoken welcome
   4. Effects: aurora, hero particles, cursor glow, scroll progress, 3D tilt, scroll-spy, counters
   ========================================================= */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fine = !!(window.matchMedia && window.matchMedia("(pointer: fine)").matches);
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (html !== undefined) { n.innerHTML = html; }
    return n;
  }

  /* =========================================================
     1. SETTINGS + CUSTOMIZER
     ========================================================= */
  var KEY = "ggrobots.custom2";
  var DEF = { theme: "blue", accent: "", dark: true, fx: true, voice: true, rate: 0.95, pitch: 0.55, brand: "GG Robots", highlight: "modern industry", tagline: "" };
  var THEMES = {
    blue:    { label: "Ocean blue", navy: "#0a2a66", blue: "#0b57d0", sky: "#e8f0fe", hero2: "#12449b", accent: "#ff8a1f" },
    emerald: { label: "Emerald",    navy: "#073b32", blue: "#0f8a6d", sky: "#e2f6ef", hero2: "#0c6b57", accent: "#ffb020" },
    purple:  { label: "Violet",     navy: "#2a1166", blue: "#6d3bd2", sky: "#efe8fd", hero2: "#4a23a8", accent: "#ff5fa2" },
    crimson: { label: "Crimson",    navy: "#4a0f1a", blue: "#c62839", sky: "#fde8ea", hero2: "#8a1c2b", accent: "#ffc247" }
  };

  function load() {
    var c = {}, k;
    for (k in DEF) { c[k] = DEF[k]; }
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var p = JSON.parse(raw); for (k in p) { if (k in DEF) { c[k] = p[k]; } } }
    } catch (e) { /* storage blocked: use defaults */ }
    return c;
  }
  var cfg = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* ignore */ } }

  var logoEl = $(".logo");
  var footerH = $(".site-footer h3");
  var h1em = $(".hero h1 em");
  var heroP = $(".hero-grid > div > p");
  var origTagline = heroP ? heroP.textContent : "";
  var accentIn = null;

  function apply() {
    var t = THEMES[cfg.theme] || THEMES.blue, s = document.documentElement.style;
    s.setProperty("--navy", t.navy);
    s.setProperty("--blue", t.blue);
    s.setProperty("--sky", t.sky);
    s.setProperty("--hero2", t.hero2);
    s.setProperty("--accent", cfg.accent || t.accent);
    document.body.classList.toggle("dark", !!cfg.dark);
    document.body.classList.toggle("no-fx", !cfg.fx);

    var brand = (cfg.brand || "").trim() || DEF.brand;
    var parts = brand.split(/\s+/), first = parts.shift();
    if (logoEl) {
      logoEl.textContent = first + (parts.length ? " " : "");
      var sp = el("span"); sp.textContent = parts.join(" "); logoEl.appendChild(sp);
    }
    if (footerH) { footerH.textContent = brand; }
    document.title = brand + " | Industrial Robots & Automation";
    if (h1em) { h1em.textContent = (cfg.highlight || "").trim() || DEF.highlight; }
    if (heroP) { heroP.textContent = (cfg.tagline || "").trim() || origTagline; }
    if (accentIn) { accentIn.value = cfg.accent || t.accent; }
    $$(".cz-swatches button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-theme") === cfg.theme); });
  }

  function buildCustomizer() {
    var fab = el("button", "cz-fab",
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>');
    fab.type = "button";
    fab.setAttribute("aria-label", "Customize this page");
    fab.setAttribute("aria-expanded", "false");

    var swatches = Object.keys(THEMES).map(function (k) {
      var t = THEMES[k];
      return '<button type="button" data-theme="' + k + '" title="' + t.label + '" aria-label="' + t.label + ' theme" style="background:linear-gradient(135deg,' + t.navy + ' 55%,' + t.accent + ' 55%)"></button>';
    }).join("");

    var panel = el("aside", "cz-panel",
      '<header><h3>Customize</h3><button type="button" class="cz-x" aria-label="Close customizer">&times;</button></header>' +
      '<p class="cz-sub">Make this site yours. Saved in this browser.</p>' +
      '<div class="cz-group"><span>Colour theme</span><div class="cz-swatches">' + swatches + '</div></div>' +
      '<label class="cz-row"><span>Accent colour</span><input type="color" id="cz-accent"></label>' +
      '<label class="cz-row"><span>Dark mode</span><input type="checkbox" class="cz-switch" id="cz-dark" role="switch"></label>' +
      '<label class="cz-row"><span>Background effects</span><input type="checkbox" class="cz-switch" id="cz-fx" role="switch"></label>' +
      '<label class="cz-row"><span>Robot voice</span><input type="checkbox" class="cz-switch" id="cz-voice" role="switch"></label>' +
      '<label class="cz-row"><span>Voice speed</span><input type="range" id="cz-rate" min="0.6" max="1.4" step="0.05"></label>' +
      '<label class="cz-row"><span>Voice pitch</span><input type="range" id="cz-pitch" min="0.1" max="1.6" step="0.05"></label>' +
      '<label class="cz-field">Brand name<input type="text" id="cz-brand" maxlength="24"></label>' +
      '<label class="cz-field">Hero highlight words<input type="text" id="cz-highlight" maxlength="30"></label>' +
      '<label class="cz-field">Hero tagline<input type="text" id="cz-tagline" maxlength="140" placeholder="Leave empty for the default"></label>' +
      '<div class="cz-actions"><button type="button" class="btn btn-blue btn-sm" id="cz-test">Test voice</button><button type="button" class="btn btn-grey btn-sm" id="cz-reset">Reset all</button></div>');
    panel.setAttribute("aria-hidden", "true");
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    accentIn = $("#cz-accent", panel);
    var dark = $("#cz-dark", panel), fx = $("#cz-fx", panel), voice = $("#cz-voice", panel);
    var rate = $("#cz-rate", panel), pitch = $("#cz-pitch", panel);
    var brand = $("#cz-brand", panel), hl = $("#cz-highlight", panel), tag = $("#cz-tagline", panel);

    function sync() {
      dark.checked = cfg.dark; fx.checked = cfg.fx; voice.checked = cfg.voice;
      rate.value = cfg.rate; pitch.value = cfg.pitch;
      brand.value = cfg.brand; hl.value = cfg.highlight; tag.value = cfg.tagline;
    }
    function toggle(open) {
      panel.classList.toggle("open", open);
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      fab.setAttribute("aria-expanded", open ? "true" : "false");
    }
    fab.addEventListener("click", function () { toggle(!panel.classList.contains("open")); });
    $(".cz-x", panel).addEventListener("click", function () { toggle(false); fab.focus(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) { toggle(false); } });

    $$(".cz-swatches button", panel).forEach(function (b) {
      b.addEventListener("click", function () { cfg.theme = b.getAttribute("data-theme"); cfg.accent = ""; save(); apply(); });
    });
    accentIn.addEventListener("input", function () { cfg.accent = accentIn.value; save(); apply(); });
    dark.addEventListener("change", function () { cfg.dark = dark.checked; save(); apply(); });
    fx.addEventListener("change", function () { cfg.fx = fx.checked; save(); apply(); });
    voice.addEventListener("change", function () {
      cfg.voice = voice.checked; save();
      if (!cfg.voice) { Talk.stopSpeech(); }
    });
    rate.addEventListener("input", function () { cfg.rate = Number(rate.value); save(); });
    pitch.addEventListener("input", function () { cfg.pitch = Number(pitch.value); save(); });
    brand.addEventListener("input", function () { cfg.brand = brand.value; save(); apply(); });
    hl.addEventListener("input", function () { cfg.highlight = hl.value; save(); apply(); });
    tag.addEventListener("input", function () { cfg.tagline = tag.value; save(); apply(); });
    $("#cz-test", panel).addEventListener("click", function () {
      var was = cfg.voice; cfg.voice = true;
      Talk.say("Hi! This is how I sound. Tap me anytime to chat.", { wave: true });
      cfg.voice = was;
    });
    $("#cz-reset", panel).addEventListener("click", function () {
      var k; for (k in DEF) { cfg[k] = DEF[k]; }
      save(); sync(); apply();
    });
    sync();
  }

  /* =========================================================
     2. TALKING HERO ROBOT
     ========================================================= */
  var robot = $("#hero-robot");
  var bubble = $("#hr-bubble");
  var synth = window.speechSynthesis;
  var TTS = !!(synth && window.SpeechSynthesisUtterance);
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var voices = [];
  var T = { tok: 0, typeT: 0, endT: 0 };

  function loadVoices() { try { voices = synth.getVoices() || []; } catch (e) { voices = []; } }
  if (TTS) {
    loadVoices();
    if (synth.addEventListener) { synth.addEventListener("voiceschanged", loadVoices); }
  }
  function L(s) { return (window.GGI18N && window.GGI18N.t) ? window.GGI18N.t(s) : s; }
  function pickVoice() {
    if (window.GGI18N && window.GGI18N.voiceLang() === "ta") {
      var tv = voices.filter(function (v) { return /^ta/i.test(v.lang); })[0];
      if (tv) { return tv; }
    }
    return voices.filter(function (v) { return /en[-_]IN/i.test(v.lang); })[0] ||
           voices.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
  }
  /* say numbers, units and names the way a person would */
  function spoken(t) {
    return t.replace(/\u20B9/g, "rupees ").replace(/GG/g, "G G").replace(/NM-/g, "N M ")
      .replace(/\bAMRs?\b/g, "A M R").replace(/24\/7/g, "twenty four seven").replace(/\bkg\b/g, "kilograms")
      .replace(/(\d+(\.\d+)?)%/g, "$1 percent").replace(/\u00B1/g, "plus or minus ").replace(/\bm\/s\b/g, "metres per second");
  }

  var Talk = {
    stopSpeech: function () {
      try { if (TTS) { synth.cancel(); } } catch (e) { /* ignore */ }
    },
    type: function (text) {
      clearInterval(T.typeT);
      var i = 0;
      bubble.textContent = "";
      bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
      T.typeT = setInterval(function () {
        i += 2;
        bubble.textContent = text.slice(0, i);
        if (i >= text.length) { clearInterval(T.typeT); bubble.textContent = text; }
      }, 28);
    },
    say: function (text, o) {
      if (!robot || !bubble) { return; }
      o = o || {};
      var my = ++T.tok;
      Talk.stopSpeech();
      clearTimeout(T.endT);
      Talk.type(text);
      robot.classList.remove("listening");
      robot.classList.add("talking");
      if (o.wave) {
        robot.classList.remove("waving", "jump", "happy"); void robot.offsetWidth;
        robot.classList.add("waving", "jump", "happy");
        setTimeout(function () { robot.classList.remove("waving", "jump", "happy"); }, 2800);
      }
      function done() {
        if (my !== T.tok) { return; }
        clearTimeout(T.endT);
        robot.classList.remove("talking");
        if (o.after) { o.after(); }
      }
      if (cfg.voice && TTS) {
        try {
          var u = new SpeechSynthesisUtterance(spoken(text));
          var v = pickVoice();
          if (v) { u.voice = v; }
          var isTa = window.GGI18N && window.GGI18N.lang() === "ta";
          u.lang = v ? v.lang : (isTa ? "ta-IN" : "en-IN");
          u.rate = cfg.rate; u.pitch = isTa ? Math.max(cfg.pitch, 0.9) : cfg.pitch; u.volume = 1;
          u.onend = done; u.onerror = done;
          synth.resume();
          synth.speak(u);
          T.endT = setTimeout(done, text.length * 95 + 2500);   /* safety: never stay stuck "talking" */
          return;
        } catch (e) { /* fall through to silent mode */ }
      }
      T.endT = setTimeout(done, text.length * 50 + 900);
    }
  };
  window.GGTalk = Talk;

  var LINES = [
    "Hi! I'm GG-1, the GG Robots mascot. Ask me anything!",
    "I can lift 500 kg without a coffee break.",
    "Welding, packing, painting. I do it all.",
    "99.2% uptime. Sleep is not in my code.",
    "Want a demo? Just say demo and I'll take you to the form.",
    "Beep boop. Safety first, always.",
    "Try the Robot Finder. It compares up to three models side by side."
  ];
  var TICKLE = ["Hehe, that tickles!", "Careful, I'm a precision robot!", "Okay okay, I'm waving, I'm waving!"];
  var lineIx = 0, taps = [];

  Talk.next = function () {
    var now = Date.now();
    taps = taps.filter(function (t) { return now - t < 1800; });
    taps.push(now);
    if (taps.length >= 4) {
      taps = [];
      var tk = (window.GGI18N && window.GGI18N.tickle && window.GGI18N.tickle()) || TICKLE;
      Talk.say(tk[Math.floor(Math.random() * tk.length)], { wave: true });
      return;
    }
    var arr = (window.GGI18N && window.GGI18N.lines && window.GGI18N.lines()) || LINES;
    lineIx = (lineIx + 1) % arr.length;
    Talk.say(arr[lineIx], { wave: true });
  };

  /* small keyword brain: answers questions about the robots and the site */
  var BRAIN = [
    { k: /\b(hello|hi|hey|namaste|vanakkam)\b/, t: "Hello! I'm GG-1. Ask me about payload, prices, safety or book a demo." },
    { k: /(your name|who are you|what are you)/, t: "I'm GG-1, the mascot of GG Robots. I help visitors find the right robot." },
    { k: /(what can you do|help|features)/, t: "I can tell you about our four robot families, prices and uptime, and take you to the demo form." },
    { k: /(payload|lift|heavy|weight|capacity)/, t: "Our NM-A500 arm lifts 500 kg. The NM-M1000 mobile robot carries a full tonne." },
    { k: /(price|cost|budget|cheap|expensive|how much)/, t: "Prices run from \u20B99.5 lakh for the Delta robot to \u20B962 lakh for the heavy arm. Use the Finder to filter by budget.", go: "#finder" },
    { k: /(cobot|collaborat|safe|safety|human)/, t: "Our cobots use force-limited sensors, so they can work right beside people. Try Safe Mode in Settings.", go: "#settings" },
    { k: /(amr|mobile|warehouse|logistic|pallet|lidar)/, t: "Our autonomous mobile robots navigate with LiDAR and move pallets without drivers." },
    { k: /(delta|pack|sort|speed|fast)/, t: "The delta robot picks up to 200 items a minute with vision guidance." },
    { k: /(weld|paint|automotive|car|arm)/, t: "Our industrial arms weld, paint and assemble with 0.05 millimetre repeatability." },
    { k: /(uptime|reliab|24\/7|shift)/, t: "Our fleet averages 99 percent uptime and runs 24/7." },
    { k: /(demo|quote|enquiry|inquiry|contact|buy|book|order)/, t: "Great! Taking you to the demo and quotation form.", go: "#enquiry" },
    { k: /(compare|find|search|filter|model)/, t: "Opening the Robot Finder. You can compare up to three models.", go: "#finder" },
    { k: /(task|maintenance|service|repair)/, t: "The Maintenance Task Manager lets you add, edit and delete service tasks.", go: "#tasks" },
    { k: /(where|location|address|coimbatore|office)/, t: "We are at 12 Automation Park, Coimbatore, Tamil Nadu." },
    { k: /(joke|funny)/, t: "Why did the robot go on holiday? It needed to recharge its batteries!" },
    { k: /(thank|bye|good night)/, t: "You're welcome! Come back soon. Beep boop!" }
  ];
  function reply(q) {
    q = q.toLowerCase();
    for (var i = 0; i < BRAIN.length; i++) { if (BRAIN[i].k.test(q)) { return BRAIN[i]; } }
    return { t: "Hmm, I'm still learning that one. Try asking about payload, price, safety or a demo." };
  }
  function ask(q) {
    q = (q || "").trim();
    if (!q) { return; }
    var r = (window.GGI18N && window.GGI18N.reply && window.GGI18N.reply(q)) || reply(q);
    Talk.say(r.t, {
      wave: true,
      after: r.go ? function () {
        var t = $(r.go);
        if (t) { t.scrollIntoView({ behavior: "smooth", block: "start" }); }
      } : null
    });
  }

  function buildTalkUi() {
    if (!robot) { return; }
    var col = el("div", "hero-robot-col");
    robot.parentNode.insertBefore(col, robot);
    col.appendChild(robot);
    col.appendChild(el("div", "hr-hint", "Tap the robot to hear it talk"));

    var ui = el("div", "hr-ask",
      '<div class="hr-chips">' +
      '<button type="button" data-q="What can you do?">What can you do?</button>' +
      '<button type="button" data-q="How much does it cost?">Prices</button>' +
      '<button type="button" data-q="Is it safe?">Is it safe?</button>' +
      '<button type="button" data-q="Tell me a joke">Joke</button>' +
      '<button type="button" data-q="Book a demo">Book a demo</button></div>' +
      '<form class="hr-form" autocomplete="off"><input type="text" aria-label="Ask GG-1 a question" placeholder="Ask GG-1 anything..." maxlength="120">' +
      '<button type="button" class="hr-mic" aria-label="Speak your question"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>' +
      '<button type="submit">Ask</button></form>');
    col.appendChild(ui);

    var input = $("input", ui), mic = $(".hr-mic", ui), rec = null;
    $$(".hr-chips button", ui).forEach(function (b) { b.addEventListener("click", function () { ask(b.getAttribute("data-q")); }); });
    $(".hr-form", ui).addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); input.value = ""; });

    if (!SR) { mic.hidden = true; }
    mic.addEventListener("click", function () {
      if (rec) { try { rec.stop(); } catch (e) { /* ignore */ } return; }
      Talk.stopSpeech();
      try {
        rec = new SR();
        rec.lang = (window.GGI18N && window.GGI18N.lang() === "ta") ? "ta-IN" : "en-IN"; rec.interimResults = false; rec.maxAlternatives = 1;
        rec.onstart = function () { mic.classList.add("on"); robot.classList.add("listening"); Talk.type(L("I'm listening...")); };
        rec.onresult = function (e) { var t = e.results[0][0].transcript; input.value = t; ask(t); input.value = ""; };
        rec.onerror = function () { Talk.say(L("I couldn't hear that. Please try again or type your question.")); };
        rec.onend = function () { mic.classList.remove("on"); robot.classList.remove("listening"); rec = null; };
        rec.start();
      } catch (err) { rec = null; Talk.say(L("Voice input isn't available here. Please type your question.")); }
    });
  }

  /* =========================================================
     3. RICHER INTRO
     ========================================================= */
  var intro = $("#intro");
  function introDone(cb) {
    if (!intro || intro.classList.contains("gone")) { cb(); return; }
    var fired = false;
    new MutationObserver(function (m, obs) {
      if (!fired && intro.classList.contains("open")) { fired = true; obs.disconnect(); setTimeout(cb, 900); }
    }).observe(intro, { attributes: true, attributeFilter: ["class"] });
  }

  function buildIntroHud() {
    if (!intro || intro.classList.contains("gone")) { return; }
    var host = $(".gg-content", intro);
    if (!host) { return; }
    host.insertBefore(el("div", "gg-floor"), host.firstChild);
    host.appendChild(el("div", "gg-orbit", "<i></i><i></i><i></i>"));
    var hud = el("div", "gg-hud",
      "<b></b><b></b><b></b><b></b>" +
      '<div class="tl">GG-OS // BOOT SEQUENCE</div><div class="tr"><span class="clk"></span></div><div class="hex"></div>');
    host.appendChild(hud);

    var hexEl = $(".hex", hud), clk = $(".clk", hud);
    var pct = el("span", "gg-pct", "0%");
    var bar = $(".gg-bar", intro);
    if (bar && bar.parentNode) { bar.parentNode.insertBefore(pct, bar.nextSibling); }

    function hexLine() {
      var s = "", i;
      for (i = 0; i < 4; i++) { s += ("0000" + Math.floor(Math.random() * 65536).toString(16)).slice(-4).toUpperCase() + " "; }
      return s;
    }
    var running = false, t0 = 0, hexT = 0, clkT = 0;
    function startHud() {
      if (running) { return; }
      running = true; t0 = performance.now();
      hexT = setInterval(function () {
        var lines = hexEl.textContent ? hexEl.textContent.split("\n") : [];
        lines.push(hexLine());
        if (lines.length > 9) { lines.shift(); }
        hexEl.textContent = lines.join("\n");
      }, 140);
      clkT = setInterval(function () { clk.textContent = new Date().toLocaleTimeString([], { hour12: false }); }, 1000);
      clk.textContent = new Date().toLocaleTimeString([], { hour12: false });
      (function loop() {
        if (!running) { return; }
        var p = Math.min(100, (performance.now() - t0) / 136);
        pct.textContent = Math.floor(p) + "%";
        requestAnimationFrame(loop);
      })();
    }
    function stopHud() { running = false; clearInterval(hexT); clearInterval(clkT); }

    new MutationObserver(function (m, obs) {
      if (intro.classList.contains("s-power")) { startHud(); }
      if (intro.classList.contains("leave") || intro.classList.contains("gone")) { stopHud(); if (intro.classList.contains("gone")) { obs.disconnect(); } }
    }).observe(intro, { attributes: true, attributeFilter: ["class"] });

    intro.addEventListener("pointermove", function (e) {
      intro.style.setProperty("--px", (e.clientX / window.innerWidth - 0.5) * 2);
      intro.style.setProperty("--py", (e.clientY / window.innerHeight - 0.5) * 2);
    });
  }

  /* =========================================================
     4. EFFECTS
     ========================================================= */
  function buildAurora() { var a = el("div", "aurora", "<i></i><i></i><i></i>"); a.setAttribute("aria-hidden", "true"); document.body.insertBefore(a, document.body.firstChild); }

  function scrollProgress() {
    var bar = el("div", "scroll-progress"); bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  function cursorGlow() {
    if (!fine) { return; }
    var g = el("div", "cursor-glow"); g.setAttribute("aria-hidden", "true"); document.body.appendChild(g);
    document.addEventListener("pointermove", function (e) {
      g.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
      g.classList.add("on");
    });
    document.addEventListener("mouseleave", function () { g.classList.remove("on"); });
  }

  function tilt() {
    if (!fine || reduce) { return; }
    var sel = ".card, .gallery figure, .explore-card, .finder-card", cur = null;
    function reset(c) { c.style.transform = ""; c.style.transition = ""; }
    document.addEventListener("pointermove", function (e) {
      var c = e.target.closest ? e.target.closest(sel) : null;
      if (cur && cur !== c) { reset(cur); cur = null; }
      if (!c || document.body.classList.contains("no-fx")) { return; }
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transition = "transform 0.08s";
      c.style.transform = "perspective(900px) rotateY(" + (x * 9).toFixed(2) + "deg) rotateX(" + (-y * 9).toFixed(2) + "deg) translateY(-6px)";
      cur = c;
    });
    document.addEventListener("mouseleave", function () { if (cur) { reset(cur); cur = null; } });
  }

  function heroParticles() {
    var hero = $(".hero");
    if (!hero || reduce) { return; }
    var cv = el("canvas", "hero-canvas"); cv.setAttribute("aria-hidden", "true");
    hero.insertBefore(cv, hero.firstChild);
    var cx = cv.getContext("2d"), W = 0, H = 0, pts = [], mx = -999, my = -999, vis = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, W * H / 14000)), i;
      pts = [];
      for (i = 0; i < n; i++) { pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, o: Math.random() < 0.2 }); }
    }
    size();
    window.addEventListener("resize", size);
    hero.addEventListener("pointermove", function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener("pointerleave", function () { mx = my = -999; });
    if ("IntersectionObserver" in window) { new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(hero); }

    (function tick() {
      requestAnimationFrame(tick);
      if (!vis || document.hidden || document.body.classList.contains("no-fx")) { return; }
      cx.clearRect(0, 0, W, H);
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        a = pts[i];
        dx = a.x - mx; dy = a.y - my; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130 && d > 0) { a.x += dx / d * 1.1; a.y += dy / d * 1.1; }
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0) { a.x = W; } else if (a.x > W) { a.x = 0; }
        if (a.y < 0) { a.y = H; } else if (a.y > H) { a.y = 0; }
        cx.fillStyle = a.o ? "rgba(255,138,31,0.9)" : "rgba(143,181,255,0.8)";
        cx.beginPath(); cx.arc(a.x, a.y, a.o ? 2.4 : 1.7, 0, 6.2832); cx.fill();
        for (j = i + 1; j < pts.length; j++) {
          b = pts[j]; dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
          if (d < 12100) {
            cx.strokeStyle = "rgba(143,181,255," + (0.22 * (1 - d / 12100)).toFixed(3) + ")";
            cx.lineWidth = 1;
            cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
          }
        }
      }
    })();
  }

  function scrollSpy() {
    if (!("IntersectionObserver" in window)) { return; }
    var links = {};
    $$(".nav-list a").forEach(function (a) { var h = a.getAttribute("href"); if (h && h.charAt(0) === "#" && h.length > 1) { links[h.slice(1)] = a; } });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        Object.keys(links).forEach(function (k) { links[k].classList.toggle("active", k === en.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) { io.observe(s); } });
  }

  function countUp() {
    $$(".hero-stats strong").slice(0, 2).forEach(function (s) {
      var m = s.textContent.match(/^(\d+)(.*)$/);
      if (!m) { return; }
      var end = Number(m[1]), suffix = m[2], t0 = performance.now();
      (function step(now) {
        var p = Math.min((now - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
        s.textContent = Math.round(end * e) + suffix;
        if (p < 1) { requestAnimationFrame(step); }
      })(t0);
    });
  }

  /* =========================================================
     START
     ========================================================= */
  buildAurora();
  buildCustomizer();
  apply();
  buildTalkUi();
  buildIntroHud();
  scrollProgress();
  cursorGlow();
  tilt();
  heroParticles();
  scrollSpy();

  introDone(function () {
    countUp();
    if (robot && cfg.voice) {
      var wt = (window.GGI18N && window.GGI18N.welcome && window.GGI18N.welcome()) ||
        ("Welcome to " + ((cfg.brand || "").trim() || DEF.brand) + "! Tap me to chat, or ask me a question.");
      Talk.say(wt, { wave: true });
    }
  });
})();
/* =========================================================
   GG Robots - FINAL ENHANCEMENTS
   1. Demo video: chapters, speed, loop, cinema mode, "Watch demo" buttons
   2. Audio player: playlist, live bar visualiser, one-thing-at-a-time playback
   3. Robot Sound Lab (Web Audio, no files needed)
   4. Industry solutions tabs
   5. ROI calculator with animated chart
   6. Animated counters, scroll reveal for new sections, back-to-top
   ========================================================= */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined) { n.textContent = text; }
    return n;
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function mmss(sec) {
    if (!isFinite(sec)) { return "0:00"; }
    sec = Math.max(0, Math.floor(sec));
    return Math.floor(sec / 60) + ":" + pad2(sec % 60);
  }
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------------------------------------------------------
     1. DEMO VIDEO
     --------------------------------------------------------- */
  var video = $("#demo-video");
  var audio = $("#gg-audio");

  if (video) {
    var chapterBtns = $$("#chapters button");
    var nowEl = $("#v-now");
    var loopBtn = $("#v-loop");
    var cinemaBtn = $("#v-cinema");
    var box = $(".video-box");
    var chapters = chapterBtns.map(function (b) {
      return { t: Number(b.getAttribute("data-t")), name: b.textContent.replace(/^\s*\d+:\d+\s*/, "") };
    });

    function setChapter(i) {
      chapterBtns.forEach(function (b, k) { b.classList.toggle("active", k === i); });
      if (nowEl) { nowEl.textContent = "Chapter: " + chapters[i].name; }
    }
    chapterBtns.forEach(function (b, i) {
      b.addEventListener("click", function () {
        video.currentTime = chapters[i].t;
        var p = video.play();
        if (p && p.catch) { p.catch(function () { /* autoplay blocked: person can press play */ }); }
        setChapter(i);
      });
    });
    video.addEventListener("timeupdate", function () {
      var cur = 0;
      chapters.forEach(function (c, i) { if (video.currentTime + 0.05 >= c.t - 0.6) { cur = i; } });
      setChapter(cur);
    });
    setChapter(0);

    $("#v-speed").addEventListener("change", function (e) { video.playbackRate = Number(e.target.value); });

    loopBtn.addEventListener("click", function () {
      video.loop = !video.loop;
      loopBtn.textContent = "Loop: " + (video.loop ? "on" : "off");
      loopBtn.setAttribute("aria-pressed", video.loop ? "true" : "false");
      loopBtn.classList.toggle("active", video.loop);
    });

    function setCinema(on) {
      document.body.classList.toggle("cinema", on);
      cinemaBtn.setAttribute("aria-pressed", on ? "true" : "false");
      cinemaBtn.textContent = on ? "Exit cinema" : "Cinema mode";
      cinemaBtn.classList.toggle("active", on);
    }
    cinemaBtn.addEventListener("click", function () { setCinema(!document.body.classList.contains("cinema")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("cinema")) { setCinema(false); } });
    document.addEventListener("click", function (e) {
      if (document.body.classList.contains("cinema") && !e.target.closest(".video-box")) { setCinema(false); }
    });
    video.addEventListener("play", function () {
      if (audio && !audio.paused) { audio.pause(); }
    });
    video.addEventListener("error", function () {
      if (!$(".video-fallback", box)) {
        var msg = make("p", "video-fallback", "The video could not be loaded. Make sure the media folder (robot-demo.mp4) is next to index.html.");
        video.parentNode.appendChild(msg);
      }
    }, true);

    /* "Watch demo" buttons scroll to the video and start it */
    $$("[data-play-demo]").forEach(function (a) {
      a.addEventListener("click", function () {
        setTimeout(function () {
          var p = video.play();
          if (p && p.catch) { p.catch(function () { /* blocked: press play */ }); }
        }, 700);
      });
    });
  }

  /* ---------------------------------------------------------
     2. AUDIO PLAYER: playlist + visualiser
     --------------------------------------------------------- */
  if (audio) {
    var host = $("#ap");
    var tracks = [
      { src: "media/intro.mp3", title: "GG Robots Jingle", sub: "Upbeat instrumental", bpm: 126 },
      { src: "media/factory.mp3", title: "Factory Floor", sub: "Machines, servos and welding", bpm: 40 }
    ];
    var current = 0;

    var head = make("div", "ap-head");
    var disc = make("div", "ap-disc");
    disc.setAttribute("aria-hidden", "true");
    var meta = make("div", "ap-meta");
    var title = make("strong", "", tracks[0].title);
    var sub = make("span", "", tracks[0].sub);
    meta.appendChild(title); meta.appendChild(sub);
    head.appendChild(disc); head.appendChild(meta);

    var cv = make("canvas", "ap-vis");
    cv.width = 600; cv.height = 80;
    cv.setAttribute("aria-hidden", "true");
    var ctx2d = cv.getContext("2d");

    var list = make("ul", "ap-list");
    tracks.forEach(function (tr, i) {
      var li = make("li");
      var b = make("button", i === 0 ? "active" : "");
      b.type = "button";
      b.innerHTML = '<span class="ap-n">' + (i + 1) + '</span><span class="ap-t"></span><span class="ap-eq" aria-hidden="true"><i></i><i></i><i></i></span>';
      $(".ap-t", b).textContent = tr.title;
      b.addEventListener("click", function () { load(i, true); });
      li.appendChild(b);
      list.appendChild(li);
    });

    host.insertBefore(head, host.firstChild);
    host.insertBefore(cv, audio);
    host.appendChild(list);

    function load(i, play) {
      current = i;
      audio.src = tracks[i].src;
      title.textContent = tracks[i].title;
      sub.textContent = tracks[i].sub;
      $$("button", list).forEach(function (b, k) { b.classList.toggle("active", k === i); });
      if (play) {
        var p = audio.play();
        if (p && p.catch) { p.catch(function () { /* blocked */ }); }
      }
    }
    audio.addEventListener("ended", function () { load((current + 1) % tracks.length, true); });
    audio.addEventListener("play", function () {
      host.classList.add("playing");
      if (video && !video.paused) { video.pause(); }
      loop();
    });
    audio.addEventListener("pause", function () { host.classList.remove("playing"); });

    var raf = 0;
    function accent() { return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ff8a1f"; }
    function blue() { return getComputedStyle(document.documentElement).getPropertyValue("--blue").trim() || "#0b57d0"; }
    function draw(now) {
      var w = cv.width, h = cv.height, n = 56, bw = w / n;
      ctx2d.clearRect(0, 0, w, h);
      var playing = !audio.paused && !audio.ended;
      var beat = 0;
      if (playing) {
        var ph = (audio.currentTime * tracks[current].bpm / 60) % 1;
        beat = Math.exp(-ph * 4.5);
      }
      var a = accent(), b = blue();
      for (var i = 0; i < n; i++) {
        var base = 0.06;
        var v = base;
        if (playing) {
          v = 0.14 + 0.32 * Math.abs(Math.sin(now / 260 + i * 0.55)) * Math.abs(Math.cos(now / 410 - i * 0.31)) + beat * 0.45 * (1 - i / n * 0.7);
        } else {
          v = base + 0.03 * Math.sin(i * 0.4);
        }
        v = Math.min(v, 1);
        var bh = Math.max(3, v * h);
        ctx2d.fillStyle = (i % 5 === 0) ? a : b;
        ctx2d.globalAlpha = playing ? 0.95 : 0.4;
        var x = i * bw + 2;
        ctx2d.fillRect(x, (h - bh) / 2, bw - 4, bh);
      }
      ctx2d.globalAlpha = 1;
    }
    function loop() {
      cancelAnimationFrame(raf);
      (function tick(now) {
        draw(now);
        if (!audio.paused && !audio.ended && !document.hidden) { raf = requestAnimationFrame(tick); }
        else { draw(now); }
      })(performance.now());
    }
    draw(0);
  }

  /* ---------------------------------------------------------
     3. ROBOT SOUND LAB (Web Audio API)
     --------------------------------------------------------- */
  var lab = $("#lab");
  if (lab) {
    var ac = null, scope = $(".lab-scope");
    function ctx() {
      if (!ac) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { return null; }
        ac = new AC();
      }
      if (ac.state === "suspended") { ac.resume(); }
      return ac;
    }
    function tone(c, t, dur, type, f0, f1, vol) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t);
      if (f1 && f1 !== f0) { o.frequency.exponentialRampToValueAtTime(f1, t + dur); }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + 0.05);
    }
    function noise(c, t, dur, f0, f1, vol, type) {
      var len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) { d[i] = Math.random() * 2 - 1; }
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; f.type = type || "bandpass"; f.Q.value = 1.2;
      f.frequency.setValueAtTime(f0, t);
      if (f1) { f.frequency.exponentialRampToValueAtTime(f1, t + dur); }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.05, dur / 3));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(c.destination);
      s.start(t); s.stop(t + dur + 0.05);
    }
    var SOUNDS = {
      power: function (c, t) {
        tone(c, t, 1.4, "sine", 45, 700, 0.35);
        tone(c, t, 0.4, "sine", 150, 40, 0.6);
        noise(c, t, 1.3, 200, 6000, 0.25);
        [523, 659, 784, 1047].forEach(function (f, i) { tone(c, t + 1.0 + i * 0.12, 0.2, "square", f, f, 0.12); });
        return 1.8;
      },
      servo: function (c, t) {
        var o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain(), f = c.createBiquadFilter();
        o.type = "sawtooth"; o.frequency.setValueAtTime(180, t); o.frequency.linearRampToValueAtTime(520, t + 0.9); o.frequency.linearRampToValueAtTime(240, t + 1.6);
        l.frequency.value = 30; lg.gain.value = 14; l.connect(lg); lg.connect(o.frequency);
        f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 3;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.3); g.gain.linearRampToValueAtTime(0.0001, t + 1.6);
        o.connect(f); f.connect(g); g.connect(c.destination);
        o.start(t); l.start(t); o.stop(t + 1.7); l.stop(t + 1.7);
        return 1.7;
      },
      weld: function (c, t) {
        noise(c, t, 1.6, 3500, 7000, 0.3, "highpass");
        for (var i = 0; i < 18; i++) { noise(c, t + Math.random() * 1.4, 0.05, 2500, 1500, 0.25, "bandpass"); }
        tone(c, t, 1.5, "sawtooth", 300, 1400, 0.04);
        return 1.6;
      },
      beep: function (c, t) {
        tone(c, t, 0.1, "square", 1320, 1320, 0.14);
        tone(c, t + 0.16, 0.1, "square", 1760, 1760, 0.14);
        return 0.4;
      },
      alarm: function (c, t) {
        for (var i = 0; i < 4; i++) { tone(c, t + i * 0.3, 0.25, "square", i % 2 ? 660 : 880, i % 2 ? 660 : 880, 0.14); }
        return 1.3;
      },
      chime: function (c, t) {
        [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
          tone(c, t + i * 0.12, 1.3, "triangle", f, f, 0.2);
        });
        return 1.6;
      }
    };
    var scopeTimer = 0;
    lab.addEventListener("click", function (e) {
      var b = e.target.closest("[data-snd]");
      if (!b) { return; }
      var c = ctx();
      if (!c) { b.textContent = "No audio support"; return; }
      if (video && !video.paused) { video.pause(); }
      if (audio && !audio.paused) { audio.pause(); }
      var dur = SOUNDS[b.getAttribute("data-snd")](c, c.currentTime + 0.02);
      b.classList.remove("hit"); void b.offsetWidth; b.classList.add("hit");
      if (scope) {
        scope.classList.add("on");
        clearTimeout(scopeTimer);
        scopeTimer = setTimeout(function () { scope.classList.remove("on"); }, dur * 1000);
      }
    });
  }

  /* ---------------------------------------------------------
     4. INDUSTRY SOLUTIONS TABS
     --------------------------------------------------------- */
  var panel = $("#sol-panel");
  if (panel) {
    var SOL = [
      { model: "NM-A500 / NM-A120", title: "Automotive: welding and body assembly", scene: 0, cat: "Robotic Arm", ind: "Automotive",
        desc: "Heavy arms hold and weld car bodies all day with the same accuracy on the first and the thousandth part.",
        challenge: "Manual welding varies from shift to shift and exposes workers to heat and fumes.",
        solution: "Two synchronised six-axis arms weld the seam while a vision system checks every joint.",
        metrics: ["Up to 35% faster cycle", "0.05 mm repeatability", "Fewer reworks"] },
      { model: "NM-C10 / NM-C20", title: "Electronics: precise, safe assembly", scene: 1, cat: "Cobot", ind: "Electronics",
        desc: "Cobots place and screw small parts right beside technicians, with no safety cage needed.",
        challenge: "Tiny components need steady hands, and product changes happen every few weeks.",
        solution: "A force-limited cobot is re-taught in minutes by guiding its arm and picking a saved program.",
        metrics: ["Re-program in minutes", "0.03 mm accuracy", "Works beside people"] },
      { model: "NM-M1000 / NM-M300", title: "Logistics: driverless pallet transport", scene: 2, cat: "AMR", ind: "Logistics",
        desc: "Mobile robots carry pallets and bins between docks, racks and packing stations by themselves.",
        challenge: "Forklift traffic is slow, costly and a safety risk in busy aisles.",
        solution: "LiDAR-guided AMRs plan their own routes, avoid people and recharge between jobs.",
        metrics: ["Up to 1,000 kg load", "8 h per charge", "Scales as a fleet"] },
      { model: "NM-D200", title: "Food & packaging: high-speed sorting", scene: 3, cat: "Delta Robot", ind: "Food",
        desc: "Delta robots pick and place items at speeds no person can keep up with, in hygienic cells.",
        challenge: "Fast lines need a constant rhythm, and hand packing is tiring and inconsistent.",
        solution: "A vision-guided delta robot tracks items on the conveyor and packs them in flight.",
        metrics: ["200 picks per minute", "Vision-guided", "Easy to clean"] }
    ];
    var tabs = $$(".sol-tab");
    var artHost = $("#sol-art");
    var sceneSrc = $$(".explore-card .art");

    function show(i, focus) {
      var d = SOL[i];
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", tabs[i].id);
      $("#sol-model").textContent = d.model;
      $("#sol-title").textContent = d.title;
      $("#sol-desc").textContent = d.desc;
      $("#sol-challenge").textContent = d.challenge;
      $("#sol-solution").textContent = d.solution;
      var m = $("#sol-metrics");
      m.innerHTML = "";
      d.metrics.forEach(function (x, k) {
        var c = make("span", "chip", x);
        c.style.animationDelay = (k * 90) + "ms";
        m.appendChild(c);
      });
      if (sceneSrc[d.scene]) {
        artHost.className = "sol-art art live";
        artHost.innerHTML = sceneSrc[d.scene].innerHTML;
      }
      panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
      $("#sol-cta").setAttribute("data-cat", d.cat);
      $("#sol-cta").setAttribute("data-ind", d.ind);
      if (focus) { tabs[i].focus(); }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(i); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = tabs.length;
        if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); show((i + 1) % n, true); }
        else if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); show((i - 1 + n) % n, true); }
        else if (k === "Home") { e.preventDefault(); show(0, true); }
        else if (k === "End") { e.preventDefault(); show(n - 1, true); }
      });
    });
    /* the button pre-sets the Robot Finder to this industry's robot type */
    $("#sol-cta").addEventListener("click", function () {
      var cat = this.getAttribute("data-cat"), ind = this.getAttribute("data-ind");
      var cs = $("#finder-category"), is = $("#finder-industry");
      if (cs) { cs.value = cat; cs.dispatchEvent(new Event("change")); }
      if (is) { is.value = ind; is.dispatchEvent(new Event("change")); }
    });
    show(0);
  }

  /* ---------------------------------------------------------
     5. ROI CALCULATOR
     --------------------------------------------------------- */
  var roiForm = $("#roi-form");
  if (roiForm) {
    var el = {
      model: $("#roi-model"), qty: $("#roi-qty"), workers: $("#roi-workers"), wage: $("#roi-wage"), hours: $("#roi-hours"),
      qtyO: $("#roi-qty-o"), workersO: $("#roi-workers-o"), wageO: $("#roi-wage-o"), hoursO: $("#roi-hours-o"),
      invest: $("#roi-invest"), save: $("#roi-save"), pay: $("#roi-payback"), net: $("#roi-net"),
      chart: $("#roi-chart"), msg: $("#roi-msg")
    };
    function lakh(v) {
      var a = Math.abs(v), sign = v < 0 ? "-" : "";
      return sign + "₹" + (a >= 100 ? (a / 100).toFixed(2) + " crore" : a.toFixed(1) + " lakh");
    }
    function bump(node) { node.classList.remove("bump"); void node.offsetWidth; node.classList.add("bump"); }

    function calc() {
      var price = Number(el.model.value), qty = Number(el.qty.value), workers = Number(el.workers.value);
      var wage = Number(el.wage.value), hours = Number(el.hours.value);
      el.qtyO.textContent = qty; el.workersO.textContent = workers;
      el.wageO.textContent = "₹" + wage; el.hoursO.textContent = hours;

      var invest = price * qty;
      var saving = qty * workers * wage * hours * 300 / 100000;      /* rupees to lakh */
      var upkeep = invest * 0.06;
      var net = saving - upkeep;
      var months = net > 0 ? invest / net * 12 : Infinity;
      var five = net * 5 - invest;

      el.invest.textContent = lakh(invest);
      el.save.textContent = lakh(net);
      el.pay.textContent = isFinite(months) ? (months < 12 ? months.toFixed(1) + " months" : (months / 12).toFixed(1) + " years") : "Not reached";
      el.net.textContent = lakh(five);
      el.net.classList.toggle("neg", five < 0);
      [el.invest, el.save, el.pay, el.net].forEach(bump);

      /* chart: cumulative cash position, year 0 to 5 */
      var pts = [], i;
      for (i = 0; i <= 5; i++) { pts.push(-invest + net * i); }
      var lo = Math.min.apply(null, pts.concat([0])), hi = Math.max.apply(null, pts.concat([0]));
      if (hi === lo) { hi = lo + 1; }
      var L = 44, R = 388, T = 14, B = 160;
      var X = function (k) { return L + (R - L) * k / 5; };
      var Y = function (v) { return B - (B - T) * (v - lo) / (hi - lo); };
      var y0 = Y(0), s = "";
      s += '<line class="rc-zero" x1="' + L + '" y1="' + y0.toFixed(1) + '" x2="' + R + '" y2="' + y0.toFixed(1) + '"/>';
      var path = pts.map(function (v, k) { return (k ? "L" : "M") + X(k).toFixed(1) + " " + Y(v).toFixed(1); }).join(" ");
      s += '<path class="rc-area" d="' + path + ' L' + X(5).toFixed(1) + " " + y0.toFixed(1) + " L" + X(0).toFixed(1) + " " + y0.toFixed(1) + ' Z"/>';
      s += '<path class="rc-line" pathLength="1" d="' + path + '"/>';
      pts.forEach(function (v, k) {
        s += '<circle class="rc-dot' + (v >= 0 ? " pos" : "") + '" cx="' + X(k).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="4.5"/>';
        s += '<text class="rc-x" x="' + X(k).toFixed(1) + '" y="182" text-anchor="middle">Y' + k + '</text>';
      });
      s += '<text class="rc-y" x="4" y="' + (y0 - 5).toFixed(1) + '">0</text>';
      el.chart.innerHTML = s;

      if (net <= 0) {
        el.msg.textContent = "Upkeep is higher than the saving here. Try more working hours or a higher labour cost.";
      } else if (months <= 12) {
        el.msg.textContent = "Excellent: this setup pays for itself in under a year.";
      } else if (months <= 30) {
        el.msg.textContent = "Good: the investment is recovered in about " + (months / 12).toFixed(1) + " years.";
      } else {
        el.msg.textContent = "Long payback. A cheaper model or longer working hours would improve it.";
      }
    }
    roiForm.addEventListener("input", calc);
    roiForm.addEventListener("change", calc);
    calc();
  }

  /* ---------------------------------------------------------
     6. COUNTERS, REVEAL, BACK TO TOP
     --------------------------------------------------------- */
  function countUp(node) {
    var to = Number(node.getAttribute("data-to")), dec = Number(node.getAttribute("data-dec") || 0);
    var suffix = node.getAttribute("data-suffix") || "";
    if (reduce) { node.textContent = to.toFixed(dec) + suffix; return; }
    var t0 = performance.now(), dur = 1600;
    (function step(now) {
      var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      node.textContent = (to * e).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
      if (p < 1) { requestAnimationFrame(step); }
    })(t0);
  }
  var counters = $$(".count");
  var revealTargets = $$(".why-card, .sol-panel, .sol-tabs, .timeline li, .roi-form, .roi-result, .cta-inner, .media-col .media-box, .video-box, .faq-list .acc-item");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        var n = en.target;
        io.unobserve(n);
        if (n.classList.contains("count")) { countUp(n); return; }
        n.classList.remove("rv-pending");
        n.classList.add("rv-in");
      });
    }, { threshold: 0.15 });
    counters.forEach(function (c) { io.observe(c); });
    revealTargets.forEach(function (n, i) {
      n.classList.add("rv-pending");
      n.style.setProperty("--rv", (i % 4) * 90 + "ms");
      io.observe(n);
    });
  } else {
    counters.forEach(countUp);
  }

  /* back-to-top button only after scrolling */
  var top = $(".to-top");
  if (top) {
    var tick = false;
    var upd = function () { top.classList.toggle("hide", window.scrollY < 500); tick = false; };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }
})();

/* =========================================================
   GG Robots - i18n.js
   English / Tamil language switcher + Tamil robot voice.
   - Translates every text node and key attributes in place
   - Keeps translating text that other scripts create later (MutationObserver)
   - Exposes window.GGI18N for the robot voice, chat and intro
   ========================================================= */
(function () {
  "use strict";

  var KEY = "ggrobots.lang";
  var cur = "ta";
  try { cur = localStorage.getItem(KEY) || "ta"; } catch (e) { cur = "ta"; }
  if (cur !== "en" && cur !== "ta") { cur = "ta"; }

  /* ---------------------------------------------------------
     TAMIL DICTIONARY  (exact English text -> Tamil)
     --------------------------------------------------------- */
  var D = {
    /* navigation + hero */
    "Robots": "ரோபோக்கள்", "Gallery": "கேலரி", "Applications": "பயன்பாடுகள்", "Demo": "டெமோ", "Specs": "விவரக்குறிப்பு",
    "Explore": "ஆராய்க", "Fleet": "குழுமம்", "Live Data": "நேரடி தரவு", "Tasks": "பணிகள்", "Finder": "தேடல்", "ROI": "லாபக் கணக்கு",
    "FAQ": "கேள்விகள்", "Settings": "அமைப்புகள்", "Get a Quote": "விலைப்புள்ளி பெறுங்கள்",
    "Industry 4.0 \u00B7 Made in Coimbatore": "தொழில் 4.0 \u00B7 கோயம்புத்தூரில் தயாரிப்பு",
    "Smart robots for": "ஸ்மார்ட் ரோபோக்கள்,", "modern industry": "நவீன தொழில்துறைக்கு",
    "GG Robots designs industrial robots that help factories, warehouses and hospitals work faster, safer and more accurately.":
      "தொழிற்சாலைகள், கிடங்குகள் மற்றும் மருத்துவமனைகள் வேகமாகவும், பாதுகாப்பாகவும், துல்லியமாகவும் இயங்க உதவும் தொழில்துறை ரோபோக்களை GG Robots வடிவமைக்கிறது.",
    "Request a Demo": "டெமோ கோருங்கள்", "Explore Robots": "ரோபோக்களைப் பாருங்கள்", "\u25B6 Watch Demo": "\u25B6 டெமோ பாருங்கள்",
    "Robot families": "ரோபோ வகைகள்", "Max payload": "அதிகபட்ச சுமை", "Operation": "இயக்கம்",
    "99.2% uptime": "99.2% இயக்கநேரம்", "500 kg payload": "500 கிலோ சுமை", "24/7 shift": "24/7 பணி",
    "Hi! I'm GG-1. Click me!": "வணக்கம்! நான் GG-1. என்னைத் தொடுங்கள்!",
    "Tap the robot to hear it talk": "ரோபோவைத் தொட்டால் தமிழில் பேசும்",
    "What can you do?": "நீ என்ன செய்வாய்?", "Prices": "விலைகள்", "Is it safe?": "பாதுகாப்பானதா?", "Joke": "நகைச்சுவை", "Book a demo": "டெமோ பதிவு",
    "Ask GG-1 anything...": "GG-1 இடம் எதையும் கேளுங்கள்...", "Ask": "கேள்", "Ask GG-1 a question": "GG-1 இடம் கேள்வி கேளுங்கள்",
    "Speak your question": "பேசி கேளுங்கள்", "I'm listening...": "கேட்கிறேன்...",
    "I couldn't hear that. Please try again or type your question.": "எனக்குக் கேட்கவில்லை. மீண்டும் முயலுங்கள் அல்லது தட்டச்சு செய்யுங்கள்.",
    "Voice input isn't available here. Please type your question.": "இங்கே குரல் உள்ளீடு இல்லை. தயவுசெய்து தட்டச்சு செய்யுங்கள்.",

    /* marquee */
    "AUTOMOTIVE": "வாகனத் தொழில்", "ELECTRONICS": "மின்னணுவியல்", "LOGISTICS": "தளவாடம்", "FOOD & PACKAGING": "உணவு & பேக்கிங்",
    "HEALTHCARE": "மருத்துவம்", "WELDING": "வெல்டிங்", "PAINTING": "பெயின்டிங்", "ASSEMBLY": "அசெம்பிளி",

    /* categories */
    "Robot Categories": "ரோபோ வகைகள்", "Four robot families built for different industrial tasks.": "பல்வேறு தொழில் பணிகளுக்காக உருவாக்கப்பட்ட நான்கு ரோபோ வகைகள்.",
    "Best seller": "அதிகம் விற்பது", "Safe": "பாதுகாப்பானது", "Autonomous": "தானியங்கி", "High speed": "அதிவேகம்",
    "Industrial Robotic Arms": "தொழில்துறை ரோபோ கைகள்", "Welding, painting, assembly and material handling.": "வெல்டிங், பெயின்டிங், அசெம்பிளி மற்றும் பொருள் கையாளுதல்.",
    "Payload: 5 \u2013 500 kg": "சுமை: 5 \u2013 500 கிலோ", "Reach: up to 3.2 m": "எட்டும் தூரம்: 3.2 மீ வரை",
    "View specifications \u2192": "விவரக்குறிப்புகளைப் பாருங்கள் \u2192",
    "Collaborative Robots": "இணைந்து பணிபுரியும் ரோபோக்கள்", "Easy-to-program robots that work beside people.": "மனிதர்களுடன் இணைந்து பணிபுரியும், எளிதில் நிரலிடக்கூடிய ரோபோக்கள்.",
    "Payload: 3 \u2013 20 kg": "சுமை: 3 \u2013 20 கிலோ", "Force-limited sensors": "விசை வரம்பு உணரிகள்",
    "Autonomous Mobile Robots": "தானியங்கி நகரும் ரோபோக்கள்", "Self-navigating robots for logistics and transport.": "தளவாடம் மற்றும் போக்குவரத்துக்கான தானாக வழிசெல்லும் ரோபோக்கள்.",
    "Payload: up to 1,000 kg": "சுமை: 1,000 கிலோ வரை", "LiDAR navigation": "LiDAR வழிசெலுத்தல்",
    "Delta Robots": "டெல்டா ரோபோக்கள்", "Ultra-fast sorting, packaging and electronics assembly.": "அதிவேக வரிசைப்படுத்தல், பேக்கேஜிங் மற்றும் மின்னணு அசெம்பிளி.",
    "Up to 200 picks/min": "நிமிடத்துக்கு 200 எடுப்புகள் வரை", "Vision-guided": "கேமரா வழிகாட்டுதல்",

    /* gallery + applications */
    "Applications Gallery": "பயன்பாட்டுக் கேலரி", "Our robots at work across industries.": "பல்வேறு தொழில்களில் எங்கள் ரோபோக்களின் பணி.",
    "Automotive welding": "வாகன வெல்டிங்", "Electronics assembly": "மின்னணு அசெம்பிளி", "Warehouse logistics": "கிடங்கு தளவாடம்", "High-speed packaging": "அதிவேக பேக்கேஜிங்",
    "Industrial Applications": "தொழில்துறைப் பயன்பாடுகள்", "Where GG Robots deliver the most value.": "GG Robots அதிகப் பலன் தரும் இடங்கள்.",
    "Automotive": "வாகனத் தொழில்", "Welding, painting and body assembly with consistent quality.": "நிலையான தரத்துடன் வெல்டிங், பெயின்டிங் மற்றும் உடல் அசெம்பிளி.",
    "Electronics": "மின்னணுவியல்", "Precise component placement and board inspection.": "துல்லியமான பாகம் பொருத்துதல் மற்றும் போர்டு ஆய்வு.",
    "Logistics & Warehousing": "தளவாடம் & கிடங்கு", "Pallet transport, order picking and sorting.": "பேலட் போக்குவரத்து, ஆர்டர் எடுத்தல் மற்றும் வரிசைப்படுத்தல்.",
    "Food & Packaging": "உணவு & பேக்கிங்", "Hygienic high-speed packing and palletising.": "சுகாதாரமான அதிவேக பேக்கிங் மற்றும் பேலட்டிங்.",
    "Key Benefits": "முக்கிய நன்மைகள்", "Higher productivity and 24/7 operation": "அதிக உற்பத்தித்திறன் மற்றும் 24/7 இயக்கம்",
    "Improved accuracy and product quality": "மேம்பட்ட துல்லியம் மற்றும் தயாரிப்பு தரம்", "Safer workplaces by automating dangerous tasks": "ஆபத்தான பணிகளை தானியக்கம் செய்து பாதுகாப்பான பணியிடம்",
    "Lower long-term operating costs": "நீண்டகால இயக்கச் செலவு குறைவு",

    /* why */
    "Why GG Robots": "ஏன் GG Robots?", "Numbers from our live fleet data.": "எங்கள் நேரடி தரவிலிருந்து எண்கள்.",
    "Robots deployed": "நிறுவப்பட்ட ரோபோக்கள்", "Best model uptime": "சிறந்த மாடல் இயக்கநேரம்", "Models in 4 families": "4 வகைகளில் மாடல்கள்", "Operation and support": "இயக்கம் மற்றும் ஆதரவு",

    /* solutions */
    "Solutions by Industry": "தொழில் வாரியான தீர்வுகள்", "Pick your industry to see the robot, the challenge it solves and the typical result.": "உங்கள் தொழிலைத் தேர்ந்தெடுத்து ரோபோ, அது தீர்க்கும் சவால் மற்றும் பொதுவான முடிவைப் பாருங்கள்.",
    "Logistics": "தளவாடம்", "Challenge": "சவால்", "Solution": "தீர்வு",
    "Outcomes shown are illustrative examples, not guaranteed results.": "காட்டப்படும் முடிவுகள் எடுத்துக்காட்டுகள் மட்டுமே, உத்தரவாதம் அல்ல.",
    "Find this robot": "இந்த ரோபோவைத் தேடுங்கள்",
    "Automotive: welding and body assembly": "வாகனம்: வெல்டிங் மற்றும் உடல் அசெம்பிளி",
    "Heavy arms hold and weld car bodies all day with the same accuracy on the first and the thousandth part.": "கனமான கைகள் நாள் முழுவதும் கார் உடல்களைப் பிடித்து, முதல் பாகத்திலும் ஆயிரமாவது பாகத்திலும் ஒரே துல்லியத்தில் வெல்டிங் செய்கின்றன.",
    "Manual welding varies from shift to shift and exposes workers to heat and fumes.": "கைமுறை வெல்டிங் ஷிப்ட்டுக்கு ஷிப்ட் மாறுபடும்; தொழிலாளர்கள் வெப்பம் மற்றும் புகைக்கு ஆளாகிறார்கள்.",
    "Two synchronised six-axis arms weld the seam while a vision system checks every joint.": "ஒருங்கிணைந்த இரண்டு ஆறு-அச்சு கைகள் வெல்டிங் செய்ய, கேமரா அமைப்பு ஒவ்வொரு இணைப்பையும் சரிபார்க்கிறது.",
    "Up to 35% faster cycle": "35% வரை வேகமான சுழற்சி", "0.05 mm repeatability": "0.05 மிமீ துல்லியம்", "Fewer reworks": "குறைந்த மறுபணி",
    "Electronics: precise, safe assembly": "மின்னணுவியல்: துல்லியமான, பாதுகாப்பான அசெம்பிளி",
    "Cobots place and screw small parts right beside technicians, with no safety cage needed.": "பாதுகாப்புக் கூண்டு இல்லாமல் தொழில்நுட்பவியலாளர்களின் அருகிலேயே சிறிய பாகங்களை காபாட்கள் பொருத்துகின்றன.",
    "Tiny components need steady hands, and product changes happen every few weeks.": "சிறிய பாகங்களுக்கு நிலையான கைகள் தேவை; சில வாரங்களுக்கு ஒருமுறை தயாரிப்பு மாறுகிறது.",
    "A force-limited cobot is re-taught in minutes by guiding its arm and picking a saved program.": "விசை வரம்புள்ள காபாட்டின் கையை வழிநடத்தி, சேமித்த நிரலைத் தேர்ந்தெடுத்து நிமிடங்களில் மீண்டும் கற்பிக்கலாம்.",
    "Re-program in minutes": "நிமிடங்களில் மறுநிரல்", "0.03 mm accuracy": "0.03 மிமீ துல்லியம்", "Works beside people": "மனிதர்களுடன் இணைந்து பணி",
    "Logistics: driverless pallet transport": "தளவாடம்: ஓட்டுநர் இல்லாத பேலட் போக்குவரத்து",
    "Mobile robots carry pallets and bins between docks, racks and packing stations by themselves.": "நகரும் ரோபோக்கள் டாக், ரேக் மற்றும் பேக்கிங் நிலையங்களுக்கு இடையே பேலட்களைத் தாங்களாகவே கொண்டு செல்கின்றன.",
    "Forklift traffic is slow, costly and a safety risk in busy aisles.": "ஃபோர்க்லிஃப்ட் போக்குவரத்து மெதுவானது, செலவு மிக்கது, நெரிசலான பாதைகளில் ஆபத்தானது.",
    "LiDAR-guided AMRs plan their own routes, avoid people and recharge between jobs.": "LiDAR வழிகாட்டும் AMR கள் தங்கள் வழியைத் திட்டமிட்டு, மனிதர்களைத் தவிர்த்து, பணிகளுக்கு இடையே சார்ஜ் செய்கின்றன.",
    "Up to 1,000 kg load": "1,000 கிலோ வரை சுமை", "8 h per charge": "ஒரு சார்ஜுக்கு 8 மணி", "Scales as a fleet": "குழுவாக விரிவாக்கலாம்",
    "Food & packaging: high-speed sorting": "உணவு & பேக்கிங்: அதிவேக வரிசைப்படுத்தல்",
    "Delta robots pick and place items at speeds no person can keep up with, in hygienic cells.": "சுகாதாரமான செல்களில், மனிதர்களால் எட்ட முடியாத வேகத்தில் டெல்டா ரோபோக்கள் பொருட்களை எடுத்து வைக்கின்றன.",
    "Fast lines need a constant rhythm, and hand packing is tiring and inconsistent.": "வேகமான வரிசைகளுக்கு நிலையான தாளம் தேவை; கைமுறை பேக்கிங் சோர்வானது, சீரற்றது.",
    "A vision-guided delta robot tracks items on the conveyor and packs them in flight.": "கேமரா வழிகாட்டும் டெல்டா ரோபோ கன்வேயரில் பொருட்களைக் கண்காணித்து, நகரும்போதே பேக் செய்கிறது.",
    "200 picks per minute": "நிமிடத்துக்கு 200 எடுப்புகள்", "Easy to clean": "சுத்தம் செய்ய எளிது",

    /* process */
    "From Enquiry to Production": "விசாரணையிலிருந்து உற்பத்தி வரை", "Five clear steps. Most cells run within weeks.": "ஐந்து தெளிவான படிகள். பெரும்பாலான செல்கள் சில வாரங்களில் இயங்கும்.",
    "Consult": "ஆலோசனை", "Tell us your task, floor space and target output.": "உங்கள் பணி, இடவசதி மற்றும் உற்பத்தி இலக்கைச் சொல்லுங்கள்.",
    "Design": "வடிவமைப்பு", "We pick the robot, plan the layout and simulate the cell.": "ரோபோவைத் தேர்ந்து, அமைப்பைத் திட்டமிட்டு, செல்லை சிமுலேட் செய்வோம்.",
    "Install": "நிறுவுதல்", "Our engineers install, wire and safety-test the system.": "எங்கள் பொறியாளர்கள் நிறுவி, வயரிங் செய்து, பாதுகாப்புச் சோதனை செய்வார்கள்.",
    "Train": "பயிற்சி", "Your operators learn programming and daily care.": "உங்கள் ஆபரேட்டர்கள் நிரலாக்கமும் தினசரிப் பராமரிப்பும் கற்றுக்கொள்வார்கள்.",
    "Support": "ஆதரவு", "Remote monitoring, spares and 24/7 service help.": "தொலைநிலைக் கண்காணிப்பு, உதிரிபாகங்கள் மற்றும் 24/7 சேவை உதவி.",

    /* media */
    "See Our Robots in Action": "எங்கள் ரோபோக்கள் செயல்படுவதைப் பாருங்கள்", "Watch the demonstration film, play the GG Robots music, try the robot sound lab and find our demo centre.": "டெமோ படத்தைப் பாருங்கள், GG Robots இசையைக் கேளுங்கள், ரோபோ ஒலி ஆய்வகத்தை முயலுங்கள், எங்கள் டெமோ மையத்தைக் கண்டறியுங்கள்.",
    "Robot Demonstration Video": "ரோபோ செயல்விளக்க வீடியோ", "24 s \u00B7 sound on": "24 வினாடி \u00B7 ஒலியுடன்",
    "Power on": "இயக்கம்", "Welding": "வெல்டிங்", "Cobots & delta": "காபாட் & டெல்டா", "Mobile robots": "நகரும் ரோபோக்கள்", "Finale": "நிறைவு",
    "Speed": "வேகம்", "Loop: off": "சுழற்சி: அணை", "Loop: on": "சுழற்சி: இயக்கு", "Cinema mode": "சினிமா பயன்முறை", "Exit cinema": "சினிமா வெளியேறு",
    "Robotic arms, a cobot, a delta robot and a mobile robot at work, with music and sound effects. English captions are available.": "ரோபோ கைகள், ஒரு காபாட், டெல்டா ரோபோ மற்றும் நகரும் ரோபோ இசை மற்றும் ஒலி விளைவுகளுடன் செயல்படுகின்றன. ஆங்கில வசன வரிகள் உள்ளன.",
    "Audio Player": "ஆடியோ பிளேயர்", "Audio description": "ஆடியோ விளக்கம்",
    "Instrumental music with no spoken words. Track 1 is an upbeat GG Robots jingle. Track 2 is the sound of a busy robot factory floor.": "பேச்சு இல்லாத இசை. பாடல் 1 உற்சாகமான GG Robots இசை. பாடல் 2 பரபரப்பான ரோபோ தொழிற்சாலையின் ஒலி.",
    "GG Robots Jingle": "GG Robots இசை", "Upbeat instrumental": "உற்சாக இசை", "Factory Floor": "தொழிற்சாலைத் தளம்", "Machines, servos and welding": "இயந்திரங்கள், சர்வோ மற்றும் வெல்டிங்",
    "Robot Sound Lab": "ரோபோ ஒலி ஆய்வகம்", "Tap a button to hear the robot. Sounds are made live in your browser.": "பொத்தானைத் தொட்டு ரோபோ ஒலியைக் கேளுங்கள். ஒலிகள் உங்கள் உலாவியிலேயே உருவாகின்றன.",
    "Power up": "இயக்கம்", "Servo whirr": "சர்வோ ஒலி", "Weld sizzle": "வெல்டு சீற்றம்", "Scan beep": "ஸ்கேன் பீப்", "Safety alarm": "பாதுகாப்பு அலாரம்", "Task done": "பணி முடிந்தது",
    "Visit Our Facility": "எங்கள் மையத்துக்கு வாருங்கள்",

    /* specs */
    "Robot Specifications": "ரோபோ விவரக்குறிப்புகள்", "Compare payload, reach and accuracy at a glance.": "சுமை, எட்டும் தூரம், துல்லியத்தை ஒரே பார்வையில் ஒப்பிடுங்கள்.",
    "Comparison of GG Robots models": "GG Robots மாடல்களின் ஒப்பீடு", "Model": "மாடல்", "Category": "வகை", "Payload": "சுமை", "Reach / Speed": "எட்டும் தூரம் / வேகம்",
    "Repeatability": "மீள்துல்லியம்", "Power": "மின்சாரம்", "Robotic Arm": "ரோபோ கை", "Cobot": "காபாட்", "AMR": "AMR", "Delta Robot": "டெல்டா ரோபோ",
    "3.2 m reach": "3.2 மீ எட்டும் தூரம்", "1.3 m reach": "1.3 மீ எட்டும் தூரம்", "200 picks/min": "நிமிடத்துக்கு 200 எடுப்பு", "400 V, 3-phase": "400 V, 3-பேஸ்", "Li-ion, 8 h": "லித்தியம்-அயன், 8 மணி",

    /* enquiry form */
    "Demo & Quotation Request": "டெமோ & விலைப்புள்ளி கோரிக்கை", "Tell us about your requirement and our team will contact you.": "உங்கள் தேவையைச் சொல்லுங்கள்; எங்கள் குழு உங்களைத் தொடர்புகொள்ளும்.",
    "Fields marked": "குறிக்கப்பட்ட புலங்கள்", "are required.": "கட்டாயம் தேவை.",
    "Contact Details": "தொடர்பு விவரங்கள்", "Full Name": "முழுப் பெயர்", "e.g. Arun Kumar": "எ.கா. அருண் குமார்", "Email Address": "மின்னஞ்சல் முகவரி",
    "Phone Number": "தொலைபேசி எண்", "10-digit mobile number": "10 இலக்க மொபைல் எண்", "Create Password": "கடவுச்சொல் உருவாக்குக", "Minimum 8 characters": "குறைந்தது 8 எழுத்துகள்",
    "Use at least 8 characters including letters and numbers.": "எழுத்துகள் மற்றும் எண்கள் உட்பட குறைந்தது 8 எழுத்துகள் பயன்படுத்தவும்.",
    "Company & Requirement": "நிறுவனம் & தேவை", "Company Name": "நிறுவனப் பெயர்", "Industry": "தொழில்", "-- Select your industry --": "-- உங்கள் தொழிலைத் தேர்ந்தெடுக்கவும் --",
    "Healthcare": "மருத்துவம்", "Other": "மற்றவை", "Number of Robots Required": "தேவையான ரோபோக்கள் எண்ணிக்கை", "Preferred Demo Date": "விரும்பும் டெமோ தேதி",
    "Enquiry Type": "விசாரணை வகை", "Product demo": "தயாரிப்பு டெமோ", "Price quotation": "விலைப்புள்ளி", "Technical support": "தொழில்நுட்ப உதவி",
    "Robot Types of Interest": "விருப்பமான ரோபோ வகைகள்", "Robotic arm": "ரோபோ கை", "Delta robot": "டெல்டா ரோபோ",
    "Describe Your Application": "உங்கள் பயன்பாட்டை விவரியுங்கள்", "e.g. We need to automate welding on our assembly line (minimum 20 characters)": "எ.கா. எங்கள் அசெம்பிளி வரிசையில் வெல்டிங்கை தானியக்கப்படுத்த வேண்டும் (குறைந்தது 20 எழுத்துகள்)",
    "Upload Requirement Document": "தேவை ஆவணத்தைப் பதிவேற்றுக", "Optional. PDF, Word, PNG or JPG.": "விருப்பம். PDF, Word, PNG அல்லது JPG.",
    "Preferences & Consent": "விருப்பங்கள் & ஒப்புதல்", "Preferred Contact Method": "விரும்பும் தொடர்பு முறை", "Email": "மின்னஞ்சல்", "Phone": "தொலைபேசி",
    "Send me product updates": "தயாரிப்பு அறிவிப்புகளை அனுப்புக", "I agree to the terms and privacy policy": "விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்கிறேன்",
    "Submit Request": "கோரிக்கையைச் சமர்ப்பி", "Reset Form": "படிவத்தை அழி", "Dismiss message": "செய்தியை மூடு",
    "Enter your full name.": "உங்கள் முழுப் பெயரை உள்ளிடுங்கள்.", "Enter your email address.": "உங்கள் மின்னஞ்சலை உள்ளிடுங்கள்.", "Create a password.": "கடவுச்சொல்லை உருவாக்குங்கள்.",
    "Enter your company name.": "நிறுவனப் பெயரை உள்ளிடுங்கள்.", "Select your industry.": "உங்கள் தொழிலைத் தேர்ந்தெடுங்கள்.", "Enter how many robots you need.": "எத்தனை ரோபோக்கள் தேவை என்பதை உள்ளிடுங்கள்.",
    "Choose a preferred demo date.": "டெமோ தேதியைத் தேர்ந்தெடுங்கள்.", "Choose an enquiry type.": "விசாரணை வகையைத் தேர்ந்தெடுங்கள்.", "Describe your application.": "உங்கள் பயன்பாட்டை விவரியுங்கள்.",
    "You must accept the terms and privacy policy.": "விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்க வேண்டும்.",
    "Use letters, spaces, dots and hyphens only.": "எழுத்துகள், இடைவெளி, புள்ளி, கோடு மட்டும் பயன்படுத்தவும்.",
    "Enter a valid 10-digit Indian mobile number starting with 6 to 9.": "6 முதல் 9 வரை தொடங்கும் சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடுங்கள்.",
    "Use at least 8 characters with both letters and numbers.": "எழுத்துகளும் எண்களும் கொண்ட குறைந்தது 8 எழுத்துகள் பயன்படுத்தவும்.",
    "Enter a valid email address, for example name@company.com.": "சரியான மின்னஞ்சலை உள்ளிடுங்கள், எ.கா. name@company.com.",
    "Use your company email address, not a free mail account.": "இலவச மின்னஞ்சல் அல்ல, உங்கள் நிறுவன மின்னஞ்சலைப் பயன்படுத்துங்கள்.",
    "Demos run Monday to Friday. Choose a weekday.": "டெமோ திங்கள் முதல் வெள்ளி வரை நடைபெறும். வார நாளைத் தேர்ந்தெடுங்கள்.",
    "Select at least one robot type for a demo or quotation.": "டெமோ அல்லது விலைப்புள்ளிக்கு குறைந்தது ஒரு ரோபோ வகையைத் தேர்ந்தெடுங்கள்.",
    "Upload a PDF, Word, PNG or JPG file.": "PDF, Word, PNG அல்லது JPG கோப்பைப் பதிவேற்றுங்கள்.", "The file is too large. Maximum size is 5 MB.": "கோப்பு மிகப் பெரியது. அதிகபட்சம் 5 MB.",
    "Enter a whole number.": "முழு எண்ணை உள்ளிடுங்கள்.", "Some details need your attention.": "சில விவரங்களைச் சரிசெய்ய வேண்டும்.",

    /* explorer */
    "Interactive Robot Explorer": "ஊடாடும் ரோபோ ஆய்வு", "Click the buttons to open information cards, expand sections and trigger notifications.": "தகவல் அட்டைகளைத் திறக்க, பிரிவுகளை விரிக்க, அறிவிப்புகளைப் பெற பொத்தான்களைத் தொடுங்கள்.",
    "Show details": "விவரம் காட்டு", "Hide details": "விவரம் மறை", "Quick view": "விரைவுப் பார்வை",
    "Safety systems": "பாதுகாப்பு அமைப்புகள்", "Force-limited sensors on our cobots and LiDAR navigation on our mobile robots help people and machines share the same floor safely.": "காபாட்களின் விசை வரம்பு உணரிகளும், நகரும் ரோபோக்களின் LiDAR வழிசெலுத்தலும் மனிதர்களும் இயந்திரங்களும் ஒரே தளத்தில் பாதுகாப்பாகப் பணிபுரிய உதவுகின்றன.",
    "Installation & training": "நிறுவல் & பயிற்சி", "Our team plans the layout, installs the robots and trains your operators so production can start quickly.": "எங்கள் குழு அமைப்பைத் திட்டமிட்டு, ரோபோக்களை நிறுவி, ஆபரேட்டர்களுக்குப் பயிற்சி அளிப்பதால் உற்பத்தி விரைவாகத் தொடங்கலாம்.",
    "Service & support": "சேவை & ஆதரவு", "Raise a technical support request through the enquiry form and our engineers will get back to you.": "விசாரணைப் படிவம் மூலம் தொழில்நுட்ப உதவி கோருங்கள்; எங்கள் பொறியாளர்கள் உங்களைத் தொடர்புகொள்வார்கள்.",
    "Notify Me": "எனக்குத் தெரிவி", "Report an Issue": "சிக்கலைப் புகாரளி",
    "Demo request noted. Fill in the form below to confirm your slot.": "டெமோ கோரிக்கை பதிவானது. நேரத்தை உறுதிசெய்ய கீழே உள்ள படிவத்தை நிரப்புங்கள்.",
    "You will be notified when new robot models are released.": "புதிய ரோபோ மாடல்கள் வெளிவரும்போது உங்களுக்குத் தெரிவிக்கப்படும்.",
    "For faults, choose Technical support in the enquiry form.": "பழுதுகளுக்கு, விசாரணைப் படிவத்தில் தொழில்நுட்ப உதவியைத் தேர்ந்தெடுங்கள்.",
    "Industrial Robotic Arms (NM-A500)": "தொழில்துறை ரோபோ கைகள் (NM-A500)", "Collaborative Robots (NM-C10)": "இணைந்து பணிபுரியும் ரோபோக்கள் (NM-C10)",
    "Autonomous Mobile Robots (NM-M1000)": "தானியங்கி நகரும் ரோபோக்கள் (NM-M1000)", "Delta Robots (NM-D200)": "டெல்டா ரோபோக்கள் (NM-D200)",
    "Six-axis arms built for heavy-duty welding, painting, assembly and material handling on factory lines.": "தொழிற்சாலை வரிசைகளில் கனரக வெல்டிங், பெயின்டிங், அசெம்பிளி, பொருள் கையாளுதலுக்கான ஆறு-அச்சு கைகள்.",
    "Force-limited cobots that work safely beside people and are easy to program for new tasks.": "மனிதர்களுடன் பாதுகாப்பாகப் பணிபுரியும், புதிய பணிகளுக்கு எளிதில் நிரலிடக்கூடிய விசை வரம்பு காபாட்கள்.",
    "LiDAR-guided mobile robots that move pallets and goods through warehouses without human drivers.": "ஓட்டுநர் இல்லாமல் கிடங்குகளில் பேலட்கள் மற்றும் பொருட்களை நகர்த்தும் LiDAR வழிகாட்டும் நகரும் ரோபோக்கள்.",
    "Vision-guided delta robots for ultra-fast sorting, packaging and electronics assembly.": "அதிவேக வரிசைப்படுத்தல், பேக்கேஜிங், மின்னணு அசெம்பிளிக்கான கேமரா வழிகாட்டும் டெல்டா ரோபோக்கள்.",

    /* fleet */
    "Robot Fleet Manager": "ரோபோ குழும மேலாளர்", "Plan your own fleet: add a robot, edit it, view its details or remove it. Nothing reloads.": "உங்கள் குழுமத்தைத் திட்டமிடுங்கள்: ரோபோவைச் சேர்க்க, திருத்த, விவரம் பார்க்க, நீக்க. பக்கம் மீண்டும் ஏற்றப்படாது.",
    "In maintenance": "பராமரிப்பில்", "Total payload": "மொத்த சுமை", "Add a robot": "ரோபோ சேர்", "Robot name": "ரோபோ பெயர்", "Type": "வகை", "Payload (kg)": "சுமை (கிலோ)", "Status": "நிலை",
    "Active": "இயக்கத்தில்", "Idle": "சும்மா", "Maintenance": "பராமரிப்பு", "Add robot": "ரோபோ சேர்", "Cancel edit": "திருத்தம் ரத்து", "Save changes": "மாற்றங்களைச் சேமி",
    "Search robots": "ரோபோக்களைத் தேடு", "Search by name or type": "பெயர் அல்லது வகை மூலம் தேடுங்கள்", "e.g. Welder Line 2": "எ.கா. வெல்டர் லைன் 2",
    "Details": "விவரம்", "Edit": "திருத்து", "Remove": "நீக்கு", "Hide": "மறை",
    "No robots in your fleet yet. Use the form to add your first robot.": "உங்கள் குழுமத்தில் இன்னும் ரோபோக்கள் இல்லை. முதல் ரோபோவைச் சேர்க்க படிவத்தைப் பயன்படுத்துங்கள்.",
    "No robots match your search.": "தேடலுக்குப் பொருந்தும் ரோபோக்கள் இல்லை.",
    "Enter a robot name with at least 3 characters.": "குறைந்தது 3 எழுத்துகள் கொண்ட ரோபோ பெயரை உள்ளிடுங்கள்.",
    "Payload must be a whole number from 1 to 1000 kg.": "சுமை 1 முதல் 1000 கிலோ வரையிலான முழு எண்ணாக இருக்க வேண்டும்.",
    "Edit cancelled.": "திருத்தம் ரத்து செய்யப்பட்டது.", "Click to change status": "நிலையை மாற்றத் தொடுங்கள்",

    /* live data */
    "Live Robot Catalogue": "நேரடி ரோபோ பட்டியல்", "Specifications and fleet statistics fetched from our data service as JSON.": "எங்கள் தரவு சேவையிலிருந்து JSON ஆக பெறப்பட்ட விவரக்குறிப்புகள் மற்றும் புள்ளிவிவரங்கள்.",
    "Load robot data": "ரோபோ தரவை ஏற்று", "Test error handling": "பிழை கையாளுதலைச் சோதி", "Refresh data": "தரவைப் புதுப்பி",
    "to fetch the catalogue.": "பட்டியலைப் பெற.", "Click": "தொடுங்கள்",
    "GG Robots models (click a column heading to sort)": "GG Robots மாடல்கள் (வரிசைப்படுத்த தலைப்பைத் தொடுங்கள்)",
    "Uptime": "இயக்கநேரம்", "Units deployed": "நிறுவப்பட்ட அலகுகள்", "Price": "விலை", "Availability": "இருப்பு", "All": "அனைத்தும்",
    "In stock": "இருப்பில்", "Limited": "குறைவு", "Pre-order": "முன்பதிவு",
    "Loading robot data\u2026": "ரோபோ தரவு ஏற்றப்படுகிறது\u2026", "Contacting the data service.": "தரவு சேவையைத் தொடர்புகொள்கிறோம்.",
    "Could not load robot data": "ரோபோ தரவை ஏற்ற முடியவில்லை", "Try again": "மீண்டும் முயல்க", "No robots found": "ரோபோக்கள் இல்லை", "No robots match this filter.": "இந்த வடிகட்டிக்கு ரோபோக்கள் இல்லை.",
    "Models available": "கிடைக்கும் மாடல்கள்", "Average uptime": "சராசரி இயக்கநேரம்", "Most deployed model": "அதிகம் நிறுவப்பட்ட மாடல்",
    "Loading failed. See the message in the catalogue.": "ஏற்றுவது தோல்வி. பட்டியலில் உள்ள செய்தியைப் பாருங்கள்.",

    /* tasks */
    "Maintenance Task Manager": "பராமரிப்புப் பணி மேலாளர்", "Create, view, edit and delete robot maintenance tasks. Your tasks are saved in this browser and stay after a refresh.": "ரோபோ பராமரிப்புப் பணிகளை உருவாக்க, பார்க்க, திருத்த, நீக்க. உங்கள் பணிகள் இந்த உலாவியில் சேமிக்கப்படும்.",
    "Total tasks": "மொத்தப் பணிகள்", "Pending": "நிலுவை", "In progress": "நடைபெறுவது", "Completed": "முடிந்தது", "In Progress": "நடைபெறுவது",
    "Add a task": "பணி சேர்", "Task title": "பணித் தலைப்பு", "Robot type": "ரோபோ வகை", "Priority": "முன்னுரிமை", "High": "உயர்", "Medium": "நடுத்தர", "Low": "குறைவு",
    "Due date": "முடிக்க வேண்டிய தேதி", "Notes (optional)": "குறிப்புகள் (விருப்பம்)", "Add task": "பணி சேர்", "Search tasks": "பணிகளைத் தேடு", "Task": "பணி", "Robot": "ரோபோ", "Due": "தேதி", "Actions": "செயல்கள்",
    "Delete": "நீக்கு", "Robot maintenance tasks": "ரோபோ பராமரிப்புப் பணிகள்", "Task added.": "பணி சேர்க்கப்பட்டது.", "Task updated.": "பணி புதுப்பிக்கப்பட்டது.", "Task deleted.": "பணி நீக்கப்பட்டது.",
    "Edit task": "பணியைத் திருத்து", "e.g. Replace gripper on Welder Line 1": "எ.கா. வெல்டர் லைன் 1 இல் கிரிப்பரை மாற்றுக",
    "Parts needed, safety checks, technician name...": "தேவையான பாகங்கள், பாதுகாப்புச் சோதனை, தொழில்நுட்பவியலாளர் பெயர்...",
    "Enter a task title with at least 3 characters.": "குறைந்தது 3 எழுத்துகள் கொண்ட பணித் தலைப்பை உள்ளிடுங்கள்.", "Choose a due date.": "தேதியைத் தேர்ந்தெடுங்கள்.",
    "This task already exists for the selected robot type.": "இந்த ரோபோ வகைக்கு இந்தப் பணி ஏற்கனவே உள்ளது.",
    "No tasks yet. Use the form to add your first maintenance task.": "இன்னும் பணிகள் இல்லை. முதல் பராமரிப்புப் பணியைச் சேர்க்க படிவத்தைப் பயன்படுத்துங்கள்.",
    "No tasks match your search or filter.": "தேடல் அல்லது வடிகட்டிக்கு பணிகள் இல்லை.",

    /* finder */
    "Robot Finder & Comparison Tool": "ரோபோ தேடல் & ஒப்பீட்டுக் கருவி", "Search our robots, filter by type, industry and budget, then compare up to three models side by side.": "ரோபோக்களைத் தேடி, வகை, தொழில், பட்ஜெட் மூலம் வடிகட்டி, மூன்று மாடல்கள் வரை ஒப்பிடுங்கள்.",
    "How does this tool work?": "இந்தக் கருவி எப்படி செயல்படுகிறது?", "Type a model or name, or use the dropdowns, to narrow the list instantly.": "மாடல் அல்லது பெயரை தட்டச்சு செய்யுங்கள் அல்லது கீழிறங்கும் பட்டியலைப் பயன்படுத்தி உடனே பட்டியலைச் சுருக்குங்கள்.",
    "Press": "அழுத்துங்கள்", "Add to compare": "ஒப்பிடச் சேர்", "on up to three robots.": "அதிகபட்சம் மூன்று ரோபோக்களில்.", "The comparison table highlights the best value in each row.": "ஒப்பீட்டு அட்டவணை ஒவ்வொரு வரிசையிலும் சிறந்த மதிப்பை முன்னிலைப்படுத்தும்.",
    "Search": "தேடல்", "e.g. NM-C10 or Weld": "எ.கா. NM-C10 அல்லது வெல்ட்", "All types": "அனைத்து வகைகள்", "All industries": "அனைத்துத் தொழில்கள்", "Sort by": "வரிசைப்படுத்து",
    "Recommended": "பரிந்துரைக்கப்பட்டது", "Payload (high to low)": "சுமை (அதிகம் \u2192 குறைவு)", "Price (low to high)": "விலை (குறைவு \u2192 அதிகம்)", "Uptime (high to low)": "இயக்கநேரம் (அதிகம் \u2192 குறைவு)",
    "Max price:": "அதிகபட்ச விலை:", "In stock only": "இருப்பில் உள்ளவை மட்டும்", "Reset filters": "வடிகட்டிகளை அழி",
    "No robots match your filters": "வடிகட்டிகளுக்கு ரோபோக்கள் இல்லை", "Try a higher budget, a different industry or clear the search box.": "அதிக பட்ஜெட், வேறு தொழில் முயலுங்கள் அல்லது தேடல் பெட்டியை அழியுங்கள்.",
    "Compare robots": "ரோபோக்களை ஒப்பிடு", "Request a quote": "விலைப்புள்ளி கோரு", "Clear all": "அனைத்தையும் அழி", "Full specifications": "முழு விவரக்குறிப்புகள்",
    "\u2713 Added to compare": "\u2713 ஒப்பீட்டில் சேர்க்கப்பட்டது", "Repeatability:": "மீள்துல்லியம்:", "Best for:": "சிறந்தது:",
    "No robots selected yet. Press \u201CAdd to compare\u201D on up to three robots above.": "இன்னும் ரோபோக்கள் தேர்ந்தெடுக்கப்படவில்லை. மேலே மூன்று ரோபோக்கள் வரை \u201Cஒப்பிடச் சேர்\u201D அழுத்துங்கள்.",
    "Robot type for comparison": "ஒப்பீட்டு ரோபோ வகை",

    /* roi */
    "Robot ROI Calculator": "ரோபோ லாபக் கணக்கீட்டுக் கருவி", "Estimate how fast a robot pays for itself. Move the sliders and the result updates instantly.": "ரோபோ எவ்வளவு விரைவில் முதலீட்டை ஈடுகட்டும் என மதிப்பிடுங்கள். ஸ்லைடர்களை நகர்த்தினால் முடிவு உடனே மாறும்.",
    "Robot model": "ரோபோ மாடல்", "Number of robots:": "ரோபோக்கள் எண்ணிக்கை:", "Workers replaced per robot:": "ஒரு ரோபோவுக்கு மாற்றப்படும் தொழிலாளர்கள்:",
    "Labour cost per worker per hour:": "ஒரு தொழிலாளருக்கு மணிக்கு ஊதியம்:", "Working hours per day:": "நாளொன்றுக்கு வேலை நேரம்:",
    "Assumes 300 working days a year and yearly upkeep of 6% of the robot price.": "ஆண்டுக்கு 300 வேலை நாட்கள் மற்றும் ரோபோ விலையில் 6% ஆண்டுப் பராமரிப்பு எனக் கொள்ளப்படுகிறது.",
    "Investment": "முதலீடு", "Yearly saving": "ஆண்டுச் சேமிப்பு", "Payback": "முதலீடு மீளும் காலம்", "5-year net gain": "5 ஆண்டு நிகர லாபம்", "Not reached": "எட்டவில்லை", "Get a detailed quote": "விரிவான விலைப்புள்ளி பெறுக",
    "Upkeep is higher than the saving here. Try more working hours or a higher labour cost.": "இங்கு பராமரிப்புச் செலவு சேமிப்பை விட அதிகம். வேலை நேரம் அல்லது ஊதியத்தை அதிகரித்துப் பாருங்கள்.",
    "Excellent: this setup pays for itself in under a year.": "அருமை: இந்த அமைப்பு ஓராண்டுக்குள் முதலீட்டை ஈடுகட்டும்.",
    "Long payback. A cheaper model or longer working hours would improve it.": "மீளும் காலம் அதிகம். குறைந்த விலை மாடல் அல்லது அதிக வேலை நேரம் உதவும்.",

    /* faq */
    "Frequently Asked Questions": "அடிக்கடி கேட்கப்படும் கேள்விகள்", "Quick answers before you talk to us.": "எங்களுடன் பேசும் முன் விரைவான பதில்கள்.",
    "How long does installation take?": "நிறுவ எவ்வளவு நேரம் ஆகும்?", "A single cobot cell can run in days. A full arm welding line usually takes a few weeks including safety testing.": "ஒரு காபாட் செல் சில நாட்களில் இயங்கும். முழு கை வெல்டிங் வரிசைக்கு பாதுகாப்புச் சோதனை உட்பட சில வாரங்கள் ஆகும்.",
    "Can robots work next to my staff?": "ரோபோக்கள் என் ஊழியர்களுடன் இணைந்து பணிபுரியுமா?", "Yes. Our cobots use force-limited joints, and Safe collaboration mode in the Settings section shows how speed and force drop around people.": "ஆம். எங்கள் காபாட்கள் விசை வரம்பு மூட்டுகளைப் பயன்படுத்துகின்றன; அமைப்புகளில் உள்ள பாதுகாப்பு முறை மனிதர்கள் அருகில் வேகமும் விசையும் குறைவதைக் காட்டும்.",
    "Do I need programming skills?": "எனக்கு நிரலாக்கத் திறன் தேவையா?", "No. Cobots are taught by guiding the arm and using a simple screen. Training for your operators is part of every project.": "இல்லை. கையை வழிநடத்தி எளிய திரை மூலம் காபாட்களுக்குக் கற்பிக்கலாம். ஒவ்வொரு திட்டத்திலும் ஆபரேட்டர் பயிற்சி உண்டு.",
    "What does a robot cost?": "ஒரு ரோபோவின் விலை என்ன?", "Prices range from about \u20B99.5 lakh for a delta robot to \u20B962 lakh for the heavy arm. Use the Robot Finder to filter by budget, then the ROI calculator for payback.": "டெல்டா ரோபோ சுமார் \u20B99.5 லட்சம் முதல் கனரகக் கை \u20B962 லட்சம் வரை. பட்ஜெட்டுக்கு ரோபோ தேடலையும், லாபத்துக்கு ROI கணிப்பானையும் பயன்படுத்துங்கள்.",
    "What support do you provide after installation?": "நிறுவிய பின் என்ன ஆதரவு தருகிறீர்கள்?", "Remote monitoring, spare parts and an engineer helpline. Raise a request any time with Technical support in the enquiry form, or track jobs in the Maintenance Task Manager.": "தொலைநிலைக் கண்காணிப்பு, உதிரிபாகங்கள் மற்றும் பொறியாளர் உதவி எண். எப்போது வேண்டுமானாலும் விசாரணைப் படிவத்தில் தொழில்நுட்ப உதவி கோரலாம்.",

    /* settings */
    "Robot Cell Settings": "ரோபோ செல் அமைப்புகள்", "Switch the robot cell between full-speed production and safe collaboration mode. Your choice is saved in this browser.": "ரோபோ செல்லை முழு வேக உற்பத்தி மற்றும் பாதுகாப்பு இணைந்த பணி முறைக்கு இடையே மாற்றுங்கள். தேர்வு உலாவியில் சேமிக்கப்படும்.",
    "Safe collaboration mode": "பாதுகாப்பு இணைந்த பணி முறை", "Slows the robots and limits their force so people can work safely beside them.": "ரோபோக்களின் வேகம் மற்றும் விசையைக் குறைத்து, மனிதர்கள் அருகில் பாதுகாப்பாகப் பணிபுரிய உதவுகிறது.",
    "ON": "இயக்கு", "OFF": "அணை",
    "Safe collaboration mode is ON. Robots are slowed and force-limited.": "பாதுகாப்பு முறை இயக்கத்தில். ரோபோக்களின் வேகமும் விசையும் குறைக்கப்பட்டுள்ளன.",
    "Safe collaboration mode is OFF. Robots run at full production speed.": "பாதுகாப்பு முறை அணைக்கப்பட்டது. ரோபோக்கள் முழு உற்பத்தி வேகத்தில் இயங்குகின்றன.",
    "Setting saved in this browser.": "அமைப்பு இந்த உலாவியில் சேமிக்கப்பட்டது.", "Restored your saved setting.": "சேமித்த அமைப்பு மீட்டெடுக்கப்பட்டது.",
    "Try it: turn the switch on and watch the animated robots in the Robots and Gallery sections slow down.": "முயலுங்கள்: சுவிட்சை இயக்கி, ரோபோக்கள் மற்றும் கேலரியில் உள்ள அனிமேஷன் ரோபோக்கள் மெதுவாவதைப் பாருங்கள்.",
    "Operating mode": "இயக்க முறை", "Max robot speed": "அதிகபட்ச ரோபோ வேகம்", "Contact force limit": "தொடு விசை வரம்பு", "Safety zone": "பாதுகாப்பு மண்டலம்", "Throughput": "உற்பத்தித் திறன்",
    "Full-speed production": "முழு வேக உற்பத்தி", "Safe collaboration": "பாதுகாப்பு இணைந்த பணி", "Light curtain only": "ஒளித் திரை மட்டும்", "1.5 m safety zone": "1.5 மீ பாதுகாப்பு மண்டலம்",
    "120 picks/min": "நிமிடத்துக்கு 120 எடுப்பு", "40 picks/min": "நிமிடத்துக்கு 40 எடுப்பு",
    "Speed and force are limited, so people can work beside the robots.": "வேகமும் விசையும் குறைக்கப்பட்டுள்ளதால் மனிதர்கள் ரோபோக்களின் அருகில் பணிபுரியலாம்.",
    "Robots run at full speed. Keep people outside the cell.": "ரோபோக்கள் முழு வேகத்தில் இயங்குகின்றன. மனிதர்களை செல்லுக்கு வெளியே வைத்திருங்கள்.",

    /* cta + footer */
    "Ready to put a robot on your line?": "உங்கள் வரிசையில் ஒரு ரோபோவை இணைக்கத் தயாரா?", "Watch the film, compare models, then book a free demo. We reply within one working day.": "படத்தைப் பாருங்கள், மாடல்களை ஒப்பிடுங்கள், பிறகு இலவச டெமோ பதிவு செய்யுங்கள். ஒரு வேலை நாளுக்குள் பதிலளிப்போம்.",
    "Book a Free Demo": "இலவச டெமோ பதிவு", "\u25B6 Watch the Film": "\u25B6 படத்தைப் பாருங்கள்",
    "Smart robots for modern industry. Designing safer, faster and more accurate automation.": "நவீன தொழிலுக்கான ஸ்மார்ட் ரோபோக்கள். பாதுகாப்பான, வேகமான, துல்லியமான தானியக்கத்தை வடிவமைக்கிறோம்.",
    "Quick Links": "விரைவு இணைப்புகள்", "Specifications": "விவரக்குறிப்புகள்", "Contact": "தொடர்பு",
    "12 Automation Park, Coimbatore,": "12 ஆட்டோமேஷன் பார்க், கோயம்புத்தூர்,", "Tamil Nadu, India": "தமிழ்நாடு, இந்தியா",
    "\u00A9 2026 GG Robots. All rights reserved.": "\u00A9 2026 GG Robots. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    "Back to top": "மேலே செல்", "Open or close menu": "மெனுவைத் திற/மூடு", "Close": "மூடு", "Main navigation": "முதன்மை வழிசெலுத்தல்",

    /* customizer */
    "Customize": "தனிப்பயனாக்கு", "Make this site yours. Saved in this browser.": "இந்தத் தளத்தை உங்களுக்கேற்ப மாற்றுங்கள். உலாவியில் சேமிக்கப்படும்.",
    "Colour theme": "வண்ணத் தீம்", "Accent colour": "அழுத்த நிறம்", "Dark mode": "இருள் பயன்முறை", "Background effects": "பின்னணி விளைவுகள்", "Robot voice": "ரோபோ குரல்",
    "Voice speed": "குரல் வேகம்", "Voice pitch": "குரல் சுருதி", "Brand name": "பிராண்ட் பெயர்", "Hero highlight words": "முகப்பு முன்னிலைச் சொற்கள்", "Hero tagline": "முகப்பு வாசகம்",
    "Leave empty for the default": "இயல்புக்கு காலியாக விடுங்கள்", "Test voice": "குரல் சோதனை", "Reset all": "அனைத்தையும் மீட்டமை", "Customize this page": "பக்கத்தைத் தனிப்பயனாக்கு",
    "Hi! This is how I sound. Tap me anytime to chat.": "வணக்கம்! நான் இப்படித்தான் பேசுவேன். எப்போது வேண்டுமானாலும் என்னைத் தொடுங்கள்.",
    "Language": "மொழி",

    /* intro */
    "Press to power on": "இயக்க அழுத்துங்கள்", "Sound on for the full experience": "முழு அனுபவத்துக்கு ஒலியை இயக்குங்கள்", "Skip intro": "அறிமுகத்தைத் தவிர்",
    "Sound on": "ஒலி இயக்கம்", "Sound off": "ஒலி அணை", "Smart robots for modern industry.": "நவீன தொழிலுக்கான ஸ்மார்ட் ரோபோக்கள்.",
    "> POWER CORE": "> மின் மையம்", "> SERVO ARRAYS": "> சர்வோ தொகுதி", "> VISION SYSTEM": "> பார்வை அமைப்பு", "> SAFETY LOCKS": "> பாதுகாப்புப் பூட்டுகள்", "> WAKING UP": "> விழிக்கிறது",
    "OK": "சரி", "Power on and play the intro with sound": "இயக்கி ஒலியுடன் அறிமுகத்தை இயக்கு"
  };

  /* patterns for text with changing numbers or names */
  var RULES = [
    [/^Showing (\d+) of (\d+) robots$/, function (m) { return m[2] + " ரோபோக்களில் " + m[1] + " காட்டப்படுகின்றன"; }],
    [/^(\d+) \/ (\d+) characters \(minimum (\d+)\)$/, function (m) { return m[1] + " / " + m[2] + " எழுத்துகள் (குறைந்தது " + m[3] + ")"; }],
    [/^Chapter: (.+)$/, function (m, t) { return "அத்தியாயம்: " + (D[m[1]] || m[1]); }],
    [/^Please fix (\d+) fields?( before submitting\.)$/, function (m) { return "சமர்ப்பிக்கும் முன் " + m[1] + " புலங்களைச் சரிசெய்யுங்கள்."; }],
    [/^Request (NM-\d+) submitted successfully\.$/, function (m) { return "கோரிக்கை " + m[1] + " வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டது."; }],
    [/^Thank you, (.+?)\. Your (.+?) request \(reference (NM-\d+)\) has been received\. We will contact you by (.+?) within one working day\.$/, function (m) {
      var k = { "product demo": "தயாரிப்பு டெமோ", "price quotation": "விலைப்புள்ளி", "technical support": "தொழில்நுட்ப உதவி" };
      var c = { email: "மின்னஞ்சல்", phone: "தொலைபேசி" };
      return "நன்றி, " + m[1] + ". உங்கள் " + (k[m[2]] || m[2]) + " கோரிக்கை (குறிப்பு எண் " + m[3] + ") பெறப்பட்டது. ஒரு வேலை நாளுக்குள் " + (c[m[4]] || m[4]) + " மூலம் தொடர்புகொள்வோம்.";
    }],
    [/^(.+) added to your fleet\.$/, function (m) { return m[1] + " உங்கள் குழுமத்தில் சேர்க்கப்பட்டது."; }],
    [/^(.+) updated\.$/, function (m) { return m[1] + " புதுப்பிக்கப்பட்டது."; }],
    [/^(.+) removed from your fleet\.$/, function (m) { return m[1] + " குழுமத்திலிருந்து நீக்கப்பட்டது."; }],
    [/^(.+) is now (active|idle|maintenance|pending|in progress|completed)\.$/, function (m) {
      var s = { active: "இயக்கத்தில்", idle: "சும்மா", maintenance: "பராமரிப்பில்", pending: "நிலுவையில்", "in progress": "நடைபெறுவதில்", completed: "முடிந்தது" };
      return m[1] + " இப்போது " + s[m[2]] + " உள்ளது.";
    }],
    [/^\u201C(.+)\u201D is now (.+)\.$/, function (m) { return "\u201C" + m[1] + "\u201D இப்போது " + (D[m[2].replace(/\b\w/g, function (c) { return c.toUpperCase(); })] || m[2]) + " நிலையில் உள்ளது."; }],
    [/^Edit (.+)$/, function (m) { return D[m[1]] ? null : m[1] + " ஐத் திருத்து"; }],
    [/^Added at (.+)\. Carries up to (\d+) kg\. Current status: (.+)\.$/, function (m) { return "சேர்க்கப்பட்ட நேரம்: " + m[1] + ". அதிகபட்சம் " + m[2] + " கிலோ சுமை. தற்போதைய நிலை: " + (D[m[3]] || m[3]) + "."; }],
    [/^A robot named \u201C(.+)\u201D already exists\.$/, function (m) { return "\u201C" + m[1] + "\u201D என்ற பெயரில் ரோபோ ஏற்கனவே உள்ளது."; }],
    [/^(\d+) robots loaded\.$/, function (m) { return m[1] + " ரோபோக்கள் ஏற்றப்பட்டன."; }],
    [/^Data updated (.+)$/, function (m) { return "தரவு புதுப்பிப்பு: " + m[1]; }],
    [/^The minimum is (.+)\.$/, function (m) { return "குறைந்தபட்சம் " + m[1] + "."; }],
    [/^The maximum is (.+) per enquiry\.$/, function (m) { return "ஒரு விசாரணைக்கு அதிகபட்சம் " + m[1] + "."; }],
    [/^Enter at least (\d+) characters\.$/, function (m) { return "குறைந்தது " + m[1] + " எழுத்துகள் உள்ளிடுங்கள்."; }],
    [/^Describe your application in at least (\d+) characters\.$/, function (m) { return "உங்கள் பயன்பாட்டை குறைந்தது " + m[1] + " எழுத்துகளில் விவரியுங்கள்."; }],
    [/^You can compare up to (\d+) robots\. Remove one first\.$/, function (m) { return "அதிகபட்சம் " + m[1] + " ரோபோக்களை ஒப்பிடலாம். முதலில் ஒன்றை நீக்குங்கள்."; }],
    [/^Highest payload: (.+?)\s+\u00B7\s+Best uptime: (.+?)\s+\u00B7\s+Lowest price: (.+)$/, function (m) { return "அதிகச் சுமை: " + m[1] + "  \u00B7  சிறந்த இயக்கநேரம்: " + m[2] + "  \u00B7  குறைந்த விலை: " + m[3]; }],
    [/^Good: the investment is recovered in about (.+) years\.$/, function (m) { return "நல்லது: முதலீடு சுமார் " + m[1] + " ஆண்டுகளில் மீளும்."; }],
    [/^Edit (.+) cancelled\.$/, function (m) { return null; }]
  ];

  /* word-level fallback for units and money */
  var SOFT = [
    [/\blakh\b/g, "லட்சம்"], [/\bcrore\b/g, "கோடி"], [/(\d)\s?kg\b/g, "$1 கிலோ"], [/\byears\b/g, "ஆண்டுகள்"], [/\bmonths\b/g, "மாதங்கள்"],
    [/\(overdue\)/g, "(தாமதம்)"], [/\bpicks\/min\b/g, "எடுப்பு/நிமிடம்"], [/\bpayload\b/g, "சுமை"], [/\bm reach\b/g, "மீ எட்டும் தூரம்"]
  ];

  var ATTRS = ["placeholder", "title", "aria-label", "alt", "data-msg", "data-title", "data-text", "data-q"];

  function tr(raw) {
    if (!raw) { return null; }
    var t = raw.trim();
    if (!t) { return null; }
    var out = D[t];
    if (out === undefined) {
      for (var i = 0; i < RULES.length; i++) {
        var m = t.match(RULES[i][0]);
        if (m) { var r = RULES[i][1](m, t); if (r) { out = r; break; } }
      }
    }
    if (out === undefined) {
      var s = t, changed = false;
      for (var j = 0; j < SOFT.length; j++) {
        var n = s.replace(SOFT[j][0], SOFT[j][1]);
        if (n !== s) { s = n; changed = true; }
      }
      if (changed && /[A-Za-z]{0,}/.test(s)) { out = s; }
    }
    if (out === undefined || out === null) { return null; }
    var lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
    return lead + out + trail;
  }

  /* ---------------------------------------------------------
     DOM TRANSLATION ENGINE
     --------------------------------------------------------- */
  var textStore = new Map();   /* text node -> {o, t} */
  var attrStore = new Map();   /* element   -> {attr: original} */
  var observer = null;
  var queue = new Set(), queued = false;
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 };

  function doText(n) {
    if (n.parentNode && n.parentNode.closest && n.parentNode.closest(".logo, .site-footer h3")) { return; }
    var cv = n.nodeValue, rec = textStore.get(n);
    if (rec && cv === rec.t) { return; }
    var t = tr(cv);
    if (t !== null && t !== cv) { textStore.set(n, { o: cv, t: t }); n.nodeValue = t; }
    else if (rec) { textStore.delete(n); }
  }
  function doAttrs(el) {
    ATTRS.forEach(function (a) {
      if (!el.hasAttribute(a)) { return; }
      var v = el.getAttribute(a), rec = attrStore.get(el);
      if (rec && rec[a] && rec[a].t === v) { return; }
      var t = tr(v);
      if (t !== null && t !== v) {
        if (!rec) { rec = {}; attrStore.set(el, rec); }
        rec[a] = { o: v, t: t };
        el.setAttribute(a, t);
      }
    });
  }
  function walk(node) {
    if (node.nodeType === 3) { if (!node.parentNode || !SKIP[node.parentNode.nodeName]) { doText(node); } return; }
    if (node.nodeType !== 1 || SKIP[node.nodeName]) { return; }
    doAttrs(node);
    for (var c = node.firstChild; c; c = c.nextSibling) { walk(c); }
  }
  function flush() {
    queued = false;
    var items = Array.prototype.slice.call(queue.values());
    queue.clear();
    items.forEach(function (n) { if (n.isConnected || n.nodeType === 3) { walk(n); } });
  }
  function enqueue(n) { queue.add(n); if (!queued) { queued = true; requestAnimationFrame(flush); } }

  function startObserver() {
    if (observer) { return; }
    observer = new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === "characterData") { enqueue(m.target); }
        else { m.addedNodes.forEach(enqueue); }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function stopObserver() { if (observer) { observer.disconnect(); observer = null; } }

  function revert() {
    stopObserver();
    textStore.forEach(function (rec, n) { if (n.nodeValue === rec.t) { n.nodeValue = rec.o; } });
    textStore.clear();
    attrStore.forEach(function (rec, el) {
      Object.keys(rec).forEach(function (a) { if (el.getAttribute(a) === rec[a].t) { el.setAttribute(a, rec[a].o); } });
    });
    attrStore.clear();
  }

  var EN_TITLE = document.title;
  function applyLang(l, announce) {
    cur = l;
    try { localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
    document.documentElement.lang = l;
    document.body.setAttribute("data-lang", l);
    revert();
    if (l === "ta") {
      walk(document.body);
      startObserver();
      document.title = "GG Robots | தொழில்துறை ரோபோக்கள் & தானியக்கம்";
      checkVoice();
    } else {
      document.title = EN_TITLE;
      hideNote();
    }
    Array.prototype.forEach.call(document.querySelectorAll(".lang-switch button"), function (b) {
      var on = b.getAttribute("data-lang") === l;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (announce && window.GGTalk && document.getElementById("intro") && document.getElementById("intro").classList.contains("gone")) {
      window.GGTalk.say(l === "ta" ? "இனி நான் தமிழில் பேசுவேன். என்னிடம் கேளுங்கள்!" : "Switched to English. Ask me anything!", { wave: true });
    }
  }

  /* ---------------------------------------------------------
     LANGUAGE SWITCH UI
     --------------------------------------------------------- */
  function buildSwitch() {
    var sw = document.createElement("div");
    sw.className = "lang-switch";
    sw.setAttribute("role", "group");
    sw.setAttribute("aria-label", "Language");
    sw.innerHTML = '<button type="button" data-lang="en">EN</button><button type="button" data-lang="ta">தமிழ்</button>';
    var wrap = document.querySelector(".nav-wrap");
    if (wrap) { wrap.appendChild(sw); }
    sw.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-lang]");
      if (b && b.getAttribute("data-lang") !== cur) { applyLang(b.getAttribute("data-lang"), true); }
    });

    /* the same choice is offered on the intro power screen */
    var gate = document.querySelector("#intro .gg-gate");
    if (gate) {
      var g = document.createElement("div");
      g.className = "gg-lang";
      g.innerHTML = '<button type="button" data-lang="en">English</button><button type="button" data-lang="ta">தமிழ்</button>';
      var skip = gate.querySelector(".gg-skip");
      gate.insertBefore(g, skip);
      g.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-lang]");
        if (b) { applyLang(b.getAttribute("data-lang"), false); Array.prototype.forEach.call(g.children, function (x) { x.classList.toggle("active", x === b); }); }
      });
      Array.prototype.forEach.call(g.children, function (x) { x.classList.toggle("active", x.getAttribute("data-lang") === cur); });
    }
  }

  /* ---------------------------------------------------------
     TAMIL VOICE
     --------------------------------------------------------- */
  var synth = window.speechSynthesis || null;
  function taVoice() {
    try { return (synth.getVoices() || []).filter(function (v) { return /^ta/i.test(v.lang); })[0] || null; } catch (e) { return null; }
  }
  var note = null;
  function hideNote() { if (note) { note.classList.remove("show"); } }
  function checkVoice() {
    if (!synth || cur !== "ta") { return; }
    setTimeout(function () {
      if (cur !== "ta") { return; }
      var voices = []; try { voices = synth.getVoices() || []; } catch (e) { /* ignore */ }
      if (voices.length && !taVoice()) { showNote(); }
    }, 1500);
  }
  function showNote() {
    if (!note) {
      note = document.createElement("div");
      note.className = "lang-note";
      note.setAttribute("role", "status");
      note.innerHTML = "<span>இந்தச் சாதனத்தில் தமிழ் குரல் நிறுவப்படவில்லை. Chrome / Edge / Android இல் தமிழ் குரலைச் சேர்த்தால் ரோபோ தமிழில் பேசும்.<br><small>No Tamil voice found on this device. Install a Tamil text-to-speech voice (Android / Windows language settings) so the robot can speak Tamil.</small></span><button type=\"button\" aria-label=\"Close\">&times;</button>";
      document.body.appendChild(note);
      note.querySelector("button").addEventListener("click", hideNote);
    }
    note.classList.add("show");
    setTimeout(hideNote, 14000);
  }
  if (synth && synth.addEventListener) { synth.addEventListener("voiceschanged", checkVoice); }

  var introMuted = false;
  function speakTa(text, o) {
    if (!synth || introMuted) { return; }
    try {
      var u = new SpeechSynthesisUtterance(text), v = taVoice();
      if (v) { u.voice = v; }
      u.lang = "ta-IN"; u.rate = (o && o.rate) || 0.95; u.pitch = (o && o.pitch) || 1; u.volume = 1;
      synth.cancel(); synth.speak(u);
    } catch (e) { /* ignore */ }
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("#intro .gg-sound")) { introMuted = !introMuted; if (introMuted && synth) { synth.cancel(); } }
    if (e.target.closest && e.target.closest("#intro .gg-skip") && synth && cur === "ta") { synth.cancel(); }
  });

  /* ---------------------------------------------------------
     TAMIL ROBOT BRAIN
     --------------------------------------------------------- */
  var LINES_TA = [
    "வணக்கம்! நான் ஜிஜி ஒன், ஜிஜி ரோபோட்ஸ் மாஸ்காட். என்னிடம் எதையும் கேளுங்கள்!",
    "நான் ஓய்வே இல்லாமல் ஐநூறு கிலோ தூக்குவேன்.",
    "வெல்டிங், பேக்கிங், பெயின்டிங் எல்லாமே நான் செய்வேன்.",
    "தொண்ணூற்றொன்பது சதவீதம் இயக்கநேரம். தூக்கம் என் நிரலிலேயே இல்லை.",
    "டெமோ வேண்டுமா? டெமோ என்று சொல்லுங்கள், படிவத்துக்கு அழைத்துச் செல்கிறேன்.",
    "பீப் பூப். பாதுகாப்பே முதலில்.",
    "ரோபோ தேடல் கருவியை முயலுங்கள். மூன்று மாடல்களை ஒப்பிடலாம்."
  ];
  var TICKLE_TA = ["ஹாஹா, கூசுகிறது!", "கவனம், நான் துல்லியமான ரோபோ!", "சரி சரி, கை அசைக்கிறேன்!"];
  var BRAIN_TA = [
    [/hello|\bhi\b|hey|namaste|vanakkam|வணக்கம்|ஹலோ|ஹாய்/i, "வணக்கம்! நான் ஜிஜி ஒன். சுமை, விலை, பாதுகாப்பு பற்றிக் கேளுங்கள் அல்லது டெமோ பதிவு செய்யுங்கள்."],
    [/your name|who are you|what are you|பெயர்|யார் நீ|நீ யார்/i, "நான் ஜிஜி ஒன், ஜிஜி ரோபோட்ஸ் நிறுவனத்தின் மாஸ்காட். சரியான ரோபோவைக் கண்டறிய உதவுவேன்."],
    [/what can you do|help|features|என்ன செய்ய|உதவி|வசதி/i, "எங்கள் நான்கு ரோபோ வகைகள், விலை, இயக்கநேரம் பற்றிச் சொல்வேன்; டெமோ படிவத்துக்கும் அழைத்துச் செல்வேன்."],
    [/payload|lift|heavy|weight|capacity|சுமை|எடை|தூக்க|கனம்/i, "எங்கள் என்எம் ஏ ஐநூறு கை ஐநூறு கிலோ தூக்கும். என்எம் எம் ஆயிரம் நகரும் ரோபோ ஒரு டன் சுமக்கும்."],
    [/price|cost|budget|cheap|expensive|how much|விலை|செலவு|பட்ஜெட்|எவ்வளவு|ரூபாய்/i, "டெல்டா ரோபோ ஒன்பதரை லட்சம் ரூபாயிலிருந்து, கனரகக் கை அறுபத்திரண்டு லட்சம் வரை. பட்ஜெட்டுக்கு ரோபோ தேடலைப் பயன்படுத்துங்கள்.", "#finder"],
    [/cobot|collaborat|safe|safety|human|பாதுகாப்பு|பாதுகாப்பா|காபாட்|மனிதர்/i, "எங்கள் காபாட்கள் விசை வரம்பு உணரிகளால் மனிதர்களுடன் பாதுகாப்பாகப் பணிபுரியும். அமைப்புகளில் பாதுகாப்பு முறையை முயலுங்கள்.", "#settings"],
    [/amr|mobile|warehouse|logistic|pallet|lidar|கிடங்கு|தளவாடம்|நகரும்/i, "எங்கள் நகரும் ரோபோக்கள் லைடார் மூலம் வழி கண்டு, ஓட்டுநர் இல்லாமல் பேலட்களை நகர்த்தும்."],
    [/delta|pack|sort|speed|fast|டெல்டா|பேக்|வேகம்|வரிசைப்படுத்/i, "டெல்டா ரோபோ கேமரா வழிகாட்டுதலுடன் நிமிடத்துக்கு இருநூறு பொருட்களை எடுக்கும்."],
    [/weld|paint|automotive|car|arm|வெல்டிங்|பெயின்ட்|வாகன|கார்|கை/i, "எங்கள் ரோபோ கைகள் பூஜ்யம் புள்ளி பூஜ்யம் ஐந்து மில்லிமீட்டர் துல்லியத்தில் வெல்டிங், பெயின்டிங், அசெம்பிளி செய்யும்."],
    [/uptime|reliab|24\/7|shift|இயக்கநேரம்|நம்பகம்|ஷிப்ட்/i, "எங்கள் குழுமம் சராசரியாக தொண்ணூற்றொன்பது சதவீத இயக்கநேரத்துடன் இருபத்துநான்கு மணி நேரமும் இயங்கும்."],
    [/demo|quote|enquiry|inquiry|contact|buy|book|order|டெமோ|விலைப்புள்ளி|தொடர்பு|வாங்க|பதிவு|ஆர்டர்/i, "சரி! டெமோ மற்றும் விலைப்புள்ளி படிவத்துக்கு அழைத்துச் செல்கிறேன்.", "#enquiry"],
    [/compare|find|search|filter|model|ஒப்பிட|தேடு|தேடல்|மாடல்/i, "ரோபோ தேடல் கருவியைத் திறக்கிறேன். மூன்று மாடல்கள் வரை ஒப்பிடலாம்.", "#finder"],
    [/task|maintenance|service|repair|பராமரிப்பு|பழுது|சேவை|பணி/i, "பராமரிப்புப் பணி மேலாளரில் பணிகளைச் சேர்க்கலாம், திருத்தலாம், நீக்கலாம்.", "#tasks"],
    [/where|location|address|coimbatore|office|எங்கே|முகவரி|கோயம்புத்தூர்|அலுவலகம்/i, "நாங்கள் தமிழ்நாடு, கோயம்புத்தூரில், பன்னிரண்டு ஆட்டோமேஷன் பார்க்கில் இருக்கிறோம்."],
    [/joke|funny|நகைச்சுவை|ஜோக்|சிரிப்பு/i, "ரோபோ ஏன் விடுமுறைக்குப் போனது? தன் பேட்டரியை ரீசார்ஜ் செய்ய வேண்டும் என்பதால்!"],
    [/thank|bye|good night|நன்றி|போய்வருகிறேன்|பை/i, "நல்வரவு! மீண்டும் வாருங்கள். பீப் பூப்!"]
  ];

  window.GGI18N = {
    lang: function () { return cur; },
    set: function (l) { applyLang(l, false); },
    t: function (s) { if (cur !== "ta") { return s; } var r = tr(s); return r === null ? s : r; },
    voiceLang: function () { return cur === "ta" ? "ta" : null; },
    lines: function () { return cur === "ta" ? LINES_TA : null; },
    tickle: function () { return cur === "ta" ? TICKLE_TA : null; },
    welcome: function () { return cur === "ta" ? "ஜிஜி ரோபோட்ஸ்க்கு வரவேற்கிறோம்! என்னைத் தொட்டுப் பேசுங்கள், அல்லது கேள்வி கேளுங்கள்." : null; },
    reply: function (q) {
      if (cur !== "ta") { return null; }
      q = (q || "").toLowerCase();
      for (var i = 0; i < BRAIN_TA.length; i++) {
        if (BRAIN_TA[i][0].test(q)) { return { t: BRAIN_TA[i][1], go: BRAIN_TA[i][2] || null }; }
      }
      return { t: "இதைப் பற்றி இன்னும் கற்றுக்கொண்டிருக்கிறேன். சுமை, விலை, பாதுகாப்பு அல்லது டெமோ பற்றிக் கேளுங்கள்." };
    },
    introSpeak: function (stage) {
      if (cur !== "ta") { return false; }
      if (stage === "power") { speakTa("வணக்கம்! ரோபோ இயங்கத் தொடங்குகிறது.", { rate: 0.95, pitch: 0.9 }); }
      else if (stage === "blast") { speakTa("பிளாஸ்ட்!", { rate: 0.8, pitch: 0.7 }); }
      else if (stage === "word") { speakTa("ஜிஜி ரோபோட்ஸ். நவீன தொழிலுக்கான ஸ்மார்ட் ரோபோக்கள்.", { rate: 0.9, pitch: 0.8 }); }
      return true;
    }
  };

  /* ---------------------------------------------------------
     START
     --------------------------------------------------------- */
  buildSwitch();
  applyLang(cur, false);
})();


/* =========================================================
   GG Robots - pro.js  (cinematic blast intro + page polish)
   Sequence: letterbox bars > red alert + heartbeat + 3-2-1 countdown >
   TRIPLE BLAST (fireball fills the screen, cracks, shockwaves, debris,
   sub-bass, tinnitus ring) > logo reveal.
   ========================================================= */
(function () {
  "use strict";
  var intro = document.getElementById("intro");
  var I18N = function () { return window.GGI18N || null; };

  /* hero eyebrow badge */
  (function () {
    var h1 = document.querySelector(".hero h1");
    if (!h1 || document.querySelector(".hero-eyebrow")) { return; }
    var s = document.createElement("span");
    s.className = "hero-eyebrow";
    s.textContent = "Industry 4.0 · Made in Coimbatore";
    h1.parentNode.insertBefore(s, h1);
    if (I18N() && I18N().lang() === "ta") { s.textContent = I18N().t(s.textContent); }
  })();

  /* header compact look after scrolling */
  (function () {
    var header = document.querySelector(".site-header");
    if (!header) { return; }
    var tick = false;
    function upd() { header.classList.toggle("scrolled", window.scrollY > 30); tick = false; }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  })();

  if (!intro || intro.classList.contains("gone")) { return; }
  var host = intro.querySelector(".gg-content");

  /* ---------- extra cinematic layers ---------- */
  function mk(cls, html) { var d = document.createElement("div"); d.className = cls; d.setAttribute("aria-hidden", "true"); if (html) { d.innerHTML = html; } return d; }
  var crackSvg = (function () {
    var p = "", i, j;
    for (i = 0; i < 14; i++) {
      var a = (i / 14) * Math.PI * 2 + Math.random() * 0.3, x = 50, y = 48, d = "M50 48";
      for (j = 0; j < 6; j++) { a += (Math.random() - 0.5) * 0.7; var l = 6 + Math.random() * 10; x += Math.cos(a) * l; y += Math.sin(a) * l * 0.62; d += " L" + x.toFixed(1) + " " + y.toFixed(1); }
      p += '<path d="' + d + '"/>';
    }
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="none">' + p + "</svg>";
  })();
  var lbTop = mk("gg-lb gg-lb-t"), lbBot = mk("gg-lb gg-lb-b");
  var count = mk("gg-count"), fire = mk("gg-bigfire"), crack = mk("gg-crack", crackSvg), streak = mk("gg-streak"), vign = mk("gg-redvig");
  [vign, fire, streak, crack, count, lbTop, lbBot].forEach(function (n) { host.appendChild(n); });

  /* ---------- audio ---------- */
  var ac = null, muted = false, noiseBuf = null;
  function getCtx() {
    if (ac) { return ac; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { return null; }
    try {
      ac = new AC();
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) { d[i] = Math.random() * 2 - 1; }
    } catch (e) { ac = null; }
    return ac;
  }
  function chain(vol) {
    var c = ac, out = c.createGain(), comp = c.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 8;
    out.gain.value = vol; out.connect(comp); comp.connect(c.destination);
    return out;
  }
  function heartbeat(at) {
    var c = getCtx(); if (!c || muted) { return; }
    if (c.state === "suspended") { c.resume(); }
    var out = chain(1.0), t = c.currentTime + at;
    var o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.22);
    g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.35);
  }
  function explosion(size, first) {
    var c = getCtx(); if (!c || muted) { return; }
    if (c.state === "suspended") { c.resume(); }
    var t = c.currentTime + 0.01, out = chain(0.95 * Math.min(size, 1.3)), i;
    function src(type, f0, f1, dur, vol, q) {
      var n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      n.buffer = noiseBuf; f.type = type; if (q) { f.Q.value = q; }
      f.frequency.setValueAtTime(f0, t); if (f1) { f.frequency.exponentialRampToValueAtTime(f1, t + dur); }
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      n.connect(f); f.connect(g); g.connect(out); n.start(t, Math.random() * 0.5); n.stop(t + dur + 0.05);
    }
    /* sub-bass drop */
    var o = c.createOscillator(), og = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(24, t + 1.3);
    og.gain.setValueAtTime(1.2, t); og.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
    o.connect(og); og.connect(out); o.start(t); o.stop(t + 1.9);
    /* growl layer (saw through lowpass) */
    var s = c.createOscillator(), sf = c.createBiquadFilter(), sg = c.createGain();
    s.type = "sawtooth"; s.frequency.setValueAtTime(70, t); s.frequency.exponentialRampToValueAtTime(30, t + 1.2);
    sf.type = "lowpass"; sf.frequency.value = 240;
    sg.gain.setValueAtTime(0.5, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    s.connect(sf); sf.connect(sg); sg.connect(out); s.start(t); s.stop(t + 1.5);
    src("lowpass", 6000, 60, 2.4, 1.0);            /* roar */
    src("highpass", 1800, null, 0.3, 0.8);          /* crack */
    src("lowpass", 400, 40, 3.2, 0.6);              /* long rumble tail */
    for (i = 0; i < 18; i++) {                      /* debris crackle */
      var tt = t + 0.3 + Math.random() * 1.6, n2 = c.createBufferSource(), f2 = c.createBiquadFilter(), g2 = c.createGain();
      n2.buffer = noiseBuf; f2.type = "bandpass"; f2.frequency.value = 1400 + Math.random() * 3800; f2.Q.value = 3;
      g2.gain.setValueAtTime(0.16 + Math.random() * 0.16, tt); g2.gain.exponentialRampToValueAtTime(0.001, tt + 0.05);
      n2.connect(f2); f2.connect(g2); g2.connect(out); n2.start(tt, Math.random() * 3); n2.stop(tt + 0.06);
    }
    if (first) {                                     /* ears ringing */
      var r = c.createOscillator(), rg = c.createGain();
      r.type = "sine"; r.frequency.value = 6800;
      rg.gain.setValueAtTime(0.0001, t + 0.2); rg.gain.exponentialRampToValueAtTime(0.05, t + 0.5); rg.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      r.connect(rg); rg.connect(out); r.start(t); r.stop(t + 3.3);
    }
  }

  /* ---------- visual blast ---------- */
  function blast(size, delay, first) {
    setTimeout(function () {
      var b = mk("gg-blast");
      b.style.setProperty("--bs", size);
      var html = '<i class="bw bw1"></i><i class="bw bw2"></i><i class="bw bw3"></i><i class="bf"></i><i class="bc"></i>', n = size > 1 ? 60 : 36, i;
      for (i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, d = (0.35 + Math.random() * 0.65) * Math.min(window.innerWidth, 1000) * 0.6 * size;
        html += '<b class="bd" style="--dx:' + (Math.cos(a) * d).toFixed(0) + "px;--dy:" + (Math.sin(a) * d * 0.8 - 40).toFixed(0) +
          "px;--rot:" + Math.floor(Math.random() * 720 - 360) + "deg;--s:" + (0.5 + Math.random() * 1.6).toFixed(2) +
          ";--t:" + (1 + Math.random() * 1).toFixed(2) + "s;--c:" + (Math.random() < 0.5 ? "#ffb04d" : (Math.random() < 0.5 ? "#fff6c9" : "#ff5a1f")) + '"></b>';
      }
      b.innerHTML = html;
      host.insertBefore(b, host.querySelector(".gg-flash"));
      host.classList.remove("quake"); void host.offsetWidth; host.classList.add("quake");
      explosion(size, first);
      setTimeout(function () { if (b.parentNode) { b.parentNode.removeChild(b); } }, 2600);
    }, delay);
  }

  /* countdown 3 - 2 - 1 while the eyes charge */
  function countdown() {
    ["3", "2", "1"].forEach(function (num, i) {
      setTimeout(function () {
        count.textContent = num; count.classList.remove("pop"); void count.offsetWidth; count.classList.add("pop");
        heartbeat(0);
      }, 150 + i * 650);
    });
    setTimeout(function () { count.textContent = ""; count.classList.remove("pop"); }, 2200);
    [0.1, 0.5, 0.85, 1.15, 1.4, 1.6, 1.78].forEach(function (x) { heartbeat(x); });
  }

  /* ---------- hooks ---------- */
  var fired = {};
  new MutationObserver(function () {
    var cl = intro.classList;
    if (cl.contains("started") && !fired.start) { fired.start = 1; getCtx(); }
    if (cl.contains("s-power") && !fired.power) { fired.power = 1; var I = I18N(); if (I) { I.introSpeak("power"); } }
    if (cl.contains("s-charge") && !fired.charge) { fired.charge = 1; intro.classList.add("charging"); countdown(); }
    if (cl.contains("s-gg") && !fired.gg) {
      fired.gg = 1;
      intro.classList.remove("charging");
      intro.classList.add("bigblast");
      blast(1.6, 0, true);      /* BLAST! */
      blast(1.1, 480);          /* BLAST! */
      blast(1.35, 980);         /* BLAST! */
      var I2 = I18N(); if (I2) { setTimeout(function () { I2.introSpeak("blast"); }, 300); }
    }
    if (cl.contains("leave") && !fired.leave) { fired.leave = 1; blast(0.8, 450); }
    if (cl.contains("gone")) { try { if (ac) { ac.close(); } } catch (e) { /* ignore */ } this.disconnect(); }
  }).observe(intro, { attributes: true, attributeFilter: ["class"] });

  intro.addEventListener("click", function (e) { if (e.target.closest(".gg-sound")) { muted = !muted; } });
})();