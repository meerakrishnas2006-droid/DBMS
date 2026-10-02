const db = require('../config/db');
const { sendSuccess } = require('../utils/response');

exports.getRevenueReport = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM v_revenue_summary ORDER BY month_start DESC');
    return sendSuccess(res, 200, { report: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getPatientReport = async (req, res, next) => {
  try {
    const result = await db.query('SELECT status, COUNT(*) AS total FROM patient GROUP BY status ORDER BY status');
    return sendSuccess(res, 200, { report: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentReport = async (req, res, next) => {
  try {
    const result = await db.query('SELECT status, COUNT(*) AS total FROM appointment GROUP BY status ORDER BY status');
    return sendSuccess(res, 200, { report: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getPharmacyReport = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM v_pharmacy_alerts ORDER BY stock_quantity ASC');
    return sendSuccess(res, 200, { report: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getStaffReport = async (req, res, next) => {
  try {
    const result = await db.query('SELECT status, COUNT(*) AS total FROM staff GROUP BY status ORDER BY status');
    return sendSuccess(res, 200, { report: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getFinancialReport = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) AS revenue,
         SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'partial' THEN total_amount ELSE 0 END) AS partial
       FROM bill`
    );
    return sendSuccess(res, 200, { report: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
