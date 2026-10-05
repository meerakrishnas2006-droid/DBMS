CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_patients BIGINT,
    active_patients BIGINT,
    total_doctors BIGINT,
    upcoming_appointments BIGINT,
    pending_bills BIGINT,
    revenue NUMERIC,
    total_admissions BIGINT,
    occupancy_pct NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM patient) AS total_patients,
        (SELECT COUNT(*) FROM patient WHERE status = 'active') AS active_patients,
        (SELECT COUNT(*) FROM doctor WHERE status IN ('available','busy')) AS total_doctors,
        (SELECT COUNT(*) FROM appointment WHERE status IN ('pending','confirmed') AND appointment_date >= CURRENT_DATE) AS upcoming_appointments,
        (SELECT COUNT(*) FROM bill WHERE status IN ('pending','partial')) AS pending_bills,
        (SELECT COALESCE(SUM(total_amount),0) FROM bill WHERE status = 'paid') AS revenue,
        (SELECT COUNT(*) FROM admission WHERE status = 'admitted') AS total_admissions,
        ROUND(
            (SELECT (COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM room),0)) * 100 FROM admission WHERE status = 'admitted'),
            2
        ) AS occupancy_pct;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_monthly_revenue(p_months INT DEFAULT 6)
RETURNS TABLE (month_name TEXT, revenue NUMERIC, expenses NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH months AS (
        SELECT date_trunc('month', CURRENT_DATE - (n || ' months')::INTERVAL) AS month_start
        FROM generate_series(0, p_months - 1) AS g(n)
    )
    SELECT
        TO_CHAR(m.month_start,'Mon') AS month_name,
        COALESCE(SUM(CASE WHEN b.status = 'paid' THEN b.total_amount ELSE 0 END),0) AS revenue,
        COALESCE(SUM(CASE WHEN s.gross_salary > 0 THEN s.gross_salary ELSE 0 END),0) AS expenses
    FROM months m
    LEFT JOIN bill b ON date_trunc('month', b.bill_date) = m.month_start
    LEFT JOIN salary s ON date_trunc('month', s.pay_period_start) = m.month_start
    GROUP BY m.month_start
    ORDER BY m.month_start;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_low_stock_medicines()
RETURNS TABLE (medicine_name VARCHAR, stock_quantity INT, reorder_level INT, status VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT medicine_name, stock_quantity, reorder_level, status
    FROM medicine
    WHERE stock_quantity <= reorder_level OR status IN ('low_stock','out_of_stock');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_department_load()
RETURNS TABLE (department_name VARCHAR, load_pct NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH dept_counts AS (
        SELECT d.department_name, COUNT(a.appointment_id) AS appt_count
        FROM department d
        LEFT JOIN appointment a ON a.department_id = d.department_id AND a.status IN ('pending','confirmed')
        GROUP BY d.department_name
    )
    SELECT d.department_name,
           ROUND((d.appt_count * 100.0 / NULLIF((SELECT MAX(appt_count) FROM dept_counts),0)), 2) AS load_pct
    FROM dept_counts d
    ORDER BY d.appt_count DESC;
END;
$$ LANGUAGE plpgsql;
