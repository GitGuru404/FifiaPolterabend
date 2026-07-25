import { Challenge, Role, Stats } from './types';

export const INVITE_CODE = 'WEBER2025';
export const GROOM_CODE = 'GROOM99';
export const ADMIN_PASSWORD = 'admin123';

export const STARTING_STATS: Stats = {
  content: 71,
  stamina: 78,
  hairline: 63,
  legend: 74,
  bottle: 72,
  moves: 70,
};

export const PHASES = [
  'Morgenoverraskning',
  'Spray tan & Kostume',
  'Paintball',
  'Park & Beer Olympics',
  'Middag',
  'Partybussen',
  'Klubben',
];

export const INITIAL_CHALLENGES: Omit<Challenge, 'status'>[] = [
  // ── FASE 1 — Morgenoverraskning ──────────────────────────────
  {
    id: 'c1', phase: 0,
    name: 'God morgen, influencer',
    description: 'Film en "morning routine" TikTok i din pyjamas og post den inden for 5 minutter. Ingen redigering. Ingen filtre.',
    rewards: [{ stat: 'content', amount: 3 }],
    penalties: [{ stat: 'content', amount: -2 }],
  },
  {
    id: 'c2', phase: 0,
    name: 'Kærlighed på prøve',
    description: 'Besvar 5 spørgsmål om din kommende kone — stillet af gruppen. Hvert forkert svar: -1 LEGEND.',
    rewards: [{ stat: 'legend', amount: 4 }],
    penalties: [{ stat: 'legend', amount: -1 }],
  },
  {
    id: 'c4', phase: 0,
    name: 'Fremtidsprognoser',
    description: 'Ring til den lokale McDonald\'s på højtaler og prøv at bestille en pizza. Du skal naturligt inddrage din kommende kone i samtalen. Samtalen skal holdes aktiv i mindst 90 sekunder.',
    rewards: [{ stat: 'legend', amount: 3 }],
    penalties: [{ stat: 'legend', amount: -2 }],
  },

  // ── FASE 2 — Spray tan & Kostume ─────────────────────────────
  {
    id: 'c5', phase: 1,
    name: 'Farvernes mester',
    description: 'Film hele spray tan-processen som en dokumentar og post den på Instagram Stories.',
    rewards: [{ stat: 'content', amount: 3 }],
    penalties: [{ stat: 'content', amount: -2 }],
  },
  {
    id: 'c6', phase: 1,
    name: 'Ingen klager',
    description: 'Bær kostume resten af dagen uden én eneste klage. Klager han = øjeblikkeligt -2 BOTTLE.',
    rewards: [{ stat: 'bottle', amount: 2 }],
    penalties: [{ stat: 'bottle', amount: -2 }],
  },
  {
    id: 'c8', phase: 1,
    name: 'Catwalk Weber',
    description: 'Simon går ned ad en improviseret catwalk for gruppen og præsenterer sit kostume-look som haute couture. Gruppen bedømmer 1-10. Under 6 = fejlet.',
    rewards: [{ stat: 'moves', amount: 3 }],
    penalties: [{ stat: 'moves', amount: -2 }],
  },

  // ── FASE 3 — Paintball ────────────────────────────────────────
  {
    id: 'c9', phase: 2,
    name: 'Overleveren',
    description: 'Overlev som primær target i mindst 3 runder uden at give op.',
    rewards: [{ stat: 'stamina', amount: 4 }],
    penalties: [{ stat: 'stamina', amount: -2 }],
  },
  {
    id: 'c11', phase: 2,
    name: 'Fredsmægleren',
    description: 'Simon skal i karakter (kostume på, dramatisk tale) forhandle en 2-minutters våbenhvile med modstanderholdet — alene og ubevæbnet. Modstanderholdet bestemmer om det lykkedes.',
    rewards: [{ stat: 'bottle', amount: 3 }],
    penalties: [{ stat: 'bottle', amount: -2 }],
  },
  {
    id: 'c12', phase: 2,
    name: 'Ensom Ørn',
    description: 'Simon angriber alene mod 3 modstandere. Overlever han 45 sekunder uden at blive ramt = gennemført.',
    rewards: [{ stat: 'stamina', amount: 4 }],
    penalties: [{ stat: 'stamina', amount: -3 }],
  },

  // ── FASE 4 — Park & Beer Olympics ────────────────────────────
  {
    id: 'c13', phase: 3,
    name: 'Morgenløberen',
    description: 'Løb X omgange rundt om parken hurtigere end en tid fastsat af gruppen.',
    rewards: [{ stat: 'stamina', amount: 3 }],
    penalties: [{ stat: 'stamina', amount: -2 }],
  },
  {
    id: 'c14', phase: 3,
    name: 'Øl-diplomat',
    description: 'Vind et beer pong-match mod det stærkeste hold.',
    rewards: [{ stat: 'bottle', amount: 3 }],
    penalties: [{ stat: 'bottle', amount: -2 }],
  },
  {
    id: 'c15', phase: 3,
    name: 'Workout with Weber',
    description: 'Film en 60-sekunders motiverende træningsvideo i parken. Obligatorisk shirtless. Obligatorisk inspirerende tale til kameraet.',
    rewards: [{ stat: 'content', amount: 2 }, { stat: 'moves', amount: 2 }],
    penalties: [{ stat: 'content', amount: -2 }],
  },
  {
    id: 'c16', phase: 3,
    name: 'Blindfoldet Øl-Smagning',
    description: 'Simon skal blindfoldet smage 5 øl og gætte mindst 3 brands korrekt. Gætter han 3+ = klaret.',
    rewards: [{ stat: 'bottle', amount: 4 }],
    penalties: [{ stat: 'bottle', amount: -3 }],
  },
  {
    id: 'c17', phase: 3,
    name: 'Menneskelig Forhindringsbane',
    description: 'Gruppen opstiller en forhindringsbane af mennesker. Simon gennemfører banen på under 60 sekunder — mens han holder en fuld øl uden at spilde.',
    rewards: [{ stat: 'stamina', amount: 3 }, { stat: 'moves', amount: 2 }],
    penalties: [{ stat: 'stamina', amount: -2 }],
  },
  {
    id: 'c18', phase: 3,
    name: 'Pensionering fra løb',
    description: 'Simon laver og poster en Instagram Story der annoncerer hans officielle pensionering fra løb — for evigt. Skal se seriøs ud.',
    rewards: [{ stat: 'content', amount: 4 }],
    penalties: [{ stat: 'content', amount: -3 }],
  },

  // ── FASE 5 — Middag ───────────────────────────────────────────
  {
    id: 'c19', phase: 4,
    name: 'Den spontane tale',
    description: 'Hold en uopfordret tale til gruppen — minimum 2 minutter. Bedømt af alle. Under 5/10 = fejlet.',
    rewards: [{ stat: 'legend', amount: 4 }],
    penalties: [{ stat: 'legend', amount: -2 }],
  },
  {
    id: 'c20', phase: 4,
    name: 'Madmod',
    description: 'Spis/drik hvad Sponsoren bestiller til dig. Ingen forhandling.',
    rewards: [{ stat: 'bottle', amount: 2 }],
    penalties: [{ stat: 'bottle', amount: -2 }],
  },
  {
    id: 'c21', phase: 4,
    name: 'På højtaler',
    description: 'Ring til din forlovede og fortæl hende de 3 ting du elsker mest ved hende — på højtaler foran alle.',
    rewards: [{ stat: 'legend', amount: 3 }],
    penalties: [{ stat: 'legend', amount: -2 }],
  },
  {
    id: 'c22', phase: 4,
    name: 'Quiz-mester',
    description: 'En af gæsterne har forberedt en quiz til middagen. Simon skal vinde quizzen — eller score højere end flertallet af de andre deltagere. Vinder han ikke = fejlet.',
    rewards: [{ stat: 'legend', amount: 4 }],
    penalties: [{ stat: 'legend', amount: -3 }],
  },
  {
    id: 'c23', phase: 4,
    name: 'Konfessionsskabet',
    description: 'Simon fortæller gruppen sin mest pinlige hemmelighed. Gruppen stemmer om den er pinlig nok (over 50% ja = klaret).',
    rewards: [{ stat: 'legend', amount: 3 }],
    penalties: [{ stat: 'legend', amount: -2 }],
  },

  // ── FASE 6 — Partybussen ──────────────────────────────────────
  {
    id: 'c24', phase: 5,
    name: 'Transfer Window',
    description: 'Brudepigernes hold stiller 5 spørgsmål om bruden. Slår hans OVR hendes kort = +4 LEGEND. Gør han ikke = -2 LEGEND.',
    rewards: [{ stat: 'legend', amount: 4 }],
    penalties: [{ stat: 'legend', amount: -2 }],
  },
  {
    id: 'c25', phase: 5,
    name: 'Kærlighedssang',
    description: 'Syng en sang til sin forlovede foran begge grupper. A cappella. Ingen undskyldninger.',
    rewards: [{ stat: 'moves', amount: 2 }, { stat: 'legend', amount: 2 }],
    penalties: [{ stat: 'legend', amount: -2 }],
  },
  {
    id: 'c26', phase: 5,
    name: 'Dobbelt Agent',
    description: 'Simon ringer til sin far på højtaler og fortæller ham, at brylluppet er aflyst. Holder han illusionen i 60 sekunder uden at bryde ud = klaret.',
    rewards: [{ stat: 'bottle', amount: 3 }],
    penalties: [{ stat: 'bottle', amount: -2 }],
  },
  {
    id: 'c27', phase: 5,
    name: 'Brudepige-Godkendelse',
    description: 'Brudepigernes hold stiller Simon 5 personlige spørgsmål han ikke må svare ja/nej på. Stopper han op eller bruger ja/nej = -1 LEGEND per fejl.',
    rewards: [{ stat: 'legend', amount: 4 }],
    penalties: [{ stat: 'legend', amount: -1 }],
  },

  // ── FASE 7 — Klubben: BOSS ────────────────────────────────────
  {
    id: 'c28', phase: 6,
    name: 'ICON Challenge',
    description: 'Hemmelig udfordring designet af brudepigerne — afsløret ved midnat. Fuldfører Simon den: OVR → 99, kortet opgraderes til ICON-status, og han bliver SIMON WEBER VALENTIN.',
    rewards: [
      { stat: 'content', amount: 5 },
      { stat: 'stamina', amount: 5 },
      { stat: 'legend', amount: 5 },
      { stat: 'bottle', amount: 5 },
      { stat: 'moves', amount: 5 },
    ],
    penalties: [],
    isBossChallenge: true,
  },
];

