const seedTasks = [
  { id: 1, title: 'Submit Digital Electronics Assignment', category: 'College', due: 'Tomorrow', priority: 'high', done: false },
  { id: 2, title: 'Pay electricity bill · ₹1,842', category: 'Bills', due: 'Today', priority: 'high', done: false },
  { id: 3, title: 'Complete physics lab record', category: 'College', due: 'Today', priority: 'medium', done: false },
  { id: 4, title: 'Buy engineering drawing sheets', category: 'Shopping', due: 'Completed', priority: 'low', done: true },
  { id: 5, title: 'Read chapter 4 before class', category: 'College', due: 'Sep 21', priority: 'low', done: false },
  { id: 6, title: 'Book dentist appointment', category: 'Health', due: 'Sep 23', priority: 'medium', done: false },
  { id: 7, title: 'Renew cloud storage plan', category: 'Personal', due: 'Sep 28', priority: 'low', done: false },
  { id: 8, title: 'Send project update to team', category: 'Work', due: 'Sep 30', priority: 'medium', done: false }
];

let tasks = JSON.parse(localStorage.getItem('taskflow-tasks')) || seedTasks;
let activeFilter = 'all';
const taskList = document.querySelector('#task-list');
const modal = document.querySelector('#capture-modal');
const input = document.querySelector('#capture-input');

function saveTasks() { localStorage.setItem('taskflow-tasks', JSON.stringify(tasks)); }
function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); }
function openCapture() { modal.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(() => input.focus(), 50); }
function closeCapture() { modal.hidden = true; document.body.style.overflow = ''; }

function renderTasks() {
  const filtered = tasks.filter((task) => {
    if (activeFilter === 'today') return task.due === 'Today' && !task.done;
    if (activeFilter === 'high') return task.priority === 'high' && !task.done;
    if (activeFilter === 'completed') return task.done;
    return true;
  });
  taskList.innerHTML = filtered.map((task) => `<div class="task-row ${task.done ? 'done' : ''}" data-id="${task.id}">
    <input class="task-check" type="checkbox" ${task.done ? 'checked' : ''} aria-label="Complete ${task.title}">
    <div class="task-info"><strong class="task-title">${task.title}</strong><div class="task-meta"><span class="task-tag">${task.category}</span><span>◷ ${task.due}</span></div></div>
    <span class="task-priority priority-${task.priority}">${task.priority === 'high' ? '● High' : task.priority === 'medium' ? '● Medium' : '● Low'}</span><button class="task-menu" aria-label="More actions">•••</button>
  </div>`).join('') || '<p class="empty-state">Nothing here. Capture something new with AI.</p>';
  document.querySelector('#nav-task-count').textContent = tasks.filter((task) => !task.done).length;
  document.querySelector('#today-count').textContent = tasks.filter((task) => task.due === 'Today' && !task.done).length;
  document.querySelector('#completed-count').textContent = tasks.filter((task) => task.done).length + 11;
  document.querySelector('#upcoming-count').textContent = tasks.filter((task) => !task.done && task.due !== 'Today').length;
  document.querySelector('#task-summary').textContent = `${tasks.filter((task) => task.due === 'Today' && !task.done).length} tasks need your attention`;
  document.querySelectorAll('.task-check').forEach((checkbox) => checkbox.addEventListener('change', (event) => {
    const task = tasks.find((item) => item.id === Number(event.target.closest('.task-row').dataset.id));
    task.done = event.target.checked;
    task.due = task.done ? 'Completed' : task.due;
    saveTasks(); renderTasks(); showToast(task.done ? 'Task completed. Nice work.' : 'Task moved back to your list.');
  }));
}

function extractTask(text) {
  const lower = text.toLowerCase();
  const amountMatch = text.match(/[₹$€]\s?[\d,]+/);
  const due = lower.includes('today') ? 'Today' : lower.includes('tomorrow') ? 'Tomorrow' : lower.includes('monday') ? 'Monday' : lower.includes('friday') ? 'Friday' : lower.match(/september\s+\d{1,2}/i)?.[0] || 'No date';
  const priority = lower.includes('today') || lower.includes('urgent') || lower.includes('tomorrow') || lower.includes('deadline') ? 'high' : 'medium';
  const title = lower.includes('bill') ? 'Pay electricity bill' : lower.includes('assignment') ? 'Submit physics assignment' : lower.includes('lab') ? 'Submit lab record' : text.replace(/\s+/g, ' ').trim().slice(0, 54) || 'New task';
  return { title: amountMatch ? `${title} · ${amountMatch[0]}` : title, category: lower.includes('bill') ? 'Bills' : 'College', due, priority, done: false, id: Date.now() };
}

