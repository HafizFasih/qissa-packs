// Qissa Studio Packs: reads catalog.json (built by `reel pack market`) and shows it.
const CATEGORIES = [
  ['people', 'People'],
  ['places', 'Places'],
  ['animals', 'Animals'],
  ['objects', 'Objects'],
  ['faith', 'Faith'],
  ['animations', 'Animations'],
  ['scenes', 'Scenes'],
  ['sounds', 'Sounds'],
  ['backgrounds', 'Backgrounds'],
  ['fonts', 'Fonts'],
];
const label = Object.fromEntries(CATEGORIES);
const params = new URLSearchParams(location.search);
let packs = [];
let cat = params.get('category') || 'all';
const focus = params.get('pack');

const grid = document.getElementById('grid');
const chips = document.getElementById('chips');
const q = document.getElementById('q');

const kb = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
function what(c) {
  const parts = [];
  const add = (n, one, many) => n && parts.push(`${n} ${n === 1 ? one : many}`);
  add(c.props, 'item', 'items');
  add(c.backgrounds, 'background', 'backgrounds');
  add(c.poses, 'pose', 'poses');
  add(c.animations ?? 0, 'animation', 'animations');
  add(c.sounds, 'sound', 'sounds');
  add(c.fonts, 'font', 'fonts');
  add(c.presets, 'scene', 'scenes');
  return parts.join(' · ');
}

function drawChips() {
  const count = (k) => packs.filter((p) => k === 'all' || p.category === k).length;
  chips.replaceChildren(
    ...[['all', 'All'], ...CATEGORIES]
      .filter(([k]) => k === 'all' || count(k) > 0)
      .map(([k, name]) => {
        const b = document.createElement('button');
        b.className = `chip${cat === k ? ' on' : ''}`;
        b.type = 'button';
        b.textContent = name;
        const n = document.createElement('span');
        n.className = 'n';
        n.textContent = count(k);
        b.append(n);
        b.onclick = () => {
          cat = k;
          const u = new URL(location.href);
          k === 'all' ? u.searchParams.delete('category') : u.searchParams.set('category', k);
          history.replaceState(null, '', u);
          draw();
        };
        return b;
      }),
  );
}

function draw() {
  drawChips();
  const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = packs.filter((p) => {
    if (cat !== 'all' && p.category !== cat) return false;
    const hay = `${p.name} ${p.description ?? ''} ${p.id} ${(p.sample ?? []).join(' ')} ${label[p.category] ?? ''}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  if (!shown.length) {
    const p = document.createElement('p');
    p.className = 'note';
    p.textContent = words.length ? 'No pack matches that search.' : 'No packs here yet.';
    return grid.replaceChildren(p);
  }
  const tpl = document.getElementById('card');
  grid.replaceChildren(
    ...shown.map((p) => {
      const el = tpl.content.firstElementChild.cloneNode(true);
      el.id = `pack-${p.id}`;
      if (p.id === focus) el.classList.add('focus');
      const img = el.querySelector('img');
      img.src = p.preview;
      img.alt = `${p.name}: ${(p.sample ?? []).join(', ')}`;
      el.querySelector('.cat').textContent = label[p.category] ?? p.category;
      el.querySelector('.ver').textContent = `v${p.version}`;
      el.querySelector('h3').textContent = p.name;
      el.querySelector('.desc').textContent = p.description ?? '';
      el.querySelector('.meta').textContent = [what(p.counts), kb(p.size), p.license].filter(Boolean).join(' · ');
      el.querySelector('.open').href = `qissa://install/${encodeURIComponent(p.id)}`;
      el.querySelector('.open').title = 'Opens Qissa Studio on this pack (Qissa Studio must be installed)';
      const dl = el.querySelector('.dl');
      dl.href = p.url;
      dl.setAttribute('download', '');
      return el;
    }),
  );
  if (focus) document.getElementById(`pack-${focus}`)?.scrollIntoView({ block: 'center' });
}

q.addEventListener('input', draw);
fetch('catalog.json', { cache: 'no-cache' })
  .then((r) => r.json())
  .then((c) => {
    packs = c.packs ?? [];
    document.getElementById('updated').textContent = `${packs.length} packs · updated ${new Date(c.updated).toLocaleDateString()}`;
    draw();
  })
  .catch(() => {
    grid.innerHTML = '<p class="note">Could not load the packs. Try again in a moment.</p>';
  });
