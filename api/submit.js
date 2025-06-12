export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const googleAppsScriptURL =
      "https://script.google.com/macros/s/AKfycbzTHIaRYgbiGs2xbabNfNJdeBh3sB9PZUj2mretM8KOB8POkigpuvFi1N4mf7vY9XIdlQ/exec";

    const body = req.body;

    // Convert JSON to URL-encoded form
    const params = new URLSearchParams();
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        params.append(key, body[key]);
      }
    }

    const googleRes = await fetch(googleAppsScriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const text = await googleRes.text();
    if (text.toLowerCase().includes("success")) {
      return res.status(200).json({ status: "success" });
    } else {
      return res.status(500).json({ status: "failed", details: text });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: "Proxy error", message: error.message });
  }
}
