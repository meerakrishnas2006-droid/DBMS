// ============================================================
// HOSPITAL MANAGEMENT SYSTEM — app.js
// Page-loading SPA router + all page logic
// ============================================================

/* ── Utility helpers ──────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function avatarColor(name) {
  const palette = ['#2563EB','#0D9488','#8B5CF6','#F59E0B','#EF4444','#10B981','#6366F1','#EC4899'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return palette[Math.abs(h) % palette.length];
}
function initials(name) {
  return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
}
function statusBadge(status) {
  const map = {
    'Active':'badge-success','Recovered':'badge-teal','Critical':'badge-danger',
    'Confirmed':'badge-success','Pending':'badge-warning','Completed':'badge-gray','Cancelled':'badge-danger',
    'Paid':'badge-success','Unpaid':'badge-danger','Overdue':'badge-danger','Partial':'badge-warning',
    'In Stock':'badge-success','Low Stock':'badge-warning','Out of Stock':'badge-danger',
    'Present':'badge-success','Absent':'badge-danger','On Leave':'badge-warning','Off Duty':'badge-gray',
    'Available':'badge-success','Busy':'badge-warning',
  };
  return `<span class="badge ${map[status]||'badge-gray'}">${status}</span>`;
}
function toast(message, type = 'info') {
  const icons = { info:'fa-info-circle', success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-triangle' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${icons[type]} toast-icon"></i><span>${message}</span><i class="fas fa-times toast-close" onclick="this.parentElement.remove()"></i>`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

const API_BASE = 'http://localhost:5000/api';
const appState = {
  patients: [],
  doctors: [],
  appointments: [],
  medicines: [],
  staff: [],
  dashboard: {},
};

function getAuthToken() {
  return localStorage.getItem('hmsToken');
}

function requireAuth() {
  if (!getAuthToken()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = (payload && payload.message) || 'Request failed.';
    throw new Error(message);
  }

  return payload;
}

function humanizeStatus(value) {
  if (!value) return 'Pending';
  const text = String(value).trim().replace(/_/g, ' ');
  const words = text.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  return words.join(' ');
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().split('T')[0];
}

function normalizePatientRow(row) {
  const name = [row.firstName, row.lastName].filter(Boolean).join(' ') || row.name || 'Unknown Patient';
  const birthDate = row.dateOfBirth || row.date_of_birth;
  const age = birthDate ? Math.max(0, new Date().getFullYear() - new Date(birthDate).getFullYear()) : '—';
  return {
    id: String(row.id ?? row.patient_id ?? '0'),
    name,
    age,
    gender: row.gender || 'Other',
    blood: row.bloodGroup || row.blood_group || '—',
    contact: row.phone || row.contact || '—',
    disease: row.disease || (row.status === 'critical' ? 'Critical Care' : 'General Care'),
    status: humanizeStatus(row.status || 'active'),
    admitted: formatDate(row.createdAt || row.created_at),
    doctor: row.doctor || 'Unassigned',
  };
}

function normalizeDoctorRow(row) {
  return {
    id: String(row.id ?? row.doctor_id ?? '0'),
    name: row.name || row.doctor_name || 'Unknown Doctor',
    dept: row.departmentName || row.department_name || 'General',
    status: humanizeStatus(row.status || 'available'),
    exp: row.experience ?? row.exp ?? 8,
    patients: row.patients ?? row.patientCount ?? 0,
    rating: row.rating ?? 4.8,
    schedule: row.schedule || 'Mon-Fri 9AM-5PM',
    contact: row.phone || '—',
    email: row.email || '—',
    color: avatarColor(row.name || row.doctor_name || 'Dr. Unknown'),
  };
}

function normalizeAppointmentRow(row) {
  return {
    id: String(row.id ?? row.appointment_id ?? '0'),
    patient: row.patientName || row.patient_name || 'Unknown Patient',
    doctor: row.doctorName || row.doctor_name || 'Unassigned',
    dept: row.departmentName || row.department_name || 'General',
    date: formatDate(row.appointmentDate || row.appointment_date),
    time: row.startTime || row.start_time || '—',
    status: humanizeStatus(row.status || 'pending'),
    type: humanizeStatus(row.appointmentType || row.appointment_type || 'consultation'),
  };
}

function normalizeStaffRow(row) {
  return {
    id: String(row.staff_id ?? row.id ?? '0'),
    name: row.staff_name || row.name || 'Unknown Staff',
    dept: row.department_name || row.departmentName || 'General',
    position: row.role || row.position || 'Staff',
    contact: row.phone || '—',
    status: humanizeStatus(row.status || 'active'),
    joined: formatDate(row.hire_date || row.joined || row.created_at),
  };
}

function normalizeMedicineRow(row) {
  return {
    id: String(row.medicine_id ?? row.id ?? '0'),
    name: row.medicine_name || row.name || 'Unknown Medicine',
    category: row.category || 'General',
    stock: Number(row.stock_quantity ?? row.stock ?? 0),
    expiry: formatDate(row.expiry_date || row.expiry),
    supplier: row.supplier || '—',
    price: Number(row.unit_price ?? row.price ?? 0),
    status: humanizeStatus(row.status || 'in_stock'),
  };
}

function animateCountUps() {
  document.querySelectorAll('.count-up').forEach(el => {
    const target = Number(el.dataset.target || 0);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (target >= 1000 && current >= target) {
        el.textContent = target.toLocaleString();
      }
      if (current >= target) clearInterval(timer);
    }, 28);
  });
}

function updateSummaryCards(stats = {}) {
  const countUps = [...document.querySelectorAll('.stat-card .count-up')];
  const values = [
    Number(stats.totalPatients ?? 0),
    Number(stats.totalDoctors ?? 0),
    Number(stats.upcomingAppointments ?? 0),
    Number(stats.revenue ?? 0),
  ];

  countUps.forEach((el, index) => {
    const value = values[index] ?? 0;
    el.dataset.target = value;
    el.textContent = '0';
  });

  animateCountUps();
}

async function hydrateDashboardCharts() {
  const fallback = HMS.chartData || {
    appointmentsWeekly: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], confirmed:[8,12,10,15,13,9,11], pending:[3,4,2,5,4,3,2], cancelled:[1,2,1,2,1,1,2] },
    patientMonthly: { labels:['Jan','Feb','Mar','Apr','May','Jun'], inpatient:[110,120,130,125,140,150], outpatient:[180,200,210,220,230,250] },
    deptDistribution: { labels:['Cardiology','Neurology','Orthopedics','General','Pediatrics'], data:[35,25,20,15,10], colors:['#2563EB','#0D9488','#8B5CF6','#F59E0B','#EF4444'] },
    revenueMonthly: { labels:['Jan','Feb','Mar','Apr','May','Jun'], revenue:[3200,4100,3900,4700,5100,5600], expenses:[2000,2200,2400,2800,3000,3200] }
  };

  try {
    const [statsResp, revenueResp, deptResp] = await Promise.all([
      apiRequest('/dashboard/stats').catch(() => ({ stats: {} })),
      apiRequest('/dashboard/revenue').catch(() => ({ data: [] })),
      apiRequest('/dashboard/departments').catch(() => ({ departments: [] })),
    ]);

    const stats = statsResp.stats || {};
    updateSummaryCards(stats);

    const revenueData = Array.isArray(revenueResp.data) ? revenueResp.data : [];
    const deptData = Array.isArray(deptResp.departments) ? deptResp.departments : [];

    if (revenueData.length) {
      HMS.chartData = {
        ...fallback,
        revenueMonthly: {
          labels: revenueData.map(item => item.month_name || item.month || 'Month'),
          revenue: revenueData.map(item => Number(item.revenue || 0)),
          expenses: revenueData.map(item => Number(item.expenses || 0)),
        },
      };
    }

    if (deptData.length) {
      HMS.chartData = {
        ...HMS.chartData,
        deptDistribution: {
          labels: deptData.map(item => item.department_name || 'Department'),
          data: deptData.map(item => Number(item.load_pct || 0)),
          colors: ['#2563EB','#0D9488','#8B5CF6','#F59E0B','#EF4444','#10B981'],
        },
      };
    }
  } catch (error) {
    updateSummaryCards({});
  }
}

/* ── Modal helpers ────────────────────────────────────────── */
function openModal(id) {
  const m = $(`#${id}`);
  if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = $(`#${id}`);
  if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
}
function closeAllModals() {
  $$('.modal-overlay').forEach(m => m.classList.remove('active'));
  document.body.style.overflow = '';
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeAllModals();
});

