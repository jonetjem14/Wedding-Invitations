const RSVP_ENDPOINT = "";

const form = document.getElementById("rsvpForm");
const formContent = document.getElementById("formContent");
const successMessage = document.getElementById("successMessage");
const attendeeField = document.getElementById("attendeeField");
const attendeesInput = document.getElementById("attendees");

const fields = {
  name: document.getElementById("name"),
  contact: document.getElementById("contact"),
  attendees: attendeesInput
};

function showError(fieldName, message) {
  const field = fields[fieldName];
  const error = document.getElementById(`${fieldName}Error`);
  if (field) field.classList.toggle("invalid", Boolean(message));
  if (error) error.textContent = message;
}

function validateForm() {
  let valid = true;
  const name = fields.name.value.trim();
  const contact = fields.contact.value.trim();
  const attendance = form.querySelector('input[name="attendance"]:checked');

  showError("name", "");
  showError("contact", "");
  showError("attendees", "");
  document.getElementById("attendanceError").textContent = "";

  if (name.length < 2) {
    showError("name", "Please enter your full name.");
    valid = false;
  }

  if (!/^[+\d][\d\s()-]{7,19}$/.test(contact)) {
    showError("contact", "Please enter a valid contact number.");
    valid = false;
  }

  if (!attendance) {
    document.getElementById("attendanceError").textContent = "Please confirm whether you can attend.";
    valid = false;
  }

  if (attendance?.value === "Attending") {
    const total = Number(fields.attendees.value);
    if (!Number.isInteger(total) || total < 1 || total > 10) {
      showError("attendees", "Please enter a number from 1 to 10.");
      valid = false;
    }
  }

  return valid;
}

form.addEventListener("change", (event) => {
  if (event.target.name === "attendance") {
    const attending = event.target.value === "Attending";
    attendeeField.hidden = !attending;
    attendeesInput.required = attending;
    if (!attending) attendeesInput.value = "0";
    if (attending && Number(attendeesInput.value) < 1) attendeesInput.value = "1";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  const submitButton = form.querySelector("button[type='submit']");
  const attendance = form.querySelector('input[name="attendance"]:checked').value;
  const response = {
    name: fields.name.value.trim(),
    contact: fields.contact.value.trim(),
    attendees: attendance === "Attending" ? Number(fields.attendees.value) : 0,
    attendance,
    submittedAt: new Date().toISOString()
  };

  submitButton.disabled = true;
  submitButton.firstElementChild.textContent = "Sending...";

  try {
    if (RSVP_ENDPOINT) {
      await fetch(RSVP_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(response)
      });
    } else {
      localStorage.setItem("joseFyneeRsvp", JSON.stringify(response));
    }

    document.getElementById("guestName").textContent = response.name.split(" ")[0];
    document.getElementById("successText").textContent = attendance === "Attending"
      ? `We are delighted to celebrate with you and your party of ${response.attendees}. See you on our special day!`
      : "We understand and appreciate you letting us know. You will be in our hearts on our special day.";
    formContent.hidden = true;
    successMessage.hidden = false;
    successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    alert("We could not send your RSVP. Please check your connection and try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.firstElementChild.textContent = "Send My RSVP";
  }
});

document.getElementById("editResponse").addEventListener("click", () => {
  successMessage.hidden = true;
  formContent.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});
