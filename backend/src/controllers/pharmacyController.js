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
    if (!medicineId || !quantity) return sendError(res, 400, 'Medicine and quantity are required.');

    const result = await db.query(
      `INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, quantity, reorder_level)
       VALUES ($1, $2, $3, COALESCE($4, 0))
       ON CONFLICT (pharmacy_id, medicine_id)
       DO UPDATE SET quantity = pharmacy_inventory.quantity + EXCLUDED.quantity,
                    reorder_level = COALESCE(EXCLUDED.reorder_level, pharmacy_inventory.reorder_level),
                    last_updated = NOW()
       RETURNING *`,
      [req.params.id, medicineId, quantity, reorderLevel || 0]
    );

    return sendSuccess(res, 201, { inventory: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateInventory = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE pharmacy_inventory
       SET quantity = COALESCE($1, quantity),
           reorder_level = COALESCE($2, reorder_level),
           last_updated = NOW()
       WHERE pharmacy_id = $3 AND medicine_id = $4
       RETURNING *`,
      [req.body.quantity, req.body.reorderLevel, req.params.id, req.params.medicineId]
    );

    if (!result.rows.length) return sendError(res, 404, 'Inventory entry not found.');
    return sendSuccess(res, 200, { inventory: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
