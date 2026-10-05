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
    const { paymentMode, amount } = req.body;
    const current = await db.query('SELECT * FROM bill WHERE bill_id = $1', [req.params.id]);
    if (!current.rows.length) return sendError(res, 404, 'Bill not found.');

    const bill = current.rows[0];
    const total = Number(bill.total_amount || 0);
    const paid = Number(amount || total);

    if (paid < 0 || paid > total) {
      return sendError(res, 400, 'Payment amount must be between 0 and the bill total.');
    }

    const nextStatus = paid >= total ? 'paid' : 'partial';
    const result = await db.query(
      `UPDATE bill
       SET status = $1,
           payment_mode = COALESCE($2, payment_mode),
           updated_at = NOW()
       WHERE bill_id = $3
       RETURNING *`,
      [nextStatus, paymentMode || bill.payment_mode || 'cash', req.params.id]
    );

    return sendSuccess(res, 200, {
      bill: result.rows[0],
      message: nextStatus === 'paid' ? 'Payment recorded successfully.' : 'Partial payment recorded successfully.',
    });
  } catch (error) {
    next(error);
  }
};
