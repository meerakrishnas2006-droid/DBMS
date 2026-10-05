// ============================================================
// HOSPITAL MANAGEMENT SYSTEM - Mock Data
// ============================================================

const HMS = {};

// ── Patients ─────────────────────────────────────────────────
HMS.patients = [
  { id:'P-001', name:'Emma Johnson',     age:34, gender:'Female', contact:'(555) 101-2030', disease:'Hypertension',       status:'Active',    blood:'A+',  admitted:'2024-01-15', doctor:'Dr. Sarah Chen' },
  { id:'P-002', name:'Michael Chen',     age:52, gender:'Male',   contact:'(555) 203-4050', disease:'Diabetes Type 2',    status:'Active',    blood:'O+',  admitted:'2024-01-18', doctor:'Dr. James Wilson' },
  { id:'P-003', name:'Sophia Williams',  age:28, gender:'Female', contact:'(555) 305-6070', disease:'Migraine',           status:'Recovered', blood:'B+',  admitted:'2024-01-20', doctor:'Dr. Priya Nair' },
  { id:'P-004', name:'Robert Davis',     age:67, gender:'Male',   contact:'(555) 407-8090', disease:'Cardiac Arrest',     status:'Critical',  blood:'AB-', admitted:'2024-01-22', doctor:'Dr. Sarah Chen' },
  { id:'P-005', name:'Olivia Martinez',  age:45, gender:'Female', contact:'(555) 509-1020', disease:'Kidney Stones',      status:'Active',    blood:'O-',  admitted:'2024-01-25', doctor:'Dr. Ahmed Hassan' },
  { id:'P-006', name:'James Anderson',   age:38, gender:'Male',   contact:'(555) 601-2030', disease:'Pneumonia',          status:'Active',    blood:'A-',  admitted:'2024-01-27', doctor:'Dr. Priya Nair' },
  { id:'P-007', name:'Ava Thompson',     age:22, gender:'Female', contact:'(555) 703-4050', disease:'Appendicitis',       status:'Recovered', blood:'B-',  admitted:'2024-01-30', doctor:'Dr. James Wilson' },
  { id:'P-008', name:'William Harris',   age:59, gender:'Male',   contact:'(555) 805-6070', disease:'Arthritis',          status:'Active',    blood:'AB+', admitted:'2024-02-01', doctor:'Dr. Ahmed Hassan' },
  { id:'P-009', name:'Isabella Clark',   age:41, gender:'Female', contact:'(555) 907-8090', disease:'Thyroid Disorder',   status:'Active',    blood:'A+',  admitted:'2024-02-03', doctor:'Dr. Sarah Chen' },
  { id:'P-010', name:'Noah Robinson',    age:75, gender:'Male',   contact:'(555) 109-2030', disease:'COPD',               status:'Critical',  blood:'O+',  admitted:'2024-02-05', doctor:'Dr. James Wilson' },
  { id:'P-011', name:'Mia Walker',       age:31, gender:'Female', contact:'(555) 211-3040', disease:'Anemia',             status:'Active',    blood:'B+',  admitted:'2024-02-07', doctor:'Dr. Priya Nair' },
  { id:'P-012', name:'Liam Hall',        age:48, gender:'Male',   contact:'(555) 313-4050', disease:'Gallstones',         status:'Active',    blood:'O-',  admitted:'2024-02-09', doctor:'Dr. Ahmed Hassan' },
];

