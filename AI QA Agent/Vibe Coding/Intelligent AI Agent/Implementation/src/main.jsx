import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const agents = [
  {
    id: "strategy",
    label: "Test Strategy",
    description: "Define how the feature will be tested.",
    url: import.meta.env.VITE_STRATEGY_AGENT_URL || "http://127.0.0.1:5182"
  },
  {
    id: "plan",
    label: "Test Plan",
    description: "Plan coverage, risks, and execution.",
    url: import.meta.env.VITE_PLAN_AGENT_URL || "http://127.0.0.1:5181"
  },
  {
    id: "cases",
    label: "Test Cases",
    description: "Create and export editable test cases.",
    url: import.meta.env.VITE_CASES_AGENT_URL || "http://127.0.0.1:5183"
  }
];

function App() {
  const [active, setActive] = useState(() => {
    const saved = localStorage.getItem("test-planning-agent");
    return agents.some((agent) => agent.id === saved) ? saved : "strategy";
  });
  const [ticketKey, setTicketKey] = useState("");
  const [ticket, setTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const frames = useRef({});

  useEffect(() => {
    if (agents.some((agent) => agent.id === active)) localStorage.setItem("test-planning-agent", active);
  }, [active]);

  function toggleSettings() {
    const agent = agents.find((item) => item.id === active);
    frames.current[active]?.contentWindow?.postMessage(
      { type: "toggle-settings" },
      new URL(agent.url).origin
    );
  }

  function sendTicket(agent, value) {
    frames.current[agent.id]?.contentWindow?.postMessage(
      { type: "shared-ticket", ticket: value },
      new URL(agent.url).origin
    );
  }

  function prepareSharedTicket(issue) {
    let remainingPrdChars = 48000;
    const linkedSource = String(issue.linkedPrdText || "");
    const linkedPrdText = linkedSource.slice(0, remainingPrdChars);
    let prdTruncated = linkedSource.length > linkedPrdText.length;
    remainingPrdChars -= linkedPrdText.length;
    const attachments = (issue.attachments || []).slice(0, 5).map((attachment) => {
      const source = String(attachment.text || "");
      const text = source.slice(0, remainingPrdChars);
      prdTruncated ||= source.length > text.length;
      remainingPrdChars -= text.length;
      return { filename: String(attachment.filename || "attachment"), text };
    }).filter((attachment) => attachment.text);
    const warnings = [...(issue.warnings || [])];
    if (prdTruncated) warnings.push("Linked PRD content was shortened for sharing between agents.");
    return {
      key: issue.key,
      summary: issue.summary,
      description: issue.description,
      acceptanceCriteria: issue.acceptanceCriteria,
      issueType: issue.issueType,
      priority: issue.priority,
      status: issue.status,
      labels: issue.labels || [],
      components: issue.components || [],
      fixVersions: issue.fixVersions || [],
      assignee: issue.assignee,
      reporter: issue.reporter,
      linkedIssues: issue.linkedIssues || [],
      subTasks: issue.subTasks || [],
      parentEpic: issue.parentEpic,
      sourceUrl: issue.sourceUrl,
      requirements: issue.requirements || [],
      linkedPrdText,
      attachments,
      prdText: String(issue.prdText || "").slice(0, 40000),
      warnings
    };
  }

  async function fetchTicket(event) {
    event.preventDefault();
    const key = ticketKey.trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9]+-\d+$/.test(key) || loadingTicket) {
      setTicketError("Enter a Jira key such as SHOP-123.");
      return;
    }
    setLoadingTicket(true);
    setTicketError("");
    setTicket(null);
    try {
      const response = await fetch(`/api/jira/${encodeURIComponent(key)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not retrieve this Jira ticket.");
      const sharedTicket = prepareSharedTicket(data);
      setTicket(sharedTicket);
      setTicketKey(sharedTicket.key);
      agents.forEach((agent) => sendTicket(agent, sharedTicket));
    } catch (error) {
      setTicketError(error.message || "Could not retrieve this Jira ticket.");
    } finally {
      setLoadingTicket(false);
    }
  }

  return (
    <main className="workspace">
      <header className="workspace-header">
        <a className="brand" href="/" aria-label="Intelligent Test Planning home">
          <span className="brand-icon">QA</span>
          <span>
            <strong>Intelligent Test Planning</strong>
            <small>AI Agent</small>
          </span>
        </a>
        <button className="settings-button" onClick={toggleSettings} aria-label="Open or close connection settings">
          <span aria-hidden="true">⚙</span> Settings
        </button>
      </header>

      <section className="workspace-intro">
        <p className="eyebrow">JIRA WORKSPACE</p>
        <h1>Testing, in one place.</h1>
        <p>Choose an agent to build a test strategy, plan, or test cases.</p>
      </section>

      <section className="shared-ticket">
        <form className="shared-ticket-form" onSubmit={fetchTicket}>
          <label htmlFor="shared-ticket-key">Shared Jira ticket</label>
          <input
            id="shared-ticket-key"
            value={ticketKey}
            onChange={(event) => setTicketKey(event.target.value)}
            placeholder="e.g. SHOP-123"
            disabled={loadingTicket}
          />
          <button type="submit" disabled={loadingTicket || !ticketKey.trim()}>
            {loadingTicket ? "Fetching…" : "Fetch once"}
          </button>
        </form>
        {ticketError && <p className="ticket-error" role="alert">{ticketError}</p>}
        {ticket && (
          <details className="ticket-summary">
            <summary>{ticket.key} · {ticket.summary}</summary>
            <p>{ticket.issueType} · Priority: {ticket.priority} · Status: {ticket.status}</p>
            <span>Ticket cached for all three agents in this workspace.</span>
          </details>
        )}
      </section>

      <nav className="agent-tabs" aria-label="Testing agents">
        {agents.map((agent, index) => (
          <button
            key={agent.id}
            className={active === agent.id ? "agent-tab active" : "agent-tab"}
            onClick={() => setActive(agent.id)}
            aria-current={active === agent.id ? "page" : undefined}
          >
            <span className="tab-number">0{index + 1}</span>
            <span>{agent.label}</span>
          </button>
        ))}
      </nav>

      <section className="agent-window" aria-label={`${agents.find((agent) => agent.id === active).label} workspace`}>
        {agents.map((agent) => (
          <iframe
            key={agent.id}
            ref={(element) => { frames.current[agent.id] = element; }}
            src={agent.url}
            title={agent.label}
            className="agent-frame"
            style={{ display: active === agent.id ? "block" : "none" }}
            onLoad={() => { if (ticket) sendTicket(agent, ticket); }}
          />
        ))}
      </section>
      <footer className="workspace-footer">
        <span>{agents.find((agent) => agent.id === active).description}</span>
        <span>Drafts are editable before download.</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
