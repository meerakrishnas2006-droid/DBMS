INSERT INTO branch (branch_name, address, phone, email, status)
VALUES
    ('Main Campus', '123 Medical Avenue, Kochi', '+91 484 2345678', 'main@medicare.com', 'active'),
    ('City Annex', '54 Wellness Road, Ernakulam', '+91 484 2456789', 'annex@medicare.com', 'active'),
    ('Satellite Care', '88 Health Plaza, Thrissur', '+91 487 2556789', 'satellite@medicare.com', 'inactive');

INSERT INTO department (branch_id, department_name, description, status)
VALUES
    (1, 'Cardiology', 'Heart care and monitoring', 'active'),
    (1, 'Neurology', 'Brain and nervous system care', 'active'),
    (1, 'General Surgery', 'Surgical treatments and procedures', 'active'),
    (2, 'Orthopedics', 'Bone and joint care', 'active'),
    (2, 'Pediatrics', 'Child health services', 'active'),
    (3, 'Dermatology', 'Skin and dermatology care', 'inactive');

INSERT INTO doctor (branch_id, department_id, doctor_name, specialization, license_no, phone, email, status, consultation_fee)
VALUES
    (1, 1, 'Dr. Sarah Chen', 'Cardiology', 'LIC-1001', '+91 9876543210', 'sarah.chen@medicare.com', 'available', 700.00),
    (1, 2, 'Dr. James Wilson', 'Neurology', 'LIC-1002', '+91 9876543211', 'james.wilson@medicare.com', 'busy', 650.00),
    (1, 3, 'Dr. Priya Nair', 'General Surgery', 'LIC-1003', '+91 9876543212', 'priya.nair@medicare.com', 'available', 800.00),
    (2, 4, 'Dr. Ahmed Hassan', 'Orthopedics', 'LIC-1004', '+91 9876543213', 'ahmed.hassan@medicare.com', 'available', 600.00),
    (2, 5, 'Dr. Emily Brown', 'Pediatrics', 'LIC-1005', '+91 9876543214', 'emily.brown@medicare.com', 'off_duty', 550.00);

INSERT INTO doctor_shift (doctor_id, branch_id, shift_date, start_time, end_time, status)
VALUES
    (1, 1, CURRENT_DATE, '09:00:00', '17:00:00', 'scheduled'),
    (2, 1, CURRENT_DATE, '10:00:00', '18:00:00', 'scheduled'),
    (3, 1, CURRENT_DATE + 1, '08:00:00', '15:00:00', 'scheduled'),
    (4, 2, CURRENT_DATE, '09:30:00', '16:30:00', 'scheduled'),
    (5, 2, CURRENT_DATE, '11:00:00', '18:00:00', 'scheduled');

INSERT INTO patient (first_name, last_name, date_of_birth, gender, blood_group, phone, email, address, status)
VALUES
    ('Emma', 'Johnson', '1990-04-15', 'Female', 'A+', '+91 9090909090', 'emma.johnson@example.com', 'Kochi', 'active'),
    ('Michael', 'Chen', '1972-08-20', 'Male', 'O+', '+91 9090909091', 'michael.chen@example.com', 'Kochi', 'active'),
    ('Sophia', 'Williams', '1994-01-05', 'Female', 'B+', '+91 9090909092', 'sophia.williams@example.com', 'Ernakulam', 'recovered'),
    ('Robert', 'Davis', '1957-09-16', 'Male', 'AB-', '+91 9090909093', 'robert.davis@example.com', 'Kochi', 'critical'),
    ('Olivia', 'Martinez', '1981-11-30', 'Female', 'O-', '+91 9090909094', 'olivia.martinez@example.com', 'Trivandrum', 'active');

INSERT INTO appointment (patient_id, doctor_id, department_id, branch_id, appointment_date, start_time, end_time, appointment_type, status, notes)
VALUES
    (1, 1, 1, 1, CURRENT_DATE, '09:00:00', '09:30:00', 'consultation', 'confirmed', 'Routine cardiology follow-up'),
    (2, 2, 2, 1, CURRENT_DATE, '10:30:00', '11:00:00', 'follow_up', 'pending', 'Check neurological symptoms'),
    (3, 3, 3, 1, CURRENT_DATE + 1, '11:00:00', '11:45:00', 'checkup', 'confirmed', 'Post-op review'),
    (4, 1, 1, 1, CURRENT_DATE + 1, '14:00:00', '14:30:00', 'emergency', 'pending', 'Cardiac monitoring required'),
    (5, 4, 4, 2, CURRENT_DATE, '15:00:00', '15:30:00', 'consultation', 'confirmed', 'Orthopedic evaluation');

