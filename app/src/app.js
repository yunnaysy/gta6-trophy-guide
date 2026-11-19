import { loadEarned, saveEarned, exportJson, importJson, exportMarkdown } from './storage.js';
import { PHASES, MISSABLE_TIPS } from './roadmap.js';

let trophies = [];
let earned = loadEarned();
let currentView = 'checklist'; // 'checklist' | 'roadmap' | 'missables'
let expandedIds = new Set();
let revealedSpoilers = new Set();
let spoilerShield = true;
let missablesOnly = false;

// DOM elements
const elProgressFill = document.getElementById('progress-fill');
const elProgressText = document.getElementById('progress-text');
const elProgressPercent = document.getElementById('progress-percent');
const elCountPlat = document.getElementById('count-platinum');
const elCountGold = document.getElementById('count-gold');
const elCountSilver = document.getElementById('count-silver');
const elCountBronze = document.getElementById('count-bronze');
const elTrophyList = document.getElementById('trophy-list');
const elRoadmapView = document.getElementById('roadmap-view');
const elMissablesView = document.getElementById('missables-view');
const elSearchInput = document.getElementById('search-input');
const elGradeFilter = document.getElementById('grade-filter');
const elKindFilter = document.getElementById('kind-filter');
const elStatusFilter = document.getElementById('status-filter');
const elPhaseFilter = document.getElementById('phase-filter');
const elMissablesToggle = document.getElementById('btn-missables-toggle');
const elSpoilerToggle = document.getElementById('btn-spoiler-toggle');
const elTabChecklist = document.getElementById('tab-checklist');
const elTabRoadmap = document.getElementById('tab-roadmap');
const elTabMissables = document.getElementById('tab-missables');
const elTabCount = document.getElementById('checklist-count');

async function init() {
  try {
    const res = await fetch('data/trophies.json');
    const data = await res.json();
    trophies = data.trophies || [];
  } catch (err) {
    console.error('Failed to load trophies dataset', err);
    return;
  }

  setupEventListeners();
  render();
}

function setupEventListeners() {
  // Tabs
  elTabChecklist.addEventListener('click', () => switchView('checklist'));
  elTabRoadmap.addEventListener('click', () => switchView('roadmap'));
  elTabMissables.addEventListener('click', () => switchView('missables'));

  // Search and Filters
  elSearchInput.addEventListener('input', renderChecklist);
  elGradeFilter.addEventListener('change', renderChecklist);
  elKindFilter.addEventListener('change', renderChecklist);
  elStatusFilter.addEventListener('change', renderChecklist);
  elPhaseFilter.addEventListener('change', renderChecklist);

  elMissablesToggle.addEventListener('click', () => {
    missablesOnly = !missablesOnly;
    elMissablesToggle.classList.toggle('active-missable', missablesOnly);
    renderChecklist();
  });

  elSpoilerToggle.addEventListener('click', () => {
    spoilerShield = !spoilerShield;
    elSpoilerToggle.classList.toggle('active-spoiler', spoilerShield);
    elSpoilerToggle.textContent = spoilerShield ? '🛡️ Spoiler Shield: ON' : '👁️ Spoiler Shield: OFF';
    renderChecklist();
  });

  // Action Buttons
  document.getElementById('btn-export-json').addEventListener('click', () => exportJson(earned, trophies));
  document.getElementById('btn-export-md').addEventListener('click', () => exportMarkdown(earned, trophies));

  const importInput = document.getElementById('file-import-json');
  importInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      earned = await importJson(file);
      saveEarned(earned);
      render();
    } catch (err) {
      alert('Could not import progress: ' + err.message);
    }
    importInput.value = '';
  });

  document.getElementById('btn-select-all').addEventListener('click', () => {
    trophies.forEach(t => earned.add(t.name));
    saveEarned(earned);
    render();
  });

  document.getElementById('btn-reset-all').addEventListener('click', () => {
    if (confirm('Reset all trophy progress to 0?')) {
      earned.clear();
      saveEarned(earned);
      render();
    }
  });
}

