import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Request failed (${response.status}): ${response.statusText || "Unexpected server response"}`);
  }
  return response.json();
}

function App() {
  const [page, setPage] = useState("main");
  const [issueId, setIssueId] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate(event) {
    event.preventDefault();
    if (loading) return;
    setStatus("");
    setPlan("");
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId })
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.error || "Unable to generate test plan.");
      setPlan(data.plan);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      {page === "main" ? (
        <>
          <h1>Test Plan Generator Window</h1>
          <div className="preview">
            {loading ? <p className="state">Loading…</p> :
              plan ? <pre>{plan}</pre> :
              status ? <p className="error">{status}</p> :
              <p className="placeholder">Preview</p>}
          </div>
          <form className="submit-row" onSubmit={generate}>
            <label htmlFor="issue">JIRA ID</label>
            <input
              id="issue"
              value={issueId}
              onChange={(event) => setIssueId(event.target.value)}
              placeholder="QA-123"
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Loading…" : "Submit"}
            </button>
          </form>
        </>
      ) : (
        <Settings />
      )}
      <button className="setting-button" onClick={() => setPage(page === "main" ? "settings" : "main")}>
        {page === "main" ? "Setting" : "Main"}
      </button>
    </main>
  );
}

function Settings() {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState("");

  async function testConnection(service) {
    setTesting(service);
    setResults((previous) => ({ ...previous, [service]: "" }));
    try {
      const response = await fetch(`/api/settings/test/${service}`);
      const data = await readJsonResponse(response);
      setResults((previous) => ({
        ...previous,
        [service]: response.ok ? data.message : `Error: ${data.error}`
      }));
    } catch {
      setResults((previous) => ({ ...previous, [service]: "Error: connection unavailable." }));
    } finally {
      setTesting("");
    }
  }

  return (
    <>
      <h1>Settings</h1>
      <section className="settings-card">
        <h2>JIRA Connect Test Center</h2>
        <button onClick={() => testConnection("jira")} disabled={testing === "jira"}>
          {testing === "jira" ? "Testing…" : "Test Jira"}
        </button>
        {results.jira && <p>{results.jira}</p>}
      </section>
      <section className="settings-card">
        <h2>Groq.com Test Center</h2>
        <button onClick={() => testConnection("groq")} disabled={testing === "groq"}>
          {testing === "groq" ? "Testing…" : "Test Groq"}
        </button>
        {results.groq && <p>{results.groq}</p>}
      </section>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
