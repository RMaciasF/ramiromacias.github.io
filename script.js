// ============================================================
// Setup
// ============================================================
const output   = document.getElementById('output');
const input    = document.getElementById('cmdInput');
const termBody = document.getElementById('termBody');
const themeLabel = document.getElementById('themeLabel');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const VALID_THEMES = ['green', 'amber', 'blue', 'red'];
const savedTheme = localStorage.getItem('cipher-theme');
if (savedTheme && VALID_THEMES.includes(savedTheme)) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}
themeLabel.textContent = document.documentElement.getAttribute('data-theme');

// ============================================================
// Output helpers
// ============================================================
function scrollToBottom() {
  termBody.scrollTop = termBody.scrollHeight;
}

function printLine(text = '', cls = '') {
  const el = document.createElement('span');
  el.className = 'line' + (cls ? ' ' + cls : '');
  el.textContent = text;
  output.appendChild(el);
  scrollToBottom();
}

function printBlank() {
  const el = document.createElement('span');
  el.className = 'line blank';
  output.appendChild(el);
}

function printHTML(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  output.appendChild(wrapper);
  scrollToBottom();
}

function appendNode(node) {
  output.appendChild(node);
  scrollToBottom();
}

function printPromptEcho(cmd) {
  const el = document.createElement('span');
  el.className = 'line';
  el.innerHTML =
    `<span class="prompt-user">pr0sp3r0</span><span class="prompt-at">@</span>` +
    `<span class="prompt-host">shell</span><span class="prompt-colon">:</span>` +
    `<span class="prompt-path">~</span><span class="prompt-dollar">$</span> ${escapeHTML(cmd)}`;
  output.appendChild(el);
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function table(rows) {
  const t = document.createElement('table');
  t.className = 'term-table';
  rows.forEach(([k, v]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="key">${escapeHTML(k)}</td><td>${v}</td>`;
    t.appendChild(tr);
  });
  return t.outerHTML;
}

function list(items) {
  const ul = document.createElement('ul');
  ul.className = 'term-list';
  items.forEach(txt => {
    const li = document.createElement('li');
    li.innerHTML = txt;
    ul.appendChild(li);
  });
  return ul.outerHTML;
}

// ============================================================
// Certification badges — generic seal-style SVG, no vendor logos
// ============================================================
const CERTS = [
  { acronym: 'WX-1',  name: 'Web Exploitation Track', status: 'done' },
  { acronym: 'RTOP',  name: 'Red Team Operator Program', status: 'in-progress' },
  { acronym: 'CSF',   name: 'Cloud Pentest Foundations', status: 'done' },
  { acronym: 'POS',   name: 'Practical Offensive Security — Full Course', status: 'done' },
  { acronym: 'DEP',   name: 'Detection Engineering — SIEM &amp; Threat Hunting', status: 'done' },
];

function badgeSVG(acronym) {
  return `
<svg viewBox="0 0 90 112" width="70" height="88" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="45" cy="40" r="31" stroke-dasharray="3 4" opacity="0.55"/>
    <circle cx="45" cy="40" r="24"/>
  </g>
  <text x="45" y="45" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="currentColor">${acronym}</text>
  <path d="M30 61 L19 103 L45 90 L71 103 L60 61" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" opacity="0.9"/>
</svg>`;
}

function renderBadgeMarquee(certs) {
  const container = document.createElement('div');
  container.className = 'badge-marquee';
  container.tabIndex = 0;
  container.setAttribute(
    'aria-label',
    'Certification badges. Hover and move your mouse left or right to scrub through them, or leave it alone to auto-scroll.'
  );

  const track = document.createElement('div');
  track.className = 'badge-track';

  const itemsHTML = certs.map(c => `
    <div class="badge-item ${c.status === 'in-progress' ? 'in-progress' : ''}">
      ${badgeSVG(c.acronym)}
      <span class="badge-label">${c.name}</span>
    </div>
  `).join('');

  // The track needs to be noticeably wider than the visible window or there's
  // no room to scrub — with only a handful of badges that's easy to undershoot,
  // especially on a wide terminal. Start with two copies (minimum for a
  // seamless -50% auto-scroll loop) and keep adding pairs until the track is
  // comfortably wider than the container, measured after it's actually on
  // screen.
  let copies = 2;
  track.innerHTML = itemsHTML.repeat(copies);
  container.appendChild(track);

  requestAnimationFrame(() => {
    const containerWidth = container.clientWidth || 1;
    let guard = 0;
    while (track.scrollWidth / 2 < containerWidth * 1.5 && guard < 10) {
      copies += 2;
      track.innerHTML = itemsHTML.repeat(copies);
      guard++;
    }
  });

  // Mouse-driven scrubbing: while hovering, the track's horizontal position
  // tracks the cursor directly instead of auto-scrolling. Leaving the strip
  // hands control back to the CSS auto-scroll animation.
  let hovering = false;

  function scrubTo(clientX) {
    const rect = container.getBoundingClientRect();
    const pct = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const maxShift = Math.max(track.scrollWidth / 2 - rect.width, 0);
    track.style.transform = `translateX(${-pct * maxShift}px)`;
  }

  container.addEventListener('mouseenter', (e) => {
    hovering = true;
    track.style.animation = 'none';
    scrubTo(e.clientX);
  });
  container.addEventListener('mousemove', (e) => {
    if (hovering) scrubTo(e.clientX);
  });
  container.addEventListener('mouseleave', () => {
    hovering = false;
    track.style.animation = '';
    track.style.transform = '';
  });

  return container;
}

// ============================================================
// Boot sequence
// ============================================================
const bootLines = [
  { t: 'initializing secure shell ...',            d: 200 },
  { t: 'negotiating handshake .......... [ OK ]',  d: 180 },
  { t: 'loading identity ............... [ OK ]',  d: 160 },
  { t: 'mounting /home/cipher ........... [ OK ]',  d: 140 },
  { t: 'checking for known exploits ..... [ NONE FOUND ]', d: 220, cls: 'dim' },
  { t: 'connection established.',                  d: 260, cls: 'accent' },
];

function typeText(el, text, speed, done) {
  let i = 0;
  (function step() {
    el.textContent = text.slice(0, i + 1);
    i++;
    if (i < text.length) {
      setTimeout(step, speed);
    } else if (done) {
      done();
    }
  })();
}

function runBoot(done) {
  let idx = 0;

  function nextLine() {
    if (idx >= bootLines.length) {
      printBlank();
      printBanner();
      done();
      return;
    }
    const entry = bootLines[idx];
    idx++;
    const el = document.createElement('span');
    el.className = 'line' + (entry.cls ? ' ' + entry.cls : '');
    output.appendChild(el);

    if (prefersReducedMotion) {
      el.textContent = entry.t;
      setTimeout(nextLine, 0);
    } else {
      typeText(el, entry.t, 12, () => setTimeout(nextLine, entry.d));
    }
  }
  nextLine();
}

function printBanner() {
  printHTML(`<div class="ascii-banner">PR0SP3R0://</div>`);
  printLine('Ramiro "Pr0sp3r0" Macias — Penetration Tester / Red Team Operator', 'tagline');
  printLine("Toronto, ON (remote-friendly)  ·  status: available for engagements", 'dim');
  printBlank();
  printLine("Type 'help' to see available commands, or tap a button below.", 'dim');
  printBlank();
}

// ============================================================
// Command definitions
// ============================================================
const commands = {
  help() {
    printLine('AVAILABLE COMMANDS', 'bold accent');
    printHTML(list([
      `<span class="file-name">help</span>        <span class="file-desc">— show this list</span>`,
      `<span class="file-name">whoami</span>       <span class="file-desc">— identity summary</span>`,
      `<span class="file-name">about</span>        <span class="file-desc">— background &amp; approach</span>`,
      `<span class="file-name">skills</span>       <span class="file-desc">— technical skill areas</span>`,
      `<span class="file-name">experience</span>   <span class="file-desc">— work history log</span>`,
      `<span class="file-name">projects</span>     <span class="file-desc">— selected technical projects</span>`,
      `<span class="file-name">writeups</span>     <span class="file-desc">— recent published writeups</span>`,
      `<span class="file-name">certs</span>        <span class="file-desc">— training &amp; certifications</span>`,
      `<span class="file-name">contact</span>      <span class="file-desc">— how to reach me</span>`,
      `<span class="file-name">theme</span> [name] <span class="file-desc">— green / amber / blue / red</span>`,
      `<span class="file-name">matrix</span> [on|off] <span class="file-desc">— toggle background rain</span>`,
      `<span class="file-name">clear</span>        <span class="file-desc">— clear the screen</span>`,
    ]));
    printBlank();
    printLine('Tip: use ↑ / ↓ to cycle through command history.', 'dim');
    printBlank();
  },

  whoami() {
    printHTML(table([
      ['uid', '1000(cipher)'],
      ['gid', '1000(redteam)'],
      ['groups', '1000(redteam), 27(sudo — revoked)'],
      ['handle', 'cipher'],
      ['name', 'Jordan Cole'],
      ['role', 'Penetration Tester / Red Team Operator'],
      ['based', 'Austin, TX (remote-friendly)'],
      ['status', '<span class="accent">available for engagements</span>'],
    ]));
    printBlank();
  },

  about() {
    printLine('cat about.md', 'dim');
    printBlank();
    printLine('I get paid to think like the person your defenses are built to stop.');
    printLine('My work spans internal and external network penetration tests,');
    printLine('Active Directory attack paths, and web application assessments —');
    printLine('always documented well enough that the client\'s blue team could');
    printLine('rebuild the attack path from my notes alone.');
    printBlank();
    printLine('Outside of client work I run a home lab, publish writeups, and');
    printLine('spend a fair amount of time turning red-team findings into');
    printLine('detection rules, because a finding no one can detect next time');
    printLine('isn\'t worth much.');
    printBlank();
  },

  skills() {
    printLine('ls -la skills/', 'dim');
    printBlank();
    printHTML(list([
      `<span class="file-name">active-directory/</span>  <span class="file-desc">Kerberoasting, ACL abuse, delegation, BloodHound, NetExec, Certipy</span>`,
      `<span class="file-name">web-exploitation/</span>   <span class="file-desc">Auth &amp; access control, SQLi, XSS, SSRF, Burp Suite, FFUF</span>`,
      `<span class="file-name">cloud-security/</span>     <span class="file-desc">IAM misconfig review, AWS, Azure AD, Terraform</span>`,
      `<span class="file-name">detection-evasion/</span>  <span class="file-desc">AV/EDR evasion concepts, C2 tradecraft, log analysis</span>`,
      `<span class="file-name">scripting/</span>          <span class="file-desc">Python, Bash, Go — tooling for repeatable enumeration</span>`,
    ]));
    printBlank();
  },

  experience() {
    printLine('cat experience.log', 'dim');
    printBlank();
    printLine('[2023-01] SENIOR PENTESTER @ Northbeam Security', 'bold');
    printLine('          Internal/external network &amp; AD assessments, client-facing', 'dim');
    printLine('          reporting, detection rules built from red-team findings.', 'dim');
    printBlank();
    printLine('[2022-06] RED TEAM TRAINEE @ Redline Labs', 'bold');
    printLine('          6-month hands-on program across AD, web exploitation and', 'dim');
    printLine('          attack/defend exercises, mentored by working operators.', 'dim');
    printBlank();
    printLine('[2021-01] INDEPENDENT RESEARCHER', 'bold');
    printLine('          Home-lab AD environments, public CTFs, early methodology', 'dim');
    printLine('          notes that became the basis for later writeups.', 'dim');
    printBlank();
  },

  projects() {
    printLine('ls -la projects/', 'dim');
    printBlank();
    printHTML(list([
      `<span class="file-name">ad-home-lab/</span>       <span class="file-desc">Controlled Windows domain for credential access &amp; lateral movement practice</span>`,
      `<span class="file-name">pentest-methodology/</span> <span class="file-desc">Structured notes: recon → exploitation → privesc → reporting</span>`,
      `<span class="file-name">detection-notebook/</span> <span class="file-desc">Mapping offensive techniques to Sigma detection rules</span>`,
      `<span class="file-name">automation-toolkit/</span> <span class="file-desc">Python CLI utilities for auth testing &amp; enumeration</span>`,
    ]));
    printLine('→ full source: <a class="link" href="#" target="_blank" rel="noopener">github.com/cipher</a>', '');
    printBlank();
  },

  writeups() {
    printLine('ls writeups/  --sort=date', 'dim');
    printBlank();
    printHTML(list([
      `<span class="file-name">2026-08-12-multi-stage-ad.md</span>   <span class="file-desc">SSTI foothold → full domain takeover via GPO abuse</span>`,
      `<span class="file-name">2026-08-10-chained-web-exp.md</span>  <span class="file-desc">Exposed API to authenticated RCE via chained misconfigs</span>`,
      `<span class="file-name">2026-08-08-wifi-field-notes.md</span> <span class="file-desc">Wireless recon &amp; WPA/WPA2 lab testing workflow</span>`,
    ]));
    printLine('→ read more: <a class="link" href="#" target="_blank" rel="noopener">cipher.dev/writeups</a>', '');
    printBlank();
  },

  certs() {
    printLine('cat certifications.txt', 'dim');
    printBlank();
    appendNode(renderBadgeMarquee(CERTS));
    printHTML(table(CERTS.map(c => [
      c.status === 'done' ? '[DONE]' : '[PROG]',
      c.name,
    ])));
    printBlank();
  },

  contact() {
    printLine('contact --info', 'dim');
    printBlank();
    printHTML(table([
      ['email', '<a class="link" href="mailto:cipher@example.com">ramiromacias221@example.com</a>'],
      ['github', '<a class="link" href="#" target="_blank" rel="noopener">github.com/RMaciasF</a>'],
      ['linkedin', '<a class="link" href="#" target="_blank" rel="noopener">linkedin.com/in/r4m1r0m4c1a5</a>'],
      ['pgp', '4A3F 9C21 8B0D 77E4 12FA  9931 0CDE 55A2 66F1 90B3'],
    ]));
    printBlank();
  },

  theme(args) {
    const name = (args[0] || '').toLowerCase();
    if (!name) {
      printLine(`current theme: ${document.documentElement.getAttribute('data-theme')}`, 'dim');
      printLine('usage: theme [green|amber|blue|red]', 'dim');
      printBlank();
      return;
    }
    if (!VALID_THEMES.includes(name)) {
      printLine(`unknown theme "${name}". options: ${VALID_THEMES.join(', ')}`, 'err');
      printBlank();
      return;
    }
    document.documentElement.setAttribute('data-theme', name);
    localStorage.setItem('cipher-theme', name);
    themeLabel.textContent = name;
    printLine(`theme set to ${name}.`, 'accent');
    printBlank();
  },

  matrix(args) {
    const canvas = document.getElementById('matrixCanvas');
    const arg = (args[0] || 'on').toLowerCase();

    if (prefersReducedMotion) {
      printLine('motion is reduced on this device — matrix effect disabled.', 'dim');
      printBlank();
      return;
    }

    if (arg === 'off') {
      canvas.classList.remove('active');
      stopMatrix();
      printLine('matrix rain disabled.', 'dim');
    } else {
      canvas.classList.add('active');
      startMatrix();
      printLine('matrix rain enabled. try `matrix off` to disable.', 'accent');
    }
    printBlank();
  },

  clear() {
    output.innerHTML = '';
  },

  sudo() {
    printLine('cipher is not in the sudoers file. This incident will be reported.', 'err');
    printLine('(it will not actually be reported. nice try though.)', 'dim');
    printBlank();
  },

  exit() {
    printLine("can't exit a website. try closing the tab.", 'dim');
    printBlank();
  },

  ls() {
    printLine('ls -la', 'dim');
    printBlank();
    printHTML(list([
      `<span class="file-name">about.md</span>`,
      `<span class="file-name">experience.log</span>`,
      `<span class="file-name">certifications.txt</span>`,
      `<span class="file-name">skills/</span>`,
      `<span class="file-name">projects/</span>`,
      `<span class="file-name">writeups/</span>`,
    ]));
    printLine("run 'cat <file>' or the matching command name to view.", 'dim');
    printBlank();
  },
  banner() { printBanner(); },
};

function runCommand(raw) {
  const trimmed = raw.trim();
  printPromptEcho(raw);
  if (!trimmed) return;

  const [cmd, ...args] = trimmed.split(/\s+/);
  const key = cmd.toLowerCase();

  if (key === 'cat' && args[0]) {
    // Friendly aliasing: `cat about.md`, `cat experience.log`, etc.
    const alias = args[0].replace(/\.(md|txt|log)$/i, '').replace(/^skills\/?$/, 'skills');
    if (commands[alias]) { commands[alias](); return; }
  }

  if (commands[key]) {
    commands[key](args);
  } else {
    printLine(`command not found: ${cmd}`, 'err');
    printLine("type 'help' for available commands.", 'dim');
    printBlank();
  }
}

// ============================================================
// Input handling: submit, history, tab-complete, quick buttons
// ============================================================
const history = [];
let historyIndex = -1;

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = input.value;
    if (val.trim()) { history.push(val); }
    historyIndex = history.length;
    input.value = '';
    runCommand(val);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      input.value = history[historyIndex];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex < history.length - 1) {
      historyIndex++;
      input.value = history[historyIndex];
    } else {
      historyIndex = history.length;
      input.value = '';
    }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    const partial = input.value.toLowerCase();
    const match = Object.keys(commands).find(c => c.startsWith(partial) && partial.length > 0);
    if (match) input.value = match;
  }
});

