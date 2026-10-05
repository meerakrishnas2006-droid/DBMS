const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getMedicines = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let where = '';
    const params = [];

    if (search) {
      where = `${where ? ' AND ' : ' WHERE '} lower(medicine_name) ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    if (category) {
      where = `${where ? ' AND ' : ' WHERE '} category = $${params.length + 1}`;
      params.push(category);
    }

    const result = await db.query(
      `SELECT * FROM medicine ${where} ORDER BY medicine_id DESC`,
      params
    );

    return sendSuccess(res, 200, { medicines: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getMedicineById = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM medicine WHERE medicine_id = $1', [req.params.id]);
    if (!result.rows.length) return sendError(res, 404, 'Medicine not found.');
    return sendSuccess(res, 200, { medicine: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.createMedicine = async (req, res, next) => {
  try {
    const { name, category, unitPrice, stockQuantity, reorderLevel, expiryDate, supplier } = req.body;
    if (!name) return sendError(res, 400, 'Medicine name is required.');

    const result = await db.query(
      `INSERT INTO medicine (medicine_name, category, unit_price, stock_quantity, reorder_level, expiry_date, supplier)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, category || 'General', Number(unitPrice || 0), Number(stockQuantity || 0), Number(reorderLevel || 0), expiryDate || null, supplier || null]
    );

    return sendSuccess(res, 201, { medicine: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateMedicine = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE medicine
       SET medicine_name = COALESCE($1, medicine_name),
           category = COALESCE($2, category),
           unit_price = COALESCE($3, unit_price),
           stock_quantity = COALESCE($4, stock_quantity),
           reorder_level = COALESCE($5, reorder_level),
           expiry_date = COALESCE($6, expiry_date),
           supplier = COALESCE($7, supplier),
           updated_at = NOW()
       WHERE medicine_id = $8
       RETURNING *`,
      [req.body.name, req.body.category, req.body.unitPrice, req.body.stockQuantity, req.body.reorderLevel, req.body.expiryDate, req.body.supplier, req.params.id]
    );

    if (!result.rows.length) return sendError(res, 404, 'Medicine not found.');
    return sendSuccess(res, 200, { medicine: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM medicine WHERE medicine_id = $1 RETURNING medicine_id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 404, 'Medicine not found.');
    return sendSuccess(res, 200, { message: 'Medicine deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
