document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeOptions = document.querySelectorAll("[data-theme-option]");
  const navPanel = document.querySelector(".nav-panel");
  const siteHeader = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const revealItems = document.querySelectorAll(".reveal");
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const themeStorageKey = "theme-preference";
  const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
  const getSavedThemePreference = () => localStorage.getItem(themeStorageKey) || "system";
  const getResolvedTheme = (preference) =>
    preference === "system" ? (themeMedia.matches ? "dark" : "light") : preference;
  const applyTheme = (preference) => {
    const resolvedTheme = getResolvedTheme(preference);
    root.dataset.themePreference = preference;
    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
  };
  const syncThemeSwitcher = () => {
    const activePreference = root.dataset.themePreference || getSavedThemePreference();
    themeOptions.forEach((option) => {
      const isActive = option.dataset.themeOption === activePreference;
      option.setAttribute("aria-pressed", String(isActive));
    });
  };

  applyTheme(getSavedThemePreference());
  syncThemeSwitcher();

  themeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const preference = option.dataset.themeOption;
      localStorage.setItem(themeStorageKey, preference);
      applyTheme(preference);
      syncThemeSwitcher();
    });
  });

  const onSystemThemeChange = () => {
    if (getSavedThemePreference() === "system") {
      applyTheme("system");
      syncThemeSwitcher();
    }
  };

  if (typeof themeMedia.addEventListener === "function") {
    themeMedia.addEventListener("change", onSystemThemeChange);
  } else if (typeof themeMedia.addListener === "function") {
    themeMedia.addListener(onSystemThemeChange);
  }

  if (navPanel) {
    navPanel.setAttribute("aria-hidden", "false");
  }

  const updateActiveLink = () => {
    const isMobileNav = window.innerWidth <= 820;
    const headerOffset = isMobileNav
      ? Math.max(window.innerHeight * 0.3, 180)
      : siteHeader
        ? siteHeader.offsetHeight + 48
        : 140;
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
    updateActiveLink();
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
    field.setAttribute("aria-invalid", "true");
    errorMessage.textContent = message;
  };

  const clearError = (field) => {
    const formGroup = field.closest(".form-group");
    const errorMessage = formGroup.querySelector(".error-message");

    formGroup.classList.remove("error");
    field.setAttribute("aria-invalid", "false");
    errorMessage.textContent = "";
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  if (contactForm && formStatus) {
    const fields = [...contactForm.querySelectorAll("input, textarea")];

    fields.forEach((field) => {
      field.setAttribute("aria-invalid", "false");
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
