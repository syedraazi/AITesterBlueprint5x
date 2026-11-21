import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const headers = [
  "Test Case ID",
  "Test Case detail",
  "Positive or Negative Test case",
  "Test case steps",
  "Actual Result",
  "Expected Result",
  "Pass/Fail Column",
  "Comments Column"
];
const statusOptions = ["", "Pass", "Fail", "Blocked", "Not Run"];

function App() {
  const [screen, setScreen] = useState("generator");
  const [ticketKey, setTicketKey] = useState("");
  const [ticket, setTicket] = useState(null);
  const [cases, setCases] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function generate(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setWarnings([]);
    setProgress("Fetching Jira ticket…");
    setCases([]);
    setTicket(null);
    try {
      const key = ticketKey.trim().toUpperCase();
      const issueResponse = await fetch(`/api/jira/${encodeURIComponent(key)}`);
      const issue = await issueResponse.json();
      if (!issueResponse.ok) throw new Error(issue.error || "Could not retrieve this Jira issue.");
      setTicket(issue);
      setWarnings(issue.warnings || []);
      setProgress("Generating test cases with Groq…");
      const generationResponse = await fetch("/api/test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: issue })
      });
      const generated = await generationResponse.json();
      if (!generationResponse.ok) throw new Error(generated.error || "Could not generate test cases.");
      setCases(generated.cases);
      setWarnings([...new Set([...(issue.warnings || []), ...(generated.warnings || [])])]);
      setProgress("");
    } catch (requestError) {
      setProgress("");
      setError(requestError.message || "The request failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function updateCase(id, field, value) {
    setCases((current) => current.map((testCase) =>
      testCase["Test Case ID"] === id ? { ...testCase, [field]: value } : testCase
    ));
  }

  async function downloadExcel() {
    if (!ticket || !cases.length || busy) return;
    setBusy(true);
    setError("");
    setProgress("Preparing the Excel workbook…");
    try {
      const exportResponse = await fetch("/api/test-cases/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket, cases })
      });
      const exported = await exportResponse.json();
      if (!exportResponse.ok) throw new Error(exported.error || "Could not prepare the workbook.");
      const fileResponse = await fetch(`/api/download/${encodeURIComponent(exported.id)}`);
      if (!fileResponse.ok) {
        const data = await fileResponse.json();
        throw new Error(data.error || "The workbook download failed.");
      }
      const url = URL.createObjectURL(await fileResponse.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = exported.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setProgress("");
    } catch (requestError) {
      setProgress("");
      setError(requestError.message || "The workbook download failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-title">TEST CASE GENERATOR</div>
        <button className="settings-button" onClick={() => setScreen(screen === "settings" ? "generator" : "settings")} aria-label={screen === "settings" ? "Return to test case generator" : "Open Settings"}>
          ⚙
        </button>
      </header>
      {screen === "settings" ? (
        <Connections onBack={() => setScreen("generator")} />
      ) : (
        <>
          <section className="preview-panel" aria-live="polite">
            {cases.length ? (
              <>
                <div className="preview-title">
                  <strong>{ticket.key} — {ticket.summary}</strong>
                  <span>{cases.length} editable cases</span>
                </div>
                {warnings.map((warning, index) => <p className="warning" key={index}>{warning}</p>)}
                <EditableTable cases={cases} onChange={updateCase} />
              </>
            ) : busy ? (
              <div className="empty-message" role="status">{progress || "Working…"}</div>
            ) : error ? (
              <div className="error-message" role="alert">{error}</div>
            ) : (
              <div className="empty-message">Enter a Jira ticket key to preview generated test cases.</div>
            )}
          </section>
          <form className="ticket-controls" onSubmit={generate}>
            <label htmlFor="ticket-key">JIRA TICKET</label>
            <input id="ticket-key" value={ticketKey} onChange={(event) => setTicketKey(event.target.value)} placeholder="e.g. VWO-123" disabled={busy} />
            <button type="submit" disabled={busy || !ticketKey.trim()}>{busy ? "Working…" : "Fetch & Generate"}</button>
            <button type="button" className="download-button" onClick={downloadExcel} disabled={!cases.length || busy} aria-label="Download Excel">
              {busy && progress.startsWith("Preparing") ? "…" : "↓"}
            </button>
          </form>
          {error && cases.length > 0 && <p className="error-message" role="alert">{error}</p>}
          {cases.length > 0 && (
            <button className="download-label" onClick={downloadExcel} disabled={busy}>Download Excel</button>
          )}
        </>
      )}
    </main>
  );
}

function EditableTable({ cases, onChange }) {
  return (
    <div className="table-scroll">
      <table className="cases-table">
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>
          {cases.map((testCase) => (
            <tr key={testCase["Test Case ID"]}>
              {headers.map((header) => (
                <td key={header}>
                  {header === "Positive or Negative Test case" ? (
                    <select value={testCase[header]} onChange={(event) => onChange(testCase["Test Case ID"], header, event.target.value)}>
                      <option>Positive</option>
                      <option>Negative</option>
                    </select>
                  ) : header === "Pass/Fail Column" ? (
                    <select value={testCase[header]} onChange={(event) => onChange(testCase["Test Case ID"], header, event.target.value)}>
                      {statusOptions.map((option) => <option key={option} value={option}>{option || "Not set"}</option>)}
                    </select>
                  ) : header === "Test Case ID" ? (
                    <span className="case-id">{testCase[header]}</span>
                  ) : (
                    <textarea
                      value={testCase[header]}
                      rows={header === "Test case steps" || header === "Expected Result" ? 5 : 3}
                      aria-label={`${testCase["Test Case ID"]} ${header}`}
                      onChange={(event) => onChange(testCase["Test Case ID"], header, event.target.value)}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Connections({ onBack }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState("");
  const [results, setResults] = useState({});

  useEffect(() => {
    let active = true;
    fetch("/api/connections/status")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load connection status.");
        if (active) setStatus(data);
      })
      .catch((requestError) => {
        if (active) setResults({ error: requestError.message });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function testConnection(service) {
    setTesting(service);
    setResults((current) => ({ ...current, [service]: null }));
    try {
      const response = await fetch("/api/connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service })
      });
      const data = await response.json();
      const result = data[service];
      setResults((current) => ({ ...current, [service]: result || { ok: false, message: data.error || "Connection test failed." } }));
    } catch (requestError) {
      setResults((current) => ({ ...current, [service]: { ok: false, message: requestError.message || "Connection test failed." } }));
    } finally {
      setTesting("");
    }
  }

  return (
    <section className="connections-screen">
      <h1>Connections</h1>
      <ConnectionCard
        title="JIRA Connect Test Center"
        detail="Verify Jira Cloud credentials and access."
        configured={status?.jira?.configured}
        loading={loading}
        testing={testing === "jira"}
        disabled={testing !== "" || loading || !status?.jira?.configured}
        label="Test Jira"
        result={results.jira}
        onTest={() => testConnection("jira")}
      />
      <ConnectionCard
        title="Groq.com Test Center"
        detail={status?.groq?.model || "Verify the Groq API key and service access."}
        configured={status?.groq?.configured}
        loading={loading}
        testing={testing === "groq"}
        disabled={testing !== "" || loading || !status?.groq?.configured}
        label="Test Groq"
        result={results.groq}
        onTest={() => testConnection("groq")}
      />
      {results.error && <p className="error-message" role="alert">{results.error}</p>}
      <button className="back-button" onClick={onBack}>Back to Test Cases</button>
    </section>
  );
}

function ConnectionCard({ title, detail, configured, loading, testing, disabled, label, result, onTest }) {
  return (
    <section className="connection-card">
      <h2>{title}</h2>
      <p>{detail}</p>
      <span className={configured ? "connection-status connected" : "connection-status"}>
        {loading ? "Checking configuration…" : configured ? "Configured" : "Not configured"}
      </span>
      <button onClick={onTest} disabled={disabled}>{testing ? "Testing…" : label}</button>
      {result && <p className={result.ok ? "connection-result success" : "connection-result failure"} role="status">{result.message}</p>}
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
