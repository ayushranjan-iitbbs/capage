// Count animations
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

// Special decimal increment animation
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

// Cloudinary + Google Sheet integration
const cloudName = "dbgbaazbz";
const uploadPreset = "cv_upload";
const scriptURL = "https://script.google.com/macros/s/AKfycbzTHIaRYgbiGs2xbabNfNJdeBh3sB9PZUj2mretM8KOB8POkigpuvFi1N4mf7vY9XIdlQ/exec";

document.getElementById("caForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const fileInput = document.getElementById("cvUpload");
  const file = fileInput.files[0];

  if (!file || file.size > 5 * 1024 * 1024) {
    document.getElementById("uploadStatus").textContent =
      "❌ File required or must be less than 5MB";
    return;
  }

  const cloudForm = new FormData();
  cloudForm.append("file", file);
  cloudForm.append("upload_preset", uploadPreset);

  try {
    // Upload to Cloudinary
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: cloudForm,
    });
    const data = await res.json();
    const cvUrl = data.secure_url;

    // Submit to Google Sheets
    const payload = new URLSearchParams({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      university: formData.get("university"),
      year: formData.get("year"),
      cvUrl: cvUrl,
    });

    const sheetRes = await fetch(scriptURL, {
      method: "POST",
      body: payload,
    });

    const resultText = await sheetRes.text();
    if (resultText.includes("success")) {
      document.getElementById("uploadStatus").textContent =
        "✅ Form submitted successfully!";
      form.reset();
    } else {
      document.getElementById("uploadStatus").textContent =
        "❌ Submission failed.";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("uploadStatus").textContent =
      "❌ Upload or submission failed. Please try again!";
  }
});