function switchView(view) {
  currentView = view;
  elTabChecklist.classList.toggle('active', view === 'checklist');
  elTabRoadmap.classList.toggle('active', view === 'roadmap');
  elTabMissables.classList.toggle('active', view === 'missables');

  elTrophyList.style.display = view === 'checklist' ? 'flex' : 'none';
  document.getElementById('toolbar-section').style.display = view === 'checklist' ? 'flex' : 'none';
  elRoadmapView.style.display = view === 'roadmap' ? 'flex' : 'none';
  elMissablesView.style.display = view === 'missables' ? 'grid' : 'none';

  if (view === 'checklist') renderChecklist();
  else if (view === 'roadmap') renderRoadmap();
  else if (view === 'missables') renderMissables();
}

function render() {
  updateDashboard();
  if (currentView === 'checklist') renderChecklist();
  else if (currentView === 'roadmap') renderRoadmap();
  else if (currentView === 'missables') renderMissables();
}

function updateDashboard() {
  const total = trophies.length;
  const earnedCount = earned.size;
  const percent = total > 0 ? Math.round((earnedCount / total) * 100) : 0;

  elProgressFill.style.width = `${percent}%`;
  elProgressText.textContent = `${earnedCount} of ${total} Earned`;
  elProgressPercent.textContent = `${percent}%`;

  let plat = 0, gold = 0, silver = 0, bronze = 0;
  for (const t of trophies) {
    if (earned.has(t.name)) {
      if (t.grade === 'platinum') plat++;
      else if (t.grade === 'gold') gold++;
      else if (t.grade === 'silver') silver++;
      else if (t.grade === 'bronze') bronze++;
    }
  }

  elCountPlat.textContent = `${plat} / 1`;
  elCountGold.textContent = `${gold} / 2`;
  elCountSilver.textContent = `${silver} / 6`;
  elCountBronze.textContent = `${bronze} / 46`;
  elTabCount.textContent = `${earnedCount}/${total}`;
}

function getFilteredTrophies() {
  const query = elSearchInput.value.trim().toLowerCase();
  const grade = elGradeFilter.value;
  const kind = elKindFilter.value;
  const status = elStatusFilter.value;
  const phase = elPhaseFilter.value;

  return trophies.filter(t => {
    if (grade !== 'all' && t.grade !== grade) return false;
    if (kind !== 'all' && t.kind !== kind) return false;
    if (phase !== 'all' && String(t.phase) !== phase) return false;
    if (missablesOnly && !t.missable) return false;

    const isEarned = earned.has(t.name);
    if (status === 'earned' && !isEarned) return false;
    if (status === 'remaining' && isEarned) return false;

    if (query) {
      const matchName = t.name.toLowerCase().includes(query);
      const matchDesc = t.description.toLowerCase().includes(query);
      const matchGuide = t.guide.toLowerCase().includes(query);
      const matchPhase = (t.phaseName || '').toLowerCase().includes(query);
      if (!matchName && !matchDesc && !matchGuide && !matchPhase) return false;
    }

    return true;
  });
}

