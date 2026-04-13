// ============================================
// Legendary Metal Works Inc. - Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Navigation ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // --- Header scroll effect ---
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- Scroll animations ---
  const fadeElements = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => observer.observe(el));

  // --- Contact Form ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      // Basic validation
      if (!data.name || !data.email || !data.phone || !data.message) {
        alert('Please fill in all required fields.');
        return;
      }

      if (!isValidEmail(data.email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Submit to Web3Forms
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          const successMsg = document.getElementById('contactSuccess');
          if (successMsg) {
            successMsg.classList.add('show');
            contactForm.reset();
            setTimeout(() => { successMsg.classList.remove('show'); }, 5000);
          }
        } else {
          alert('Something went wrong. Please call us at (805) 396-9984.');
        }
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
      })
      .catch(() => {
        alert('Something went wrong. Please call us at (805) 396-9984.');
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
      });
    });
  }

  // --- Booking Form ---
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(bookingForm);
      const data = Object.fromEntries(formData.entries());
      const selectedDate = document.getElementById('selectedDate').value;
      const selectedTime = document.getElementById('selectedTime').value;

      if (!data.name || !data.email || !data.phone || !selectedDate || !selectedTime) {
        alert('Please fill in all fields and select a date and time.');
        return;
      }

      // Submit to Web3Forms
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          const successMsg = document.getElementById('bookingSuccess');
          if (successMsg) {
            successMsg.classList.add('show');
            bookingForm.reset();
            document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
            document.querySelectorAll('.time-slot.selected').forEach(t => t.classList.remove('selected'));
            document.getElementById('selectedDate').value = '';
            document.getElementById('selectedTime').value = '';
            setTimeout(() => { successMsg.classList.remove('show'); }, 5000);
          }
        } else {
          alert('Something went wrong. Please call us at (805) 396-9984.');
        }
        submitBtn.textContent = 'Confirm Booking';
        submitBtn.disabled = false;
      })
      .catch(() => {
        alert('Something went wrong. Please call us at (805) 396-9984.');
        submitBtn.textContent = 'Confirm Booking';
        submitBtn.disabled = false;
      });
    });
  }

  // --- Email Validation ---
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});


// ============================================
// Booking Calendar
// ============================================
class BookingCalendar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.today = new Date();
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
    this.selectedDate = null;

    this.render();
    this.attachNavEvents();
  }

  render() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthLabel = this.container.querySelector('.calendar-month');
    if (monthLabel) {
      monthLabel.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
    }

    const grid = this.container.querySelector('.calendar-days');
    if (!grid) return;

    grid.innerHTML = '';

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('button');
      empty.className = 'calendar-day empty';
      empty.disabled = true;
      grid.appendChild(empty);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const btn = document.createElement('button');
      btn.className = 'calendar-day';
      btn.textContent = day;

      const date = new Date(this.currentYear, this.currentMonth, day);

      // Disable past dates and weekends (Sunday=0, Saturday=6)
      if (date < new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()) ||
          date.getDay() === 0) {
        btn.classList.add('disabled');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => this.selectDate(btn, date));
      }

      grid.appendChild(btn);
    }
  }

  selectDate(btn, date) {
    this.container.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    btn.classList.add('selected');
    this.selectedDate = date;

    const dateInput = document.getElementById('selectedDate');
    if (dateInput) {
      dateInput.value = date.toISOString().split('T')[0];
    }

    // Show time slots
    const timeSlotsContainer = document.getElementById('timeSlots');
    if (timeSlotsContainer) {
      timeSlotsContainer.style.display = 'grid';
    }
  }

  attachNavEvents() {
    const prevBtn = this.container.querySelector('.calendar-prev');
    const nextBtn = this.container.querySelector('.calendar-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentMonth--;
        if (this.currentMonth < 0) {
          this.currentMonth = 11;
          this.currentYear--;
        }
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentMonth++;
        if (this.currentMonth > 11) {
          this.currentMonth = 0;
          this.currentYear++;
        }
        this.render();
      });
    }
  }
}

// Initialize calendar on booking page
document.addEventListener('DOMContentLoaded', () => {
  new BookingCalendar('bookingCalendar');

  // Time slot selection
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');

      const timeInput = document.getElementById('selectedTime');
      if (timeInput) {
        timeInput.value = slot.dataset.time;
      }
    });
  });
});
