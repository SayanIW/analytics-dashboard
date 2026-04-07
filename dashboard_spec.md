# JarrettFord Dashboard — Complete Technical Specification
> Use this document to replicate the full dashboard in React.js.

---

## 1. Tech Stack (Current HTML Version)

| Layer | Technology |
|---|---|
| CSS Framework | Tailwind CSS (CDN, custom config) |
| Icons | FontAwesome 6.4.0 |
| Font | Inter (Google Fonts — 400, 500, 600, 700) |
| Charts | Chart.js (CDN) |
| Auth | `localStorage` (`isAuthenticated: 'true'`) |
| Data | GoHighLevel (GHL) REST API |

---

## 2. Design System / Tokens

All colors, fonts and animations are consistent across every page.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#8b5cf6` | Active nav, buttons, badges, chart color |
| `surface` | `#18181b` | Cards, sidebar, table, modal backgrounds |
| `background` | `#09090b` | Page body background |
| `bordercolor` | `#27272a` | All borders |
| `textMain` | `#ffffff` | Main text |
| `textMuted` | `#a1a1aa` | Secondary / helper text |
| `accentGreen` | `#bef264` | Appointments active state & KPI |
| `accentRed` | `#ef4444` | Error states, sign-out hover |
| Facebook Blue | `#1877F2` | Social Messages page accent |

### Background

```css
body {
  background-color: #09090b;
  background-image:
    radial-gradient(at 0% 0%, rgba(190, 242, 100, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.08) 0px, transparent 50%);
  background-attachment: fixed;
}
```

### Key CSS Classes

| Class | Effect |
|---|---|
| `.kpi-card` | Glassmorphism card with `backdrop-filter: blur(12px)`, hover lifts `translateY(-4px)` + purple glow |
| `.placeholder-glow` | Pulsing skeleton loader animation (`background-color` keyframe from `#0d0d0f` → `#1a1a1d`) |
| `aside` | Glassmorphism: `background: rgba(18,18,20,0.8)`, `backdrop-filter: blur(20px)` |
| `thead` | `background-color: #8b5cf6 !important`, all text white, 10px uppercase |
| `tbody tr:hover` | `background: rgba(139,92,246,0.05)` |

### Typography

- Font: `Inter`, `sans-serif`
- Font sizes: `text-sm` (14px base), `text-xs` (12px), `text-[10px]` (10px) for labels
- Headings: `text-2xl font-bold` for page titles

---

## 3. Global Layout

Every authenticated page uses a two-column flex layout:

```
┌─────────────────────┬──────────────────────────────────────────┐
│  SIDEBAR (w-64,     │  MAIN CONTENT (flex-1, p-8, overflow-y)  │
│  sticky, h-screen)  │                                           │
└─────────────────────┴──────────────────────────────────────────┘
```

- **Outer wrapper**: `<div class="flex min-h-screen">`
- **Sidebar**: `<aside class="w-64 bg-surface border-r border-bordercolor flex flex-col sticky top-0 h-screen">`
- **Main**: `<main class="flex-1 p-8 overflow-y-auto">`
- Login page: standalone centered card, full screen, no sidebar.

---

## 4. Sidebar

### Structure

```
[Logo Icon] JarrettFord
──────────────────────
[icon] Dashboard
[icon] AI Calls ▾
    ├─ Inbound
    └─ Outbound
[icon] Leads
[icon] Appointments
[icon] Web Chats
[icon] Social Messages
[icon] AI Agents           ← link in aicalls/leads/appointments sidebar, agents.html (not built yet)
──────────────────────
[→] Sign Out
```

### Logo

- Container: `w-8 h-8 rounded-lg bg-primary` (purple square)
- Icon: `fa-solid fa-microphone-lines` (white)
- Text: `JarrettFord` bold, 14px

### Nav Items

Each nav link: `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium`

**Active state**: `bg-primary/10 text-primary font-semibold`  
**Inactive state**: `text-textMuted hover:text-textMain hover:bg-gray-50/10`

### AI Calls Submenu

AI Calls is an expandable collapsible group:
- Toggle button with chevron icon (rotates 180° when open)
- Submenu: `pl-11 space-y-1`
- Sub-links: `aicalls.html?type=inbound` and `aicalls.html?type=outbound`
- Active sub-link gets `text-primary font-bold`

