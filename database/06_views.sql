CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM patient) AS total_patients,
    (SELECT COUNT(*) FROM patient WHERE status = 'active') AS active_patients,
    (SELECT COUNT(*) FROM doctor WHERE status IN ('available','busy')) AS doctors,
    (SELECT COUNT(*) FROM appointment WHERE status IN ('pending','confirmed') AND appointment_date = CURRENT_DATE) AS appointments_today,
    (SELECT COUNT(*) FROM bill WHERE status IN ('pending','partial')) AS pending_bills,
    (SELECT COALESCE(SUM(total_amount),0) FROM bill WHERE status = 'paid') AS total_revenue,
    (SELECT COUNT(*) FROM admission WHERE status = 'admitted') AS admissions_active;

CREATE OR REPLACE VIEW v_appointment_summary AS
SELECT
    a.appointment_id,
    p.patient_id,
    CONCAT(p.first_name, ' ', COALESCE(p.last_name, '')) AS patient_name,
    d.doctor_name,
    dep.department_name,
    a.appointment_date,
    a.start_time,
    a.status,
    a.appointment_type
FROM appointment a
JOIN patient p ON p.patient_id = a.patient_id
JOIN doctor d ON d.doctor_id = a.doctor_id
JOIN department dep ON dep.department_id = a.department_id;

CREATE OR REPLACE VIEW v_revenue_summary AS
SELECT
    date_trunc('month', bill_date) AS month_start,
    SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) AS revenue,
    COUNT(*) AS bill_count
FROM bill
GROUP BY date_trunc('month', bill_date)
ORDER BY month_start DESC;

CREATE OR REPLACE VIEW v_pharmacy_alerts AS
SELECT
    m.medicine_name,
    m.stock_quantity,
    m.reorder_level,
    m.status
FROM medicine m
WHERE m.stock_quantity <= m.reorder_level OR m.status IN ('low_stock','out_of_stock');

CREATE OR REPLACE VIEW v_doctor_workload AS
SELECT
    d.doctor_id,
    d.doctor_name,
    dep.department_name,
    COUNT(a.appointment_id) AS appointment_count,
    ROUND(COUNT(a.appointment_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM appointment a2 WHERE a2.status IN ('pending','confirmed')),0), 2) AS workload_pct
FROM doctor d
LEFT JOIN appointment a ON a.doctor_id = d.doctor_id AND a.status IN ('pending','confirmed')
LEFT JOIN department dep ON dep.department_id = d.department_id
GROUP BY d.doctor_id, d.doctor_name, dep.department_name
ORDER BY appointment_count DESC;
