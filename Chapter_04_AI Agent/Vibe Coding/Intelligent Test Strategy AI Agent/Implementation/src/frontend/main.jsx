import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [screen, setScreen] = useState("strategy");
  const [key, setKey] = useState("");
  const [strategy, setStrategy] = useState(null);
  const [warning, setWarning] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setWarning("");
    setStrategy(null);
    try {
      const ticketResponse = await fetch(`/api/jira/${encodeURIComponent(key.trim().toUpperCase())}`);
      const ticket = await ticketResponse.json();
      if (!ticketResponse.ok) throw new Error(ticket.error || "Could not retrieve this Jira ticket.");
      setWarning(ticket.warnings?.[0] || "");
      const strategyResponse = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket })
      });
      const generated = await strategyResponse.json();
      if (!strategyResponse.ok) throw new Error(generated.error || "Could not generate the strategy.");
      setStrategy(generated);
    } catch (requestError) {
      setError(requestError.message || "The request failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf() {
    if (!strategy || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/strategy/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Could not create the PDF.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${strategy.ticket.key}-test-strategy.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message || "PDF download failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("strategy")} aria-label="Go to Test Strategy">
          <span className="brand-mark">QA</span>
          <span>
            <span className="eyebrow">JIRA WORKSPACE</span>
            <span className="brand-title">Test Strategy</span>
          </span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={screen === "strategy" ? "nav-link active" : "nav-link"} onClick={() => setScreen("strategy")} aria-current={screen === "strategy" ? "page" : undefined}>
            Strategy
          </button>
          <button className={screen === "connections" ? "nav-link active" : "nav-link"} onClick={() => setScreen("connections")} aria-current={screen === "connections" ? "page" : undefined}>
            Settings
          </button>
        </nav>
      </header>
      {screen === "strategy" ? (
        <>
          <section className="hero">
            <p className="eyebrow">STRATEGY BUILDER</p>
            <h2>Turn a Jira ticket into a test strategy.</h2>
            <p className="subhead">A structured, review-ready draft based on ticket details and team defaults.</p>
            <form className="ticket-form" onSubmit={submit}>
              <label htmlFor="ticket-key">Jira ticket key</label>
              <div className="input-row">
                <input id="ticket-key" value={key} onChange={(event) => setKey(event.target.value)} placeholder="e.g. SHOP-123" disabled={busy} />
                <button type="submit" disabled={busy || !key.trim()}>{busy ? "Working…" : "Fetch & Generate"}</button>
              </div>
            </form>
            {error && <div className="alert" role="alert">{error}</div>}
            {warning && <div className="warning" role="status">{warning}</div>}
          </section>

          <section className="preview-section">
            <div className="preview-heading">
              <div>
                <p className="eyebrow">DOCUMENT PREVIEW</p>
                <h2>{strategy ? strategy.header.title : "Your strategy will appear here"}</h2>
              </div>
              <button className="secondary-button" onClick={downloadPdf} disabled={!strategy || busy}>Download PDF</button>
            </div>
            {strategy ? (
              <article className="document">
                <div className="document-meta">
                  <Meta label="Version" value={strategy.header.version} />
                  <Meta label="Date" value={strategy.header.date} />
                  <Meta label="Author" value={strategy.header.author} />
                  <Meta label="Reviewers" value={strategy.header.reviewers.join(", ")} />
                  <Meta label="Related documents" value={strategy.header.relatedDocuments.join("; ") || "To be confirmed"} />
                </div>
                {strategy.sections.map((section) => <Section key={section.title} section={section} />)}
                <p className="draft-note">Draft for review · Confirm assumptions and team defaults before approval.</p>
              </article>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">↗</div>
                <p>Enter a ticket key above to build a traceable strategy.</p>
                <span>Unknown project details are marked “To be confirmed.”</span>
              </div>
            )}
          </section>
          <footer>Generated from Jira source data and configurable team defaults.</footer>
        </>
      ) : (
        <Connections onBack={() => setScreen("strategy")} />
      )}
    </main>
  );
}

function Connections({ onBack }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState("");
  const [messages, setMessages] = useState({});

  useEffect(() => {
    let active = true;
    fetch("/api/connections")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load connections.");
        if (active) setStatus(data);
      })
      .catch((requestError) => {
        if (active) setMessages({ error: requestError.message });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function testConnection(service) {
    setTesting(service);
    setMessages((previous) => ({ ...previous, [service]: "" }));
    try {
      const response = await fetch(`/api/connections/${service}/test`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `${service} connection test failed.`);
      setMessages((previous) => ({ ...previous, [service]: data.message }));
    } catch (requestError) {
      setMessages((previous) => ({ ...previous, [service]: requestError.message || `${service} connection test failed.` }));
    } finally {
      setTesting("");
    }
  }

  return (
    <section className="connections-page">
      <button className="back-link" onClick={onBack}>← Back to Strategy</button>
      <p className="eyebrow">SETTINGS</p>
      <h2>Connections</h2>
      <p className="subhead">Test your Jira and Groq connections.</p>
      {messages.error && <div className="alert" role="alert">{messages.error}</div>}
      <div className="connection-grid">
        <section className="connection-card">
          <div className="connection-icon">J</div>
          <h3>JIRA Connect Test Center</h3>
          <p>Verify the server-side Jira credentials and access.</p>
          <span className={status?.jira?.configured ? "status-pill connected" : "status-pill"}>
            {loading ? "Checking…" : status?.jira?.configured ? "Configured" : "Not configured"}
          </span>
          <button className="secondary-button test-connection" onClick={() => testConnection("jira")} disabled={loading || testing !== "" || !status?.jira?.configured}>
            {testing === "jira" ? "Testing…" : "Test Jira"}
          </button>
          {messages.jira && <p className={messages.jira.includes("successful") ? "connection-success" : "connection-error"} role="status">{messages.jira}</p>}
        </section>
        <section className="connection-card">
          <div className="connection-icon groq-icon">G</div>
          <h3>Groq.com Test Center</h3>
          <p>Verify the server-side Groq API key and service access.</p>
          <span className={status?.groq?.configured ? "status-pill connected" : "status-pill"}>
            {loading ? "Checking…" : status?.groq?.configured ? "Configured" : "Not configured"}
          </span>
          <button className="secondary-button test-connection" onClick={() => testConnection("groq")} disabled={loading || testing !== "" || !status?.groq?.configured}>
            {testing === "groq" ? "Testing…" : "Test Groq"}
          </button>
          {messages.groq && <p className={messages.groq.includes("successful") ? "connection-success" : "connection-error"} role="status">{messages.groq}</p>}
        </section>
      </div>
      <button className="primary-back" onClick={onBack}>Back to main screen</button>
    </section>
  );
}

function Meta({ label, value }) {
  return <div><span>{label}</span><strong>{value || "To be confirmed"}</strong></div>;
}

function Section({ section }) {
  return (
    <section className="doc-section">
      <h3>{section.title}</h3>
      {section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      {section.bullets && <ul>{section.bullets.map((item, index) => <li key={index}>{item}</li>)}</ul>}
      {section.table && <DataTable table={section.table} />}
      {section.subsections?.map((subsection) => (
        <div key={subsection.title} className="subsection">
          <h4>{subsection.title}</h4>
          <ul>{subsection.bullets.map((item, index) => <li key={index}>{item}</li>)}</ul>
        </div>
      ))}
    </section>
  );
}

function DataTable({ table }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{table.headers.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead>
        <tbody>{table.rows.map((row, rowIndex) => (
          <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
