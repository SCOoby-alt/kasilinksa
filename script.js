/* =========================================================
   KasiLink SA — script.js
   TUT ICT First Years — JGA 2026 — Digital Entrepreneurship

   This file is written in plain (vanilla) JavaScript so that
   first-year students can read every line without needing a
   framework. It is split into small named functions, each
   doing one clear job.
   ========================================================= */

/* ---------------------------------------------------------
   1. DEMO PLUMBER DATA
   These records match the demo data returned by the real
   Spring Boot backend (GET /api/plumbers) so the site behaves
   the same whether the backend is running or not.
   --------------------------------------------------------- */
const DEMO_PLUMBERS = [
  {
    name: "Mokoena",
    service: "Residential plumbing",
    price: 800,
    experience: 8,
    location: "Soshanguve, Pretoria",
    rating: 4.6,
    reviews: 32,
    emergency: false,
    review: "Sorted out our bathroom pipes quickly and cleaned up after."
  },
  {
    name: "Maseko",
    service: "Leak repairs",
    price: 960,
    experience: 6,
    location: "Mamelodi, Pretoria",
    rating: 4.4,
    reviews: 21,
    emergency: true,
    review: "Came out the same evening for a burst pipe. Very reliable."
  },
  {
    name: "Baloyi",
    service: "Bathroom plumbing",
    price: 770,
    experience: 7,
    location: "Atteridgeville, Pretoria",
    rating: 4.7,
    reviews: 40,
    emergency: false,
    review: "Neat installation work and fair pricing on the quote."
  },
  {
    name: "Kgatle",
    service: "Water-pipe",
    price: 900,
    experience: 10,
    location: "Ga-Rankuwa, Pretoria",
    rating: 4.8,
    reviews: 55,
    emergency: true,
    review: "Most experienced plumber we have used. Highly recommended."
  },
  {
    name: "Mabena",
    service: "geyser plumbing",
    price: 500,
    experience: 9,
    location: "Hammanskraal, Pretoria",
    rating: 4.3,
    reviews: 18,
    emergency: false,
    review: "Replaced our geyser at a reasonable price, good communication."
  }
];

/* Business costing constants — kept identical to the backend
   (KasiLinkWebController.java) so the revenue calculator on
   the Revenue Model page matches the real API logic. */
const FIXED_COST = 3500;
const VARIABLE_COST_PER_BOOKING = 8;

/* ---------------------------------------------------------
   2. SMALL HELPERS
   --------------------------------------------------------- */

