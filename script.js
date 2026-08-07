// Wedding RSVP submission

(() => {
  const form = document.getElementById("rsvp-form");
  const submitButton = form.querySelector(".submit");

  const attendance = document.getElementById("attendance");
  const guestDetails = document.getElementById("guestDetails");
  const total = document.getElementById("total");

  const additionalGuestsWrapper =
    document.getElementById("additionalGuestsWrapper");

  const guestNames = document.getElementById("guestNames");

  const successPopup = document.getElementById("successPopup");
  const popupTitle = document.getElementById("popupTitle");
  const popupMessage = document.getElementById("popupMessage");
  const closePopupButton = document.getElementById("closePopup");

  const FORMS_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbyI_eiOM_N6L37-n38PARl2dYDWJF3Jp67Za_WvMsAxSw0syMPhc_M2S-AEi8J8_oxJ7w/exec";


  // ------------------------------------------------
  // Show or hide guest questions
  // ------------------------------------------------

  function updateAttendanceFields() {

    if (attendance.value === "accept") {

      guestDetails.hidden = false;
      total.required = true;

      updateGuestNameField();

    } else {

      guestDetails.hidden = true;

      total.required = false;
      total.value = "1";

      additionalGuestsWrapper.hidden = true;

      guestNames.required = false;
      guestNames.value = "";
    }
  }


  // ------------------------------------------------
  // Show additional guest name field
  // ------------------------------------------------

  function updateGuestNameField() {

    const selectedTotal = total.value;

    if (
      selectedTotal === "2" ||
      selectedTotal === "3" ||
      selectedTotal === "4" ||
      selectedTotal === "5+"
    ) {

      additionalGuestsWrapper.hidden = false;
      guestNames.required = true;

    } else {

      additionalGuestsWrapper.hidden = true;
      guestNames.required = false;
      guestNames.value = "";
    }
  }


  attendance.addEventListener("change", updateAttendanceFields);
  total.addEventListener("change", updateGuestNameField);


  // ------------------------------------------------
  // Form validation
  // ------------------------------------------------

  function validate(formData) {

    const name = formData.get("fullName")?.trim();
    const contact = formData.get("contact")?.trim();
    const attendanceValue = formData.get("attendance");

    if (!name) {
      return "Please enter your full name.";
    }

    if (!contact) {
      return "Please enter your contact number.";
    }

    if (!attendanceValue) {
      return "Please let us know if you will be joining us.";
    }


    // Only validate guest information if attending
    if (attendanceValue === "accept") {

      const totalValue = formData.get("total");

      if (!totalValue) {
        return "Please select the total number of attendees.";
      }


      // Additional guest names required for 2+
      if (totalValue !== "1") {

        const additionalGuestNames =
          formData.get("guestNames")?.trim();

        if (!additionalGuestNames) {
          return "Please enter the name(s) of your additional guest(s).";
        }
      }
    }

    return "";
  }


  // ------------------------------------------------
  // Success popup
  // ------------------------------------------------

  function showSuccessPopup(attendanceValue) {

    if (attendanceValue === "accept") {

      popupTitle.textContent = "RSVP Received! ♥";

      popupMessage.textContent =
        "Thank you! We’re so happy you’ll be celebrating with us. We can’t wait to see you!";

    } else {

      popupTitle.textContent = "Thank You! ♥";

      popupMessage.textContent =
        "Thank you for letting us know. We’ll miss celebrating with you and truly appreciate your love and well wishes.";
    }

    successPopup.hidden = false;
    closePopupButton.focus();
  }


  function closeSuccessPopup() {

    successPopup.hidden = true;
    submitButton.focus();
  }


  // ------------------------------------------------
  // Submit RSVP
  // ------------------------------------------------

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const formData = new FormData(form);
    const validationError = validate(formData);

    if (validationError) {

      alert(validationError);
      return;
    }


    // Save attendance before resetting form
    const attendanceValue = formData.get("attendance");

    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";


    try {

      await fetch(FORMS_ENDPOINT, {
        method: "POST",
        body: formData,
        mode: "no-cors"
      });


      // Reset form after sending
      form.reset();

      guestDetails.hidden = true;
      additionalGuestsWrapper.hidden = true;

      total.value = "1";
      total.required = false;

      guestNames.required = false;


      // Show personalized popup
      showSuccessPopup(attendanceValue);


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


  // ------------------------------------------------
  // Close popup
  // ------------------------------------------------

  closePopupButton.addEventListener(
    "click",
    closeSuccessPopup
  );


  // Close when clicking dark background
  successPopup.addEventListener("click", (event) => {

    if (event.target === successPopup) {
      closeSuccessPopup();
    }
  });


  // Close using Escape key
  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      !successPopup.hidden
    ) {

      closeSuccessPopup();
    }
  });


  // Set correct initial state
  updateAttendanceFields();

})();
