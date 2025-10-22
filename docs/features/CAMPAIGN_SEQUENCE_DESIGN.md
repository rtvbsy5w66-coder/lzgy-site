# Multi-Email Campaign Sequence System

## 📧 Koncepció Áttekintés

Egy profi email marketing automation rendszer, ahol **egy kampány több emailből áll**, amelyek **ütemezett időközönként** kerülnek kiküldésre.

## 🎯 Példa Használati Esetek

### 1. Diák Kampány (4 hetes)
```
📚 "Egyetemisták Kampány"
├── Email #1: Üdvözlő email (azonnal)
├── Email #2: Program bemutató (1 hét múlva)  
├── Email #3: Esemény meghívó (2 hét múlva)
└── Email #4: Zárás, következő lépések (4 hét múlva)
```

### 2. Választási Kampány (3 hetes)
```
🗳️ "Választási Felkészülés"
├── Email #1: Kampány indítás (azonnal)
├── Email #2: Program részletek (1 hét múlva)
├── Email #3: Esemény hírek (2 hét múlva)  
└── Email #4: Szavazásra buzdítás (3 hét múlva)
```

### 3. Esemény Sorozat
```
🎪 "Közösségi Események"
├── Email #1: Esemény bejelentés (azonnal)
├── Email #2: Részletek és regisztráció (3 nap múlva)
├── Email #3: Emlékeztető (1 nappal előtte)
└── Email #4: Köszönő email (1 nap múlva)
```

## 🗄️ Adatbázis Struktúra

### CampaignSequence (Új tábla)
```sql
CREATE TABLE CampaignSequence (
  id                String   @id @default(cuid())
  name             String   -- "Diák Kampány 2025"
  description      String?  -- Kampány leírása
  status           SequenceStatus @default(DRAFT)
  
  -- Célcsoport
  targetAudience   String   -- "STUDENTS", "VOTERS", "ALL"
  audienceFilter   Json?    -- Szűrési feltételek
  
  -- Időzítés
  startDate        DateTime -- Mikor induljon a sorozat
  totalDuration    Int      -- Teljes időtartam napokban
  
  -- Metadata
  createdAt        DateTime @default(now())
  createdBy        String
  isActive         Boolean  @default(true)
  
  -- Kapcsolatok
  emails           SequenceEmail[]
  executions       SequenceExecution[]
}

enum SequenceStatus {
  DRAFT
  SCHEDULED  
  RUNNING
  PAUSED
  COMPLETED
  CANCELLED
}
```

### SequenceEmail (Új tábla)
```sql
CREATE TABLE SequenceEmail (
  id              String   @id @default(cuid())
  sequenceId      String
  sequence        CampaignSequence @relation(fields: [sequenceId], references: [id])
  
  -- Email tartalma
  name           String   -- "Üdvözlő Email"
  subject        String   -- Email tárgy
  content        Text     -- HTML tartalom
  
  -- Időzítés
  order          Int      -- Sorrend (1, 2, 3, 4...)
  delayDays      Int      -- Hány nap múlva (0=azonnal)
  sendTime       String   -- "09:00" - mikor küldje el
  
  -- Feltételek
  conditions     Json?    -- Speciális feltételek
  isActive       Boolean  @default(true)
  
  createdAt      DateTime @default(now())
}
```

### SequenceExecution (Új tábla)
```sql
CREATE TABLE SequenceExecution (
  id              String   @id @default(cuid())
  sequenceId      String
  sequence        CampaignSequence @relation(fields: [sequenceId], references: [id])
  
  -- Címzett
  subscriberEmail String
  subscriberName  String?
  
  -- Státusz
  status          ExecutionStatus @default(ACTIVE)
  currentStep     Int      @default(1)
  startedAt       DateTime @default(now())
  lastEmailSent   DateTime?
  nextEmailDue    DateTime?
  completedAt     DateTime?
  
  -- Tracking
  emailsSent      Int      @default(0)
  emailsOpened    Int      @default(0)
  emailsClicked   Int      @default(0)
  
  -- Logs
  executionLog    SequenceLog[]
}

enum ExecutionStatus {
  ACTIVE
  PAUSED  
  COMPLETED
  CANCELLED
  FAILED
}
```

## 🔄 Működési Logika