// Turns "Water-Pipe Services" and "Water-pipe" into the same
// simple string so they can be compared for a match.
function normaliseService(text) {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

// Returns true if a plumber's service matches the service the
// customer picked in the dropdown (or if nothing was picked).
function serviceMatches(plumberService, chosenService) {
  if (!chosenService) return true;

  if (chosenService.toLowerCase() === "emergency plumbing") {
    return plumberService.toLowerCase().includes("emergency");
  }

  const a = normaliseService(plumberService);
  const b = normaliseService(chosenService.replace("Services", ""));
  return a.includes(b.slice(0, 5)) || b.includes(a.slice(0, 5));
}

// Returns true if the plumber's location contains the text the
// customer typed (case-insensitive). Empty search always matches.
function locationMatches(plumberLocation, chosenLocation) {
  if (!chosenLocation) return true;
  return plumberLocation.toLowerCase().includes(chosenLocation.toLowerCase());
}

// Builds two-letter initials from a plumber surname, e.g. "Mokoena" -> "MO"
function initialsFor(name) {
  return name.slice(0, 2).toUpperCase();
}

// Formats a number as South African Rand, e.g. 800 -> "R 800"
function formatRand(amount) {
  return "R " + Number(amount).toLocaleString("en-ZA");
}

// Builds a row of filled/empty star characters for a rating out of 5
function starString(rating) {
  const fullStars = Math.round(rating);
  return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
}

/* ---------------------------------------------------------
   3. MOBILE NAVIGATION TOGGLE
   Shared by every page's header.
   --------------------------------------------------------- */
function setupNavToggle() {
  const toggleButton = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");

  if (!toggleButton || !nav) return;

  toggleButton.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("open");
    toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

/* ---------------------------------------------------------
   4. PLUMBER CARD RENDERING
   Used on the Home page (search results) and the
   Products / Services page (full plumber list).
   --------------------------------------------------------- */
function buildPlumberCard(plumber) {
  const emergencyBadge = plumber.emergency
    ? '<span class="emergency-badge">Emergency callout available</span>'
    : "";

  return `
    <article class="plumber-card">
      <div class="plumber-photo" aria-hidden="true">${initialsFor(plumber.name)}</div>
      <div class="plumber-body">
        <h3 class="plumber-name">${plumber.name}</h3>
        <p class="plumber-spec">${plumber.service} &middot; ${plumber.location}</p>
        ${emergencyBadge}
        <div class="plumber-meta">
          <span>${plumber.experience} yrs experience</span>
          <span>${formatRand(plumber.price)} / callout</span>
        </div>
        <p class="plumber-rating">${starString(plumber.rating)}
          <span class="count">${plumber.rating.toFixed(1)} (${plumber.reviews} reviews)</span>
        </p>
        <p class="plumber-review">
          <span class="review-tag">Prototype Demo Review</span><br>
          "${plumber.review}"
        </p>
        <div class="plumber-actions">
          <button type="button" class="btn btn-outline" onclick="viewPlumberProfile('${plumber.name}')">View Profile</button>
          <button type="button" class="btn btn-primary" onclick="requestService('${plumber.name}')">Request Service</button>
        </div>
      </div>
    </article>
  `;
}

// "View Profile" — for this JGA prototype this shows the same
// details in a simple alert box rather than a separate page.
function viewPlumberProfile(name) {
  const plumber = DEMO_PLUMBERS.find(function (p) { return p.name === name; });
  if (!plumber) return;

  alert(
    plumber.name + " — " + plumber.service + "\n" +
    "Location: " + plumber.location + "\n" +
    "Experience: " + plumber.experience + " years\n" +
    "Rating: " + plumber.rating + " (" + plumber.reviews + " reviews)\n" +
    "Callout price: " + formatRand(plumber.price)
  );
}

// "Request Service" — jumps to the booking form on the
// Products / Services page and pre-selects the plumber.
function requestService(name) {
  const bookingSelect = document.getElementById("booking-plumber");
  const bookingSection = document.getElementById("booking");

  if (bookingSelect) {
    bookingSelect.value = name;
  }

  if (bookingSection) {
    bookingSection.scrollIntoView({ behavior: "smooth" });
  }
}

/* ---------------------------------------------------------
   5. HOME PAGE — "FIND A PLUMBER" SEARCH
   Tries the real backend first: GET /api/plumbers/search
   If that endpoint is not running (e.g. this page is opened
   as a plain file, or the backend project has not been
   started yet), it falls back to the demo data above so the
   page still works during class demonstrations.
   --------------------------------------------------------- */
function setupHomeSearch() {
  const form = document.getElementById("plumber-search-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const location = document.getElementById("search-location").value.trim();
    const service = document.getElementById("search-service").value;

    runPlumberSearch(location, service);
  });

  // Show every demo plumber on first load so the section never looks empty.
  renderSearchResults(DEMO_PLUMBERS, "Showing all available plumbers.");
}

function runPlumberSearch(location, service) {
  const query = new URLSearchParams();
  if (location) query.set("location", location);
  if (service) query.set("service", service);

  fetch("/api/plumbers/search?" + query.toString())
    .then(function (response) {
      if (!response.ok) throw new Error("Search endpoint not available yet");
      return response.json();
    })
    .then(function (results) {
      renderSearchResults(results, "Results from KasiLink SA (live API).");
    })
    .catch(function () {
      // DEMO FALLBACK: the /api/plumbers/search endpoint is not
      // built yet, so filter the local demo list instead.
      const filtered = DEMO_PLUMBERS.filter(function (plumber) {
        return locationMatches(plumber.location, location) && serviceMatches(plumber.service, service);
      });
      renderSearchResults(filtered, "Demo mode — showing sample plumbers (live search API not connected yet).");
    });
}

function renderSearchResults(list, statusMessage) {
  const resultsContainer = document.getElementById("search-results");
  const statusContainer = document.getElementById("search-status");
  if (!resultsContainer) return;

  if (statusContainer) statusContainer.textContent = statusMessage;

  if (!list.length) {
    resultsContainer.innerHTML = "<p>No plumbers matched that search. Try a different location or service.</p>";
    return;
  }

  resultsContainer.innerHTML =
    '<div class="plumber-grid">' + list.map(buildPlumberCard).join("") + "</div>";
}

/* ---------------------------------------------------------
   6. PRODUCTS / SERVICES PAGE — FULL PLUMBER LIST
   --------------------------------------------------------- */
function setupPlumberDirectory() {
  const grid = document.getElementById("plumber-directory");
  if (!grid) return;

  // Try the real backend first so the page reflects live data
  // once the Spring Boot app (KasiLinkWebApplication) is running.
  fetch("/api/plumbers")
    .then(function (response) {
      if (!response.ok) throw new Error("Backend not reachable");
      return response.json();
    })
    .then(function (plumbers) {
      const merged = plumbers.map(function (p) {
        const demoMatch = DEMO_PLUMBERS.find(function (d) { return d.name === p.name; }) || {};
        return Object.assign({ location: "Tshwane, Gauteng", rating: 4.5, reviews: 10, emergency: false, review: "Reliable and professional service." }, demoMatch, p);
      });
      grid.innerHTML = merged.map(buildPlumberCard).join("");
    })
    .catch(function () {
      grid.innerHTML = DEMO_PLUMBERS.map(buildPlumberCard).join("");
    });
}

/* ---------------------------------------------------------
   7. BOOKING FORM (Request Service)
   Matches the backend's BookingRequest fields exactly:
   customerName, contact, location, email, plumberName, bookings
   --------------------------------------------------------- */
function setupBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const requestBody = {
      customerName: document.getElementById("booking-name").value.trim(),
      contact: document.getElementById("booking-contact").value.trim(),
      location: document.getElementById("booking-location").value.trim(),
      email: document.getElementById("booking-email").value.trim(),
      plumberName: document.getElementById("booking-plumber").value,
      bookings: Number(document.getElementById("booking-count").value)
    };

    fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    })
      .then(function (response) { return response.json(); })
      .then(function (result) { showBookingResult(result); })
      .catch(function () {
        // DEMO FALLBACK: mirrors the same validation and costing
        // logic used in KasiLinkWebController.java so the form
        // still works if the backend is not running.
        showBookingResult(calculateBookingDemo(requestBody));
      });
  });
}