/* ── Confirm Dialog ───────────────────────────────────────── */
function confirmDialog(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="confirm-dialog">
      <div class="icon-wrap"><i class="fas fa-trash-alt"></i></div>
      <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:.5rem">Are you sure?</h3>
      <p style="color:var(--gray-500);font-size:.875rem;margin-bottom:1.5rem">${message}</p>
      <div class="flex gap-3 justify-center">
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove();document.body.style.overflow=''">Cancel</button>
        <button class="btn btn-danger" id="confirm-ok">Yes, Delete</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  overlay.querySelector('#confirm-ok').addEventListener('click', () => {
    onConfirm(); overlay.remove(); document.body.style.overflow = '';
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) { overlay.remove(); document.body.style.overflow = ''; }
  });
}

/* ── Dropdown ─────────────────────────────────────────────── */
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown')) {
    $$('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  }
});
function toggleDropdown(id) {
  const menu = $(`#${id}`);
  const wasOpen = menu.classList.contains('open');
  $$('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  if (!wasOpen) menu.classList.add('open');
}

/* ══════════════════════════════════════════════════════════
   PAGE ROUTER — async fragment loader
════════════════════════════════════════════════════════════ */
const pageCache = {};   // stores processed HTML strings
let   currentPage = '';
let   sidebarCollapsed = false;
let   sidebarMobileOpen = false;

const PAGE_TITLES = {
  dashboard:     'Dashboard',
  patients:      'Patient Management',
  doctors:       'Doctor Management',
  appointments:  'Appointments',
  prescriptions: 'Prescriptions & Treatment',
  pharmacy:      'Pharmacy',
  billing:       'Billing & Invoices',
  staff:         'Staff Management',
  reports:       'Reports & Analytics',
  settings:      'Settings',
};

/**
 * Navigate to a page.
 * Reads HTML from <script type="text/html" id="tpl-{page}"> embedded in
 * dashboard.html — no fetch() needed, works on file:// protocol.
 */
function navigate(page) {
  if (page === currentPage) return;
  currentPage = page;

  // Highlight active nav item
  $$('.nav-item[data-page]').forEach(n => n.classList.toggle('active', n.dataset.page === page));

  const container = $('#page-content');

  // Read from embedded template tag (cached after first access)
  if (!pageCache[page]) {
    const tpl = document.getElementById(`tpl-${page}`);
    if (!tpl) {
      container.innerHTML = `
        <div class="empty-state" style="min-height:50vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <i class="fas fa-exclamation-circle" style="font-size:3rem;color:var(--danger);margin-bottom:1rem"></i>
          <h3>Page not found</h3>
          <p>Template <code>tpl-${page}</code> is missing.</p>
          <button class="btn btn-primary mt-4" onclick="navigate('dashboard')">Go to Dashboard</button>
        </div>`;
      return;
    }
    pageCache[page] = tpl.innerHTML;
  }

  // Brief fade-out then inject
  container.style.opacity = '0';
  container.style.transition = 'opacity .15s';
  setTimeout(() => {
    container.innerHTML = pageCache[page];
    // The .page wrapper has display:none by default in CSS;
    // add 'active' so it becomes display:block (same as old monolithic approach)
    const pageEl = container.querySelector('.page');
    if (pageEl) pageEl.classList.add('active');
    container.style.opacity = '1';
    container.scrollTop = 0;
    closeMobileSidebar();
    initPage(page);
  }, 150);
}

/** Called after each page fragment is injected */
function initPage(page) {
  // Animate count-up numbers
  $$('.count-up').forEach(el => {
    const target = +el.dataset.target;
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 28);
  });

  // Animate progress bars
  setTimeout(() => {
    $$('.progress-bar[data-width]').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
  }, 250);

  // Chart tabs (generic)
  $$('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tab.closest('.chart-tabs').querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Export buttons (reports page)
  $$('.export-btn').forEach(btn => {
    btn.addEventListener('click', () => toast(`Exporting as ${btn.dataset.format}…`, 'info'));
  });

  // Per-page logic
  switch (page) {
    case 'dashboard':    initDashboard();    break;
    case 'patients':     initPatients();     break;
    case 'doctors':      initDoctors();      break;
    case 'appointments': initAppointments(); break;
    case 'prescriptions':initPrescriptions();break;
    case 'pharmacy':     initPharmacy();     break;
    case 'billing':      initBilling();      break;
    case 'staff':        initStaff();        break;
    case 'reports':      initReports();      break;
    case 'settings':     initSettings();     break;
  }
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════ */
async function initDashboard() {
  renderActivities();
  await hydrateDashboardCharts();

  const d = HMS.chartData || {
    appointmentsWeekly: { labels: [], confirmed: [], pending: [], cancelled: [] },
    patientMonthly: { labels: [], inpatient: [], outpatient: [] },
    deptDistribution: { labels: [], data: [], colors: [] },
  };

  const apptCtx = $('#appt-chart');
  if (apptCtx) {
    new Chart(apptCtx, {
      type: 'bar',
      data: {
        labels: d.appointmentsWeekly?.labels || [],
        datasets: [
          { label:'Confirmed', data:d.appointmentsWeekly?.confirmed || [], backgroundColor:'#2563EB', borderRadius:5, barPercentage:.6 },
          { label:'Pending', data:d.appointmentsWeekly?.pending || [], backgroundColor:'#F59E0B', borderRadius:5, barPercentage:.6 },
          { label:'Cancelled', data:d.appointmentsWeekly?.cancelled || [], backgroundColor:'#EF4444', borderRadius:5, barPercentage:.6 },
        ],
      },
      options: { responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'top', labels:{ boxWidth:10, font:{family:'Inter',size:11} } } },
        scales:{ x:{ grid:{display:false} }, y:{ grid:{color:'#F1F5F9'}, beginAtZero:true } },
      },
    });
  }

  const patCtx = $('#patient-chart');
  if (patCtx) {
    new Chart(patCtx, {
      type: 'line',
      data: {
        labels: d.patientMonthly?.labels || [],
        datasets: [
          { label:'Inpatient', data:d.patientMonthly?.inpatient || [], borderColor:'#2563EB', backgroundColor:'rgba(37,99,235,.08)', fill:true, tension:.4, pointRadius:4 },
          { label:'Outpatient', data:d.patientMonthly?.outpatient || [], borderColor:'#0D9488', backgroundColor:'rgba(13,148,136,.08)', fill:true, tension:.4, pointRadius:4 },
        ],
      },
      options: { responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'top', labels:{ boxWidth:10, font:{family:'Inter',size:11} } } },
        scales:{ x:{ grid:{display:false} }, y:{ grid:{color:'#F1F5F9'}, beginAtZero:true } },
      },
    });
  }

  const deptCtx = $('#dept-chart');
  if (deptCtx) {
    new Chart(deptCtx, {
      type: 'doughnut',
      data: {
        labels: d.deptDistribution?.labels || [],
        datasets:[{ data:d.deptDistribution?.data || [], backgroundColor:d.deptDistribution?.colors || ['#2563EB','#0D9488','#8B5CF6','#F59E0B','#EF4444'], borderWidth:0, hoverOffset:6 }],
      },
      options: { responsive:true, maintainAspectRatio:false, cutout:'70%',
        plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, font:{family:'Inter',size:11}, padding:12 } } },
      },
    });
  }

  const scheduleTbody = $('#dashboard-schedule-body');
  if (scheduleTbody) {
    try {
      const resp = await apiRequest('/appointments');
      const data = Array.isArray(resp.appointments) ? resp.appointments : [];
      const rows = data.slice(0, 5).map(item => {
        const patient = item.patientName || 'Unknown Patient';
        const doctor = item.doctorName || 'Unassigned';
        const status = humanizeStatus(item.status || 'pending');
        const initials = patient.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
        const color = avatarColor(patient);
        return `
          <tr>
            <td><div class="flex items-center gap-2"><div class="avatar avatar-sm" style="background:${color}">${initials}</div>${patient}</div></td>
            <td>${doctor}</td><td>${(item.startTime || '—')}</td><td>${statusBadge(status)}</td>
          </tr>`;
      }).join('');
      scheduleTbody.innerHTML = rows || `<tr><td colspan="4">No appointments available.</td></tr>`;
    } catch (error) {
      scheduleTbody.innerHTML = `<tr><td colspan="4">Unable to load live schedule.</td></tr>`;
    }
  }
}

