import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [page, setPage] = useState("main");
  const [issueId, setIssueId] = useState("");
  const [sharedTicket, setSharedTicket] = useState(null);
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleParentMessage(event) {
      if (event.source !== window.parent) return;
      if (event.data?.type === "toggle-settings") setPage((current) => current === "settings" ? "main" : "settings");
      if (event.data?.type === "shared-ticket" && event.data.ticket?.key) {
        setIssueId(event.data.ticket.key);
        setSharedTicket(event.data.ticket);
      }
    }
    window.addEventListener("message", handleParentMessage);
    return () => window.removeEventListener("message", handleParentMessage);
  }, []);

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
        body: JSON.stringify({ issueId, ticket: sharedTicket?.key === issueId.trim().toUpperCase() ? sharedTicket : undefined })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to generate test plan.");
      setPlan(data.plan);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPlan() {
    if (!plan || loading) return;
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/plan/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, issueId })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to download the test plan.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `${issueId.trim().toUpperCase() || "test-plan"}-test-plan.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setStatus(error.message || "Unable to download the test plan.");
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
          {plan && <button className="download-button" onClick={downloadPlan} disabled={loading}>{loading ? "Preparing…" : "Download PDF"}</button>}
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
              {loading ? "Loading…" : sharedTicket?.key === issueId.trim().toUpperCase() ? "Generate from shared ticket" : "Submit"}
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
      const data = await response.json();
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

const root = createRoot(document.getElementById("root"));
root.render(<App />);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
