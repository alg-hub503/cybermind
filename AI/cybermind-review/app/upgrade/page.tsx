"use client";

import { useState } from "react";

export default function UpgradePage() {
const [loading, setLoading] = useState(false);

const handleUpgrade = async () => {
try {
setLoading(true);

  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    console.error("No checkout URL returned");
  }
} catch (error) {
  console.error(error);
} finally {
  setLoading(false);
}

};

return (
<div style={{ padding: 40 }}>
<h1>Upgrade To PRO</h1>

  <p>Unlock full SaaS features</p>

  <button onClick={handleUpgrade} disabled={loading}>
    {loading ? "Loading..." : "Upgrade Now"}
  </button>
</div>

);
}