function renderChecklist() {
  const filtered = getFilteredTrophies();
  elTrophyList.replaceChildren();

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.style.textAlign = 'center';
    empty.style.padding = '40px 20px';
    empty.style.color = '#94a3b8';
    empty.textContent = 'No trophies found matching the selected filters.';
    elTrophyList.appendChild(empty);
    return;
  }

  for (const t of filtered) {
    const isEarned = earned.has(t.name);
    const isExpanded = expandedIds.has(t.id);
    const isStorySpoiler = t.hidden && !isEarned && spoilerShield && !revealedSpoilers.has(t.id);

    const card = document.createElement('div');
    card.className = `trophy-card ${isEarned ? 'is-earned' : ''} ${isExpanded ? 'expanded' : ''}`;
    card.dataset.id = t.id;

    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'trophy-header-row';

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'trophy-check';
    checkbox.checked = isEarned;
    checkbox.setAttribute('aria-label', `Mark ${t.name} as earned`);
    checkbox.addEventListener('click', (e) => e.stopPropagation());
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        earned.add(t.name);
      } else {
        earned.delete(t.name);
      }
      saveEarned(earned);
      updateDashboard();
      renderChecklist();
    });
    headerRow.appendChild(checkbox);

    // Metadata column
    const metaCol = document.createElement('div');
    metaCol.className = 'trophy-meta-col';

    const topLine = document.createElement('div');
    topLine.className = 'trophy-top-line';

    const gradeBadge = document.createElement('span');
    gradeBadge.className = `grade-badge ${t.grade}`;
    gradeBadge.textContent = t.grade;
    topLine.appendChild(gradeBadge);

    const kindBadge = document.createElement('span');
    kindBadge.className = `kind-badge ${t.missable ? 'missable' : ''}`;
    kindBadge.textContent = t.missable ? '⚠️ MISSABLE' : (t.kind || 'activity');
    topLine.appendChild(kindBadge);

    const phaseTag = document.createElement('span');
    phaseTag.className = 'phase-tag';
    phaseTag.textContent = `Phase ${t.phase}`;
    topLine.appendChild(phaseTag);

    if (t.trackingCount) {
      const trackBadge = document.createElement('span');
      trackBadge.className = 'phase-tag';
      trackBadge.textContent = `🎯 Goal: ${t.trackingCount.toLocaleString()}`;
      topLine.appendChild(trackBadge);
    }

    if (isStorySpoiler) {
      const alertTag = document.createElement('span');
      alertTag.className = 'spoiler-alert-tag';
      alertTag.textContent = '🔒 Hidden Story Spoiler (Click Reveal)';
      topLine.appendChild(alertTag);
    }

    metaCol.appendChild(topLine);

    // Title & Description
    const nameEl = document.createElement('div');
    nameEl.className = `trophy-name ${isStorySpoiler ? 'spoiler-masked' : ''}`;
    nameEl.textContent = isStorySpoiler ? 'Hidden Story Mission Spoiler' : t.name;
    metaCol.appendChild(nameEl);

    const descEl = document.createElement('div');
    descEl.className = `trophy-desc ${isStorySpoiler ? 'spoiler-masked' : ''}`;
    descEl.textContent = isStorySpoiler ? 'Complete campaign story mission or confidential chapter objective.' : t.description;
    metaCol.appendChild(descEl);

    headerRow.appendChild(metaCol);

    // Expand Indicator
    const chevron = document.createElement('span');
    chevron.className = 'expand-indicator';
    chevron.textContent = '▼';
    headerRow.appendChild(chevron);

    // Toggle expansion on card header click
    headerRow.addEventListener('click', () => {
      if (isStorySpoiler) {
        revealedSpoilers.add(t.id);
        renderChecklist();
        return;
      }
      if (expandedIds.has(t.id)) expandedIds.delete(t.id);
      else expandedIds.add(t.id);
      card.classList.toggle('expanded');
    });

    card.appendChild(headerRow);

    // Expandable Details Drawer
    const details = document.createElement('div');
    details.className = 'trophy-details';

    if (t.missable && t.missableReason) {
      const missBox = document.createElement('div');
      missBox.className = 'missable-box';
      const missTitle = document.createElement('div');
      missTitle.className = 'missable-box-title';
      missTitle.textContent = '⚠️ Missable Objective Advisory';
      const missText = document.createElement('div');
      missText.className = 'detail-text';
      missText.textContent = t.missableReason;
      missBox.appendChild(missTitle);
      missBox.appendChild(missText);
      details.appendChild(missBox);
    }

    const stratSec = document.createElement('div');
    stratSec.className = 'detail-section';
    const stratHeading = document.createElement('div');
    stratHeading.className = 'detail-heading';
    stratHeading.innerHTML = '<span>📖</span> Unlock Strategy & Walkthrough';
    const stratText = document.createElement('div');
    stratText.className = 'detail-text';
    stratText.textContent = t.guide;
    stratSec.appendChild(stratHeading);
    stratSec.appendChild(stratText);
    details.appendChild(stratSec);

    const citeSec = document.createElement('div');
    citeSec.className = 'source-citation';
    citeSec.textContent = `Source Citation: ${t.sources}`;
    details.appendChild(citeSec);

    card.appendChild(details);
    elTrophyList.appendChild(card);
  }
}

