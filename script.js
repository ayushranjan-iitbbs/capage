const countUp = (el, target, suffix = "", speed = 25) => {
  let count = 0;
  const update = () => {
    if (count < target) {
      count += Math.ceil((target - count) / speed);
      el.textContent = `${count}${suffix}`;
      requestAnimationFrame(update);
    } else {
      el.textContent = `${target}${suffix}`;
    }
  };
  update();
};

const animateDecimal = (el, start, end, step, delay = 300) => {
  let current = start;
  const interval = setInterval(() => {
    el.textContent = current.toFixed(1);
    current += step;
    if (current >= end) {
      el.textContent = end.toFixed(1);
      clearInterval(interval);
    }
  }, delay);
};

window.addEventListener("load", () => {
  countUp(document.getElementById("studentsCount"), 1200, "+");
  animateDecimal(document.getElementById("editionCount"), 1.0, 2.0, 0.5);
  countUp(document.getElementById("impressionsCount"), 55000, "+");
});

const cloudName = "dbgbaazbz";
const uploadPreset = "cv_upload";
const scriptURL = "https://script.google.com/macros/s/AKfycbzTHIaRYgbiGs2xbabNfNJdeBh3sB9PZUj2mretM8KOB8POkigpuvFi1N4mf7vY9XIdlQ/exec";

document.getElementById("caForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const fileInput = document.getElementById("cvUpload");
  const file = fileInput.files[0];
  const statusEl = document.getElementById("uploadStatus");

  if (!file || file.size > 5 * 1024 * 1024) {
    statusEl.textContent = "❌ Please upload a file less than 5MB.";
    return;
  }

  statusEl.textContent = "⏳ Uploading CV..";

  const cloudForm = new FormData();
  cloudForm.append("file", file);
  cloudForm.append("upload_preset", uploadPreset);

  try {
    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: cloudForm,
    });

    const cloudData = await cloudRes.json();
    if (!cloudData.secure_url) throw new Error("No secure URL returned");

    const cvUrl = cloudData.secure_url;

    statusEl.textContent = "⏳ Submitting form to Google Sheets...";

    const payload = new URLSearchParams({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      university: formData.get("university"),
      year: formData.get("year"),
      cvUrl,
    });

    const sheetRes = await fetch(scriptURL, {
      method: "POST",
      body: payload,
    });

    const sheetText = await sheetRes.text();
    console.log("Google Sheet Response:", sheetText);

    if (sheetText.toLowerCase().includes("success")) {
      statusEl.textContent = "✅ Form submitted successfully!";
      form.reset();
    } else {
      statusEl.textContent = "❌ Submission failed: " + sheetText;
    }
  } catch (error) {
    console.error(error);
    statusEl.textContent = "❌ Error occurred. Try again!";
  }
});
