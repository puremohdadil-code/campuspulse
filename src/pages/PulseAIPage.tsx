import { useState } from "react";
import type { FormEvent } from "react";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SourceRoundedIcon from "@mui/icons-material/SourceRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import { askPulseAgent, type AgentAnswer } from "../services/pulseAgent";

interface Message {
  id: number;
  role: "user" | "agent";
  text: string;
  answer?: AgentAnswer;
}

const quickPrompts = [
  { label: "What is urgent today?", icon: CalendarMonthRoundedIcon },
  { label: "Find scholarships for me", icon: SchoolRoundedIcon },
  { label: "Plan my week", icon: TravelExploreRoundedIcon },
];

export default function PulseAIPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "agent", text: "Good morning, Aina. I have checked your deadlines, calendar and campus opportunities. What would you like to make clearer?" },
  ]);

  const send = async (prompt: string) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || loading) return;
    setInput("");
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: cleanPrompt }]);
    setLoading(true);
    const answer = await askPulseAgent(cleanPrompt);
    setMessages((current) => [...current, { id: Date.now() + 1, role: "agent", text: answer.text, answer }]);
    setLoading(false);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  return (
    <div className="agent-page">
      <section className="agent-intro">
        <div className="agent-logo"><AutoAwesomeRoundedIcon /></div>
        <div><span>PULSE AI · DEMO MODE</span><h1>Your campus copilot.</h1><p>Ask, compare and act on campus information. Gemini can be connected later through the prepared frontend integration layer.</p></div>
        <span className="demo-badge"><i /> Frontend demo</span>
      </section>

      <section className="agent-workspace">
        <div className="chat-panel">
          <div className="chat-messages" aria-live="polite">
            {messages.map((message) => (
              <article className={`chat-message ${message.role}`} key={message.id}>
                {message.role === "agent" ? <span className="chat-avatar"><AutoAwesomeRoundedIcon /></span> : null}
                <div>
                  <p>{message.text}</p>
                  {message.answer?.sources ? <details><summary><SourceRoundedIcon /> {message.answer.sources.length} campus sources</summary>{message.answer.sources.map((source) => <span key={source}>{source}</span>)}</details> : null}
                  {message.answer?.action ? <button className="agent-action" onClick={() => setConfirmation(message.answer?.action?.confirmation ?? "Done")}>{message.answer.action.label}</button> : null}
                </div>
              </article>
            ))}
            {loading ? <article className="chat-message agent"><span className="chat-avatar"><AutoAwesomeRoundedIcon /></span><div className="typing-indicator"><i /><i /><i /></div></article> : null}
          </div>

          {confirmation ? <div className="action-confirmation"><CheckCircleRoundedIcon /><span>{confirmation}</span><button onClick={() => setConfirmation("")}>Dismiss</button></div> : null}

          <div className="quick-prompts">
            {quickPrompts.map(({ label, icon: Icon }) => <button onClick={() => void send(label)} key={label}><Icon /> {label}</button>)}
          </div>
          <form className="agent-composer" onSubmit={submit}>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Pulse about your campus life…" aria-label="Message Pulse AI" />
            <button disabled={!input.trim() || loading} aria-label="Send message"><SendRoundedIcon /></button>
          </form>
          <small className="agent-disclaimer">Pulse may make mistakes. Confirm important deadlines with the linked campus source.</small>
        </div>

        <aside className="agent-context-panel">
          <span>LIVE CONTEXT</span>
          <h2>What Pulse can see</h2>
          <div><CalendarMonthRoundedIcon /><p><strong>Your calendar</strong><small>7 upcoming items</small></p><b>Synced</b></div>
          <div><SchoolRoundedIcon /><p><strong>Your courses</strong><small>4 active subjects</small></p><b>Synced</b></div>
          <div><TravelExploreRoundedIcon /><p><strong>Your interests</strong><small>AI, product, scholarships</small></p><b>Active</b></div>
          <hr />
          <p className="context-note">Pulse only uses the campus data and preferences visible in this frontend demo.</p>
        </aside>
      </section>
    </div>
  );
}