### 1. Sequence Létrehozás
```typescript
// Admin felület
const sequence = {
  name: "Diák Kampány 2025",
  startDate: new Date("2025-10-01"),
  targetAudience: "STUDENTS",
  emails: [
    {
      order: 1,
      delayDays: 0,     // azonnal
      subject: "Üdvözlünk a programban!",
      sendTime: "09:00"
    },
    {
      order: 2, 
      delayDays: 7,     // 1 hét múlva
      subject: "Program részletek",
      sendTime: "10:00"
    },
    {
      order: 3,
      delayDays: 14,    // 2 hét múlva  
      subject: "Esemény meghívó",
      sendTime: "09:30"
    }
  ]
}
```

### 2. Automatikus Feldolgozás
```typescript
// Scheduler bővítés
async function processSequences() {
  // 1. Új subscriberek hozzáadása aktív sequence-ekhez
  await enrollNewSubscribers();
  
  // 2. Esedékes emailek kiküldése
  await processDueEmails();
  
  // 3. Sequence státusz frissítése
  await updateSequenceStatus();
}

async function processDueEmails() {
  const dueExecutions = await prisma.sequenceExecution.findMany({
    where: {
      status: 'ACTIVE',
      nextEmailDue: { lte: new Date() }
    },
    include: { sequence: { include: { emails: true } } }
  });
  
  for (const execution of dueExecutions) {
    await sendSequenceEmail(execution);
  }
}
```

## 🎨 Admin Felület Funkciók

### Sequence Builder
```
📝 Campaign Sequence Builder
┌─────────────────────────────────────┐
│ Sequence Name: [Diák Kampány 2025 ] │
│ Target: [🎓 Students            ▼] │ 
│ Start Date: [📅 2025-10-01     📅] │
│                                     │
│ ✉️ Email Sequence:                  │
│ ┌─── Email #1 ─────────────────────┐ │
│ │ Subject: [Üdvözlő email      ] │ │
│ │ Delay: [0] days, Send: [09:00] │ │
│ │ [✏️ Edit] [📋 Preview]        │ │  
│ └───────────────────────────────────┘ │
│ ┌─── Email #2 ─────────────────────┐ │
│ │ Subject: [Program bemutató   ] │ │
│ │ Delay: [7] days, Send: [10:00] │ │
│ │ [✏️ Edit] [📋 Preview]        │ │
│ └───────────────────────────────────┘ │
│ [➕ Add Email] [💾 Save Sequence]   │
└─────────────────────────────────────┘
```

### Sequence Dashboard
```
📊 Active Campaigns Dashboard
┌──────────────────────────────────────────┐
│ 🎓 Diák Kampány      [RUNNING]   156 👤 │
│ ├─ Email #1 (sent)   ✅ 156/156 sent    │  
│ ├─ Email #2 (due)    ⏰ 89 due today    │
│ └─ Email #3 (future) 📅 in 7 days       │
│                                          │
│ 🗳️ Választási Kampány [SCHEDULED] 89 👤 │ 
│ ├─ Email #1          📅 starts Oct 15   │
│ ├─ Email #2          📅 Oct 22          │
│ └─ Email #3          📅 Oct 29          │
│                                          │
│ [🎯 Create New] [📈 Analytics]          │
└──────────────────────────────────────────┘
```

## 🚀 Implementation Plan

### Phase 1: Database & Models
- [ ] Prisma schema bővítése
- [ ] Migration futtatása  
- [ ] TypeScript types generálása

### Phase 2: Core Logic
- [ ] Sequence execution engine
- [ ] Scheduler bővítése
- [ ] Email template system

### Phase 3: Admin UI
- [ ] Sequence builder komponens
- [ ] Dashboard és monitoring
- [ ] Preview és testing

### Phase 4: Advanced Features  
- [ ] Conditional logic
- [ ] A/B testing sequences
- [ ] Performance analytics

## 📈 Fejlett Funkciók (Jövőbeli)

### Conditional Sequences
```typescript
// Feltételes elágazások
if (subscriber.opened_last_email) {
  // Küldj részletesebb tartalmat
  sendEmail("detailed_content.html");
} else {
  // Küldj emlékeztetőt
  sendEmail("reminder.html");
}
```

### Behavior Triggers
```typescript
// Viselkedés alapú triggerek
if (subscriber.clicked_link) {
  // Azonnal küldd a következő emailt
  scheduleImmediate(nextEmail);
}
```

## 🎯 Használati Példa

Egy **4 hetes diák kampány** automatikus felépítése:

1. **Admin** létrehozza a sequence-et
2. **System** automatikusan hozzáadja az összes diák email címet
3. **Scheduler** naponta ellenőrzi ki kap emailt
4. **Analytics** követi a megnyitásokat, klikkeléseket
5. **Auto-completion** amikor minden email elküldve

Ez a rendszer **professzionális email marketing automation** szintet ér el! 🚀