export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const googleAppsScriptURL =
      "https://script.google.com/macros/s/AKfycbzTHIaRYgbiGs2xbabNfNJdeBh3sB9PZUj2mretM8KOB8POkigpuvFi1N4mf7vY9XIdlQ/exec";

    const googleRes = await fetch(googleAppsScriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await googleRes.text();
    console.log("Google Script Response:", text);

    if (text.toLowerCase().includes("success")) {
      res.status(200).json({ status: "success" });
    } else {
      res.status(500).json({ status: "failed", details: text });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy error", message: error.message });
  }
}
