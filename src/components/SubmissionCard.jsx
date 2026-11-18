// SubmissionCard.jsx
import { useState } from "react";

export default function SubmissionCard({ sub }) {
  // sub = { name, category, code, status, verifyToken? }  (verifyToken saved in localStorage at submit time)
  const [status, setStatus] = useState(sub.status);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setLoading(true); setMsg("");
    const res = await fetch(`/api/submissions/${sub.code}/verify`, {
      method: "POST", credentials: "include",
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setStatus("verified");
    else setMsg(data.error);
  };

  return (
    <div className="card">
      <h3>{sub.name}</h3>
      <p>{sub.category} · Code {sub.code}</p>

      {status === "pending" && (
        <>
          <p>To prove you own this group, paste this into your group <b>description</b>:</p>
          <code>{sub.verifyToken}</code>
          <button onClick={() => navigator.clipboard.writeText(sub.verifyToken)}>Copy</button>
          <button onClick={verify} disabled={loading}>
            {loading ? "Checking..." : "Verify ownership"}
          </button>
          {msg && <p style={{ color: "crimson" }}>{msg}</p>}
        </>
      )}

      {status === "verified" && <p>✅ Ownership verified. Waiting for admin approval.</p>}

      {status === "approved" && (
        <a className="join-btn" href={`/go/${sub.code}`} target="_blank" rel="noopener noreferrer nofollow">
          Join Group
        </a>
      )}
    </div>
  );
