(() => {
  const contactForm = document.querySelector("[data-contact-form]");
  if (!contactForm) return;

  const status = contactForm.querySelector("[data-form-status]");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  let isSubmitting = false;

  const setStatus = (message, type = "") => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status${type ? ` is-${type}` : ""}`;
  };

  const setFieldError = (field, message) => {
    const error = contactForm.querySelector(
      `[data-error-for="${field.name}"]`,
    );
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (error) error.textContent = message;
  };

  const validateField = (field) => {
    const value = field.value.trim();
    let message = "";

    if (field.required && !value) {
      message = "Please complete this field.";
    } else if (
      field.type === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      message = "Enter a valid work email.";
    }

    setFieldError(field, message);
    return !message;
  };

  const fields = [
    ...contactForm.querySelectorAll(
      "input:not([name='_gotcha']), select, textarea",
    ),
  ];

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!fields.map(validateField).every(Boolean)) {
      setStatus("Please review the highlighted fields.", "error");
      contactForm.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    if (contactForm.elements._gotcha?.value) return;

    const endpoint = contactForm.dataset.formEndpoint;
    const demoMode = !endpoint || endpoint.includes("REPLACE_WITH_FORM_ID");
    isSubmitting = true;
    contactForm.classList.add("is-submitting");
    submitButton?.setAttribute("disabled", "");
    setStatus("Sending your enquiry...");

    try {
      if (demoMode) {
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        setStatus(
          "Local test successful. No message was sent. Add the company Formspree ID before launch.",
          "success",
        );
      } else {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });

        if (response.status === 429) throw new Error("rate-limit");
        if (!response.ok) throw new Error("submission");

        contactForm.reset();
        setStatus(
          "Thank you. Your enquiry has been sent to Zeeman Culture.",
          "success",
        );
      }
    } catch (error) {
      setStatus(
        error.message === "rate-limit"
          ? "Too many attempts. Please wait and try again, or email us directly."
          : "The form could not be sent. Please try again or email us directly.",
        "error",
      );
    } finally {
      isSubmitting = false;
      contactForm.classList.remove("is-submitting");
      submitButton?.removeAttribute("disabled");
    }
  });
})();
