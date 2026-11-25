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
    "company": "NovaMotion Robotics",
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
    "Hi! I'm NOVA-1. Click me!",
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