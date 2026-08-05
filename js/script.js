// Wedding RSVP submission

(() => {
  const form = document.getElementById("rsvp-form");
  const submitButton = form.querySelector(".submit");
  const successPopup = document.getElementById("successPopup");
  const closePopupButton = document.getElementById("closePopup");

  // We will replace this with your Google Apps Script URL later.
  const FORMS_ENDPOINT = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

  function validate(formData) {
    const name = formData.get("fullName")?.trim();
    const contact = formData.get("contact")?.trim();
    const total = Number(formData.get("total"));
    const attendance = formData.get("attendance");

    if (!name) {
      return "Please enter your full name.";
    }

    if (!contact) {
      return "Please enter your contact number.";
    }

    if (!total || total < 1) {
      return "Please enter the total number of attendees.";
    }

    if (!attendance) {
      return "Please confirm whether you will attend.";
    }

    return "";
  }

  function showSuccessPopup() {
    successPopup.hidden = false;
    closePopupButton.focus();
  }

  function closeSuccessPopup() {
    successPopup.hidden = true;
    submitButton.focus();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const validationError = validate(formData);

    if (validationError) {
      alert(validationError);
      return;
    }

    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      await fetch(FORMS_ENDPOINT, {
        method: "POST",
        body: formData,
        mode: "no-cors"
      });

      // Clear the form only after sending.
      form.reset();
      document.getElementById("total").value = "1";

      showSuccessPopup();
    } catch (error) {
      console.error("RSVP submission error:", error);

      alert(
        "Sorry, we could not submit your RSVP. " +
        "Please check your internet connection and try again."
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

  closePopupButton.addEventListener("click", closeSuccessPopup);

  // Close the popup when clicking the dark background.
  successPopup.addEventListener("click", (event) => {
    if (event.target === successPopup) {
      closeSuccessPopup();
    }
  });

  // Close the popup by pressing Escape.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !successPopup.hidden) {
      closeSuccessPopup();
    }
  });
})();
