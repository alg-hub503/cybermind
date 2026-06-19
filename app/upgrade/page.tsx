"use client";

export default function UpgradePage() {
  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("API returned invalid JSON:", text);
        alert("Server error");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("No checkout URL returned");
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Upgrade To PRO</h1>

      <p>Unlock full SaaS features</p>

      <button
        onClick={handleUpgrade}
        style={{
          marginTop: 20,
          padding: 12,
          background: "black",
          color: "white",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Upgrade To PRO
      </button>
    </div>
  );
}