INSERT INTO nurse (branch_id, department_id, nurse_name, phone, email, status)
VALUES
    (1, 1, 'Margaret Ellis', '+91 9988776655', 'margaret.ellis@medicare.com', 'active'),
    (1, 2, 'Lucy Park', '+91 9988776656', 'lucy.park@medicare.com', 'active'),
    (2, 4, 'Carlos Mendez', '+91 9988776657', 'carlos.mendez@medicare.com', 'on_leave');

INSERT INTO staff (branch_id, department_id, staff_name, role, phone, email, hire_date, status)
VALUES
    (1, 1, 'Margaret Ellis', 'NURSE', '+91 9988776655', 'margaret.staff@medicare.com', '2018-03-12', 'active'),
    (1, 2, 'Kevin Tran', 'PHARMACIST', '+91 9988776658', 'kevin.tran@medicare.com', '2020-09-14', 'active'),
    (1, 3, 'Samuel Okafor', 'LAB_TECHNICIAN', '+91 9988776659', 'samuel.okafor@medicare.com', '2019-05-20', 'active'),
    (2, 4, 'Fiona Walsh', 'BILLING', '+91 9988776660', 'fiona.walsh@medicare.com', '2022-02-01', 'active');

INSERT INTO room (branch_id, room_number, room_type, capacity, status)
VALUES
    (1, '101', 'private', 1, 'occupied'),
    (1, '102', 'general', 2, 'available'),
    (1, 'ICU-1', 'icu', 1, 'occupied'),
    (2, '201', 'private', 1, 'available'),
    (2, '202', 'general', 2, 'reserved');

INSERT INTO admission (patient_id, doctor_id, room_id, branch_id, department_id, admitted_on, discharged_on, status, notes)
VALUES
    (1, 1, 1, 1, 1, NOW() - INTERVAL '2 days', NULL, 'admitted', 'Cardiac observation'),
    (4, 1, 3, 1, 1, NOW() - INTERVAL '1 day', NULL, 'admitted', 'Critical care unit'),
    (5, 4, 4, 2, 4, NOW() - INTERVAL '3 days', NULL, 'admitted', 'Orthopedic rehabilitation');

INSERT INTO medicine (medicine_name, generic_name, category, unit_price, stock_quantity, reorder_level, expiry_date, supplier, status)
VALUES
    ('Metformin 500mg', 'Metformin', 'Antidiabetic', 2.50, 450, 50, '2026-08-30', 'PharmaCo', 'in_stock'),
    ('Lisinopril 10mg', 'Lisinopril', 'Antihypertensive', 3.20, 280, 50, '2026-06-15', 'MediSupply', 'in_stock'),
    ('Atorvastatin 20mg', 'Atorvastatin', 'Statin', 4.80, 180, 60, '2026-09-20', 'PharmaCo', 'in_stock'),
    ('Amoxicillin 250mg', 'Amoxicillin', 'Antibiotic', 1.90, 20, 40, '2025-12-31', 'BioMed Corp', 'low_stock'),
    ('Amlodipine 5mg', 'Amlodipine', 'CCB', 3.60, 15, 30, '2025-11-28', 'PharmaCo', 'low_stock'),
    ('Paracetamol 500mg', 'Paracetamol', 'Analgesic', 0.80, 890, 100, '2027-03-15', 'GenPharma', 'in_stock');

INSERT INTO pharmacy (branch_id, pharmacy_name, phone, status)
VALUES
    (1, 'Main Pharmacy', '+91 484 9001001', 'active'),
    (2, 'City Pharmacy', '+91 484 9001002', 'active');

INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, quantity, reorder_level)
VALUES
    (1, 1, 450, 50),
    (1, 2, 280, 50),
    (1, 3, 180, 60),
    (1, 4, 20, 40),
    (1, 5, 15, 30),
    (1, 6, 890, 100),
    (2, 1, 150, 30),
    (2, 6, 250, 80);

INSERT INTO prescription (patient_id, doctor_id, branch_id, prescription_date, diagnosis, notes, status)
VALUES
    (1, 1, 1, CURRENT_DATE - 1, 'Hypertension follow-up', 'Monitor blood pressure and return in 2 weeks', 'active'),
    (2, 2, 1, CURRENT_DATE - 2, 'Neurological evaluation', 'Continue therapy and rest', 'active');