function calculateBookingDemo(request) {
  if (!request.customerName) {
    return { success: false, message: "Customer name is required" };
  }
  if (!request.email.includes("@") || !request.email.includes(".")) {
    return { success: false, message: "Email should contain @ and ." };
  }

  const plumber = DEMO_PLUMBERS.find(function (p) { return p.name === request.plumberName; });
  if (!plumber) {
    return { success: false, message: "Choose correct name" };
  }
  if (!(request.bookings >= 1)) {
    return { success: false, message: "Bookings must be at least 1" };
  }

  const revenue = plumber.price * request.bookings;
  const totalCost = FIXED_COST + VARIABLE_COST_PER_BOOKING * request.bookings;

  return {
    success: true,
    customerName: request.customerName,
    plumberName: plumber.name,
    service: plumber.service,
    experience: plumber.experience,
    price: plumber.price,
    bookings: request.bookings,
    revenue: revenue,
    totalCost: totalCost,
    message: "Booking created successfully (demo mode)"
  };
}

function showBookingResult(result) {
  const messageBox = document.getElementById("booking-message");
  if (!messageBox) return;

  messageBox.className = "form-msg " + (result.success ? "success" : "error");

  if (result.success) {
    messageBox.innerHTML =
      result.message + "<br>" +
      "Plumber: " + result.plumberName + " (" + result.service + ")<br>" +
      "Bookings: " + result.bookings + " &middot; Estimated revenue: " + formatRand(result.revenue);
  } else {
    messageBox.textContent = result.message;
  }
}