// ── Doctors ───────────────────────────────────────────────────
HMS.doctors = [
  { id:'D-001', name:'Dr. Sarah Chen',    dept:'Cardiology',      exp:12, patients:248, rating:4.9, status:'Available', contact:'ext-201', email:'s.chen@medcare.com',    color:'#2563EB', schedule:'Mon-Fri 9AM-5PM' },
  { id:'D-002', name:'Dr. James Wilson',  dept:'Endocrinology',   exp:18, patients:312, rating:4.8, status:'Busy',      contact:'ext-202', email:'j.wilson@medcare.com',  color:'#0D9488', schedule:'Mon-Thu 8AM-4PM' },
  { id:'D-003', name:'Dr. Priya Nair',    dept:'Neurology',       exp:9,  patients:187, rating:4.7, status:'Available', contact:'ext-203', email:'p.nair@medcare.com',    color:'#8B5CF6', schedule:'Tue-Sat 10AM-6PM' },
  { id:'D-004', name:'Dr. Ahmed Hassan',  dept:'Nephrology',      exp:15, patients:274, rating:4.9, status:'Available', contact:'ext-204', email:'a.hassan@medcare.com',  color:'#F59E0B', schedule:'Mon-Fri 9AM-5PM' },
  { id:'D-005', name:'Dr. Emily Brown',   dept:'Orthopedics',     exp:11, patients:203, rating:4.6, status:'Off Duty',  contact:'ext-205', email:'e.brown@medcare.com',   color:'#EF4444', schedule:'Mon-Wed 9AM-3PM' },
  { id:'D-006', name:'Dr. Daniel Lee',    dept:'Pulmonology',     exp:7,  patients:156, rating:4.8, status:'Available', contact:'ext-206', email:'d.lee@medcare.com',     color:'#10B981', schedule:'Mon-Fri 8AM-4PM' },
  { id:'D-007', name:'Dr. Aisha Patel',   dept:'Dermatology',     exp:6,  patients:142, rating:4.7, status:'Available', contact:'ext-207', email:'a.patel@medcare.com',   color:'#EC4899', schedule:'Tue-Sat 9AM-5PM' },
  { id:'D-008', name:'Dr. Marcus Reed',   dept:'General Surgery',  exp:20, patients:389, rating:5.0, status:'Busy',      contact:'ext-208', email:'m.reed@medcare.com',    color:'#6366F1', schedule:'Mon-Fri 7AM-3PM' },
];

// ── Appointments ──────────────────────────────────────────────
HMS.appointments = [
  { id:'APT-001', patient:'Emma Johnson',    doctor:'Dr. Sarah Chen',   dept:'Cardiology',    date:'2024-02-12', time:'09:00 AM', status:'Confirmed', type:'Follow-up' },
  { id:'APT-002', patient:'Michael Chen',    doctor:'Dr. James Wilson',  dept:'Endocrinology', date:'2024-02-12', time:'10:30 AM', status:'Pending',   type:'Consultation' },
  { id:'APT-003', patient:'Sophia Williams', doctor:'Dr. Priya Nair',    dept:'Neurology',     date:'2024-02-12', time:'11:00 AM', status:'Confirmed', type:'Check-up' },
  { id:'APT-004', patient:'Robert Davis',    doctor:'Dr. Sarah Chen',    dept:'Cardiology',    date:'2024-02-13', time:'09:30 AM', status:'Completed', type:'Emergency' },
  { id:'APT-005', patient:'Olivia Martinez', doctor:'Dr. Ahmed Hassan',  dept:'Nephrology',    date:'2024-02-13', time:'02:00 PM', status:'Cancelled', type:'Consultation' },
  { id:'APT-006', patient:'James Anderson',  doctor:'Dr. Daniel Lee',    dept:'Pulmonology',   date:'2024-02-14', time:'10:00 AM', status:'Pending',   type:'Follow-up' },
  { id:'APT-007', patient:'Ava Thompson',    doctor:'Dr. James Wilson',  dept:'Endocrinology', date:'2024-02-14', time:'03:00 PM', status:'Confirmed', type:'Check-up' },
  { id:'APT-008', patient:'William Harris',  doctor:'Dr. Ahmed Hassan',  dept:'Nephrology',    date:'2024-02-15', time:'11:30 AM', status:'Completed', type:'Follow-up' },
  { id:'APT-009', patient:'Isabella Clark',  doctor:'Dr. Sarah Chen',    dept:'Cardiology',    date:'2024-02-15', time:'01:00 PM', status:'Pending',   type:'Consultation' },
  { id:'APT-010', patient:'Noah Robinson',   doctor:'Dr. Daniel Lee',    dept:'Pulmonology',   date:'2024-02-16', time:'08:30 AM', status:'Confirmed', type:'Emergency' },
];

