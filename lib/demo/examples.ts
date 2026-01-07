/**
 * One example payload per block. They feed the playground, the demo chat
 * and the "Example" section of each prompt contract.
 */

// Demo images ship in /public/demo. Prefixed so they resolve under a base path too.
const asset = (file: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/demo/${file}`;

const author = {
  name: "Maya Laurent",
  handle: "mayabuilds",
  avatarUrl: asset("avatar.svg"),
};

export const examples: Record<string, unknown> = {
  chart: {
    id: "signups-by-week",
    type: "bar",
    title: "Signups by week",
    description: "Organic against paid, last six weeks",
    xKey: "week",
    data: [
      { week: "W36", organic: 320, paid: 140 },
      { week: "W37", organic: 410, paid: 180 },
      { week: "W38", organic: 380, paid: 260 },
      { week: "W39", organic: 520, paid: 240 },
      { week: "W40", organic: 610, paid: 310 },
      { week: "W41", organic: 690, paid: 290 },
    ],
    series: [
      { key: "organic", label: "Organic", color: "#2F4BFF" },
      { key: "paid", label: "Paid", color: "#9DB0FF" },
    ],
    showLegend: true,
    showGrid: true,
  },

  dashboard: {
    id: "release-health",
    title: "Release health",
    description: "Version 4.2, first 24 hours",
    columns: 2,
    tiles: [
      { type: "metric", id: "crash-free", label: "Crash-free", value: "99.4%", icon: "ShieldCheck", trend: "up", delta: "+0.3 pts", size: "small" },
      { type: "metric", id: "p95", label: "p95 latency", value: "412 ms", icon: "Timer", trend: "down", delta: "-38 ms", size: "small" },
      { type: "progress", id: "rollout", label: "Rollout", value: 60, max: 100, size: "small" },
      { type: "stat-comparison", id: "errors", label: "Errors per 10K", stats: [{ label: "4.1", value: 18 }, { label: "4.2", value: 11 }], size: "small" },
      {
        type: "chart",
        id: "adoption",
        size: "large",
        chart: {
          id: "adoption-chart",
          type: "line",
          title: "Adoption",
          xKey: "hour",
          data: [
            { hour: "0h", share: 2 },
            { hour: "6h", share: 14 },
            { hour: "12h", share: 31 },
            { hour: "18h", share: 47 },
            { hour: "24h", share: 60 },
          ],
          series: [{ key: "share", label: "Share of sessions (%)", color: "#2F4BFF" }],
          showLegend: false,
        },
      },
    ],
  },

  "data-table": {
    id: "open-incidents",
    caption: "Open incidents",
    rowIdKey: "id",
    striped: true,
    columns: [
      {
        key: "status",
        label: "Status",
        priority: "primary",
        format: {
          kind: "status",
          statusMap: {
            investigating: { tone: "danger", label: "Investigating" },
            mitigated: { tone: "warning", label: "Mitigated" },
            resolved: { tone: "success", label: "Resolved" },
          },
        },
      },
      { key: "service", label: "Service", priority: "primary" },
      { key: "opened", label: "Opened", format: { kind: "date", dateFormat: "short" } },
      { key: "errorRate", label: "Error rate", format: { kind: "number", numberFormat: "percentage" } },
      { key: "change", label: "Since 1h", format: { kind: "delta", showSign: true } },
      { key: "owners", label: "Owners", priority: "secondary", format: { kind: "array", maxVisibleItems: 2 } },
    ],
    data: [
      { id: "inc-311", status: "investigating", service: "checkout-api", opened: "2025-12-15T08:40:00Z", errorRate: 0.042, change: 1.1, owners: ["Ines", "Theo"] },
      { id: "inc-309", status: "mitigated", service: "search", opened: "2025-12-15T06:15:00Z", errorRate: 0.009, change: -2.4, owners: ["Sam"] },
      { id: "inc-304", status: "resolved", service: "notifications", opened: "2025-12-14T19:02:00Z", errorRate: 0.001, change: -0.6, owners: ["Lena", "Omar", "Jo"] },
    ],
  },

  plan: {
    id: "migration-plan",
    title: "Move billing to the new database",
    description: "Zero downtime, reversible until the last step",
    showProgress: true,
    maxVisibleTodos: 5,
    todos: [
      { id: "t1", label: "Create the new schema", status: "completed", description: "Tables, indexes and constraints mirrored from production." },
      { id: "t2", label: "Dual-write from the billing service", status: "completed" },
      { id: "t3", label: "Backfill historical invoices", status: "in_progress", description: "62% done, running in batches of 5,000." },
      { id: "t4", label: "Compare both stores for a week", status: "pending" },
      { id: "t5", label: "Switch reads, then drop the old tables", status: "pending" },
    ],
  },

  "option-list": {
    id: "pick-region",
    selectionMode: "single",
    options: [
      { id: "paris", label: "Paris (eu-west-3)", description: "Closest to most of your users, 18 ms median." },
      { id: "frankfurt", label: "Frankfurt (eu-central-1)", description: "Largest capacity in Europe, 24 ms median." },
      { id: "dublin", label: "Dublin (eu-west-1)", description: "Cheapest of the three, 31 ms median." },
    ],
  },

  "next-best-action": {
    id: "after-report",
    title: "What next?",
    description: "Three ways to continue from this report",
    actions: [
      { id: "a1", label: "Draft the incident summary", description: "A short write-up for the status page", prompt: "Draft the incident summary for the status page", variant: "secondary" },
      { id: "a2", label: "Compare with last month", description: "Same metrics, previous period", prompt: "Compare these numbers with last month", variant: "secondary" },
      { id: "a3", label: "Plan the fix", description: "Break the work into steps", prompt: "Plan the fix as a list of steps", variant: "secondary" },
    ],
  },

  "item-carousel": {
    id: "templates",
    loop: true,
    items: [
      { id: "i1", name: "Weekly report", subtitle: "Analytics", description: "Charts and a short summary, every Monday.", imageUrl: asset("cover-1.svg"), actions: [{ id: "use", label: "Use this", prompt: "Set up the weekly report template" }] },
      { id: "i2", name: "Onboarding checklist", subtitle: "People", description: "First-week tasks for a new teammate.", imageUrl: asset("cover-2.svg"), actions: [{ id: "use", label: "Use this", prompt: "Set up the onboarding checklist template" }] },
      { id: "i3", name: "Release notes", subtitle: "Product", description: "Turn merged work into readable notes.", imageUrl: asset("cover-3.svg"), actions: [{ id: "use", label: "Use this", prompt: "Set up the release notes template" }] },
      { id: "i4", name: "Interview kit", subtitle: "Hiring", description: "Questions and a scorecard per role.", color: "#3B2A66", actions: [{ id: "use", label: "Use this", prompt: "Set up the interview kit template" }] },
    ],
  },

  "item-detail": {
    id: "plan-team",
    title: "Team plan",
    subtitle: "For groups of 5 to 50",
    imageUrl: asset("cover-4.svg"),
    sections: [
      { id: "s1", title: "Included", items: ["Unlimited projects", "Shared workspaces", "Audit log, 90 days"] },
      { id: "s2", title: "Limits", items: ["50 seats", "200 GB storage", "1,000 automation runs a day"] },
    ],
  },

  image: {
    id: "arch-diagram",
    assetId: "asset-arch-diagram",
    src: asset("cover-1.svg"),
    alt: "Abstract blue composition",
    title: "Service map, December",
    description: "Generated from the dependency graph.",
    ratio: "16:9",
    fit: "cover",
  },

  "link-preview": {
    id: "docs-link",
    href: "https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API",
    title: "MediaStream Recording API",
    description: "Record audio and video in the browser with MediaRecorder.",
    image: asset("cover-2.svg"),
    domain: "developer.mozilla.org",
    ratio: "16:9",
  },

  maps: {
    id: "to-office",
    title: "To the client office",
    origin: "Gare de Nice-Ville",
    destination: "Promenade des Anglais, Nice",
    mode: "walking",
    distance: "1.4 km",
    duration: "18 min",
    mapImageUrl: asset("map.svg"),
    ratio: "16:9",
  },

  "file-download": {
    id: "q3-export",
    fileName: "q3-usage-report.pdf",
    description: "Usage by workspace, July to September",
    fileUrl: asset("cover-1.svg"),
    fileSize: "1.2 MB",
    icon: "FileText",
  },

  "record-button": {
    id: "record-standup",
    title: "Record the stand-up",
    description: "Talk as usual. You get notes and action items when you stop.",
    startLabel: "Start recording",
    processingLabel: "Transcribing...",
    autoSend: true,
    promptPrefix: "Here is the stand-up transcript. Turn it into notes and action items:\n\n",
  },

  "x-post": {
    id: "x-draft-1",
    author: { ...author, verified: true },
    text: "We cut cold start from 2.1 s to 640 ms by moving one import.\n\nThe write-up, with flame graphs, is on the blog.",
    stats: { likes: 482, comments: 37, shares: 91 },
    createdAt: "2025-12-15T09:30:00Z",
  },

  "instagram-post": {
    id: "ig-draft-1",
    author,
    text: "Team offsite, day two. Whiteboards full, coffee empty.",
    media: [{ type: "image", url: asset("cover-3.svg"), alt: "Warm abstract composition" }],
    stats: { likes: 1240, comments: 58 },
    createdAt: "2025-12-14T17:05:00Z",
  },

  "linkedin-post": {
    id: "li-draft-1",
    author: { name: author.name, headline: "Engineering lead", avatarUrl: author.avatarUrl },
    text: "Three things we learned shipping voice input to production:\n\n1. Silence detection matters more than the model.\n2. People interrupt. Let them.\n3. Show what was heard before acting on it.",
    stats: { likes: 312, comments: 24, shares: 12 },
    createdAt: "2025-12-12T07:45:00Z",
  },
};

export const exampleJson = (name: string) =>
  JSON.stringify(examples[name] ?? {}, null, 2);

/** The fenced block exactly as a model would write it. */
export const exampleFence = (name: string) =>
  "```" + name + "\n" + exampleJson(name) + "\n```";
