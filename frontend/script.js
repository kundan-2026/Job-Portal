// script.js - robust event wiring and delegation

document.addEventListener("DOMContentLoaded", () => {
  // DOM helpers
  const $ = (id) => document.getElementById(id);
  const showView = (id) => {
    // hide all views
    document
      .querySelectorAll(".view")
      .forEach((v) => (v.style.display = "none"));
    const el = $(id);
    if (el) el.style.display = "";
    // focus first input if present
    const firstInput =
      el && el.querySelector("input, textarea, select, button");
    if (firstInput) firstInput.focus();
  };

  // initial elements
  const jobListEl = $("job-list");
  const jobTemplate = document.getElementById("job-template");

  // state (localStorage backed)
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  let tracker = JSON.parse(localStorage.getItem("history")) || [];
  let users = JSON.parse(localStorage.getItem("users")) || []; // local demo auth
  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

  // nav buttons
  $("show-jobs").addEventListener("click", () => {
    showView("jobs-section");
    renderJobs();
  });
  $("show-post").addEventListener("click", () => {
    showView("post-section");
  });
  $("show-tracker").addEventListener("click", () => {
    showView("tracker-section");
    renderTracker();
  });
  $("show-auth").addEventListener("click", () => {
    showView("auth-section");
  });

  // Apply filters / clear
  $("applyFilters").addEventListener("click", renderJobs);
  $("clearFilters").addEventListener("click", () => {
    ["q", "location", "minFee", "maxFee", "fromDate", "toDate"].forEach(
      (id) => {
        $(id).value = "";
      }
    );
    renderJobs();
  });

  // Post job form
  $("job-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const job = {
      title: $("title").value.trim(),
      company: $("company").value.trim(),
      location: $("job-location").value.trim(),
      fee: $("job-fee").value ? Number($("job-fee").value) : 0,
      description: $("job-desc").value.trim(),
      datePosted: new Date().toISOString().slice(0, 10),
    };
    if (!job.title || !job.company) {
      alert("Please enter title and company");
      return;
    }
    jobs.unshift(job);
    localStorage.setItem("jobs", JSON.stringify(jobs));
    $("job-form").reset();
    showView("jobs-section");
    renderJobs();
    alert("Job posted (saved locally)");
  });
  $("reset-job-form").addEventListener("click", () => $("job-form").reset());

  // Tracker form
  $("tracker-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const entry = {
      type: $("tracker-type").value,
      title: $("tracker-title").value.trim(),
      organisation: $("tracker-org").value.trim(),
      date: $("tracker-date").value || null,
      status: $("tracker-status").value.trim() || "Planned",
      notes: $("tracker-notes").value.trim() || "",
    };
    if (!entry.title) {
      alert("Please enter a title");
      return;
    }
    tracker.unshift(entry);
    localStorage.setItem("history", JSON.stringify(tracker));
    $("tracker-form").reset();
    renderTracker();
    alert("Tracker entry added");
  });
  $("clear-tracker-form").addEventListener("click", () =>
    $("tracker-form").reset()
  );

  // Auth (local demo)
  $("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("signup-name").value.trim();
    const email = $("signup-email").value.trim().toLowerCase();
    const pass = $("signup-password").value;
    const role = $("signup-role").value;
    if (!name || !email || !pass) {
      alert("Fill all fields");
      return;
    }
    if (users.some((u) => u.email === email)) {
      alert("Email already registered");
      return;
    }
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: pass,
      role,
    };
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));
    currentUser = user;
    $("signup-form").reset();
    alert(`Signed up as ${role}. Demo login saved locally.`);
  });

  $("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("login-email").value.trim().toLowerCase();
    const pass = $("login-password").value;
    const found = users.find((u) => u.email === email && u.password === pass);
    if (!found) {
      alert("Invalid credentials (demo local)");
      return;
    }
    currentUser = found;
    localStorage.setItem("currentUser", JSON.stringify(found));
    $("login-form").reset();
    alert(`Welcome back, ${found.name} (${found.role})`);
  });

  // Event delegation for job apply buttons
  jobListEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".apply-btn");
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    if (Number.isNaN(idx) || idx < 0 || idx >= jobs.length) {
      console.warn("Invalid job index", idx);
      return;
    }
    // require demo login for applying
    if (!currentUser) {
      if (!confirm("You must be logged in to apply. Go to Login/Signup?"))
        return;
      showView("auth-section");
      return;
    }
    // add to tracker as Applied
    const applied = Object.assign({}, jobs[idx], {
      status: "Applied",
      appliedAt: new Date().toISOString().slice(0, 10),
    });
    tracker.unshift({
      type: "job",
      title: applied.title,
      organisation: applied.company || applied.location,
      date: applied.appliedAt,
      status: "Applied",
      notes: `Applied by ${currentUser.name}`,
    });
    localStorage.setItem("history", JSON.stringify(tracker));
    renderTracker();
    alert("Application saved to your tracker (local demo).");
  });

  // Render functions
  function renderJobs() {
    const q = ($("q").value || "").toLowerCase();
    const location = ($("location").value || "").toLowerCase();
    const minFee = Number($("minFee").value || 0);
    const maxFee = Number($("maxFee").value || 0);
    const fromDate = $("fromDate").value;
    const toDate = $("toDate").value;

    jobListEl.innerHTML = "";
    const filtered = jobs.filter((job) => {
      if (
        q &&
        !(
          job.title.toLowerCase().includes(q) ||
          (job.company || "").toLowerCase().includes(q)
        )
      )
        return false;
      if (location && !(job.location || "").toLowerCase().includes(location))
        return false;
      if (minFee && Number(job.fee) < minFee) return false;
      if (maxFee && maxFee > 0 && Number(job.fee) > maxFee) return false;
      if (fromDate && job.datePosted && job.datePosted < fromDate) return false;
      if (toDate && job.datePosted && job.datePosted > toDate) return false;
      return true;
    });

    if (filtered.length === 0) {
      jobListEl.innerHTML =
        '<div class="card"><em>No jobs found — try clearing filters or post one.</em></div>';
      return;
    }

    filtered.forEach((job, index) => {
      const node = jobTemplate.content.cloneNode(true);
      node.querySelector(".title").textContent = job.title;
      node.querySelector(".company").textContent = job.company || "Unknown";
      node.querySelector(".loc").textContent = job.location || "Anywhere";
      node.querySelector(".desc").textContent = job.description || "";
      node.querySelector(".fee").textContent = job.fee ? "₹" + job.fee : "₹0";
      node.querySelector(".date").textContent =
        job.datePosted || job.date || "";
      const applyBtn = node.querySelector(".apply-btn");
      applyBtn.dataset.index = jobs.indexOf(job); // real index in jobs array
      applyBtn.textContent = "Apply";
      jobListEl.appendChild(node);
    });
  }

  function renderTracker() {
    const container = $("tracker-list");
    container.innerHTML = "";
    if (tracker.length === 0) {
      container.innerHTML = "<div><em>No tracker entries yet.</em></div>";
      return;
    }
    tracker.forEach((item) => {
      const li = document.createElement("div");
      li.className = "card";
      li.innerHTML = `<strong>${item.type.toUpperCase()}</strong> — ${
        item.title
      } <div style="color:#475569;font-size:13px">${
        item.organisation || ""
      } • ${item.date || ""}</div><div style="margin-top:8px">${
        item.status || ""
      } ${item.notes ? "• " + item.notes : ""}</div>`;
      container.appendChild(li);
    });
  }

  // initial render
  renderJobs();
  renderTracker();

  // Expose some helpers for debugging (optional)
  window._jobportal = {
    jobs,
    tracker,
    users,
    currentUser,
    renderJobs,
    renderTracker,
    showView,
  };
});

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});
