export type CampusCategory = "Academic" | "Event" | "Scholarship" | "Club";

export interface CampusItem {
  id: number;
  title: string;
  category: CampusCategory;
  date: string;
  time: string;
  location: string;
  description: string;
  source: string;
  urgent?: boolean;
  color: string;
}

export const agenda: CampusItem[] = [
  {
    id: 1,
    title: "AI Ethics assignment",
    category: "Academic",
    date: "29 Aug",
    time: "12:00 PM",
    location: "MMLS submission portal",
    description: "Final reflection and responsible AI case analysis.",
    source: "TDS 2111 · Course announcement",
    urgent: true,
    color: "#ff6f61",
  },
  {
    id: 2,
    title: "Tech Club product workshop",
    category: "Club",
    date: "29 Aug",
    time: "2:00 PM",
    location: "FCI XR Lab",
    description: "Rapid prototyping workshop for student builders.",
    source: "IT Society · Event notice",
    color: "#4f8cff",
  },
  {
    id: 3,
    title: "Yayasan scholarship briefing",
    category: "Scholarship",
    date: "29 Aug",
    time: "6:30 PM",
    location: "Microsoft Teams",
    description: "Eligibility, documents and application walkthrough.",
    source: "Student Affairs · Scholarship desk",
    color: "#9b6cff",
  },
  {
    id: 4,
    title: "Campus sustainability challenge",
    category: "Event",
    date: "30 Aug",
    time: "10:00 AM",
    location: "CLC Concourse",
    description: "Pitch practical ideas for a greener MMU campus.",
    source: "Sustainability Office",
    color: "#2bb98c",
  },
  {
    id: 5,
    title: "Database systems quiz",
    category: "Academic",
    date: "31 Aug",
    time: "9:00 AM",
    location: "MMLS online quiz",
    description: "Covers normalization, transactions and indexing.",
    source: "TDB 2201 · Course announcement",
    color: "#f2a63b",
  },
];

export const opportunities: CampusItem[] = [
  {
    id: 11,
    title: "Maybank FutureReady Scholarship",
    category: "Scholarship",
    date: "Closes 1 Sep",
    time: "11:59 PM",
    location: "Online application",
    description: "Funding and mentorship for Malaysian undergraduates with strong community involvement.",
    source: "MMU Student Affairs",
    urgent: true,
    color: "#9b6cff",
  },
  {
    id: 12,
    title: "Google Developer Groups Campus Meetup",
    category: "Event",
    date: "3 Sep",
    time: "4:00 PM",
    location: "FCI Lecture Theatre 2",
    description: "Lightning talks, networking and hands-on Gemini prototyping with student developers.",
    source: "GDG on Campus MMU",
    color: "#4f8cff",
  },
  {
    id: 13,
    title: "Robotics Club intake 2026",
    category: "Club",
    date: "5 Sep",
    time: "2:00 PM",
    location: "Engineering Maker Lab",
    description: "Join the build, software or design team. Beginners are welcome.",
    source: "MMU Robotics Club",
    color: "#2bb98c",
  },
  {
    id: 14,
    title: "Academic writing clinic",
    category: "Academic",
    date: "6 Sep",
    time: "11:00 AM",
    location: "Learning Point, Library",
    description: "Bring a draft and receive one-to-one feedback on structure and citations.",
    source: "MMU Library",
    color: "#f2a63b",
  },
];

export interface CampusNotification {
  id: number;
  title: string;
  body: string;
  time: string;
  type: CampusCategory | "Agent";
  read: boolean;
}

export const initialNotifications: CampusNotification[] = [
  { id: 1, title: "Deadline moved forward", body: "AI Ethics assignment is now due today at 12:00 PM.", time: "8 min ago", type: "Academic", read: false },
  { id: 2, title: "Pulse AI found a conflict", body: "Your product workshop overlaps with the project-team check-in.", time: "24 min ago", type: "Agent", read: false },
  { id: 3, title: "Scholarship closing soon", body: "The Maybank FutureReady application closes in three days.", time: "1 hr ago", type: "Scholarship", read: false },
  { id: 4, title: "New event for you", body: "A Gemini prototyping meetup matches your AI and product interests.", time: "Yesterday", type: "Event", read: true },
  { id: 5, title: "Robotics Club intake", body: "Applications are open for build, software and design teams.", time: "Yesterday", type: "Club", read: true },
];
