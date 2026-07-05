/**
 * The copywriter: generates every visible string in the product from the
 * business profile and the voice tokens. This is the second half of the LLM
 * seam — in production an LLM would implement this same contract
 * (generateBlockProps / generateFlowSteps); the studio doesn't care which
 * brain fills the props.
 */
import { TokenSet } from '../felix/tokens';
import { Block, BlockKind, BlockProps, Business, ChatStep } from './types';

type Voice = TokenSet['voice'];

interface Archetype {
  match: RegExp;
  /** What the business offers, used mid-sentence: "book {offering}". */
  offering: string;
  badge: string;
  headline: (b: Business) => string;
  subhead: (b: Business) => string;
  primaryCta: string;
  secondaryCta: string;
  navLinks: string[];
  features: { title: string; body: string }[];
  stats: { label: string; value: string; delta?: string }[];
  tiers: { name: string; price: string; blurb: string; cta: string; featured?: boolean }[];
  quote: (b: Business) => string;
  author: string;
  role: string;
  formTitle: string;
  fields: { label: string; placeholder: string; type?: string }[];
  submitLabel: string;
  footnote: string;
  columns: string[];
  rows: { cells: string[]; badge?: { label: string; tone: 'positive' | 'warning' | 'neutral' | 'danger' } }[];
  ctaHeadline: (b: Business) => string;
  ctaSubhead: string;
  /** Chat flow vocabulary. */
  chat: {
    welcome: (b: Business) => string;
    actionLabel: string;
    actionReply: (b: Business) => string;
    infoLabel: string;
    infoReply: (b: Business) => string;
  };
}