document.querySelectorAll('.quick-bar button').forEach(btn => {
  btn.addEventListener('click', () => {
    input.value = btn.dataset.cmd;
    input.focus();
    runCommand(input.value);
    input.value = '';
  });
});

document.querySelector('.term-window').addEventListener('click', () => input.focus());

// ============================================================
// Matrix rain (canvas)
// ============================================================
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
let matrixInterval = null;
let columns = [];
const glyphs = 'アイウエオカキクケコサシスセソ01<>/\\{}[]#$%';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const cols = Math.floor(canvas.width / 16);
  columns = new Array(cols).fill(0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function matrixColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#58ffa0';
}

function drawMatrix() {
  ctx.fillStyle = 'rgba(2, 4, 2, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = matrixColor();
  ctx.font = '14px monospace';
  columns.forEach((y, i) => {
    const text = glyphs[Math.floor(Math.random() * glyphs.length)];
    ctx.fillText(text, i * 16, y);
    if (y > canvas.height && Math.random() > 0.975) {
      columns[i] = 0;
    } else {
      columns[i] = y + 16;
    }
  });
}

function startMatrix() {
  if (matrixInterval) return;
  matrixInterval = setInterval(drawMatrix, 45);
}
function stopMatrix() {
  clearInterval(matrixInterval);
  matrixInterval = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ============================================================
// Boot
// ============================================================
runBoot(() => {
  input.disabled = false;
  input.focus();
});