```javascript
// Toggle logic
function toggleSubmenu(id) {
  const menu = document.getElementById(id);
  const chevron = document.getElementById('aicalls-chevron');
  menu.classList.toggle('hidden');
  chevron.style.transform = menu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}
```

### Sign Out

```javascript
function logout() {
  localStorage.removeItem('isAuthenticated');
  window.location.href = 'login.html';
}
```

---

## 5. Authentication

### Login Page (`login.html`)

**Route**: `/login.html`  
**Redirect logic**: Every authenticated page checks at page load:

```javascript
if (localStorage.getItem('isAuthenticated') !== 'true') {
  window.location.href = 'login.html';
}
```

**Login form logic** (hardcoded credentials):

```javascript
if (user === 'admin' && pass === 'demo123') {
  localStorage.setItem('isAuthenticated', 'true');
  window.location.href = 'index.html';
} else {
  // Show error, shake animation
}
```

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `demo123` |

**UI Elements**:
- Glassmorphism card: `background: rgba(24,24,27,0.6)`, `backdrop-filter: blur(12px)`
- Logo icon, "Welcome Back" h1, branded sub-label "JarrettFord"
- Username input, password input
- Error div: hidden by default, red with shake animation on wrong credentials
- Submit button: `bg-primary` purple, `shadow-primary/20`

---

## 6. Pages

### 6.1 Dashboard (`index.html`)

**Route**: `/index.html`  
**Script**: `app.js`  
**Title**: "JarrettFord Dashboard"  
**Subtitle**: "Monitor your AI call performance"

#### Layout

```
[KPI Grid — 4 cards in 2×2 / 4×1 at md]
[Line Chart — "Calls Completed"]
[KPI Row 2 — 2 cards: Avg Duration + Quick Link]
```

#### KPI Cards

| ID | Label | Color Accent | Value Source |
|---|---|---|---|
| `kpi-total-calls` | Total Calls | `primary` purple | `data.total` from Calls API |
| `kpi-web-chats` | Web Chats | `accentGreen` lime | `data.total` from WebChats API |
| `kpi-total-duration` | Total Duration | `blue-400` | Sum of `log.duration` in seconds → minutes |
| `kpi-actions` | Actions Triggered | `orange-400` | Sum of `log.executedCallActions.length` |
| `kpi-avg-duration` | Avg Call Duration | `purple-400` | Average of durations |

All KPIs use `.placeholder-glow` skeleton state while loading.

#### Chart

- Library: **Chart.js**
- Type: `line`
- Canvas ID: `callsChart`
- X-axis: Time of each call (`HH:MM`)
- Y-axis: Duration in seconds
- Color: `#8b5cf6` line, gradient fill: `rgba(139,92,246,0.35)` → `transparent`
- No legend, custom dark tooltip

#### Modal (Global)

Used on this page for any expandable data (summary/transcript from calls). Reused pattern across pages.

```html
<div id="data-modal" class="fixed inset-0 z-[100] bg-black/40 ...opacity-0 pointer-events-none">
  <div id="data-modal-content" class="bg-surface max-w-2xl rounded-xl ...scale-95">
    <!-- Header -->
    <div>
      <h2 id="modal-title">...</h2>
      <p id="modal-subtitle">...</p>
      <button onclick="closeModal()">✕</button>
    </div>
    <!-- Body -->
    <div id="modal-body-scroll" class="max-h-[60vh] overflow-y-auto">
      <div id="modal-pill">Translated Content</div>
      <div id="modal-text">...</div>
    </div>
  </div>
</div>
```

---

### 6.2 AI Calls (`aicalls.html`)

**Route**: `/aicalls.html?type=inbound` or `?type=outbound`  
**Script**: `aicalls.js`  
**Title**: Dynamic — "AI Calls - Inbound" or "AI Calls - Outbound"  
**Subtitle**: "Monitor your artificial intelligence conversations"

#### Header Controls

Date range filter bar (in the page header, right-aligned):
- "From" date picker (`filter-startDate`)
- "To" date picker (`filter-endDate`)
- "Apply" button → triggers `fetchData(1)` with `startDate` and `endDate` as Unix timestamps
- "Clear" button → resets filters, refetches

#### Table Columns