const ARCHETYPES: Archetype[] = [
  {
    match: /bak|cafe|café|coffee|restaurant|food|pizza|kitchen|catering|bar\b/i,
    offering: 'an order',
    badge: 'Baked fresh every morning',
    headline: (b) => `${b.name} — worth crossing town for`,
    subhead: (b) =>
      `Small-batch, seasonal and made by hand. ${b.name} bakes what the market gives us, and sells out most days by noon.`,
    primaryCta: 'Order ahead',
    secondaryCta: 'See the menu',
    navLinks: ['Menu', 'Wholesale', 'Our story'],
    features: [
      { title: 'Seasonal menu', body: 'The lineup changes with the market — check what came out of the oven today.' },
      { title: 'Order ahead', body: 'Skip the line: order by 8pm and pick up warm the next morning.' },
      { title: 'Wholesale', body: 'We supply cafés and restaurants around the neighborhood, delivered daily.' },
    ],
    stats: [
      { label: 'Loaves this week', value: '1,240', delta: '+8%' },
      { label: 'Pre-orders', value: '312', delta: '+22%' },
      { label: 'Wholesale partners', value: '17', delta: '+2' },
      { label: 'Sold out by', value: '11:40', delta: '-0:35' },
    ],
    tiers: [
      { name: 'Walk-in', price: '$0', blurb: 'First come, first served at the counter', cta: 'Visit us' },
      { name: 'Regulars Club', price: '$12/mo', blurb: 'Reserved loaf every week plus member pricing', cta: 'Join the club', featured: true },
      { name: 'Wholesale', price: 'Custom', blurb: 'Daily delivery for cafés and restaurants', cta: 'Talk to us' },
    ],
    quote: (b) => `“I plan my Saturdays around ${b.name}. The sourdough is the best in the city, full stop.”`,
    author: 'Maya Chen',
    role: 'Regular since 2023',
    formTitle: 'Reserve your order',
    fields: [
      { label: 'Name', placeholder: 'Maya Chen' },
      { label: 'Email', placeholder: 'maya@example.com', type: 'email' },
      { label: 'Pickup day', placeholder: 'Saturday' },
    ],
    submitLabel: 'Reserve',
    footnote: 'We’ll confirm by email. Pay at pickup.',
    columns: ['Item', 'Batch', 'Status'],
    rows: [
      { cells: ['Country sourdough', 'Morning'], badge: { label: 'In stock', tone: 'positive' } },
      { cells: ['Cardamom knots', 'Morning'], badge: { label: 'Low', tone: 'warning' } },
      { cells: ['Rye + walnut', 'Afternoon'], badge: { label: 'Baking', tone: 'neutral' } },
      { cells: ['Seeded baguette', 'Morning'], badge: { label: 'Sold out', tone: 'danger' } },
    ],
    ctaHeadline: (b) => `Get ${b.name} on your table`,
    ctaSubhead: 'Order by 8pm tonight, pick up warm tomorrow.',
    chat: {
      welcome: (b) => `Hi! You’ve reached ${b.name}. What can we get started for you?`,
      actionLabel: 'Place an order',
      actionReply: (b) => `Great — tell us what you’d like and your pickup time, and ${b.name} will have it warm and waiting.`,
      infoLabel: 'Hours & location',
      infoReply: () => `We’re open Tue–Sun, 7am until we sell out (usually around noon). Find us at 14 Market Lane.`,
    },
  },
  {
    match: /dent|clinic|medical|health|doctor|therap|vet|wellness|physio/i,
    offering: 'an appointment',
    badge: 'Now accepting new patients',
    headline: (b) => `Care that starts on time, at ${b.name}`,
    subhead: (b) =>
      `${b.name} pairs modern care with appointments that respect your day — book online, arrive to a ready room, leave with a clear plan.`,
    primaryCta: 'Book an appointment',
    secondaryCta: 'Meet the team',
    navLinks: ['Services', 'Team', 'Patients'],
    features: [
      { title: 'Online booking', body: 'See real availability and book in under a minute — no phone tag.' },
      { title: 'Clear estimates', body: 'Know what a visit costs before you sit down, insurance included.' },
      { title: 'Gentle follow-up', body: 'Your plan, reminders and results in one place after every visit.' },
    ],
    stats: [
      { label: 'Patients this month', value: '842', delta: '+6%' },
      { label: 'Avg. wait', value: '4 min', delta: '-2 min' },
      { label: 'Same-week slots', value: '61', delta: '+12' },
      { label: 'Satisfaction', value: '4.9', delta: '+0.1' },
    ],
    tiers: [
      { name: 'Visit', price: 'From $95', blurb: 'Single appointment, transparent pricing', cta: 'Book now' },
      { name: 'Membership', price: '$29/mo', blurb: 'Two cleanings a year plus member rates', cta: 'Join', featured: true },
      { name: 'Family', price: '$79/mo', blurb: 'Coverage for the whole household', cta: 'Talk to us' },
    ],
    quote: (b) => `“${b.name} is the first practice where I’ve never sat in the waiting room past my slot. My kids actually don’t mind going.”`,
    author: 'Dana Okafor',
    role: 'Patient, 3 years',
    formTitle: 'Request an appointment',
    fields: [
      { label: 'Name', placeholder: 'Dana Okafor' },
      { label: 'Email', placeholder: 'dana@example.com', type: 'email' },
      { label: 'Preferred day', placeholder: 'Weekday mornings' },
    ],
    submitLabel: 'Request appointment',
    footnote: 'We’ll confirm within one business day.',
    columns: ['Patient', 'Visit', 'Status'],
    rows: [
      { cells: ['D. Okafor', 'Cleaning'], badge: { label: 'Confirmed', tone: 'positive' } },
      { cells: ['R. Alvarez', 'Consult'], badge: { label: 'Pending', tone: 'warning' } },
      { cells: ['S. Kim', 'Follow-up'], badge: { label: 'Checked in', tone: 'neutral' } },
      { cells: ['J. Whitfield', 'X-ray'], badge: { label: 'No-show', tone: 'danger' } },
    ],
    ctaHeadline: (b) => `Ready when you are — book with ${b.name}`,
    ctaSubhead: 'Same-week appointments, online in under a minute.',
    chat: {
      welcome: (b) => `Hello! This is ${b.name}. How can we help you today?`,
      actionLabel: 'Book an appointment',
      actionReply: () => `Of course. What day works best for you? We have same-week openings most mornings.`,
      infoLabel: 'Insurance & pricing',
      infoReply: () => `We accept most major plans and always share an estimate before treatment. A standard visit starts at $95.`,
    },
  },
  {
    match: /gym|fitness|yoga|pilates|studio.*(fit|move)|climb|crossfit|train/i,
    offering: 'a class',
    badge: 'First class free',
    headline: (b) => `Show up. ${b.name} does the rest.`,
    subhead: (b) =>
      `Small classes, real coaching and a schedule that bends around your life. ${b.name} is built for people who train before work, not for the mirror.`,
    primaryCta: 'Book a class',
    secondaryCta: 'View schedule',
    navLinks: ['Schedule', 'Coaches', 'Pricing'],
    features: [
      { title: 'Small classes', body: 'Capped at twelve so a coach actually sees every rep you do.' },
      { title: 'Flexible booking', body: 'Book, swap or cancel up to two hours before class, penalty-free.' },
      { title: 'Progress tracked', body: 'Benchmarks logged automatically — watch the numbers move.' },
    ],
    stats: [
      { label: 'Classes this week', value: '58', delta: '+4' },
      { label: 'Active members', value: '412', delta: '+9%' },
      { label: 'Avg. class size', value: '9', delta: '0' },
      { label: 'Retention', value: '93%', delta: '+2%' },
    ],
    tiers: [
      { name: 'Drop-in', price: '$22', blurb: 'Single class, no commitment', cta: 'Book one' },
      { name: 'Unlimited', price: '$129/mo', blurb: 'Every class, every week, plus open gym', cta: 'Go unlimited', featured: true },
      { name: 'Duo', price: '$219/mo', blurb: 'Unlimited for two — train with a partner', cta: 'Bring a friend' },
    ],
    quote: (b) => `“Two years at ${b.name} and I’m stronger at 41 than I was at 30. The coaches remember your name and your knees.”`,
    author: 'Priya Raman',
    role: 'Member since 2024',
    formTitle: 'Claim your free class',
    fields: [
      { label: 'Name', placeholder: 'Priya Raman' },
      { label: 'Email', placeholder: 'priya@example.com', type: 'email' },
      { label: 'Experience', placeholder: 'Beginner' },
    ],
    submitLabel: 'Claim free class',
    footnote: 'No card required for your first visit.',
    columns: ['Class', 'Coach', 'Status'],
    rows: [
      { cells: ['6am Strength', 'Sam'], badge: { label: 'Open', tone: 'positive' } },
      { cells: ['Noon Mobility', 'Ida'], badge: { label: '2 spots', tone: 'warning' } },
      { cells: ['5pm Conditioning', 'Sam'], badge: { label: 'Waitlist', tone: 'neutral' } },
      { cells: ['7pm Open Gym', '—'], badge: { label: 'Full', tone: 'danger' } },
    ],
    ctaHeadline: (b) => `Your first class at ${b.name} is free`,
    ctaSubhead: 'No card, no contract — just show up.',
    chat: {
      welcome: (b) => `Hey! ${b.name} here. Ready to move?`,
      actionLabel: 'Book a class',
      actionReply: () => `Nice. Which day suits you? Mornings fill fast — the 6am crew is serious.`,
      infoLabel: 'Pricing',
      infoReply: () => `Drop-ins are $22, unlimited is $129/month, and your first class is always free.`,
    },
  },
  {
    match: /hotel|hospitalit|rental|stay|lodg|cabin|retreat|travel|bnb|airbnb/i,
    offering: 'a stay',
    badge: 'Now booking this season',
    headline: (b) => `Unplug at ${b.name}`,
    subhead: (b) =>
      `Quiet places in wild settings. ${b.name} keeps the wifi optional and the views mandatory — book direct for the best rates.`,
    primaryCta: 'Check availability',
    secondaryCta: 'Explore the stays',
    navLinks: ['Stays', 'Gallery', 'Guide'],
    features: [
      { title: 'Book direct', body: 'No platform fees, flexible cancellation and the best nightly rate.' },
      { title: 'Self check-in', body: 'Arrive on your own schedule — door codes sent the morning of.' },
      { title: 'Local guide', body: 'Our own map of trails, swims and suppers within twenty minutes.' },
    ],
    stats: [
      { label: 'Nights booked', value: '1,180', delta: '+14%' },
      { label: 'Occupancy', value: '87%', delta: '+5%' },
      { label: 'Avg. rating', value: '4.96', delta: '+0.02' },
      { label: 'Repeat guests', value: '38%', delta: '+6%' },
    ],
    tiers: [
      { name: 'Midweek', price: 'From $180', blurb: 'Sun–Thu nights, two-night minimum', cta: 'See dates' },
      { name: 'Weekend', price: 'From $240', blurb: 'Fri–Sat nights, book early', cta: 'See dates', featured: true },
      { name: 'Full buyout', price: 'Custom', blurb: 'All cabins for groups and retreats', cta: 'Enquire' },
    ],
    quote: (b) => `“We’ve stayed at ${b.name} three times now. It’s the only place where my partner actually stops checking email.”`,
    author: 'Jordan & Lee',
    role: 'Guests, Big Sur',
    formTitle: 'Request dates',
    fields: [
      { label: 'Name', placeholder: 'Jordan Lee' },
      { label: 'Email', placeholder: 'jordan@example.com', type: 'email' },
      { label: 'Dates', placeholder: 'Oct 12–15' },
    ],
    submitLabel: 'Request dates',
    footnote: 'We reply within a day — no charge until confirmed.',
    columns: ['Cabin', 'Dates', 'Status'],
    rows: [
      { cells: ['The Lookout', 'Oct 12–15'], badge: { label: 'Available', tone: 'positive' } },
      { cells: ['Creek House', 'Oct 12–15'], badge: { label: '1 night gap', tone: 'warning' } },
      { cells: ['The Bothy', 'Oct 12–15'], badge: { label: 'Pending', tone: 'neutral' } },
      { cells: ['Ridge Cabin', 'Oct 12–15'], badge: { label: 'Booked', tone: 'danger' } },
    ],
    ctaHeadline: (b) => `The quiet is waiting at ${b.name}`,
    ctaSubhead: 'Book direct — best rates, flexible cancellation.',
    chat: {
      welcome: (b) => `Welcome to ${b.name}! Planning an escape?`,
      actionLabel: 'Check availability',
      actionReply: () => `Lovely. Which dates are you thinking? Midweek stays start at $180 a night.`,
      infoLabel: 'About the stays',
      infoReply: (b) => `${b.name} has three cabins, all self check-in, all within a short walk of the water. Dogs welcome at Creek House.`,
    },
  },
  {
    match: /shop|store|boutique|retail|ecommerce|e-commerce|market|goods|apparel|cloth/i,
    offering: 'an order',
    badge: 'New arrivals weekly',
    headline: (b) => `Everyday things, chosen well — ${b.name}`,
    subhead: (b) =>
      `${b.name} stocks a short list of goods we actually use: made to last, fairly priced, shipped the same day you order.`,
    primaryCta: 'Shop new arrivals',
    secondaryCta: 'Browse all',
    navLinks: ['Shop', 'About', 'Journal'],
    features: [
      { title: 'Curated, not crowded', body: 'A few dozen items, each earning its place — no endless scroll.' },
      { title: 'Same-day dispatch', body: 'Order by 3pm and it ships today, tracked door to door.' },
      { title: 'Easy returns', body: 'Thirty days, no questions, prepaid label in every box.' },
    ],
    stats: [
      { label: 'Orders this week', value: '486', delta: '+11%' },
      { label: 'Ship time', value: '0.8 d', delta: '-0.2' },
      { label: 'Return rate', value: '2.1%', delta: '-0.4%' },
      { label: 'Repeat buyers', value: '44%', delta: '+3%' },
    ],
    tiers: [
      { name: 'Standard', price: 'Free 50+', blurb: 'Tracked shipping on every order', cta: 'Shop now' },
      { name: 'Members', price: '$39/yr', blurb: 'Free shipping always, early access drops', cta: 'Join', featured: true },
      { name: 'Trade', price: 'Custom', blurb: 'Volume pricing for studios and offices', cta: 'Apply' },
    ],
    quote: (b) => `“Everything I’ve bought from ${b.name} is still in use years later. That’s the whole review.”`,
    author: 'Alex Fontaine',
    role: 'Customer since 2022',
    formTitle: 'Get the drop list',
    fields: [
      { label: 'Name', placeholder: 'Alex Fontaine' },
      { label: 'Email', placeholder: 'alex@example.com', type: 'email' },
    ],
    submitLabel: 'Subscribe',
    footnote: 'One email a week. Unsubscribe anytime.',
    columns: ['Order', 'Items', 'Status'],
    rows: [
      { cells: ['#4821', '2'], badge: { label: 'Shipped', tone: 'positive' } },
      { cells: ['#4822', '1'], badge: { label: 'Packing', tone: 'warning' } },
      { cells: ['#4823', '4'], badge: { label: 'Received', tone: 'neutral' } },
      { cells: ['#4818', '1'], badge: { label: 'Returned', tone: 'danger' } },
    ],
    ctaHeadline: (b) => `See what’s new at ${b.name}`,
    ctaSubhead: 'New arrivals every week. Order by 3pm, ships today.',
    chat: {
      welcome: (b) => `Hi, thanks for reaching out to ${b.name}! What can we help with?`,
      actionLabel: 'Track my order',
      actionReply: () => `Sure — drop your order number (it starts with #) and I’ll check where it is right now.`,
      infoLabel: 'Returns',
      infoReply: () => `Returns are free for 30 days. There’s a prepaid label in your box — just stick it on and drop it off.`,
    },
  },
  {
    match: /agenc|studio|consult|design|brand|creative|marketing|law|account|advis/i,
    offering: 'a call',
    badge: 'Booking Q3 projects',
    headline: (b) => `${b.name} — small team, senior work`,
    subhead: (b) =>
      `No juniors learning on your budget. ${b.name} puts principals on every engagement and ships in weeks, not quarters.`,
    primaryCta: 'Book a call',
    secondaryCta: 'See the work',
    navLinks: ['Work', 'Services', 'About'],
    features: [
      { title: 'Principals only', body: 'The people in the pitch are the people doing the work.' },
      { title: 'Fixed-scope sprints', body: 'Priced up front, shipped on a date, no hourly meter running.' },
      { title: 'Direct line', body: 'One shared channel with the whole team — no account-manager relay.' },
    ],
    stats: [
      { label: 'Projects shipped', value: '64', delta: '+7' },
      { label: 'Avg. engagement', value: '6 wks', delta: '-1' },
      { label: 'Repeat clients', value: '71%', delta: '+4%' },
      { label: 'NPS', value: '78', delta: '+6' },
    ],
    tiers: [
      { name: 'Sprint', price: '$18k', blurb: 'Two weeks, one sharp problem', cta: 'Scope it' },
      { name: 'Engagement', price: '$45k+', blurb: 'Six weeks, strategy through ship', cta: 'Book a call', featured: true },
      { name: 'Retainer', price: 'Custom', blurb: 'Ongoing partnership, priority access', cta: 'Enquire' },
    ],
    quote: (b) => `“${b.name} gave us in six weeks what our last agency couldn’t in six months — and they were nicer about it.”`,
    author: 'Casey Morrow',
    role: 'VP Product, Meridian',
    formTitle: 'Start a conversation',
    fields: [
      { label: 'Name', placeholder: 'Casey Morrow' },
      { label: 'Email', placeholder: 'casey@company.com', type: 'email' },
      { label: 'What are you building?', placeholder: 'A few sentences' },
    ],
    submitLabel: 'Send',
    footnote: 'We reply to every note within two business days.',
    columns: ['Project', 'Phase', 'Status'],
    rows: [
      { cells: ['Meridian rebrand', 'Ship'], badge: { label: 'On track', tone: 'positive' } },
      { cells: ['Atlas onboarding', 'Design'], badge: { label: 'Review', tone: 'warning' } },
      { cells: ['Foundry site', 'Scope'], badge: { label: 'Queued', tone: 'neutral' } },
      { cells: ['Nimbus audit', 'Hold'], badge: { label: 'Blocked', tone: 'danger' } },
    ],
    ctaHeadline: (b) => `Have a project in mind? Talk to ${b.name}`,
    ctaSubhead: 'Booking now — first call is free and useful either way.',
    chat: {
      welcome: (b) => `Hi — you’ve reached ${b.name}. Tell us a little about what you’re building.`,
      actionLabel: 'Start a project',
      actionReply: () => `Great. What’s the problem you’re trying to solve, and when do you need it shipped? We’ll take it from there.`,
      infoLabel: 'How you work',
      infoReply: () => `Fixed-scope sprints, principals only, one shared channel. Most engagements run six weeks from kickoff to ship.`,
    },
  },
  // Generic / SaaS fallback — also matches "software", "app", "platform".
  {
    match: /.*/,
    offering: 'a demo',
    badge: 'Now in public beta',
    headline: (b) => `${b.name} does the busywork`,
    subhead: (b) =>
      `${b.name} takes the repetitive part of your day and quietly handles it — so your team spends time on judgment, not admin.`,
    primaryCta: 'Start free',
    secondaryCta: 'Book a demo',
    navLinks: ['Product', 'Pricing', 'Docs'],
    features: [
      { title: 'Set up in minutes', body: 'Connect your tools and see value the same afternoon — no services engagement.' },
      { title: 'Works with your stack', body: 'Native integrations for the tools your team already lives in.' },
      { title: 'Audit-ready', body: 'Every action logged, exportable and reversible. Your compliance team will smile.' },
    ],
    stats: [
      { label: 'Active teams', value: '1,284', delta: '+12%' },
      { label: 'Tasks automated', value: '9,412', delta: '+4%' },
      { label: 'Hours saved / wk', value: '317', delta: '+9%' },
      { label: 'Error rate', value: '0.4%', delta: '-0.2%' },
    ],
    tiers: [
      { name: 'Starter', price: '$0', blurb: 'For small teams finding their feet', cta: 'Start free' },
      { name: 'Growth', price: '$8/user', blurb: 'Unlimited automation, priority support', cta: 'Go Growth', featured: true },
      { name: 'Enterprise', price: 'Custom', blurb: 'SSO, audit exports and a named contact', cta: 'Talk to us' },
    ],
    quote: (b) => `“${b.name} gave our ops team their Fridays back. I stopped counting the hours saved when it passed my own salary.”`,
    author: 'Rae Martinez',
    role: 'Head of Operations, Cascade',
    formTitle: 'Create your account',
    fields: [
      { label: 'Name', placeholder: 'Rae Martinez' },
      { label: 'Work email', placeholder: 'rae@company.com', type: 'email' },
      { label: 'Password', placeholder: '••••••••', type: 'password' },
    ],
    submitLabel: 'Sign up',
    footnote: 'Free for your first 100 tasks. No card required.',
    columns: ['Task', 'Owner', 'Status'],
    rows: [
      { cells: ['Invoice sync', 'Automation'], badge: { label: 'Done', tone: 'positive' } },
      { cells: ['Weekly digest', 'Automation'], badge: { label: 'Running', tone: 'warning' } },
      { cells: ['CRM cleanup', 'R. Martinez'], badge: { label: 'Draft', tone: 'neutral' } },
      { cells: ['Legacy import', 'Automation'], badge: { label: 'Failed', tone: 'danger' } },
    ],
    ctaHeadline: (b) => `Give ${b.name} your busywork`,
    ctaSubhead: 'Start free, upgrade when the workload does.',
    chat: {
      welcome: (b) => `Hi! This is ${b.name} support. How can we help?`,
      actionLabel: 'Book a demo',
      actionReply: () => `Happy to set that up. What size is your team, and what tools are you hoping to connect?`,
      infoLabel: 'Pricing',
      infoReply: () => `Starter is free, Growth is $8 per user per month, and Enterprise is custom. Every plan starts with a free trial.`,
    },
  },
];

