-- Test primary keys and joins
SELECT * FROM patient p JOIN appointment a ON a.patient_id = p.patient_id LIMIT 10;

-- Aggregation and grouping
SELECT department_id, COUNT(*) AS appointment_count
FROM appointment
GROUP BY department_id
HAVING COUNT(*) > 0;

-- Subquery example
SELECT *
FROM doctor
WHERE doctor_id IN (
    SELECT doctor_id
    FROM appointment
    WHERE status = 'confirmed'
);

-- View checks
SELECT * FROM v_dashboard_stats;
SELECT * FROM v_appointment_summary LIMIT 10;
SELECT * FROM v_revenue_summary;
SELECT * FROM v_pharmacy_alerts;

-- Invalid operations expected to fail (uncomment one at a time for validation)
-- INSERT INTO doctor_shift (doctor_id, branch_id, shift_date, start_time, end_time, status)
-- VALUES (1, 1, CURRENT_DATE, '08:00:00', '10:00:00', 'scheduled');

-- INSERT INTO appointment (patient_id, doctor_id, department_id, branch_id, appointment_date, start_time, end_time, status)
-- VALUES (1, 1, 1, 1, CURRENT_DATE, '09:15:00', '09:45:00', 'confirmed');

-- INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, quantity, reorder_level)
-- VALUES (1, 1, -5, 10);

-- INSERT INTO bill (patient_id, doctor_id, appointment_id, branch_id, bill_date, total_amount, status)
-- VALUES (1, 1, 1, 1, CURRENT_DATE, 0, 'paid');
