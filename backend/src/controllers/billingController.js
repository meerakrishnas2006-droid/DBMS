const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getBills = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM bill ORDER BY bill_id DESC');
    return sendSuccess(res, 200, { bills: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getBillById = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM bill WHERE bill_id = $1', [req.params.id]);
    if (!result.rows.length) return sendError(res, 404, 'Bill not found.');
    return sendSuccess(res, 200, { bill: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.createBill = async (req, res, next) => {
  try {
    const { patientId, doctorId, branchId, totalAmount, status, paymentMode, notes } = req.body;
    if (!patientId || !branchId) return sendError(res, 400, 'Patient and branch are required.');

    const result = await db.query(
      `INSERT INTO bill (patient_id, doctor_id, branch_id, total_amount, status, payment_mode, notes)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'pending'), $6, $7)
       RETURNING *`,
      [patientId, doctorId || null, branchId, Number(totalAmount || 0), status || 'pending', paymentMode || null, notes || null]
    );

    return sendSuccess(res, 201, { bill: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateBill = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE bill
       SET total_amount = COALESCE($1, total_amount),
           status = COALESCE($2, status),
           payment_mode = COALESCE($3, payment_mode),
           notes = COALESCE($4, notes),
           updated_at = NOW()
       WHERE bill_id = $5
       RETURNING *`,
      [req.body.totalAmount, req.body.status, req.body.paymentMode, req.body.notes, req.params.id]
    );

    if (!result.rows.length) return sendError(res, 404, 'Bill not found.');
    return sendSuccess(res, 200, { bill: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE bill
       SET status = 'paid',
           payment_mode = COALESCE($1, payment_mode),
           updated_at = NOW()
       WHERE bill_id = $2
       RETURNING *`,
      [req.body.paymentMode || 'cash', req.params.id]
    );

    if (!result.rows.length) return sendError(res, 404, 'Bill not found.');
    return sendSuccess(res, 200, { bill: result.rows[0], message: 'Payment recorded successfully.' });
  } catch (error) {
    next(error);
  }
};
