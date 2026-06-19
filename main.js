import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  COMMISSION_COLLECTION_ID,
  CONTACT_COLLECTION_ID,
  PROJECTS_COLLECTION_ID,
} from './config.js';

const { Client, Databases, ID, Query } = window.Appwrite;

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const db = new Databases(client);

// ── Fallback project data ──────────────────────────────────

const FALLBACK = [
  {
    title: 'Combat Framework',
    description: 'Lag-compensated hitbox system with per-player hit tracking and exploit validation on the server.',
    tags: ['Combat', 'OOP', 'Networking'],
    videoUrl: '',
    codeSnippet:
`local HitboxService = {}
HitboxService.__index = HitboxService

function HitboxService.new(caster: Model)
    return setmetatable({ caster = caster, seen = {} }, HitboxService)
end

function HitboxService:cast(origin: Vector3, range: number): {Model}
    local hits = {}
    for _, player in Players:GetPlayers() do
        if player.Character == self.caster then continue end
        local root = player.Character:FindFirstChild("HumanoidRootPart")
        if root and (root.Position - origin).Magnitude <= range then
            if not self.seen[player.UserId] then
                self.seen[player.UserId] = true
                table.insert(hits, player.Character)
            end
        end
    end
    return hits
end

return HitboxService`,
  },
  {
    title: 'DataStore Service',
    description: 'DataStore wrapper with exponential backoff retry logic, session locking, and automatic migration support.',
    tags: ['DataStore', 'Module', 'Backend'],
    videoUrl: '',
    codeSnippet:
`local DataService = {}
local MAX_RETRIES = 3

local function withRetry(fn: () -> any): (boolean, any)
    for i = 1, MAX_RETRIES do
        local ok, result = pcall(fn)
        if ok then return true, result end
        task.wait(2 ^ (i - 1))
    end
    return false, nil
end

function DataService:load(userId: number): table
    local ok, data = withRetry(function()
        return PlayerStore:GetAsync(tostring(userId))
    end)
    return ok and data or table.clone(DEFAULT_DATA)
end

function DataService:save(userId: number, data: table): boolean
    local ok = withRetry(function()
        PlayerStore:SetAsync(tostring(userId), data)
    end)
    return ok
end

return DataService`,
  },
  {
    title: 'Round Manager',
    description: 'Game loop manager handling round state, intermissions, player teleportation, and winner detection.',
    tags: ['Game Loop', 'OOP', 'Systems'],
    videoUrl: '',
    codeSnippet:
`local RoundManager = {}
RoundManager.__index = RoundManager

local ROUND_DURATION = 120
local INTERMISSION  = 15
local MIN_PLAYERS   = 2

function RoundManager.new()
    return setmetatable({ state = "idle" }, RoundManager)
end

function RoundManager:setState(state: string)
    self.state = state
    ReplicatedStorage.GameState.Value = state
end

function RoundManager:run()
    while true do
        self:setState("intermission")
        task.wait(INTERMISSION)
        if #Players:GetPlayers() >= MIN_PLAYERS then
            self:setState("active")
            self:spawnPlayers()
            task.wait(ROUND_DURATION)
            self:resolveWinner()
            task.wait(3)
        end
    end
end

return RoundManager`,
  },
];

// ── Helpers ───────────────────────────────────────────────

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function ytId(url) {
  const m = url && url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return m ? m[1] : null;
}

// ── Render project cards ──────────────────────────────────

