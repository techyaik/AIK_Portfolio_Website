document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const menuToggle = document.querySelector(".menu-toggle");
  const navPanel = document.querySelector(".nav-panel");
  const siteHeader = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const revealItems = document.querySelectorAll(".reveal");
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const syncNavAccessibility = () => {
    if (!navPanel) {
      return;
    }

    const isDesktop = window.innerWidth > 820;
    const isOpen = navPanel.classList.contains("is-open");
    navPanel.setAttribute("aria-hidden", String(!isDesktop && !isOpen));
  };

  const closeMenu = () => {
    if (!menuToggle || !navPanel) {
      return;
    }

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navPanel.classList.remove("is-open");
    body.classList.remove("menu-open");
    syncNavAccessibility();
  };

  if (menuToggle && navPanel) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Open navigation menu" : "Close navigation menu"
      );
      navPanel.classList.toggle("is-open");
      body.classList.toggle("menu-open");
      syncNavAccessibility();
    });
  }

  syncNavAccessibility();

  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 820 &&
      menuToggle &&
      navPanel &&
      navPanel.classList.contains("is-open") &&
      !navPanel.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navPanel?.classList.contains("is-open")) {
      closeMenu();
      menuToggle?.focus();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 820) {
        closeMenu();
      }
    });
  });

  const updateActiveLink = () => {
    const headerOffset = siteHeader ? siteHeader.offsetHeight + 48 : 140;
    const scrollPosition = window.scrollY + headerOffset;
    let currentId = "home";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }

    syncNavAccessibility();
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  const setError = (field, message) => {
    const formGroup = field.closest(".form-group");
    const errorMessage = formGroup.querySelector(".error-message");

    formGroup.classList.add("error");
    errorMessage.textContent = message;
  };

  const clearError = (field) => {
    const formGroup = field.closest(".form-group");
    const errorMessage = formGroup.querySelector(".error-message");

    formGroup.classList.remove("error");
    errorMessage.textContent = "";
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  if (contactForm && formStatus) {
    const fields = [...contactForm.querySelectorAll("input, textarea")];

    fields.forEach((field) => {
      field.addEventListener("input", () => clearError(field));
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameField = contactForm.querySelector("#name");
      const emailField = contactForm.querySelector("#email");
      const messageField = contactForm.querySelector("#message");
      let hasError = false;

      formStatus.textContent = "";
      formStatus.className = "form-status";

      if (!nameField.value.trim()) {
        setError(nameField, "Please enter your name.");
        hasError = true;
      }

      if (!emailField.value.trim()) {
        setError(emailField, "Please enter your email address.");
        hasError = true;
      } else if (!isValidEmail(emailField.value.trim())) {
        setError(emailField, "Please enter a valid email address.");
        hasError = true;
      }

      if (!messageField.value.trim()) {
        setError(messageField, "Please enter your message.");
        hasError = true;
      } else if (messageField.value.trim().length < 12) {
        setError(messageField, "Please share a few more details about your project.");
        hasError = true;
      }

      if (hasError) {
        formStatus.textContent = "Please correct the highlighted fields and try again.";
        formStatus.classList.add("error");
        return;
      }

      fields.forEach((field) => clearError(field));
      contactForm.reset();
      formStatus.textContent = "Message sent successfully. Thanks for reaching out!";
      formStatus.classList.add("success");
    });
  }
});