// ── Pharmacy / Medicines ──────────────────────────────────────
HMS.medicines = [
  { id:'MED-001', name:'Metformin 500mg',   category:'Antidiabetic',   stock:450, expiry:'2025-08-30', supplier:'PharmaCo Ltd',    price:2.50,  status:'In Stock' },
  { id:'MED-002', name:'Lisinopril 10mg',   category:'Antihypertensive',stock:280, expiry:'2025-06-15', supplier:'MediSupply Inc',  price:3.20,  status:'In Stock' },
  { id:'MED-003', name:'Atorvastatin 20mg', category:'Statin',          stock:180, expiry:'2025-09-20', supplier:'PharmaCo Ltd',    price:4.80,  status:'In Stock' },
  { id:'MED-004', name:'Amoxicillin 250mg', category:'Antibiotic',      stock:50,  expiry:'2024-12-31', supplier:'BioMed Corp',     price:1.90,  status:'Low Stock' },
  { id:'MED-005', name:'Omeprazole 20mg',   category:'PPI',             stock:320, expiry:'2025-11-10', supplier:'MediSupply Inc',  price:2.10,  status:'In Stock' },
  { id:'MED-006', name:'Amlodipine 5mg',    category:'CCB',             stock:15,  expiry:'2024-11-28', supplier:'PharmaCo Ltd',    price:3.60,  status:'Critical' },
  { id:'MED-007', name:'Paracetamol 500mg', category:'Analgesic',       stock:890, expiry:'2026-03-15', supplier:'GenPharma Ltd',   price:0.80,  status:'In Stock' },
  { id:'MED-008', name:'Insulin Glargine',  category:'Insulin',         stock:120, expiry:'2025-04-22', supplier:'BioMed Corp',     price:48.00, status:'In Stock' },
  { id:'MED-009', name:'Salbutamol Inhaler',category:'Bronchodilator',  stock:75,  expiry:'2025-07-18', supplier:'RespiraTech',     price:12.50, status:'In Stock' },
  { id:'MED-010', name:'Warfarin 5mg',      category:'Anticoagulant',   stock:8,   expiry:'2024-10-05', supplier:'MediSupply Inc',  price:5.40,  status:'Critical' },
];

// ── Staff ─────────────────────────────────────────────────────
HMS.staff = [
  { id:'ST-001', name:'Margaret Ellis',   dept:'Nursing',          position:'Head Nurse',         contact:'(555) 401-2000', status:'Present', joined:'2018-03-12' },
  { id:'ST-002', name:'Carlos Mendez',    dept:'Radiology',        position:'Radiologist',        contact:'(555) 402-3000', status:'Present', joined:'2020-07-08' },
  { id:'ST-003', name:'Lucy Park',        dept:'Nursing',          position:'ICU Nurse',          contact:'(555) 403-4000', status:'Absent',  joined:'2021-11-15' },
  { id:'ST-004', name:'Samuel Okafor',    dept:'Laboratory',       position:'Lab Technician',     contact:'(555) 404-5000', status:'Present', joined:'2019-05-20' },
  { id:'ST-005', name:'Fiona Walsh',      dept:'Admin',            position:'Receptionist',       contact:'(555) 405-6000', status:'Present', joined:'2022-02-01' },
  { id:'ST-006', name:'Kevin Tran',       dept:'Pharmacy',         position:'Pharmacist',         contact:'(555) 406-7000', status:'Present', joined:'2020-09-14' },
  { id:'ST-007', name:'Rachel Kim',       dept:'Physiotherapy',    position:'Physiotherapist',    contact:'(555) 407-8000', status:'On Leave', joined:'2021-06-30' },
  { id:'ST-008', name:'Tom Baker',        dept:'Maintenance',      position:'Biomedical Engineer',contact:'(555) 408-9000', status:'Present', joined:'2017-12-05' },
];

// ── Prescriptions ─────────────────────────────────────────────
HMS.prescriptions = [
  {
    id:'RX-001', patient:'Emma Johnson', doctor:'Dr. Sarah Chen', date:'2024-02-10',
    diagnosis:'Stage 2 Hypertension with associated palpitations',
    medicines:[
      { name:'Lisinopril 10mg',   dose:'1 tablet', freq:'Once daily', dur:'30 days', notes:'Take in morning' },
      { name:'Atorvastatin 20mg', dose:'1 tablet', freq:'Once daily', dur:'30 days', notes:'Take at night' },
    ],
    notes:'Monitor blood pressure weekly. Low sodium diet advised. Return if dizziness occurs.',
  },
  {
    id:'RX-002', patient:'Michael Chen', doctor:'Dr. James Wilson', date:'2024-02-11',
    diagnosis:'Type 2 Diabetes Mellitus – uncontrolled HbA1c',
    medicines:[
      { name:'Metformin 500mg',  dose:'1 tablet', freq:'Twice daily', dur:'60 days', notes:'With meals' },
      { name:'Insulin Glargine', dose:'10 units', freq:'Once nightly', dur:'60 days', notes:'Subcutaneous' },
    ],
    notes:'HbA1c target < 7%. Diet counselling required. Follow-up in 4 weeks.',
  },
];

