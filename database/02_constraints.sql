CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN (
            'branch','department','doctor','doctor_shift','patient','appointment','nurse','staff','room','admission',
            'medicine','pharmacy','pharmacy_inventory','prescription','prescription_detail','lab_result',
            'operation_theatre','ot_schedule','equipment','bill','shift_log','pay_structure','salary','user_account'
          )
    LOOP
        EXECUTE format('CREATE TRIGGER trg_%I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION validate_department_active()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM department d
        WHERE d.department_id = NEW.department_id
          AND d.status <> 'active'
    ) THEN
        RAISE EXCEPTION 'Department is inactive and cannot accept new appointments.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM branch b
        WHERE b.branch_id = NEW.branch_id
          AND b.status <> 'active'
    ) THEN
        RAISE EXCEPTION 'Branch is inactive and cannot accept new appointments.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointment_department_active
BEFORE INSERT OR UPDATE ON appointment
FOR EACH ROW
WHEN (NEW.status IN ('pending','confirmed'))
EXECUTE FUNCTION validate_department_active();

CREATE OR REPLACE FUNCTION check_doctor_shift_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM doctor_shift ds
        WHERE ds.doctor_id = NEW.doctor_id
          AND ds.branch_id = NEW.branch_id
          AND ds.shift_date = NEW.shift_date
          AND ds.shift_id <> COALESCE(NEW.shift_id, -1)
          AND ds.status <> 'cancelled'
          AND NEW.status <> 'cancelled'
          AND NOT (ds.end_time <= NEW.start_time OR NEW.end_time <= ds.start_time)
    ) THEN
        RAISE EXCEPTION 'Doctor shift overlaps with an existing shift for the same doctor in the same branch.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_doctor_shift_overlap
BEFORE INSERT OR UPDATE ON doctor_shift
FOR EACH ROW
EXECUTE FUNCTION check_doctor_shift_overlap();

CREATE OR REPLACE FUNCTION check_appointment_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM appointment a
        WHERE a.doctor_id = NEW.doctor_id
          AND a.appointment_date = NEW.appointment_date
          AND a.status NOT IN ('cancelled','completed')
          AND a.appointment_id <> COALESCE(NEW.appointment_id, -1)
          AND NOT (a.end_time <= NEW.start_time OR NEW.end_time <= a.start_time)
    ) THEN
        RAISE EXCEPTION 'Appointment overlaps with an existing scheduled appointment for the same doctor.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointment_conflict
BEFORE INSERT OR UPDATE ON appointment
FOR EACH ROW
EXECUTE FUNCTION check_appointment_conflict();

CREATE OR REPLACE FUNCTION validate_room_allocation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.room_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM admission a
            WHERE a.room_id = NEW.room_id
              AND a.admission_id <> COALESCE(NEW.admission_id, -1)
              AND a.status <> 'discharged'
              AND NEW.status <> 'discharged'
              AND a.admitted_on < COALESCE(NEW.discharged_on, NOW())
              AND COALESCE(NEW.admitted_on, NOW()) < COALESCE(a.discharged_on, NOW())
        ) THEN
            RAISE EXCEPTION 'Room is already assigned to another active admission during this time.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_allocation
BEFORE INSERT OR UPDATE ON admission
FOR EACH ROW
EXECUTE FUNCTION validate_room_allocation();

CREATE OR REPLACE FUNCTION check_ot_schedule_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM ot_schedule os
        WHERE os.theatre_id = NEW.theatre_id
          AND os.scheduled_date = NEW.scheduled_date
          AND os.status <> 'cancelled'
          AND os.schedule_id <> COALESCE(NEW.schedule_id, -1)
          AND NOT (os.end_time <= NEW.start_time OR NEW.end_time <= os.start_time)
    ) THEN
        RAISE EXCEPTION 'Operation theatre schedule conflicts with an existing booking.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ot_schedule_conflict
BEFORE INSERT OR UPDATE ON ot_schedule
FOR EACH ROW
EXECUTE FUNCTION check_ot_schedule_conflict();

CREATE OR REPLACE FUNCTION validate_bill_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND NEW.total_amount <= 0 THEN
        RAISE EXCEPTION 'Paid bills must have a positive total amount.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bill_status_validation
BEFORE INSERT OR UPDATE ON bill
FOR EACH ROW
EXECUTE FUNCTION validate_bill_status();

CREATE OR REPLACE FUNCTION validate_prescription_fk()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM patient WHERE patient_id = NEW.patient_id) THEN
        RAISE EXCEPTION 'Prescription patient does not exist.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM doctor WHERE doctor_id = NEW.doctor_id) THEN
        RAISE EXCEPTION 'Prescription doctor does not exist.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prescription_fk
BEFORE INSERT OR UPDATE ON prescription
FOR EACH ROW
EXECUTE FUNCTION validate_prescription_fk();

CREATE OR REPLACE FUNCTION validate_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity < 0 THEN
        RAISE EXCEPTION 'Inventory quantity cannot be negative.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pharmacy_inventory_quantity
BEFORE INSERT OR UPDATE ON pharmacy_inventory
FOR EACH ROW
EXECUTE FUNCTION validate_inventory_quantity();

CREATE OR REPLACE FUNCTION validate_salary_record()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.net_salary < 0 OR NEW.gross_salary < 0 OR NEW.deductions < 0 THEN
        RAISE EXCEPTION 'Salary values cannot be negative.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_salary_validation
BEFORE INSERT OR UPDATE ON salary
FOR EACH ROW
EXECUTE FUNCTION validate_salary_record();
