const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getPharmacies = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM pharmacy ORDER BY pharmacy_id DESC');
    return sendSuccess(res, 200, { pharmacies: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getInventory = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT pi.*, m.medicine_name, m.category, m.unit_price
       FROM pharmacy_inventory pi
       JOIN medicine m ON m.medicine_id = pi.medicine_id
       WHERE pi.pharmacy_id = $1
       ORDER BY m.medicine_name`,
      [req.params.id]
    );
    return sendSuccess(res, 200, { inventory: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.addInventory = async (req, res, next) => {
  try {
    const { medicineId, quantity, reorderLevel } = req.body;
    if (!medicineId || quantity === undefined || quantity < 0) return sendError(res, 400, 'Medicine and a valid non-negative quantity are required.');

    const pharmacy = await db.query('SELECT pharmacy_id FROM pharmacy WHERE pharmacy_id = $1', [req.params.id]);
    if (!pharmacy.rows.length) {
      return sendError(res, 404, 'Pharmacy not found.');
    }

    const result = await db.query(
      `INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, quantity, reorder_level)
       VALUES ($1, $2, $3, COALESCE($4, 0))
       ON CONFLICT (pharmacy_id, medicine_id)
       DO UPDATE SET quantity = pharmacy_inventory.quantity + EXCLUDED.quantity,
                    reorder_level = COALESCE(EXCLUDED.reorder_level, pharmacy_inventory.reorder_level),
                    last_updated = NOW()
       RETURNING *`,
      [req.params.id, medicineId, Number(quantity), Number(reorderLevel || 0)]
    );

    return sendSuccess(res, 201, { inventory: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateInventory = async (req, res, next) => {
  try {
    const { quantity, reorderLevel, action } = req.body;
    if (quantity === undefined && reorderLevel === undefined) {
      return sendError(res, 400, 'Provide a quantity or reorder level to update.');
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const current = await client.query(
        `SELECT * FROM pharmacy_inventory WHERE pharmacy_id = $1 AND medicine_id = $2 FOR UPDATE`,
        [req.params.id, req.params.medicineId]
      );

      if (!current.rows.length) {
        await client.query('ROLLBACK');
        return sendError(res, 404, 'Inventory entry not found.');
      }

      if (quantity !== undefined && Number(quantity) < 0) {
        await client.query('ROLLBACK');
        return sendError(res, 400, 'Quantity cannot be negative.');
      }

      if (reorderLevel !== undefined && Number(reorderLevel) < 0) {
        await client.query('ROLLBACK');
        return sendError(res, 400, 'Reorder level cannot be negative.');
      }

      const currentQty = Number(current.rows[0].quantity || 0);
      const requestedQty = quantity !== undefined ? Number(quantity) : currentQty;
      let finalQty = currentQty;

      if (action === 'deduct') {
        finalQty = currentQty - requestedQty;
      } else if (quantity !== undefined) {
        finalQty = requestedQty;
      }

      if (finalQty < 0) {
        await client.query('ROLLBACK');
        return sendError(res, 409, 'Insufficient stock in inventory.');
      }

      const result = await client.query(
        `UPDATE pharmacy_inventory
         SET quantity = $1,
             reorder_level = COALESCE($2, reorder_level),
             last_updated = NOW(),
             updated_at = NOW()
         WHERE pharmacy_id = $3 AND medicine_id = $4
         RETURNING *`,
        [Math.max(finalQty, 0), reorderLevel !== undefined ? Number(reorderLevel) : current.rows[0].reorder_level, req.params.id, req.params.medicineId]
      );

      await client.query('COMMIT');
      return sendSuccess(res, 200, { inventory: result.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};
