// script.js
document.addEventListener('DOMContentLoaded', function() {

  // ========== INDIAN TIME (IST) DISPLAY ON ALL PAGES ==========
  function updateIndiaTime() {
    const timeElement = document.getElementById('indiaTime');
    if (!timeElement) return;

    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    const formatter = new Intl.DateTimeFormat('en-IN', options);
    const now = new Date();
    const formatted = formatter.format(now).replace(',', ',') + ' IST';
    timeElement.textContent = formatted;
  }
  updateIndiaTime();
  setInterval(updateIndiaTime, 1000);

  // ========== LEAFLET MAP FOR AHMEDABAD (parking.html) ==========
  if (document.getElementById('ahmedabad-map')) {
    var map = L.map('ahmedabad-map').setView([23.0225, 72.5714], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var locations = [
      { name: "Alpha One Mall", coords: [23.0358, 72.5462], slots: 24 },
      { name: "CG Road", coords: [23.0260, 72.5560], slots: 8 },
      { name: "Sabarmati Riverfront", coords: [23.0439, 72.5797], slots: 15 },
      { name: "Gandhi Ashram", coords: [23.0608, 72.5813], slots: 32 },
      { name: "Kankaria Lake", coords: [23.0067, 72.6010], slots: 5 },
      { name: "Vastrapur Lake", coords: [23.0396, 72.5286], slots: 12 }
    ];

    locations.forEach(loc => {
      L.marker(loc.coords).addTo(map)
        .bindPopup(`<b>${loc.name}</b><br>Available: ${loc.slots} slots`);
    });

    L.circle([23.0225, 72.5714], {
      color: '#2a9d8f',
      fillColor: '#2a9d8f',
      fillOpacity: 0.1,
      radius: 3000
    }).addTo(map).bindTooltip('Ahmedabad Smart Parking Zone');
  }

  // ========== MINI MAP FOR CONTACT PAGE ==========
  if (document.getElementById('miniMap')) {
    var mini = L.map('miniMap').setView([23.0225, 72.5714], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mini);
    L.marker([23.0225, 72.5714]).addTo(mini).bindPopup('ParkSmart HQ');
  }

  // ========== POPULATE PARKING GRID (from JS) ==========
  const grid = document.getElementById('parkingGrid');
  if (grid) {
    const lots = [
      { name: "Alpha One Mall", slots: 24 },
      { name: "CG Road", slots: 8 },
      { name: "Sabarmati Riverfront", slots: 15 },
      { name: "Gandhi Ashram", slots: 32 },
      { name: "Kankaria Lake", slots: 5 },
      { name: "Vastrapur Lake", slots: 12 }
    ];
    grid.innerHTML = lots.map(lot => `
      <div class="parking-card">
        <h3>${lot.name}</h3>
        <p class="slots">Available slots: <span>${lot.slots}</span></p>
        <button class="btn btn-secondary book-now-btn" data-location="${lot.name}">Book Now</button>
      </div>
    `).join('');

    // reattach event listeners to new buttons
    document.querySelectorAll('.book-now-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        sessionStorage.setItem('prefillLocation', this.dataset.location);
        window.location.href = 'booking.html';
      });
    });
  }

  // ========== BOOKING FORM HANDLER ==========
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const vehicle = document.getElementById('vehicle').value.trim();
      const location = document.getElementById('location').value;
      const timeslot = document.getElementById('timeslot').value;
      if (!name || !vehicle || !location || !timeslot) {
        alert('Please fill in all fields.');
        return;
      }
      alert(`✅ Booking confirmed for ${name} at ${location} (${timeslot} IST). Thank you!`);
      bookingForm.reset();
    });
  }

  // ========== CONTACT FORM HANDLER ==========
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('message').value.trim();
      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }
      alert(`📬 Thanks for reaching out, ${name}! Our Ahmedabad team will respond within 24 hours.`);
      contactForm.reset();
    });
  }

  // ========== AUTO-PREFILL LOCATION IN BOOKING FORM ==========
  const locationSelect = document.getElementById('location');
  if (locationSelect) {
    const savedLocation = sessionStorage.getItem('prefillLocation');
    if (savedLocation) {
      const options = locationSelect.options;
      for (let opt of options) {
        if (opt.text === savedLocation) {
          opt.selected = true;
          break;
        }
      }
      sessionStorage.removeItem('prefillLocation');
    }
  }

  // ========== COUNTER ANIMATION FOR STATS ==========
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          let count = 0;
          const updater = setInterval(() => {
            if (count >= target) {
              clearInterval(updater);
            } else {
              count += Math.ceil(target / 40);
              if (count > target) count = target;
              el.textContent = count + (el.dataset.target == '45' ? '' : '+');
            }
          }, 30);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(num => observer.observe(num));
  }

  // ========== FILTER FOR PARKING (simple) ==========
  const searchInput = document.getElementById('searchParking');
  const filterSelect = document.getElementById('slotFilter');
  if (searchInput && filterSelect) {
    const filterCards = () => {
      const cards = document.querySelectorAll('.parking-card');
      const searchTerm = searchInput.value.toLowerCase();
      const filterVal = filterSelect.value;
      cards.forEach(card => {
        const name = card.querySelector('h3').innerText.toLowerCase();
        const slots = parseInt(card.querySelector('.slots span').innerText);
        let show = true;
        if (searchTerm && !name.includes(searchTerm)) show = false;
        if (filterVal === 'high' && slots < 10) show = false;
        if (filterVal === 'low' && slots >= 10) show = false;
        card.style.display = show ? 'block' : 'none';
      });
    };
    searchInput.addEventListener('input', filterCards);
    filterSelect.addEventListener('change', filterCards);
  }

  // ========== ACTIVE NAV HIGHLIGHT ==========
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });
});