INSERT INTO prescription_detail (prescription_id, medicine_id, dosage, frequency, duration_days, quantity, instructions)
VALUES
    (1, 2, '10mg', 'Once daily', 30, 30, 'Morning dosage after breakfast'),
    (1, 3, '20mg', 'Once daily', 30, 30, 'Night dosage'),
    (2, 1, '500mg', 'Twice daily', 45, 90, 'With meals');

INSERT INTO lab_result (patient_id, doctor_id, test_name, result_value, normal_range, status, report_date)
VALUES
    (1, 1, 'CBC', 'Normal', 'Within normal range', 'normal', CURRENT_DATE - 1),
    (4, 1, 'ECG', 'Irregular heartbeat', 'Normal rhythm', 'critical', CURRENT_DATE),
    (2, 2, 'MRI Scan', 'Mild abnormalities', 'No abnormalities', 'abnormal', CURRENT_DATE - 2);

INSERT INTO operation_theatre (branch_id, theatre_name, status)
VALUES
    (1, 'OT-01', 'available'),
    (1, 'OT-02', 'busy'),
    (2, 'OT-03', 'available');

INSERT INTO ot_schedule (theatre_id, doctor_id, patient_id, procedure_name, scheduled_date, start_time, end_time, status)
VALUES
    (1, 3, 3, 'Appendectomy Review', CURRENT_DATE + 1, '10:00:00', '11:30:00', 'scheduled'),
    (2, 1, 4, 'Cardiac Catheterization', CURRENT_DATE, '13:00:00', '15:00:00', 'scheduled');

INSERT INTO equipment (theatre_id, equipment_name, quantity, status, last_service_date)
VALUES
    (1, 'Anesthesia Machine', 1, 'available', CURRENT_DATE - 30),
    (1, 'Monitor', 2, 'available', CURRENT_DATE - 10),
    (2, 'Defibrillator', 1, 'busy', CURRENT_DATE - 20);

INSERT INTO bill (patient_id, doctor_id, appointment_id, branch_id, bill_date, total_amount, status, payment_mode, notes)
VALUES
    (1, 1, 1, 1, CURRENT_DATE - 1, 1450.00, 'paid', 'card', 'Consultation and tests'),
    (2, 2, 2, 1, CURRENT_DATE - 2, 890.00, 'pending', 'insurance', 'Neurology review'),
    (4, 1, 4, 1, CURRENT_DATE, 3150.00, 'partial', 'bank_transfer', 'Critical care admission');

INSERT INTO shift_log (staff_id, branch_id, shift_date, start_time, end_time, status)
VALUES
    (1, 1, CURRENT_DATE, '08:00:00', '16:00:00', 'present'),
    (2, 1, CURRENT_DATE, '09:00:00', '17:00:00', 'present'),
    (3, 1, CURRENT_DATE, '08:30:00', '16:30:00', 'absent'),
    (4, 2, CURRENT_DATE, '09:00:00', '17:00:00', 'present');

INSERT INTO pay_structure (staff_id, position_title, base_salary, allowance, overtime_rate, effective_from)
VALUES
    (1, 'Nurse', 43000.00, 5000.00, 350.00, CURRENT_DATE - INTERVAL '6 months'),
    (2, 'Pharmacist', 52000.00, 7000.00, 400.00, CURRENT_DATE - INTERVAL '6 months'),
    (3, 'Lab Technician', 48000.00, 4500.00, 320.00, CURRENT_DATE - INTERVAL '6 months'),
    (4, 'Billing Officer', 41000.00, 4000.00, 300.00, CURRENT_DATE - INTERVAL '6 months');

INSERT INTO salary (staff_id, pay_period_start, pay_period_end, gross_salary, deductions, net_salary, status)
VALUES
    (1, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE, 48000.00, 2000.00, 46000.00, 'paid'),
    (2, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE, 59000.00, 2500.00, 56500.00, 'pending'),
    (3, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE, 52500.00, 1800.00, 50700.00, 'paid'),
    (4, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE, 45000.00, 1500.00, 43500.00, 'pending');

INSERT INTO user_account (username, password_hash, role, staff_id, status)
VALUES
    ('admin', crypt('admin123', gen_salt('bf')), 'ADMIN', NULL, 'active'),
    ('doctor.sarah', crypt('doctor123', gen_salt('bf')), 'DOCTOR', NULL, 'active'),
    ('pharmacist.kevin', crypt('pharmacist123', gen_salt('bf')), 'PHARMACIST', 2, 'active'),
    ('billing.fiona', crypt('billing123', gen_salt('bf')), 'BILLING', 4, 'active');