document.querySelectorAll('.filter-chip').forEach((button) => button.addEventListener('click', () => { document.querySelector('.filter-chip.active').classList.remove('active'); button.classList.add('active'); activeFilter = button.dataset.filter; renderTasks(); }));
document.querySelector('#open-capture').addEventListener('click', openCapture);
document.querySelector('#open-capture-rail').addEventListener('click', openCapture);
document.querySelector('#mobile-capture').addEventListener('click', openCapture);
document.querySelector('#quick-add').addEventListener('click', openCapture);
document.querySelector('#close-capture').addEventListener('click', closeCapture);
modal.addEventListener('click', (event) => { if (event.target === modal) closeCapture(); });
document.querySelector('#analyze-capture').addEventListener('click', () => { const text = input.value.trim(); if (!text) { showToast('Add a message or thought first.'); input.focus(); return; } tasks.unshift(extractTask(text)); saveTasks(); renderTasks(); closeCapture(); input.value = ''; showToast('AI organized your thought into a task.'); });
input.addEventListener('input', () => { document.querySelector('#char-count').textContent = `${input.value.length} / 2,000`; });
input.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') document.querySelector('#analyze-capture').click(); });
document.querySelectorAll('.capture-tab').forEach((tab) => tab.addEventListener('click', () => { document.querySelector('.capture-tab.active').classList.remove('active'); tab.classList.add('active'); const upload = tab.dataset.captureTab === 'upload'; document.querySelector('#write-panel').hidden = upload; document.querySelector('#upload-panel').hidden = !upload; }));
document.querySelector('#refresh-plan').addEventListener('click', () => showToast('Your plan is already up to date.'));
document.querySelector('#mobile-menu').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));
const viewLabels = { dashboard: 'Overview', tasks: 'Tasks', calendar: 'Calendar', documents: 'Documents', expenses: 'Expenses', assistant: 'AI assistant', settings: 'Settings' };
function ensureWorkspaceView(view) {
  if (view === 'dashboard' || view === 'tasks') return;
  if (document.querySelector(`#${view}-view`)) return;
  const viewMarkup = {
    calendar: `<section class="secondary-view" id="calendar-view"><div class="view-title"><div><p class="eyebrow">WORKSPACE / CALENDAR</p><h2>Deadlines, at a glance.</h2><p>Keep the important dates moving with you.</p></div><button class="outline-dark" id="calendar-today">Jump to today</button></div><div class="calendar-layout panel"><div class="calendar-header"><button class="calendar-arrow">←</button><h3>September 2026</h3><button class="calendar-arrow">→</button><span class="calendar-view-label">Month view</span></div><div class="calendar-weekdays"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div><div class="calendar-days"><span class="muted-day">31</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span class="today-day">18<small>Today</small></span><span>19</span><span>20</span><span class="event-day">21<small>Reading</small></span><span>22</span><span class="event-day amber-day">23<small>Dentist</small></span><span>24</span><span>25</span><span>26</span><span>27</span><span class="event-day">28<small>Renew plan</small></span><span>29</span><span class="event-day">30<small>Project update</small></span></div></div></section>`,
    documents: `<section class="secondary-view" id="documents-view"><div class="view-title"><div><p class="eyebrow">WORKSPACE / DOCUMENTS</p><h2>Your important stuff, surfaced.</h2><p>AI finds dates, amounts, and actions inside the files you save.</p></div><button class="capture-button" id="document-capture"><span>✦</span> Analyze a document</button></div><div class="document-grid"><article class="document-card panel"><div class="document-icon coral">▤</div><div><h3>College Circular</h3><p>PDF · Added yesterday</p><span class="document-status ready">2 actions found</span></div><button class="more-button">•••</button><div class="document-action"><strong>Submit scholarship form</strong><small>Due October 4 · High priority</small></div></article><article class="document-card panel"><div class="document-icon yellow">▤</div><div><h3>Electricity Bill</h3><p>Image · Added Sep 16</p><span class="document-status ready">₹1,842 extracted</span></div><button class="more-button">•••</button><div class="document-action"><strong>Pay electricity bill</strong><small>Due September 24 · Reminder set</small></div></article><article class="document-card panel upload-card"><div class="document-icon purple">↑</div><h3>Bring a document</h3><p>Drop a PDF, image, or DOCX here and TaskFlow will organize what matters.</p><button class="outline-dark" id="document-upload">Upload file</button></article></div></section>`,
    expenses: `<section class="secondary-view" id="expenses-view"><div class="view-title"><div><p class="eyebrow">WORKSPACE / EXPENSES</p><h2>Know where it goes.</h2><p>A simple view of the spending you capture.</p></div><button class="outline-dark" id="add-expense">+ Add expense</button></div><div class="expense-overview"><div class="expense-total panel"><small>SEPTEMBER SPEND</small><strong>₹4,286</strong><span>↓ 12% from last month</span></div><div class="expense-breakdown panel"><small>TOP CATEGORIES</small><div><span><i class="category-dot purple-dot"></i>Shopping <b>₹1,850</b></span><span><i class="category-dot coral-dot"></i>Food <b>₹1,420</b></span><span><i class="category-dot amber-dot"></i>Transport <b>₹1,016</b></span></div></div></div><div class="expense-table panel"><div class="expense-table-head"><strong>Recent expenses</strong><span>September 2026</span></div><div class="expense-row"><span class="expense-symbol purple-bg">▣</span><span><strong>Engineering stationery</strong><small>Sep 17 · Shopping</small></span><b>₹850</b></div><div class="expense-row"><span class="expense-symbol coral-bg">◒</span><span><strong>Campus canteen</strong><small>Sep 16 · Food</small></span><b>₹420</b></div><div class="expense-row"><span class="expense-symbol amber-bg">↗</span><span><strong>Bus pass</strong><small>Sep 15 · Transport</small></span><b>₹500</b></div></div></section>`,
    settings: `<section class="secondary-view" id="settings-view"><div class="view-title"><div><p class="eyebrow">WORKSPACE / SETTINGS</p><h2>Make TaskFlow yours.</h2><p>Control how your workspace captures, reminds, and organizes.</p></div><button class="outline-dark" id="save-settings">Save changes</button></div><div class="settings-grid"><section class="settings-card panel"><p class="settings-label">PROFILE</p><div class="settings-profile"><span class="avatar avatar-large">RM</span><div><h3>Rohan Malluri</h3><p>rohan@example.com</p></div><button class="text-button">Edit profile <span>→</span></button></div><label class="settings-field">Display name<input value="Rohan Malluri"></label></section><section class="settings-card panel"><p class="settings-label">WORKSPACE PREFERENCES</p><label class="settings-toggle"><span><strong>Morning daily plan</strong><small>Get a focused summary at the start of your day.</small></span><input type="checkbox" checked><i></i></label><label class="settings-toggle"><span><strong>Smart priority explanations</strong><small>Show why AI marked something urgent.</small></span><input type="checkbox" checked><i></i></label><label class="settings-toggle"><span><strong>Evening review</strong><small>Receive a short reflection on unfinished tasks.</small></span><input type="checkbox"><i></i></label></section><section class="settings-card panel"><p class="settings-label">DEFAULTS</p><label class="settings-field">Remind me by<select><option>1 day before</option><option>3 days before</option><option>1 week before</option></select></label><label class="settings-field">Default task category<select><option>Personal</option><option>College</option><option>Work</option><option>Bills</option></select></label></section><section class="settings-card panel danger-card"><p class="settings-label">DATA & PRIVACY</p><h3>Your workspace is local-first.</h3><p>Tasks created in this demo stay in this browser. Connect an account later to sync across devices.</p><button class="text-button">Export my data <span>↗</span></button></section></div></section>`
  };
  document.querySelector('#dashboard').insertAdjacentHTML('beforeend', viewMarkup[view]);
  if (view === 'documents') document.querySelector('#document-capture').addEventListener('click', openCapture);
  if (view === 'expenses') document.querySelector('#add-expense').addEventListener('click', () => showToast('Expense capture is ready from the AI Capture button.'));
}
function switchWorkspaceView(view) {
  ensureWorkspaceView(view);
  document.querySelectorAll('#dashboard > :not(.secondary-view)').forEach((panel) => { panel.hidden = view !== 'dashboard' && view !== 'tasks'; });
  document.querySelectorAll('.secondary-view').forEach((panel) => { panel.hidden = panel.id !== `${view}-view`; });
  document.querySelector('.breadcrumbs strong').textContent = viewLabels[view] || 'Overview';
}
document.querySelectorAll('.nav-item[data-view]').forEach((link) => link.addEventListener('click', () => { document.querySelectorAll('.nav-item.active').forEach((item) => item.classList.remove('active')); link.classList.add('active'); document.querySelector('#sidebar').classList.remove('open'); switchWorkspaceView(link.dataset.view); }));
document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCapture(); } if (event.key === 'Escape' && !modal.hidden) closeCapture(); });
renderTasks();
