CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS branch (
    branch_id SERIAL PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS department (
    department_id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    department_name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (branch_id, department_name)
);

CREATE TABLE IF NOT EXISTS doctor (
    doctor_id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    department_id INT NOT NULL REFERENCES department(department_id) ON DELETE RESTRICT,
    doctor_name VARCHAR(150) NOT NULL,
    specialization VARCHAR(100),
    license_no VARCHAR(50) UNIQUE,
    phone VARCHAR(30),
    email VARCHAR(100) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available','busy','off_duty','inactive')),
    consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_shift (
    shift_id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS patient (
    patient_id SERIAL PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male','Female','Other')),
    blood_group VARCHAR(5),
    phone VARCHAR(30),
    email VARCHAR(100),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','recovered','critical','inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointment (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(patient_id) ON DELETE RESTRICT,
    doctor_id INT NOT NULL REFERENCES doctor(doctor_id) ON DELETE RESTRICT,
    department_id INT NOT NULL REFERENCES department(department_id) ON DELETE RESTRICT,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_type VARCHAR(50) NOT NULL DEFAULT 'consultation' CHECK (appointment_type IN ('consultation','follow_up','emergency','checkup')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS nurse (
    nurse_id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    department_id INT NOT NULL REFERENCES department(department_id) ON DELETE RESTRICT,
    nurse_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(100) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','on_leave')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
    staff_id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    department_id INT NOT NULL REFERENCES department(department_id) ON DELETE RESTRICT,
    staff_name VARCHAR(150) NOT NULL,
    role VARCHAR(80) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(100) UNIQUE,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','on_leave')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room (
    room_id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(30) NOT NULL CHECK (room_type IN ('general','private','icu','operation')),
    capacity INT NOT NULL DEFAULT 1 CHECK (capacity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance','reserved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (branch_id, room_number)
);

CREATE TABLE IF NOT EXISTS admission (
    admission_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(patient_id) ON DELETE RESTRICT,
    doctor_id INT NOT NULL REFERENCES doctor(doctor_id) ON DELETE RESTRICT,
    room_id INT REFERENCES room(room_id) ON DELETE RESTRICT,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    department_id INT NOT NULL REFERENCES department(department_id) ON DELETE RESTRICT,
    admitted_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharged_on TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'admitted' CHECK (status IN ('admitted','discharged','pending')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (discharged_on IS NULL OR discharged_on >= admitted_on)
);

CREATE TABLE IF NOT EXISTS medicine (
    medicine_id SERIAL PRIMARY KEY,
    medicine_name VARCHAR(150) NOT NULL UNIQUE,
    generic_name VARCHAR(150),
    category VARCHAR(80),
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_level INT NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    expiry_date DATE,
    supplier VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock','low_stock','out_of_stock','expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pharmacy (
    pharmacy_id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    pharmacy_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (branch_id, pharmacy_name)
);

CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    inventory_id SERIAL PRIMARY KEY,
    pharmacy_id INT NOT NULL REFERENCES pharmacy(pharmacy_id) ON DELETE CASCADE,
    medicine_id INT NOT NULL REFERENCES medicine(medicine_id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reorder_level INT NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (pharmacy_id, medicine_id)
);

CREATE TABLE IF NOT EXISTS prescription (
    prescription_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(patient_id) ON DELETE RESTRICT,
    doctor_id INT NOT NULL REFERENCES doctor(doctor_id) ON DELETE RESTRICT,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescription_detail (
    detail_id SERIAL PRIMARY KEY,
    prescription_id INT NOT NULL REFERENCES prescription(prescription_id) ON DELETE CASCADE,
    medicine_id INT NOT NULL REFERENCES medicine(medicine_id) ON DELETE RESTRICT,
    dosage VARCHAR(80) NOT NULL,
    frequency VARCHAR(80) NOT NULL,
    duration_days INT NOT NULL CHECK (duration_days >= 1),
    quantity INT NOT NULL CHECK (quantity > 0),
    instructions TEXT,
    UNIQUE (prescription_id, medicine_id)
);

CREATE TABLE IF NOT EXISTS lab_result (
    lab_result_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(patient_id) ON DELETE RESTRICT,
    doctor_id INT NOT NULL REFERENCES doctor(doctor_id) ON DELETE RESTRICT,
    test_name VARCHAR(120) NOT NULL,
    result_value TEXT,
    normal_range VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','normal','abnormal','critical')),
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operation_theatre (
    theatre_id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    theatre_name VARCHAR(80) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available','busy','maintenance')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (branch_id, theatre_name)
);

CREATE TABLE IF NOT EXISTS ot_schedule (
    schedule_id SERIAL PRIMARY KEY,
    theatre_id INT NOT NULL REFERENCES operation_theatre(theatre_id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctor(doctor_id) ON DELETE RESTRICT,
    patient_id INT NOT NULL REFERENCES patient(patient_id) ON DELETE RESTRICT,
    procedure_name VARCHAR(150) NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS equipment (
    equipment_id SERIAL PRIMARY KEY,
    theatre_id INT NOT NULL REFERENCES operation_theatre(theatre_id) ON DELETE CASCADE,
    equipment_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available','busy','maintenance')),
    last_service_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bill (
    bill_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(patient_id) ON DELETE RESTRICT,
    doctor_id INT REFERENCES doctor(doctor_id),
    appointment_id INT REFERENCES appointment(appointment_id) ON DELETE SET NULL,
    admission_id INT REFERENCES admission(admission_id) ON DELETE SET NULL,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','partial','paid','cancelled')),
    payment_mode VARCHAR(20) CHECK (payment_mode IN ('cash','card','insurance','bank_transfer')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shift_log (
    shift_log_id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
    branch_id INT NOT NULL REFERENCES branch(branch_id) ON DELETE RESTRICT,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','present','absent','on_leave')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS pay_structure (
    pay_structure_id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL UNIQUE REFERENCES staff(staff_id) ON DELETE CASCADE,
    position_title VARCHAR(80) NOT NULL,
    base_salary NUMERIC(12,2) NOT NULL CHECK (base_salary >= 0),
    allowance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (allowance >= 0),
    overtime_rate NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (overtime_rate >= 0),
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary (
    salary_id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES staff(staff_id) ON DELETE RESTRICT,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    gross_salary NUMERIC(12,2) NOT NULL CHECK (gross_salary >= 0),
    deductions NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (deductions >= 0),
    net_salary NUMERIC(12,2) NOT NULL CHECK (net_salary >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (pay_period_end >= pay_period_start)
);

CREATE TABLE IF NOT EXISTS user_account (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN','DOCTOR','NURSE','PHARMACIST','LAB_TECHNICIAN','BILLING','STAFF','PATIENT')),
    staff_id INT REFERENCES staff(staff_id) ON DELETE SET NULL,
    doctor_id INT REFERENCES doctor(doctor_id) ON DELETE SET NULL,
    patient_id INT REFERENCES patient(patient_id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