| Column | Source Field |
|---|---|
| Agent Name | `log.agentName` or `log.agentId` |
| Contact Name | `log.extractedData?.name` |
| Phone Number | `log.fromNumber` |
| Date and Time | `log.createdAt` (formatted: `DD Mon YYYY` + time) |
| Duration | `log.duration` (seconds → `MM:SS`) |
| Actions Triggered | `log.executedCallActions.length` |
| Actions | "Summary" button + "Transcript" icon button |

#### Row Actions (Modal)

- **Summary button** → opens modal with `log.summary`
- **Transcript button** (file icon) → opens modal, parses `log.transcript` line-by-line:
  - `bot:` prefix → purple AI bubble (right align)
  - `human:` prefix → gray user bubble (left align)

#### Pagination

- Type: **Page-number based**
- State: `page`, `pageSize: 10`, `total`
- Total pages = `Math.ceil(total / pageSize)`
- Shows: Previous, page numbers (window of 5), Next
- Active page: `bg-primary text-white`

---

### 6.3 Leads (`leads.html`)

**Route**: `/leads.html`  
**Script**: `leads.js`  
**Title**: "Leads"  
**Subtitle**: "Manage your contacts from HighLevel"

#### Search

- Real-time search input (debounced 500ms)
- Resets cursor pagination and refetches on change
- Query param: `&query=<encoded string>`

#### Table Columns

| Column | Source Field |
|---|---|
| Name | `contact.firstName + lastName` or `contact.name` |
| Email | `contact.email` |
| Source | `contact.source` |
| Country | `contact.country` |
| Appointment | Async fetch per contact (see below) |
| Date Added | `contact.dateAdded` |

#### Appointment Column (Per-Row Async Fetch)

Each row triggers a separate appointment lookup after the row renders:
- Shows spinner while loading
- Displays first appointment title + start time + status
- Falls back to "No appointments"

#### Pagination