// ── Billing / Invoices ────────────────────────────────────────
HMS.invoices = [
  {
    id:'INV-001', patient:'Emma Johnson',    doctor:'Dr. Sarah Chen',   date:'2024-02-10', due:'2024-02-25',
    status:'Paid',
    treatments:[
      { desc:'Cardiology Consultation', qty:1, price:350 },
      { desc:'ECG Test',                qty:1, price:120 },
      { desc:'Blood Pressure Monitor',  qty:1, price:60  },
    ],
    medicines:[
      { name:'Lisinopril 10mg 30 tabs',   price:96  },
      { name:'Atorvastatin 20mg 30 tabs', price:144 },
    ],
    taxRate:0.08,
  },
  {
    id:'INV-002', patient:'Michael Chen',    doctor:'Dr. James Wilson',  date:'2024-02-11', due:'2024-02-26',
    status:'Pending',
    treatments:[
      { desc:'Endocrinology Consultation', qty:1, price:380 },
      { desc:'HbA1c Test',                 qty:1, price:90  },
      { desc:'Fasting Glucose Test',       qty:2, price:45  },
    ],
    medicines:[
      { name:'Metformin 500mg 60 tabs',   price:150 },
      { name:'Insulin Glargine (2 vials)', price:960 },
    ],
    taxRate:0.08,
  },
];

// ── Activities (Recent) ───────────────────────────────────────
HMS.activities = [
  { icon:'fa-user-plus',       color:'blue',    title:'New Patient Registered',    desc:'Emma Johnson (P-001) registered successfully',  time:'5 min ago' },
  { icon:'fa-calendar-check',  color:'success', title:'Appointment Confirmed',     desc:'APT-003 confirmed for Dr. Priya Nair',          time:'18 min ago' },
  { icon:'fa-pills',           color:'warning', title:'Low Stock Alert',           desc:'Amlodipine 5mg – only 15 units remaining',      time:'32 min ago' },
  { icon:'fa-file-invoice',    color:'purple',  title:'Invoice Generated',         desc:'INV-001 generated for Emma Johnson – $868.80',  time:'1 hr ago' },
  { icon:'fa-user-md',         color:'teal',    title:'Doctor Schedule Updated',   desc:'Dr. Emily Brown schedule modified for Feb 14',  time:'2 hr ago' },
  { icon:'fa-exclamation-triangle', color:'danger', title:'Critical Patient Alert', desc:'Robert Davis – cardiac monitoring required',  time:'3 hr ago' },
  { icon:'fa-check-circle',    color:'success', title:'Prescription Issued',       desc:'RX-002 issued by Dr. James Wilson',             time:'4 hr ago' },
  { icon:'fa-sign-in-alt',     color:'blue',    title:'Staff Check-in',            desc:'Margaret Ellis checked in at 07:58 AM',         time:'5 hr ago' },
];

// ── Chart Data ────────────────────────────────────────────────
HMS.chartData = {
  appointmentsWeekly: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    confirmed: [18, 24, 22, 28, 20, 14, 8],
    pending:   [6,  8,  5,  10, 7,  4,  2],
    cancelled: [2,  3,  1,  4,  2,  1,  0],
  },
  patientMonthly: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    inpatient:  [45, 52, 48, 61, 55, 67, 72, 68, 59, 64, 71, 78],
    outpatient: [120,138,125,145,132,158,167,154,141,162,175,188],
  },
  revenueMonthly: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    revenue:  [82000,94000,88000,102000,96000,115000],
    expenses: [61000,68000,65000,74000,70000,82000],
  },
  deptDistribution: {
    labels: ['Cardiology','Neurology','Endocrinology','Nephrology','Orthopedics','Others'],
    data:   [28, 18, 22, 15, 12, 5],
    colors: ['#2563EB','#8B5CF6','#0D9488','#F59E0B','#EF4444','#94A3B8'],
  },
};

// ── Notifications ─────────────────────────────────────────────
HMS.notifications = [
  { id:1, title:'Critical Patient Alert',          desc:'Robert Davis requires immediate attention in ICU',  time:'5 min ago',   read:false, type:'danger' },
  { id:2, title:'Appointment Reminder',             desc:'10 appointments scheduled for today',              time:'30 min ago',  read:false, type:'info' },
  { id:3, title:'Low Medicine Stock',               desc:'Amlodipine 5mg critically low (15 units left)',   time:'1 hr ago',    read:false, type:'warning' },
  { id:4, title:'New Patient Registered',           desc:'12 new patients registered this week',            time:'2 hr ago',    read:true,  type:'success' },
  { id:5, title:'Lab Results Available',            desc:'Blood panel results for Emma Johnson ready',      time:'3 hr ago',    read:true,  type:'info' },
  { id:6, title:'Invoice Payment Received',         desc:'INV-001 payment confirmed – $868.80',             time:'5 hr ago',    read:true,  type:'success' },
  { id:7, title:'Doctor Schedule Conflict',         desc:'Dr. Emily Brown has overlapping appointments',    time:'1 day ago',   read:true,  type:'warning' },
];