export function archetypeFor(business: Business): Archetype {
  return ARCHETYPES.find((a) => a.match.test(business.industry)) ?? ARCHETYPES[ARCHETYPES.length - 1];
}

/** Tone applied to chat copy at generation time. */
function voiced(text: string, voice: Voice): string {
  if (voice.tone === 'professional') {
    return text.replace(/^Hi!|^Hey!|^Hi —/, 'Hello,').replace(/Nice\.|Great —|Lovely\./, 'Certainly.');
  }
  if (voice.tone === 'playful') {
    return text.replace(/^Hello,|^Hi!/, 'Hey hey!');
  }
  return text;
}

const TONE_EMOJI: Record<Voice['tone'], string> = {
  warm: '🙂',
  professional: '👍',
  playful: '🎉',
};

export function emojiFor(voice: Voice): string {
  return TONE_EMOJI[voice.tone];
}

/** Generate full content props for a block kind from the business profile. */
export function generateBlockProps(kind: BlockKind, business: Business): BlockProps {
  const a = archetypeFor(business);
  switch (kind) {
    case 'navbar':
      return { brand: business.name, links: a.navLinks, ctaLabel: a.primaryCta };
    case 'hero':
      return {
        badge: a.badge,
        headline: a.headline(business),
        subhead: a.subhead(business),
        primaryCta: a.primaryCta,
        secondaryCta: a.secondaryCta,
      };
    case 'features':
      return { items: a.features };
    case 'stats':
      return { stats: a.stats };
    case 'form':
      return { title: a.formTitle, fields: a.fields, submitLabel: a.submitLabel, footnote: a.footnote };
    case 'pricing':
      return { tiers: a.tiers };
    case 'testimonial':
      return { quote: a.quote(business), author: a.author, role: a.role };
    case 'table':
      return { columns: a.columns, rows: a.rows };
    case 'cta':
      return { headline: a.ctaHeadline(business), subhead: a.ctaSubhead, primaryCta: a.primaryCta };
    case 'footer':
      return {
        brand: business.name,
        links: ['Privacy', 'Terms', 'Contact'],
        fineprint: `© 2026 ${business.name}. Made with Felix.`,
      };
  }
}