function renderRoadmap() {
  elRoadmapView.replaceChildren();

  for (const p of PHASES) {
    const card = document.createElement('div');
    card.className = 'roadmap-phase-card';

    const header = document.createElement('div');
    header.className = 'phase-header';

    const title = document.createElement('h2');
    title.className = 'phase-title';
    title.textContent = p.title;
    header.appendChild(title);

    const badge = document.createElement('span');
    badge.className = 'badge-tag';
    badge.textContent = p.badge;
    header.appendChild(badge);

    card.appendChild(header);

    const desc = document.createElement('p');
    desc.className = 'phase-desc';
    desc.textContent = p.description;
    card.appendChild(desc);

    // Trophies in this phase
    const phaseTrophies = trophies.filter(t => t.phase === p.phase);
    const earnedInPhase = phaseTrophies.filter(t => earned.has(t.name)).length;

    const subTitle = document.createElement('div');
    subTitle.style.fontSize = '12px';
    subTitle.style.fontWeight = '700';
    subTitle.style.textTransform = 'uppercase';
    subTitle.style.color = '#94a3b8';
    subTitle.style.marginBottom = '8px';
    subTitle.textContent = `Trophies (${earnedInPhase}/${phaseTrophies.length} Earned):`;
    card.appendChild(subTitle);

    const chipWrap = document.createElement('div');
    chipWrap.className = 'phase-trophy-chips';

    for (const t of phaseTrophies) {
      const isEarned = earned.has(t.name);
      const chip = document.createElement('div');
      chip.className = `phase-trophy-chip ${isEarned ? 'earned' : ''}`;
      chip.innerHTML = `<span>${isEarned ? '✓' : '○'}</span> [${t.grade.toUpperCase()}] ${t.name}`;
      chip.addEventListener('click', () => {
        elPhaseFilter.value = String(t.phase);
        expandedIds.add(t.id);
        switchView('checklist');
      });
      chipWrap.appendChild(chip);
    }

    card.appendChild(chipWrap);
    elRoadmapView.appendChild(card);
  }
}

function renderMissables() {
  elMissablesView.replaceChildren();

  for (const m of MISSABLE_TIPS) {
    const card = document.createElement('div');
    card.className = 'missable-radar-card';

    const header = document.createElement('div');
    header.className = 'radar-header';

    const title = document.createElement('h2');
    title.className = 'radar-title';
    title.innerHTML = `<span>⚠️</span> ${m.name} <span class="grade-badge ${m.grade}">${m.grade}</span>`;
    header.appendChild(title);

    const tag = document.createElement('span');
    tag.className = 'kind-badge missable';
    tag.textContent = m.tag;
    header.appendChild(tag);

    card.appendChild(header);

    const risk = document.createElement('div');
    risk.className = 'radar-risk';
    risk.innerHTML = `<strong>Missable Trigger Risk:</strong> ${m.risk}`;
    card.appendChild(risk);

    const strat = document.createElement('div');
    strat.className = 'radar-strategy';
    strat.innerHTML = `<strong>Safe Route Strategy:</strong> ${m.strategy}`;
    card.appendChild(strat);

    elMissablesView.appendChild(card);
  }
}

// Start application
window.addEventListener('DOMContentLoaded', init);