// Exactly 14 roles — one per guest. Roles are permanent for the whole event.
// The 4 "defensive" roles are distinct by timing: Veto/Læge = before, Fysio/VAR = after failure.
export const ROLES: Role[] = [
  // ── OFFENSIVE / NEUTRAL ──────────────────────────────────────
  {
    id: 'manager',
    name: 'Manager',
    description: 'Fordobler stat-belønningen på én udfordring — aktiveres inden udfordringen afsluttes',
    powerType: 'double_reward',
  },
  {
    id: 'assistant_manager',
    name: 'Assisterende Manager',
    description: 'Bytter én aktiv udfordring ud med en alternativ — aktiveres inden Simon begynder',
    powerType: 'swap_challenge',
  },
  {
    id: 'agent',
    name: 'Agent',
    description: 'Forhandler en lettere version af én aktiv udfordring — du bestemmer hvilken betingelse der lempes',
    powerType: 'downgrade_challenge',
  },
  {
    id: 'ultras',
    name: 'Ultras',
    description: 'Tilføjer én ekstra betingelse der gør udfordringen sværere — du bestemmer hvad Simon også skal gøre',
    powerType: 'upgrade_challenge',
  },
  {
    id: 'captain',
    name: 'Kaptajn',
    description: 'Udløser en spontan gruppe-mod-Simon ekstra-udfordring — du bestemmer selv hvad Simon skal præstere',
    powerType: 'group_challenge',
  },
  {
    id: 'referee',
    name: 'Dommer',
    description: 'Afgør med endelig myndighed alle tvivlsspørgsmål om én udfordring — din dom kan ikke ankes',
    powerType: 'judge',
  },
  {
    id: 'commentator',
    name: 'Kommentator',
    description: 'Kommenterer én udfordring live og højt — Simon skal fuldføre uden at reagere på dine kommentarer',
    powerType: 'commentate',
  },
  {
    id: 'sponsor',
    name: 'Sponsor',
    description: 'Bestemmer hvad Simon drikker til den næste udfordring (påvirker BOTTLE)',
    powerType: 'assign_drink',
  },
  {
    id: 'reporter',
    name: 'Transfer Deadline Reporter',
    description: 'Tilføjer en selvvalgt countdown-timer til én udfordring — overskrider Simon tiden tæller det som fejlet',
    powerType: 'add_timer',
  },
  {
    id: 'gk_coach',
    name: 'Målmandstræner',
    description: 'Tilføjer et ekstra fysisk eller præstationsbaseret krav til én udfordring',
    powerType: 'add_physical',
  },

  // ── DEFENSIVE — fire distinct timings/effects ─────────────────
  {
    id: 'veto',
    name: 'Vetoretten',
    // Used BEFORE challenge starts — cancels it, roleHolder defines a brand new challenge instead
    description: 'Annullerer én udfordring INDEN den begynder — og du definerer selv en helt ny udfordring der kører i stedet. Admin registrerer den nye udfordring manuelt.',
    powerType: 'veto_challenge',
  },
  {
    id: 'medic',
    name: 'Læge',
    // Used BEFORE challenge — Simon gets a drink he must finish simultaneously
    description: 'Udskrives INDEN en udfordring: du vælger en drink som Simon skal indtage som "medicin" sideløbende med udfordringen. Drikken skal være færdig inden udfordringen slutter.',
    powerType: 'immunity',
  },
  {
    id: 'physio',
    name: 'Fysioterapeut',
    // Used AFTER Simon fails — removes the stat penalty, but challenge stays failed
    description: 'Simon er for skadet til at klare det alene! Bruges INDEN en udfordring: du erklærer Simon ude af stand og udpeger én person fra gruppen der SKAL hjælpe ham — uanset om de meldte sig eller ej.',
    powerType: 'remove_penalty',
  },
  {
    id: 'var_judge',
    name: 'VAR-dommer',
    // Used AFTER any result — reverses it AND roleHolder adds a custom penalty or reward
    description: 'VAR har set det igen! Bruges EFTER en udfordring: vender resultatet (klaret→fejlet eller fejlet→klaret) OG du bestemmer selv én ekstra belønning eller straf som admin tilføjer manuelt.',
    powerType: 'overturn_fail',
  },
];