/* ---------------------------------------------------------
   8. STAR RATING WIDGET
   --------------------------------------------------------- */
function setupRatingWidget() {
  const widget = document.getElementById("star-rating");
  const ratingForm = document.getElementById("rating-form");
  if (!widget || !ratingForm) return;

  const stars = widget.querySelectorAll("button");
  let selectedRating = 0;

  stars.forEach(function (star) {
    star.addEventListener("click", function () {
      selectedRating = Number(star.dataset.value);
      stars.forEach(function (s) {
        s.classList.toggle("filled", Number(s.dataset.value) <= selectedRating);
      });
    });
  });

  ratingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    fetch("/api/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: selectedRating })
    })
      .then(function (response) { return response.json(); })
      .then(function (result) { showRatingResult(result); })
      .catch(function () {
        // DEMO FALLBACK: same rule as KasiLinkWebController.java
        if (selectedRating < 1 || selectedRating > 5) {
          showRatingResult({ success: false, message: "Rating must be between 1 and 5" });
        } else if (selectedRating >= 4) {
          showRatingResult({ success: true, message: "Thank you, we are glad. (demo mode)" });
        } else {
          showRatingResult({ success: true, message: "Thank you for your feedback, we will improve (demo mode)" });
        }
      });
  });
}

function showRatingResult(result) {
  const messageBox = document.getElementById("rating-message");
  if (!messageBox) return;
  messageBox.className = "form-msg " + (result.success ? "success" : "error");
  messageBox.textContent = result.message;
}

/* ---------------------------------------------------------
   9. REVENUE MODEL CALCULATOR
   Uses the same fixed/variable cost figures as the backend.
   --------------------------------------------------------- */
function setupRevenueCalculator() {
  const form = document.getElementById("revenue-calculator");
  if (!form) return;

  const priceSelect = document.getElementById("calc-service");
  const bookingsInput = document.getElementById("calc-bookings");

  function update() {
    const price = Number(priceSelect.value);
    const bookings = Math.max(0, Number(bookingsInput.value) || 0);

    const revenue = price * bookings;
    const totalCost = FIXED_COST + VARIABLE_COST_PER_BOOKING * bookings;
    const profit = revenue - totalCost;

    document.getElementById("calc-revenue").textContent = formatRand(revenue);
    document.getElementById("calc-cost").textContent = formatRand(totalCost);

    const profitEl = document.getElementById("calc-profit");
    profitEl.textContent = formatRand(profit);
    profitEl.className = "value " + (profit >= 0 ? "positive" : "negative");
  }

  form.addEventListener("input", update);
  update();
}

/* ---------------------------------------------------------
   10. CONTACT FORM
   No backend endpoint exists for messages yet in this
   prototype, so this performs simple validation and shows a
   confirmation message instead of pretending to send an email.
   --------------------------------------------------------- */
function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const message = document.getElementById("contact-message").value.trim();
    const messageBox = document.getElementById("contact-message-status");

    if (!name || !email || !message) {
      messageBox.className = "form-msg error";
      messageBox.textContent = "Please fill in your name, email and message.";
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      messageBox.className = "form-msg error";
      messageBox.textContent = "Email should contain @ and .";
      return;
    }

    messageBox.className = "form-msg success";
    messageBox.textContent = "Thanks " + name + ", your message has been noted (demo mode — no email server connected yet).";
    form.reset();
  });
}

/* ---------------------------------------------------------
   11. RUN EVERYTHING ONCE THE PAGE HAS LOADED
   Each setup function checks for its own elements first, so
   it is safe to call all of them on every page.
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  setupNavToggle();
  setupHomeSearch();
  setupPlumberDirectory();
  setupBookingForm();
  setupRatingWidget();
  setupRevenueCalculator();
  setupContactForm();
});
