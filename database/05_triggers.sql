CREATE OR REPLACE FUNCTION update_medicine_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_quantity <= 0 THEN
        NEW.status := 'out_of_stock';
    ELSIF NEW.stock_quantity <= NEW.reorder_level THEN
        NEW.status := 'low_stock';
    ELSE
        NEW.status := 'in_stock';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_medicine_status_update
BEFORE INSERT OR UPDATE OF stock_quantity, reorder_level ON medicine
FOR EACH ROW
EXECUTE FUNCTION update_medicine_status();

CREATE OR REPLACE FUNCTION update_pharmacy_inventory_from_med()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, quantity, reorder_level)
        SELECT p.pharmacy_id, NEW.medicine_id, NEW.stock_quantity, NEW.reorder_level
        FROM pharmacy p
        WHERE p.status = 'active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user_for_staff()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM user_account WHERE username = LOWER(REPLACE(NEW.staff_name, ' ', '.'))
    ) THEN
        INSERT INTO user_account (username, password_hash, role, staff_id, status)
        VALUES (LOWER(REPLACE(NEW.staff_name, ' ', '.')), crypt('changeme123', gen_salt('bf')), 'STAFF', NEW.staff_id, 'active');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_staff_user
AFTER INSERT ON staff
FOR EACH ROW
EXECUTE FUNCTION create_user_for_staff();