- Type: **Cursor-based** (GHL contacts API)
- Uses `startAfterId` + `startAfter` (timestamp of last contact's `dateAdded`)
- History stack for Previous button
- Shows: Previous / Next only

---

### 6.4 Appointments (`appointments.html`)

**Route**: `/appointments.html`  
**Script**: `appointments.js`  
**Title**: "Appointments"  
**Subtitle**: "Scheduled appointments from HighLevel contacts"  
**Active accent**: `accentGreen` (#bef264) instead of `primary` purple

#### Flow

1. Fetch contacts page (cursor-based, limit 20)
2. For each contact, concurrently fetch their appointments
3. Flatten all events, filter `deleted !== true`, sort by `startTime` descending

#### Table Columns

| Column | Source Field |
|---|---|
| Contact | `contact.firstName + lastName` + phone below |
| Email | `contact.email` |
| Appointment Title | `appt.title` |
| Status | `appt.appointmentStatus` (badge) |
| Start Time | `appt.startTime` |
| End Time | `appt.endTime` |
| Calendar | `appt.calendarId` (monospaced, truncated) |

#### Status Badges

| Value | Color |
|---|---|
| `confirmed` | Green (`bg-green-500/10 text-green-400`) |
| `cancelled` | Red (`bg-red-500/10 text-accentRed`) |
| `showed` | Blue (`bg-blue-500/10 text-blue-400`) |
| `noshow` | Orange (`bg-orange-500/10 text-orange-400`) |
| `new` | Purple (`bg-primary/10 text-primary`) |

---

### 6.5 Web Chats (`webchats.html`)

**Route**: `/webchats.html`  
**Script**: `webchats.js`  
**Title**: "Web Chats"  
**Subtitle**: "Live chat conversations from your website"

#### Table Columns

| Column | Source Field |
|---|---|
| Full Name | `conv.fullName` |
| Contact Name | `conv.contactName` |
| Email | `conv.email` |
| Phone | `conv.phone` |
| Last Message | `conv.lastMessageBody` (truncated) |
| Unread | `conv.unreadCount` (purple badge) |
| Actions | "View Info" button → opens message modal |

#### Message Modal

Clicking "View Info" opens a chat-style modal:
1. Shows user name + "email • phone"
2. Fetches full conversation messages
3. Renders bubble UI (outbound = purple right, inbound = gray left)
4. Auto-scrolls to bottom
5. Shows message count

---

### 6.6 Social Messages (`socialmessages.html`)

**Route**: `/socialmessages.html`  
**Script**: `socialmessages.js`  
**Title**: "Social Messages"  
**Subtitle**: "Facebook messages via HighLevel"  
**Accent**: Facebook Blue `#1877F2`

Identical layout and modal to Web Chats. Differences:
- Unread count badge: `bg-[#1877F2]` (blue instead of purple)
- Contact avatar: `bg-blue-500/20 text-blue-400` with Facebook icon badge overlay
- "View Info" button: `bg-blue-500/20 text-blue-400 hover:bg-[#1877F2] hover:text-white`
- Outbound messages: `bg-[#1877F2]` bubble

---

## 7. API Reference

### 7.1 Credentials

#### Calls / AI Calls / Leads / Appointments

| Field | Value |
|---|---|
| Location ID | `0BL2s1FXz9zqmSGr7yns` |
| Bearer Token | `pit-b9cfd4b2-394a-4dc2-a5fe-08373f52bb96` |

#### Web Chats / Social Messages

| Field | Value |
|---|---|
| Location ID | `wJ5RzgK5QWJOkfK65b06` |
| Bearer Token | `pit-80915d73-a3b5-4c75-bc78-34750b1c2537` |

#### Common Header

```http
Accept: application/json
Authorization: Bearer <token>
version: 2021-04-15
```

---

### 7.2 API Endpoints

#### A. Voice AI Call Logs

**Used by**: Dashboard (KPIs + Chart), AI Calls page

```
GET https://services.leadconnectorhq.com/voice-ai/dashboard/call-logs
```

**Query Parameters**:

| Param | Type | Description |
|---|---|---|
| `locationId` | string | required, `0BL2s1FXz9zqmSGr7yns` |
| `page` | number | Page number (1-based) |
| `pageSize` | number | Results per page (default: 10) |
| `startDate` | number | Unix timestamp in ms (optional) |
| `endDate` | number | Unix timestamp in ms (optional) |

**Full Example Request (Dashboard)**:
```
GET https://services.leadconnectorhq.com/voice-ai/dashboard/call-logs?locationId=0BL2s1FXz9zqmSGr7yns&page=1&pageSize=10
Authorization: Bearer pit-b9cfd4b2-394a-4dc2-a5fe-08373f52bb96
version: 2021-04-15
```

**Full Example Request (AI Calls with date filter)**:
```
GET https://services.leadconnectorhq.com/voice-ai/dashboard/call-logs?locationId=0BL2s1FXz9zqmSGr7yns&page=2&pageSize=10&startDate=1711929600000&endDate=1712015999000
Authorization: Bearer pit-b9cfd4b2-394a-4dc2-a5fe-08373f52bb96
version: 2021-04-15
```

**Sample Response**:

```json
{
  "callLogs": [
    {
      "id": "abc123",
      "agentId": "agent_xyz",
      "agentName": "Sales Agent",
      "fromNumber": "+15551234567",
      "toNumber": "+15559876543",
      "createdAt": "2024-04-01T14:30:00.000Z",
      "duration": 185,
      "summary": "The caller was interested in pricing for the Pro plan. Transferred to sales team.",
      "transcript": "bot: Hello, how can I help you today?\nhuman: I want to know about your pricing\nbot: Sure! We have three plans...",
      "extractedData": {
        "name": "John Smith",
        "email": "john@example.com",
        "phone": "+15551234567"
      },
      "executedCallActions": [
        { "actionType": "send_email", "timestamp": "2024-04-01T14:35:00Z" },
        { "actionType": "create_contact", "timestamp": "2024-04-01T14:35:05Z" }
      ]
    }
  ],
  "total": 247,
  "page": 1,
  "pageSize": 10
}
```

**Fields Used**:

| Field | Usage |
|---|---|
| `callLogs` | Array of call records |
| `total` | Total count for KPI + pagination |
| `page` | Current page |
| `log.agentName` / `log.agentId` | Agent column |
| `log.extractedData.name` | Contact name column |
| `log.fromNumber` | Phone number column |
| `log.createdAt` | Date/time column |
| `log.duration` | Duration (seconds) |
| `log.executedCallActions` | Action count |
| `log.summary` | Summary modal content |
| `log.transcript` | Transcript modal content |

---

#### B. Contacts (Leads / Appointments)

**Used by**: Leads page, Appointments page

```
GET https://services.leadconnectorhq.com/contacts/
```

**Query Parameters**:

| Param | Type | Description |
|---|---|---|
| `locationId` | string | required, `0BL2s1FXz9zqmSGr7yns` |
| `limit` | number | Results per page (default: 20) |
| `query` | string | Search term (optional) |
| `startAfterId` | string | Contact ID for cursor forward pagination |
| `startAfter` | number | Unix timestamp of last contact's `dateAdded` |

**Full Example Request**:
```
GET https://services.leadconnectorhq.com/contacts/?locationId=0BL2s1FXz9zqmSGr7yns&limit=20
Authorization: Bearer pit-b9cfd4b2-394a-4dc2-a5fe-08373f52bb96
version: 2021-04-15
```

**Sample Response**:

```json
{
  "contacts": [
    {
      "id": "contact_001",
      "firstName": "Jane",
      "lastName": "Doe",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+15550001111",
      "source": "Facebook",
      "country": "US",
      "dateAdded": "2024-03-15T10:00:00.000Z",
      "tags": ["lead", "hot"]
    }
  ],
  "meta": {
    "total": 512,
    "nextPageUrl": null
  },
  "count": 20
}
```

**Fields Used**:

| Field | Usage |
|---|---|
| `contacts` | Array of contact objects |
| `meta.total` or `count` | Total count |
| `contact.id` | Used for appointment lookup |
| `contact.firstName` + `lastName` | Name display |
| `contact.email` | Email column |
| `contact.source` | Source column |
| `contact.country` | Country column |
| `contact.dateAdded` | Date added + cursor pagination |
| `contact.phone` | Phone (Appointments page) |

---

#### C. Contact Appointments

**Used by**: Leads page (per-row async), Appointments page (batch concurrent)

```
GET https://services.leadconnectorhq.com/contacts/{contactId}/appointments
```

**Headers**: Same credentials

**Note**: API version `2021-07-28` is used in the Leads per-row fetch; `2021-04-15` in the Appointments batch fetch.

**Full Example Request**:
```
GET https://services.leadconnectorhq.com/contacts/contact_001/appointments
Authorization: Bearer pit-b9cfd4b2-394a-4dc2-a5fe-08373f52bb96
version: 2021-07-28
```

**Sample Response**:

```json
{
  "events": [
    {
      "id": "appt_001",
      "title": "Discovery Call",
      "startTime": "2024-04-05T15:00:00.000Z",
      "endTime": "2024-04-05T15:30:00.000Z",
      "appointmentStatus": "confirmed",
      "calendarId": "cal_xyz123",
      "deleted": false
    }
  ]
}
```

**Fields Used**:

| Field | Usage |
|---|---|
| `events` | Array of appointment objects |
| `appt.title` | Appointment title |
| `appt.startTime` | Start time |
| `appt.endTime` | End time |
| `appt.appointmentStatus` | Status badge |
| `appt.calendarId` | Calendar column |
| `appt.deleted` | Filtered out if `true` |

---

#### D. Conversations Search

**Used by**: Dashboard (web chats KPI count), Web Chats page, Social Messages page

```
GET https://services.leadconnectorhq.com/conversations/search
```

**Credentials**: `wJ5RzgK5QWJOkfK65b06` / `pit-80915d73-a3b5-4c75-bc78-34750b1c2537`

**Query Parameters**:

| Param | Type | Description |
|---|---|---|
| `locationId` | string | required, `wJ5RzgK5QWJOkfK65b06` |
| `limit` | number | Results per page (default: 20) |
| `lastMessageType` | string | `TYPE_LIVE_CHAT` (Web Chats) or `TYPE_FACEBOOK` (Social) |
| `query` | string | Search term (optional) |
| `startAfterDate` | string | `lastMessageDate` of last conversation |
| `id` | string | ID of last conversation (for cursor) |

**Web Chats Request**:
```
GET https://services.leadconnectorhq.com/conversations/search?locationId=wJ5RzgK5QWJOkfK65b06&limit=20&lastMessageType=TYPE_LIVE_CHAT
Authorization: Bearer pit-80915d73-a3b5-4c75-bc78-34750b1c2537
Version: 2021-04-15
```

**Social Messages Request**:
```
GET https://services.leadconnectorhq.com/conversations/search?locationId=wJ5RzgK5QWJOkfK65b06&limit=20&lastMessageType=TYPE_FACEBOOK
Authorization: Bearer pit-80915d73-a3b5-4c75-bc78-34750b1c2537
Version: 2021-04-15
```

**Dashboard KPI (count only)**:
```
GET https://services.leadconnectorhq.com/conversations/search?locationId=wJ5RzgK5QWJOkfK65b06&limit=1&lastMessageType=TYPE_LIVE_CHAT
```

**Sample Response**:

```json
{
  "conversations": [
    {
      "id": "conv_001",
      "contactId": "contact_001",
      "fullName": "Jane Doe",
      "contactName": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+15550001111",
      "lastMessageBody": "Hi, I have a question about your services.",
      "lastMessageDate": "2024-04-01T14:00:00.000Z",
      "unreadCount": 2,
      "type": "live_chat"
    }
  ],
  "total": 85
}
```

**Fields Used**:

| Field | Usage |
|---|---|
| `conversations` | Array of conversation objects |
| `total` | Total count (KPI + pagination) |
| `conv.fullName` | Name column |
| `conv.contactName` | Contact name column |
| `conv.email` | Email column |
| `conv.phone` | Phone column |
| `conv.lastMessageBody` | Last message preview |
| `conv.unreadCount` | Unread badge |
| `conv.lastMessageDate` | Cursor for next-page pagination |
| `conv.id` | Used for message fetch modal |

---

#### E. Conversation Messages (Modal)

**Used by**: Web Chats modal, Social Messages modal

```
GET https://services.leadconnectorhq.com/conversations/{conversationId}/messages
```

**Same credentials as conversations** (webchats/social bearer token).

**Full Example Request**:
```
GET https://services.leadconnectorhq.com/conversations/conv_001/messages
Authorization: Bearer pit-80915d73-a3b5-4c75-bc78-34750b1c2537
Version: 2021-04-15
```

**Sample Response**:

```json
{
  "messages": {
    "messages": [
      {
        "id": "msg_001",
        "body": "Hi, I have a question about your services.",
        "direction": "inbound",
        "status": "delivered",
        "dateAdded": "2024-04-01T14:00:00.000Z",
        "messageType": "TYPE_LIVE_CHAT"
      },
      {
        "id": "msg_002",
        "body": "Hello! I'd be happy to help. What would you like to know?",
        "direction": "outbound",
        "status": "sent",
        "dateAdded": "2024-04-01T14:01:00.000Z",
        "messageType": "TYPE_LIVE_CHAT"
      }
    ]
  }
}
```

**Fields Used**:

| Field | Usage |
|---|---|
| `messages.messages` | Nested array of message objects |
| `msg.body` | Message text |
| `msg.direction` | `inbound` = left bubble, `outbound` = right bubble |
| `msg.status` | Shown below bubble |
| `msg.dateAdded` | Timestamp, sorted ascending |

---

## 8. Pagination Patterns

| Page | Type | Key Params |
|---|---|---|
| AI Calls | Page number | `page`, `pageSize` → `total / pageSize` pages |
| Leads | Cursor (Next/Prev only) | `startAfterId`, `startAfter` (timestamp), history stack |
| Appointments | Cursor (contacts load, appointments inline) | Same as Leads |
| Web Chats | Cursor (Next/Prev only) | `startAfterDate`, `id`, history stack |
| Social Messages | Cursor (Next/Prev only) | Same as Web Chats |

---

## 9. Loading States

All data pages use skeleton rows while fetching:

```javascript
function renderSkeletons() {
  // 5-8 rows with .placeholder-glow divs
  // Each cell has a div with fixed width, h-4, rounded, placeholder-glow class
}
```

The `placeholder-glow` class runs a 2s infinite keyframe:
```css
@keyframes placeholderGlow {
  0%   { background-color: #0d0d0f; }
  50%  { background-color: #1a1a1d; }
  100% { background-color: #0d0d0f; }
}
```

---

## 10. React.js Migration Guide

### Recommended Structure

```
src/
├── components/
│   ├── Sidebar.jsx          ← Shared sidebar with submenu toggle
│   ├── Modal.jsx            ← Generic modal (summary/transcript/chat)
│   ├── SkeletonTable.jsx    ← Reusable skeleton loader
│   ├── StatusBadge.jsx      ← Appointment status badges
│   └── ChatBubble.jsx       ← Message bubble component
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx        ← KPIs + Chart
│   ├── AiCalls.jsx          ← ?type=inbound|outbound via useSearchParams
│   ├── Leads.jsx
│   ├── Appointments.jsx
│   ├── WebChats.jsx
│   └── SocialMessages.jsx
├── hooks/
│   ├── useCallLogs.js       ← Calls API with page + date filters
│   ├── useContacts.js       ← Contacts cursor pagination
│   ├── useConversations.js  ← Conversations with type filter
│   └── useMessages.js       ← Per-conversation messages
├── context/
│   └── AuthContext.jsx      ← isAuthenticated + logout
├── constants/
│   └── api.js               ← All API URLs + credentials
└── styles/
    └── index.css            ← Global CSS tokens + custom classes
```

### Auth in React

```jsx
// AuthContext.jsx
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const login = (user, pass) => {
    if (user === 'admin' && pass === 'demo123') {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };
  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}
```

### API Constants

```javascript
// constants/api.js
export const CALLS_API = {
  BASE_URL: 'https://services.leadconnectorhq.com/voice-ai/dashboard/call-logs',
  LOCATION_ID: '0BL2s1FXz9zqmSGr7yns',
  TOKEN: 'pit-b9cfd4b2-394a-4dc2-a5fe-08373f52bb96',
  VERSION: '2021-04-15',
};

export const CONTACTS_API = {
  BASE_URL: 'https://services.leadconnectorhq.com/contacts/',
  LOCATION_ID: '0BL2s1FXz9zqmSGr7yns',
  TOKEN: 'pit-b9cfd4b2-394a-4dc2-a5fe-08373f52bb96',
  VERSION: '2021-04-15',
};

export const CONVERSATIONS_API = {
  BASE_URL: 'https://services.leadconnectorhq.com/conversations/search',
  MESSAGES_URL: 'https://services.leadconnectorhq.com/conversations',
  LOCATION_ID: 'wJ5RzgK5QWJOkfK65b06',
  TOKEN: 'pit-80915d73-a3b5-4c75-bc78-34750b1c2537',
  VERSION: '2021-04-15',
};
```

### Tailwind Config (React equivalent)

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8b5cf6',
        surface: '#18181b',
        background: '#09090b',
        bordercolor: '#27272a',
        textMain: '#ffffff',
        textMuted: '#a1a1aa',
        accentGreen: '#bef264',
        accentRed: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
};
```

### Routing (React Router v6)

```jsx
// App.jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<PrivateRoute />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/aicalls" element={<AiCalls />} />  {/* useSearchParams for ?type= */}
    <Route path="/leads" element={<Leads />} />
    <Route path="/appointments" element={<Appointments />} />
    <Route path="/webchats" element={<WebChats />} />
    <Route path="/socialmessages" element={<SocialMessages />} />
  </Route>
</Routes>
```

### Chart.js in React

```jsx
// In Dashboard.jsx
import { Line } from 'react-chartjs-2';

const chartData = {
  labels: callLogs.map(log => formatTime(log.createdAt)),
  datasets: [{
    label: 'Call Duration (s)',
    data: callLogs.map(log => log.duration || 0),
    borderColor: '#8b5cf6',
    backgroundColor: createGradient(ctx), // canvas gradient
    borderWidth: 2,
    pointRadius: 0,
    fill: true,
    tension: 0.4,
  }],
};
```

---

## 11. File Inventory

| File | Role |
|---|---|
| `login.html` | Login page |
| `index.html` | Dashboard overview |
| `app.js` | Dashboard JS logic |
| `aicalls.html` | AI Calls list page |
| `aicalls.js` | AI Calls logic (fetch, filter, modal, pagination) |
| `leads.html` | Leads/contacts list page |
| `leads.js` | Leads logic (fetch, search, per-row appointment, cursor pagination) |
| `appointments.html` | Appointments page |
| `appointments.js` | Appointments logic (2-step: contacts → appointments, concurrent) |
| `webchats.html` | Web Chats page |
| `webchats.js` | Web Chats logic (fetch, message modal, cursor pagination) |
| `socialmessages.html` | Social Messages (Facebook) page |
| `socialmessages.js` | Social Messages logic (same as webchats, FB accent) |
| `styles.css` | Global CSS: body bg, kpi-card, skeleton, scrollbar, table |