function renderActivities() {
  const list = $('#activity-list');
  if (!list) return;
  const bg   = { blue:'var(--primary-light)', success:'#D1FAE5', warning:'#FEF3C7', purple:'#EDE9FE', danger:'#FEE2E2', teal:'var(--teal-light)' };
  const fg   = { blue:'var(--primary)', success:'var(--success)', warning:'var(--warning)', purple:'var(--purple)', danger:'var(--danger)', teal:'var(--teal)' };
  const data = Array.isArray(HMS.activities) && HMS.activities.length ? HMS.activities : [
    { color:'blue', icon:'fa-user-injured', title:'Patient intake updated', desc:'5 new patient records synced from the database.', time:'2 min ago' },
    { color:'success', icon:'fa-calendar-check', title:'Appointments confirmed', desc:'2 appointments were verified in the last hour.', time:'18 min ago' },
    { color:'warning', icon:'fa-pills', title:'Stock review', desc:'Low-stock medicines require pharmacist attention.', time:'1 hour ago' },
  ];
  list.innerHTML = data.map(a => `
    <div class="activity-item">
      <div class="activity-dot" style="background:${bg[a.color]};color:${fg[a.color]}"><i class="fas ${a.icon}"></i></div>
      <div class="activity-content">
        <div class="title">${a.title}</div>
        <div class="desc">${a.desc}</div>
        <div class="time"><i class="fas fa-clock" style="margin-right:3px"></i>${a.time}</div>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════════════════
   PATIENTS
════════════════════════════════════════════════════════════ */
async function initPatients() {
  try {
    const response = await apiRequest('/patients');
    appState.patients = Array.isArray(response.patients) ? response.patients.map(normalizePatientRow) : [];
  } catch (error) {
    appState.patients = (HMS.patients || []).map(normalizePatientRow);
  }
  renderPatients('');
  const search = $('#patient-search');
  if (search) search.addEventListener('input', e => renderPatients(e.target.value));
  const submit = $('#patient-form-submit');
  if (submit) submit.addEventListener('click', submitPatientForm);
}

function renderPatients(filter = '') {
  const tbody = $('#patients-tbody');
  if (!tbody) return;
  const source = appState.patients.length ? appState.patients : HMS.patients;
  const filtered = (source || []).filter(p =>
    `${p.name || ''} ${p.id || ''} ${p.disease || ''}`.toLowerCase().includes(filter.toLowerCase())
  );
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fas fa-user-injured"></i><h3>No patients found</h3><p>Try a different search term.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><span class="text-primary fw-600">${p.id}</span></td>
      <td>
        <div class="flex items-center gap-2">
          <div class="avatar avatar-sm" style="background:${avatarColor(p.name)}">${initials(p.name)}</div>
          <div><div class="fw-600" style="font-size:.875rem">${p.name}</div><div class="text-xs text-muted">${p.blood}</div></div>
        </div>
      </td>
      <td>${p.age}</td><td>${p.gender}</td><td>${p.contact}</td><td>${p.disease}</td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-sm btn-outline btn-icon" title="View"   onclick="viewPatient('${p.id}')"><i class="fas fa-eye"></i></button>
          <button class="btn btn-sm btn-outline btn-icon" title="Edit"   onclick="editPatient('${p.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger  btn-icon" title="Delete" onclick="deletePatient('${p.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}
function viewPatient(id) {
  const p = HMS.patients.find(x => x.id === id);
  if (!p) return;
  $('#view-patient-content').innerHTML = `
    <div style="text-align:center;margin-bottom:1.5rem">
      <div class="avatar avatar-xl" style="background:${avatarColor(p.name)};margin:0 auto .75rem">${initials(p.name)}</div>
      <h2 style="font-size:1.2rem;font-weight:700">${p.name}</h2>
      <p class="text-muted text-sm">${p.id} &bull; ${p.disease}</p>
      <div style="margin-top:.5rem">${statusBadge(p.status)}</div>
    </div>
    <div class="grid-2 grid" style="gap:.85rem">
      ${[['Age',p.age],['Gender',p.gender],['Blood',p.blood],['Contact',p.contact],['Admitted',p.admitted],['Doctor',p.doctor]].map(([k,v])=>`
        <div style="background:var(--gray-50);border-radius:var(--radius);padding:.85rem">
          <div class="text-xs text-muted fw-600 mb-1">${k}</div>
          <div class="fw-600" style="font-size:.875rem">${v}</div>
        </div>`).join('')}
    </div>`;
  openModal('modal-view-patient');
}
function editPatient(id) {
  const p = HMS.patients.find(x => x.id === id);
  if (!p) return;
  document.getElementById('patient-form-title').textContent = 'Edit Patient';
  $('#pf-name').value    = p.name;
  $('#pf-age').value     = p.age;
  $('#pf-gender').value  = p.gender;
  $('#pf-contact').value = p.contact;
  $('#pf-disease').value = p.disease;
  $('#pf-blood').value   = p.blood;
  $('#pf-status').value  = p.status;
  openModal('modal-patient-form');
}
function deletePatient(id) {
  confirmDialog(`This will permanently delete patient <strong>${id}</strong>.`, () => {
    HMS.patients = HMS.patients.filter(p => p.id !== id);
    renderPatients($('#patient-search')?.value || '');
    toast('Patient deleted successfully', 'success');
  });
}
function submitPatientForm() {
  const name    = $('#pf-name').value.trim();
  const age     = $('#pf-age').value.trim();
  const contact = $('#pf-contact').value.trim();
  const disease = $('#pf-disease').value.trim();
  if (!name || !age || !contact || !disease) { toast('Please fill all required fields','warning'); return; }
  const newId = `P-${String(HMS.patients.length + 1).padStart(3,'0')}`;
  HMS.patients.unshift({
    id:newId, name, age:+age,
    gender:$('#pf-gender').value, blood:$('#pf-blood').value, contact, disease,
    status:$('#pf-status').value,
    admitted: new Date().toISOString().split('T')[0], doctor:'Unassigned',
  });
  renderPatients('');
  closeModal('modal-patient-form');
  toast(`Patient ${name} added!`, 'success');
}

/* ══════════════════════════════════════════════════════════
   DOCTORS
════════════════════════════════════════════════════════════ */
async function initDoctors() {
  try {
    const response = await apiRequest('/doctors');
    appState.doctors = Array.isArray(response.doctors) ? response.doctors.map(normalizeDoctorRow) : [];
  } catch (error) {
    appState.doctors = (HMS.doctors || []).map(normalizeDoctorRow);
  }
  renderDoctors('');
  const search = $('#doctor-search');
  if (search) search.addEventListener('input', e => renderDoctors(e.target.value));
  const submit = $('#doctor-form-submit');
  if (submit) submit.addEventListener('click', submitDoctorForm);
}
function renderDoctors(filter = '') {
  const grid = $('#doctors-grid');
  if (!grid) return;
  const source = appState.doctors.length ? appState.doctors : HMS.doctors || [];
  const filtered = source.filter(d =>
    `${d.name} ${d.dept}`.toLowerCase().includes(filter.toLowerCase())
  );
  grid.innerHTML = filtered.map(d => {
    const dotCls = d.status === 'Available' ? 'online' : d.status === 'Busy' ? 'busy' : 'offline';
    return `
    <div class="doctor-card">
      <div class="doctor-avatar-wrap">
        <div class="avatar avatar-xl" style="background:${d.color}">${initials(d.name)}</div>
        <span class="doctor-online status-dot ${dotCls}"></span>
      </div>
      <div class="doctor-name">${d.name}</div>
      <div class="doctor-dept">${d.dept}</div>
      <div style="margin:.5rem 0">${statusBadge(d.status)}</div>
      <div class="doctor-stats">
        <div class="doctor-stat"><div class="value">${d.exp}y</div><div class="label">Exp.</div></div>
        <div class="doctor-stat"><div class="value">${d.patients}</div><div class="label">Patients</div></div>
        <div class="doctor-stat"><div class="value">${d.rating}★</div><div class="label">Rating</div></div>
      </div>
      <div class="divider"></div>
      <div class="text-xs text-muted mb-3"><i class="fas fa-clock" style="margin-right:4px"></i>${d.schedule}</div>
      <div class="flex gap-2">
        <button class="btn btn-primary btn-sm flex-1" onclick="viewDoctor('${d.id}')"><i class="fas fa-eye"></i> View</button>
        <button class="btn btn-outline btn-sm" onclick="editDoctor('${d.id}')"><i class="fas fa-edit"></i></button>
      </div>
    </div>`;
  }).join('');
}
function viewDoctor(id) {
  const d = HMS.doctors.find(x => x.id === id);
  if (!d) return;
  $('#view-doctor-content').innerHTML = `
    <div style="background:linear-gradient(135deg,${d.color},var(--teal));border-radius:var(--radius-lg);padding:2rem;text-align:center;color:#fff;margin-bottom:1.5rem">
      <div class="avatar avatar-xl" style="background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.5);margin:0 auto 1rem;font-size:1.6rem">${initials(d.name)}</div>
      <h2 style="font-size:1.15rem;font-weight:700">${d.name}</h2>
      <p style="opacity:.85;margin-top:.2rem">${d.dept} &bull; ${d.id}</p>
    </div>
    <div class="grid-2 grid" style="gap:.85rem">
      ${[['Experience',`${d.exp} years`],['Patients',d.patients],['Rating',`${d.rating}/5 ★`],['Status',d.status],['Contact',d.contact],['Email',d.email],['Schedule',d.schedule]].map(([k,v])=>`
        <div style="background:var(--gray-50);border-radius:var(--radius);padding:.85rem">
          <div class="text-xs text-muted fw-600 mb-1">${k}</div>
          <div class="fw-600" style="font-size:.875rem">${v}</div>
        </div>`).join('')}
    </div>`;
  openModal('modal-view-doctor');
}
function editDoctor(id) {
  const d = HMS.doctors.find(x => x.id === id);
  if (!d) return;
  document.getElementById('doctor-form-title').textContent = 'Edit Doctor';
  $('#df-name').value = d.name; $('#df-dept').value = d.dept; $('#df-exp').value = d.exp;
  $('#df-contact').value = d.contact; $('#df-email').value = d.email;
  $('#df-schedule').value = d.schedule; $('#df-status').value = d.status;
  openModal('modal-doctor-form');
}
function submitDoctorForm() {
  const name = $('#df-name').value.trim();
  if (!name) { toast('Doctor name is required','warning'); return; }
  toast(`Doctor ${name} saved!`, 'success');
  closeModal('modal-doctor-form');
}

/* ══════════════════════════════════════════════════════════
   APPOINTMENTS
════════════════════════════════════════════════════════════ */
async function initAppointments() {
  renderMiniCalendar();
  try {
    const response = await apiRequest('/appointments');
    appState.appointments = Array.isArray(response.appointments) ? response.appointments.map(normalizeAppointmentRow) : [];
  } catch (error) {
    appState.appointments = (HMS.appointments || []).map(normalizeAppointmentRow);
  }
  renderAppointments('');
  const search = $('#appt-search');
  if (search) search.addEventListener('input', e => renderAppointments(e.target.value));
  const submit = $('#appt-form-submit');
  if (submit) submit.addEventListener('click', () => {
    const p = $('#af-patient').value.trim();
    if (!p) { toast('Please enter patient name','warning'); return; }
    toast('Appointment scheduled!', 'success');
    closeModal('modal-appt-form');
  });
}
function renderAppointments(filter = '') {
  const tbody = $('#appt-tbody');
  if (!tbody) return;
  const source = appState.appointments.length ? appState.appointments : HMS.appointments || [];
  const filtered = source.filter(a =>
    `${a.patient} ${a.doctor} ${a.id}`.toLowerCase().includes(filter.toLowerCase())
  );
  tbody.innerHTML = filtered.map(a => `
    <tr>
      <td><span class="text-primary fw-600">${a.id}</span></td>
      <td><div class="flex items-center gap-2"><div class="avatar avatar-sm" style="background:${avatarColor(a.patient)}">${initials(a.patient)}</div><span class="fw-500">${a.patient}</span></div></td>
      <td>${a.doctor}</td><td>${a.dept}</td><td>${a.date}</td><td>${a.time}</td>
      <td>${statusBadge(a.status)}</td>
      <td><span class="badge badge-primary">${a.type}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-sm btn-outline btn-icon" onclick="toast('Editing appointment…','info')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger  btn-icon" onclick="toast('Appointment cancelled','warning')"><i class="fas fa-times"></i></button>
        </div>
      </td>
    </tr>`).join('');
}
function renderMiniCalendar() {
  const today = new Date();
  const year = today.getFullYear(), month = today.getMonth();
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const eventDays = [5,8,12,15,18,22,25,28];
  const container = $('#mini-calendar');
  if (!container) return;
  container.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <button class="btn btn-outline btn-sm btn-icon"><i class="fas fa-chevron-left"></i></button>
      <span class="fw-700">${months[month]} ${year}</span>
      <button class="btn btn-outline btn-sm btn-icon"><i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="cal-header">${dayNames.map(d=>`<div class="cal-day-name">${d}</div>`).join('')}</div>
    <div class="calendar-grid">
      ${Array(firstDay).fill('<div></div>').join('')}
      ${Array.from({length:daysInMonth},(_,i)=>{
        const day=i+1, isToday=day===today.getDate(), hasEvent=eventDays.includes(day);
        return `<div class="cal-day${isToday?' today':''}${hasEvent?' has-event':''}" onclick="toast('${months[month]} ${day}','info')">${day}</div>`;
      }).join('')}
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   PRESCRIPTIONS
════════════════════════════════════════════════════════════ */
let rxMedicines = [{name:'',dose:'',freq:'',dur:'',notes:''}];

function initPrescriptions() {
  renderPrescriptions();
  const addBtn = $('#rx-add-medicine');
  if (addBtn) addBtn.addEventListener('click', addRxMedicine);
  const submit = $('#rx-form-submit');
  if (submit) submit.addEventListener('click', submitRxForm);
  renderRxMedicineList();
}
function renderPrescriptions() {
  const list = $('#rx-list');
  if (!list) return;
  list.innerHTML = HMS.prescriptions.map(rx => `
    <div class="card mb-4" style="overflow:hidden">
      <div class="rx-header">
        <div class="flex items-center justify-between">
          <div><div style="font-size:.72rem;opacity:.7">PRESCRIPTION ID</div><div style="font-size:1.1rem;font-weight:700">${rx.id}</div></div>
          <div style="text-align:right"><div style="font-size:.72rem;opacity:.7">DATE</div><div class="fw-600">${rx.date}</div></div>
        </div>
      </div>
      <div class="card-body">
        <div class="two-col mb-4">
          <div><div class="text-xs text-muted fw-600 mb-1">Patient</div>
            <div class="flex items-center gap-2"><div class="avatar avatar-sm" style="background:${avatarColor(rx.patient)}">${initials(rx.patient)}</div><span class="fw-600">${rx.patient}</span></div>
          </div>
          <div><div class="text-xs text-muted fw-600 mb-1">Doctor</div>
            <div class="flex items-center gap-2"><div class="avatar avatar-sm" style="background:${avatarColor(rx.doctor)}">${initials(rx.doctor)}</div><span class="fw-600">${rx.doctor}</span></div>
          </div>
        </div>
        <div style="background:var(--primary-light);border-radius:var(--radius);padding:1rem;margin-bottom:1rem">
          <div class="text-xs fw-700 text-primary mb-1">DIAGNOSIS</div>
          <div style="font-size:.9rem;color:var(--gray-700)">${rx.diagnosis}</div>
        </div>
        <div class="fw-700 mb-3" style="font-size:.9rem"><i class="fas fa-pills text-primary" style="margin-right:.5rem"></i>Medicines</div>
        ${rx.medicines.map(m=>`
          <div class="medicine-row">
            <div style="flex:1"><div class="fw-600" style="font-size:.875rem">${m.name}</div><div class="text-xs text-muted mt-1">${m.notes||''}</div></div>
            <div class="text-center" style="min-width:70px"><div class="text-xs text-muted">Dose</div><div class="fw-600 text-sm">${m.dose}</div></div>
            <div class="text-center" style="min-width:90px"><div class="text-xs text-muted">Frequency</div><div class="fw-600 text-sm">${m.freq}</div></div>
            <div class="text-center" style="min-width:70px"><div class="text-xs text-muted">Duration</div><div class="fw-600 text-sm">${m.dur}</div></div>
          </div>`).join('')}
        <div style="background:var(--teal-light);border-radius:var(--radius);padding:1rem;margin-top:1rem">
          <div class="text-xs fw-700 text-teal mb-1"><i class="fas fa-sticky-note" style="margin-right:4px"></i>DOCTOR NOTES</div>
          <div style="font-size:.875rem;color:var(--gray-700)">${rx.notes}</div>
        </div>
      </div>
      <div style="padding:1rem 1.5rem;border-top:1px solid var(--gray-100);display:flex;gap:.75rem;justify-content:flex-end">
        <button class="btn btn-outline btn-sm" onclick="toast('Printing…','info')"><i class="fas fa-print"></i> Print</button>
        <button class="btn btn-primary btn-sm" onclick="openModal('modal-rx-form')"><i class="fas fa-edit"></i> Edit</button>
      </div>
    </div>`).join('');
}
function renderRxMedicineList() {
  const container = $('#rx-medicine-list');
  if (!container) return;
  container.innerHTML = rxMedicines.map((m,i) => `
    <div class="medicine-row">
      <input class="form-control" style="flex:1.5" placeholder="Medicine name"  value="${m.name}" oninput="rxMedicines[${i}].name=this.value">
      <input class="form-control" style="width:85px"  placeholder="Dose"       value="${m.dose}" oninput="rxMedicines[${i}].dose=this.value">
      <input class="form-control" style="width:110px" placeholder="Frequency"  value="${m.freq}" oninput="rxMedicines[${i}].freq=this.value">
      <input class="form-control" style="width:85px"  placeholder="Duration"   value="${m.dur}"  oninput="rxMedicines[${i}].dur=this.value">
      <button class="del-btn" onclick="removeRxMedicine(${i})"><i class="fas fa-trash"></i></button>
    </div>`).join('');
}
function addRxMedicine() {
  rxMedicines.push({name:'',dose:'',freq:'',dur:'',notes:''});
  renderRxMedicineList();
}
function removeRxMedicine(i) {
  rxMedicines.splice(i,1);
  if (!rxMedicines.length) rxMedicines = [{name:'',dose:'',freq:'',dur:'',notes:''}];
  renderRxMedicineList();
}
function submitRxForm() {
  const patient = $('#rx-patient').value.trim();
  if (!patient) { toast('Patient name is required','warning'); return; }
  const id = `RX-${String(HMS.prescriptions.length+1).padStart(3,'0')}`;
  HMS.prescriptions.unshift({
    id, patient,
    doctor: $('#rx-doctor').value || 'Dr. Unassigned',
    date: new Date().toISOString().split('T')[0],
    diagnosis: $('#rx-diagnosis').value || '',
    medicines: [...rxMedicines],
    notes: $('#rx-notes').value || '',
  });
  renderPrescriptions();
  closeModal('modal-rx-form');
  toast(`Prescription ${id} issued!`, 'success');
  rxMedicines = [{name:'',dose:'',freq:'',dur:'',notes:''}];
}

/* ══════════════════════════════════════════════════════════
   PHARMACY
════════════════════════════════════════════════════════════ */
async function initPharmacy() {
  try {
    const response = await apiRequest('/medicines');
    appState.medicines = Array.isArray(response.medicines) ? response.medicines.map(normalizeMedicineRow) : [];
  } catch (error) {
    appState.medicines = (HMS.medicines || []).map(normalizeMedicineRow);
  }
  renderPharmacy('');
  const search = $('#pharmacy-search');
  if (search) search.addEventListener('input', e => renderPharmacy(e.target.value));
}
function renderPharmacy(filter = '') {
  const tbody = $('#pharmacy-tbody');
  if (!tbody) return;
  const source = appState.medicines.length ? appState.medicines : HMS.medicines || [];
  const filtered = source.filter(m =>
    `${m.name} ${m.category}`.toLowerCase().includes(filter.toLowerCase())
  );
  tbody.innerHTML = filtered.map(m => {
    const pct = Math.min((m.stock / 500) * 100, 100);
    const bar = m.status === 'In Stock' ? 'var(--success)' : m.status === 'Low Stock' ? 'var(--warning)' : 'var(--danger)';
    return `
    <tr>
      <td><span class="text-primary fw-600">${m.id}</span></td>
      <td><div class="fw-600" style="font-size:.875rem">${m.name}</div><div class="text-xs text-muted">${m.category}</div></td>
      <td>
        <div class="flex items-center gap-2">
          <div style="width:70px"><div class="progress"><div class="progress-bar" style="width:${pct}%;background:${bar}"></div></div></div>
          <span class="fw-600">${m.stock}</span>
        </div>
      </td>
      <td>${m.expiry}</td><td>${m.supplier}</td><td>$${Number(m.price || 0).toFixed(2)}</td>
      <td>${statusBadge(m.status)}</td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-sm btn-outline btn-icon" onclick="toast('Editing ${m.name}…','info')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-teal   btn-icon" onclick="toast('Restocking ${m.name}…','info')"><i class="fas fa-plus"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════════
   BILLING
════════════════════════════════════════════════════════════ */
function initBilling() { renderBilling(); }
function renderBilling() {
  const list = $('#billing-list');
  if (!list) return;
  list.innerHTML = HMS.invoices.map(inv => {
    const treatTotal = inv.treatments.reduce((s,t) => s + t.price * t.qty, 0);
    const medTotal   = inv.medicines.reduce((s,m)  => s + m.price, 0);
    const sub  = treatTotal + medTotal;
    const tax  = sub * inv.taxRate;
    const total= sub + tax;
    return `
    <div class="card mb-4" style="overflow:hidden">
      <div style="background:linear-gradient(135deg,#0F172A,var(--primary-dark));color:#fff;padding:1.5rem">
        <div class="flex items-center justify-between">
          <div><div style="font-size:.7rem;opacity:.6;letter-spacing:.08em">INVOICE</div><div style="font-size:1.3rem;font-weight:800">${inv.id}</div></div>
          <div>${statusBadge(inv.status)}</div>
        </div>
        <div class="two-col mt-4">
          <div><div style="font-size:.7rem;opacity:.6;margin-bottom:.2rem">BILLED TO</div>
            <div class="fw-600">${inv.patient}</div><div style="font-size:.8rem;opacity:.7">${inv.doctor}</div>
          </div>
          <div style="text-align:right"><div style="font-size:.7rem;opacity:.6;margin-bottom:.2rem">DATE / DUE</div>
            <div class="fw-600">${inv.date}</div><div style="font-size:.8rem;opacity:.7">Due: ${inv.due}</div>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="fw-700 mb-3">Treatment Charges</div>
        <div class="table-wrap mb-3"><table class="table">
          <thead><tr><th>Description</th><th>Qty</th><th style="text-align:right">Price</th></tr></thead>
          <tbody>${inv.treatments.map(t=>`<tr><td>${t.desc}</td><td>${t.qty}</td><td style="text-align:right">$${(t.price*t.qty).toFixed(2)}</td></tr>`).join('')}</tbody>
        </table></div>
        <div class="fw-700 mb-3">Medicine Charges</div>
        <div class="table-wrap mb-4"><table class="table">
          <thead><tr><th>Medicine</th><th></th><th style="text-align:right">Price</th></tr></thead>
          <tbody>${inv.medicines.map(m=>`<tr><td colspan="2">${m.name}</td><td style="text-align:right">$${m.price.toFixed(2)}</td></tr>`).join('')}</tbody>
        </table></div>
        <div style="background:var(--gray-900);color:#fff;border-radius:var(--radius-lg);padding:1.25rem 1.5rem">
          <div class="flex justify-between mb-2" style="font-size:.9rem;opacity:.8"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>
          <div class="flex justify-between mb-2" style="font-size:.9rem;opacity:.8"><span>Tax (${(inv.taxRate*100).toFixed(0)}%)</span><span>$${tax.toFixed(2)}</span></div>
          <div style="height:1px;background:rgba(255,255,255,.15);margin:.5rem 0"></div>
          <div class="flex justify-between" style="font-size:1.1rem;font-weight:800"><span>Total</span><span>$${total.toFixed(2)}</span></div>
        </div>
      </div>
      <div style="padding:1rem 1.5rem;border-top:1px solid var(--gray-100);display:flex;gap:.75rem;justify-content:flex-end">
        <button class="btn btn-outline btn-sm" onclick="toast('Downloading PDF…','info')"><i class="fas fa-download"></i> PDF</button>
        <button class="btn btn-primary btn-sm" onclick="toast('Printing invoice…','info')"><i class="fas fa-print"></i> Print</button>
        ${inv.status==='Pending'?`<button class="btn btn-success btn-sm" onclick="toast('Payment recorded','success')"><i class="fas fa-check"></i> Mark Paid</button>`:''}
      </div>
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════════
   STAFF
════════════════════════════════════════════════════════════ */
async function initStaff() {
  try {
    const response = await apiRequest('/staff');
    appState.staff = Array.isArray(response.staff) ? response.staff.map(normalizeStaffRow) : [];
  } catch (error) {
    appState.staff = (HMS.staff || []).map(normalizeStaffRow);
  }
  renderStaff('');
  const search = $('#staff-search');
  if (search) search.addEventListener('input', e => renderStaff(e.target.value));
}
function renderStaff(filter = '') {
  const tbody = $('#staff-tbody');
  if (!tbody) return;
  const source = appState.staff.length ? appState.staff : HMS.staff || [];
  const filtered = source.filter(s =>
    `${s.name} ${s.dept} ${s.position}`.toLowerCase().includes(filter.toLowerCase())
  );
  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td><span class="text-primary fw-600">${s.id}</span></td>
      <td>
        <div class="flex items-center gap-2">
          <div class="avatar avatar-sm" style="background:${avatarColor(s.name)}">${initials(s.name)}</div>
          <div><div class="fw-600" style="font-size:.875rem">${s.name}</div><div class="text-xs text-muted">${s.joined}</div></div>
        </div>
      </td>
      <td>${s.dept}</td><td>${s.position}</td><td>${s.contact}</td>
      <td>${statusBadge(s.status)}</td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-sm btn-outline btn-icon" onclick="toast('Viewing ${s.name}…','info')"><i class="fas fa-eye"></i></button>
          <button class="btn btn-sm btn-outline btn-icon" onclick="toast('Editing ${s.name}…','info')"><i class="fas fa-edit"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

/* ══════════════════════════════════════════════════════════
   REPORTS
════════════════════════════════════════════════════════════ */
function initReports() {
  const d = HMS.chartData;
  const revCtx = $('#revenue-chart');
  if (revCtx) {
    new Chart(revCtx, {
      type:'bar',
      data:{
        labels:d.revenueMonthly.labels,
        datasets:[
          { label:'Revenue', data:d.revenueMonthly.revenue, backgroundColor:'#2563EB', borderRadius:6, barPercentage:.55 },
          { label:'Expenses',data:d.revenueMonthly.expenses,backgroundColor:'#EF4444', borderRadius:6, barPercentage:.55 },
        ],
      },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'top' } },
        scales:{ x:{ grid:{display:false} }, y:{ grid:{color:'#F1F5F9'}, beginAtZero:true, ticks:{ callback:v=>'$'+v.toLocaleString() } } },
      },
    });
  }
  const patCtx = $('#rpt-patient-chart');
  if (patCtx) {
    new Chart(patCtx, {
      type:'line',
      data:{
        labels:d.patientMonthly.labels,
        datasets:[
          { label:'Inpatient', data:d.patientMonthly.inpatient,  borderColor:'#2563EB', backgroundColor:'rgba(37,99,235,.1)', fill:true, tension:.4 },
          { label:'Outpatient',data:d.patientMonthly.outpatient, borderColor:'#0D9488', backgroundColor:'rgba(13,148,136,.1)', fill:true, tension:.4 },
        ],
      },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'top' } },
        scales:{ x:{ grid:{display:false} }, y:{ grid:{color:'#F1F5F9'}, beginAtZero:true } },
      },
    });
  }
}

/* ══════════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════════════ */
function initSettings() {
  // Render notification toggles
  const togglesContainer = $('#notif-toggles');
  if (togglesContainer) {
    const notifSettings = [
      ['Email notifications for new appointments', true],
      ['SMS alerts for critical patients', true],
      ['Low stock pharmacy alerts', true],
      ['Daily summary reports', false],
      ['Security login alerts', true],
    ];
    togglesContainer.innerHTML = notifSettings.map(([label, checked]) => `
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm">${label}</span>
        <label style="position:relative;display:inline-block;width:42px;height:22px;cursor:pointer">
          <input type="checkbox" ${checked?'checked':''} style="opacity:0;width:0;height:0" onchange="this.nextElementSibling.style.background=this.checked?'var(--primary)':'var(--gray-200)';this.nextElementSibling.querySelector('span').style.transform=this.checked?'translateX(20px)':'translateX(0)'">
          <span style="position:absolute;cursor:pointer;inset:0;background:${checked?'var(--primary)':'var(--gray-200)'};border-radius:99px;transition:.3s;display:flex;align-items:center;padding:2px">
            <span style="background:#fff;border-radius:50%;width:18px;height:18px;transform:${checked?'translateX(20px)':'translateX(0)'};transition:.3s;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,.2)"></span>
          </span>
        </label>
      </div>`).join('');
  }
  const saveBtn = $('#settings-save');
  if (saveBtn) saveBtn.addEventListener('click', () => toast('Settings saved!','success'));
}

/* ══════════════════════════════════════════════════════════
   NOTIFICATIONS PANEL
════════════════════════════════════════════════════════════ */
function renderNotifications() {
  const panel = $('#notif-panel');
  if (!panel) return;
  panel.innerHTML = HMS.notifications.map(n => `
    <div class="notif-item ${n.read?'read':''}" onclick="markNotifRead(${n.id})">
      <div class="notif-dot-badge"></div>
      <div style="flex:1">
        <div class="title">${n.title}</div>
        <div class="desc">${n.desc}</div>
        <div class="time"><i class="fas fa-clock" style="margin-right:3px"></i>${n.time}</div>
      </div>
    </div>`).join('');
  updateNotifBadge();
}
function markNotifRead(id) {
  const n = HMS.notifications.find(x => x.id === id);
  if (n) n.read = true;
  renderNotifications();
}
function updateNotifBadge() {
  const unread = HMS.notifications.filter(n => !n.read).length;
  const badge = $('#notif-count');
  if (badge) badge.textContent = unread;
}
function markAllRead() {
  HMS.notifications.forEach(n => n.read = true);
  renderNotifications();
  toast('All notifications marked as read', 'success');
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════════════════ */
function toggleSidebar() {
  if (window.innerWidth <= 768) {
    sidebarMobileOpen = !sidebarMobileOpen;
    $('.sidebar').classList.toggle('mobile-open', sidebarMobileOpen);
    $('.sidebar-overlay').classList.toggle('active', sidebarMobileOpen);
  } else {
    sidebarCollapsed = !sidebarCollapsed;
    $('.sidebar').classList.toggle('collapsed', sidebarCollapsed);
    $('.main-content').classList.toggle('collapsed', sidebarCollapsed);
  }
}
function closeMobileSidebar() {
  sidebarMobileOpen = false;
  $('.sidebar')?.classList.remove('mobile-open');
  $('.sidebar-overlay')?.classList.remove('active');
}

/* ══════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar nav clicks
  $$('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });
  // Sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', toggleSidebar);
  // Mobile overlay close
  document.querySelector('.sidebar-overlay')?.addEventListener('click', closeMobileSidebar);
  // Notification mark all
  document.getElementById('mark-all-read')?.addEventListener('click', markAllRead);
  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    confirmDialog('Are you sure you want to logout?', () => { window.location.href = 'index.html'; });
  });
  // Header search
  document.getElementById('header-search')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') toast(`Searching for "${e.target.value}"…`, 'info');
  });

  if (!requireAuth()) return;

  // Render notifications in header panel
  renderNotifications();

  // Load the dashboard page first
  navigate('dashboard');
});
