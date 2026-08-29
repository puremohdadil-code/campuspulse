export interface AgentAnswer {
  text: string;
  suggestions: string[];
  sources: string[];
  action?: { label: string; confirmation: string };
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function askPulseAgent(prompt: string): Promise<AgentAnswer> {
  await wait(650);
  const normalized = prompt.toLowerCase();

  if (normalized.includes("week") || normalized.includes("schedule") || normalized.includes("plan")) {
    return {
      text: "You have two academic deadlines and three campus activities this week. I would protect 9:00–11:00 AM tomorrow for Database Systems, keep Friday afternoon for the GDG meetup, and move your project check-in to 4:30 PM to avoid the workshop conflict.",
      suggestions: ["Show only urgent items", "Create focus blocks", "What can I skip?"],
      sources: ["TDB 2201 course announcement", "IT Society event notice", "Personal CampusPulse calendar"],
      action: { label: "Add focus blocks", confirmation: "Two focus blocks were added to your demo calendar." },
    };
  }

  if (normalized.includes("scholar") || normalized.includes("fund")) {
    return {
      text: "The Maybank FutureReady Scholarship is the strongest current match for your profile. It closes on 1 September and prioritises academic consistency plus community involvement. You should prepare your latest transcript and a short leadership statement first.",
      suggestions: ["Build my application checklist", "Set a deadline reminder", "Show eligibility"],
      sources: ["MMU Student Affairs · Scholarship desk", "Maybank FutureReady campus notice"],
      action: { label: "Create checklist", confirmation: "A four-step scholarship checklist was added to your dashboard." },
    };
  }

  if (normalized.includes("today") || normalized.includes("urgent") || normalized.includes("deadline")) {
    return {
      text: "The most urgent item is your AI Ethics assignment at 12:00 PM. After that, you have the Tech Club workshop at 2:00 PM and a scholarship briefing at 6:30 PM. There is enough travel time between all three.",
      suggestions: ["Start a focus timer", "Open assignment details", "Plan tomorrow"],
      sources: ["TDS 2111 course announcement", "IT Society event notice", "Student Affairs calendar"],
      action: { label: "Remind me at 11:15", confirmation: "Demo reminder set for 11:15 AM." },
    };
  }

  return {
    text: "I can help you understand campus announcements, find opportunities, compare deadlines and turn your plans into calendar actions. Try asking what is urgent today or which scholarship fits you best.",
    suggestions: ["What is urgent today?", "Find scholarships for me", "Plan my week"],
    sources: ["CampusPulse demo knowledge base"],
  };
}