function renderCards(projects) {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';

  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card fade-in';

    const id = ytId(p.videoUrl);
    const media = id
      ? `<div class="card-media"><iframe src="https://www.youtube.com/embed/${id}" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe></div>`
      : `<div class="card-media"><div class="video-placeholder">No preview</div></div>`;

    const snippet = (p.codeSnippet || '').replace(/\\n/g, '\n');
    const tags = (p.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

    const links = [
      p.githubUrl ? `<a href="${p.githubUrl}" class="card-link" target="_blank" rel="noopener">GitHub &#x2197;</a>` : '',
      p.videoUrl  ? `<a href="${p.videoUrl}"  class="card-link" target="_blank" rel="noopener">Demo &#x2197;</a>`   : '',
    ].filter(Boolean).join('');

    card.innerHTML = `${media}
      <div class="card-body">
        <div class="card-header">
          <h3 class="card-title">${p.title}</h3>
          <button class="card-toggle" aria-expanded="false">
            <span class="toggle-arrow">&#9654;</span> View Details
          </button>
        </div>
        <p class="card-desc">${p.description}</p>
        <div class="card-tags">${tags}</div>
      </div>
      <div class="card-expanded">
        <div class="card-code"><pre><code class="language-lua">${escHtml(snippet)}</code></pre></div>
        ${links ? `<div class="card-links">${links}</div>` : ''}
      </div>`;

    card.querySelector('.card-toggle').addEventListener('click', () => {
      const open = card.classList.toggle('expanded');
      card.querySelector('.card-toggle').setAttribute('aria-expanded', open);
      if (open) hljs.highlightAll();
    });

    grid.appendChild(card);
  });

  observe();
}

// ── Appwrite: commission status ───────────────────────────

async function loadStatus() {
  try {
    const res = await db.listDocuments(APPWRITE_DATABASE_ID, COMMISSION_COLLECTION_ID);
    const open = res.documents[0]?.isOpen ?? false;
    document.getElementById('badge-dot').className   = `badge-dot ${open ? 'open' : 'closed'}`;
    document.getElementById('badge-label').textContent = open ? 'Open for work' : 'Closed';
  } catch {
    document.getElementById('commission-badge')?.remove();
  }
}

// ── Appwrite: projects ────────────────────────────────────

async function loadProjects() {
  try {
    const res = await db.listDocuments(APPWRITE_DATABASE_ID, PROJECTS_COLLECTION_ID, [
      Query.orderAsc('order'),
    ]);
    renderCards(res.documents.length ? res.documents : FALLBACK);
  } catch {
    renderCards(FALLBACK);
  }
}

// ── Contact form ──────────────────────────────────────────

function initForm() {
  const form    = document.getElementById('contact-form');
  const btn     = document.getElementById('form-submit');
  const errEl   = document.getElementById('form-error');
  const success = document.getElementById('form-success');
  const details = document.getElementById('details');
  const counter = document.getElementById('char-count');

  details.addEventListener('input', () => {
    counter.textContent = `${details.value.length} / 500`;
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errEl.textContent = '';

    const payload = {
      name:        form.name.value.trim(),
      discord:     form.discord.value.trim(),
      projectType: form.projectType.value,
      budget:      form.budget.value,
      details:     details.value.trim(),
      timestamp:   new Date().toISOString(),
    };

    if (!payload.name || !payload.discord || !payload.projectType || !payload.budget || !payload.details) {
      errEl.textContent = 'Please fill in all fields.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      await db.createDocument(APPWRITE_DATABASE_ID, CONTACT_COLLECTION_ID, ID.unique(), payload);
      form.hidden = true;
      success.hidden = false;
      // After databases.createDocument() succeeds:
      fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `**New commission inquiry**\n**Name:** ${payload.name}\n**Discord:** ${payload.discord}\n**Type:** ${payload.projectType}\n**Budget:** ${payload.budget}\n**Details:** ${payload.details}`
        })
      }).catch(() => {});
    } catch {
      errEl.textContent = 'Something went wrong. Please try again.';
      btn.disabled = false;
      btn.textContent = 'Send Message →';
    }
  });
}

// ── Nav scroll ────────────────────────────────────────────

function initNav() {
  const nav = document.getElementById('site-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
}

// ── Intersection observer ─────────────────────────────────

function observe() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
}

// ── Discord copy ──────────────────────────────────────────

function initDiscordCopy() {
  const btn = document.getElementById('discord-copy');
  const label = document.getElementById('discord-label');
  if (!btn || !label) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('solaerius');
      label.textContent = 'Copied!';
      btn.style.borderColor = 'var(--green)';
      btn.style.color = 'var(--green)';
      setTimeout(() => {
        label.textContent = 'solaerius';
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 2000);
    } catch {
      label.textContent = 'solaerius';
    }
  });
}

// ── Init ──────────────────────────────────────────────────

loadStatus();
loadProjects();
initForm();
initNav();
initDiscordCopy();
observe();