/** Generate a support/booking chat flow for the business. */
export function generateFlowSteps(
  business: Business,
  voice: Voice,
  makeId: () => string,
): ChatStep[] {
  const a = archetypeFor(business);
  const welcome = makeId();
  const action = makeId();
  const info = makeId();
  const handoff = makeId();
  return [
    {
      id: welcome,
      name: 'Welcome',
      message: voiced(a.chat.welcome(business), voice),
      replies: [
        { label: a.chat.actionLabel, goTo: action },
        { label: a.chat.infoLabel, goTo: info },
        { label: 'Talk to a person', goTo: handoff },
      ],
    },
    {
      id: action,
      name: a.chat.actionLabel,
      message: voiced(a.chat.actionReply(business), voice),
      replies: [{ label: 'Back to start', goTo: welcome }],
    },
    {
      id: info,
      name: a.chat.infoLabel,
      message: voiced(a.chat.infoReply(business), voice),
      replies: [
        { label: a.chat.actionLabel, goTo: action },
        { label: 'Back to start', goTo: welcome },
      ],
    },
    {
      id: handoff,
      name: 'Human handoff',
      message: voiced(
        `No problem — connecting you with the team. Someone from ${business.name} will reply here shortly.`,
        voice,
      ),
      replies: [{ label: 'Back to start', goTo: welcome }],
    },
  ];
}

/**
 * Re-generate content for existing blocks after a rebrand. Structure stays,
 * and hand-edited blocks are preserved unless `force` — human work is sacred.
 */
export function regenerateBlocks(blocks: Block[], business: Business, force = false): Block[] {
  return blocks.map((b) =>
    b.custom && !force ? b : { ...b, props: generateBlockProps(b.kind, business), custom: undefined },
  );
}
