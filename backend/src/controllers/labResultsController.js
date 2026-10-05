const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getLabResults = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM lab_result ORDER BY lab_result_id DESC');
    return sendSuccess(res, 200, { labResults: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getLabResultById = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM lab_result WHERE lab_result_id = $1', [req.params.id]);
    if (!result.rows.length) return sendError(res, 404, 'Lab result not found.');
    return sendSuccess(res, 200, { labResult: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.createLabResult = async (req, res, next) => {
  try {
    const { patientId, doctorId, testName, resultValue, normalRange, status } = req.body;
    if (!patientId || !doctorId || !testName) return sendError(res, 400, 'Patient, doctor, and test name are required.');

    const result = await db.query(
      `INSERT INTO lab_result (patient_id, doctor_id, test_name, result_value, normal_range, status)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'pending'))
       RETURNING *`,
      [patientId, doctorId, testName, resultValue || null, normalRange || null, status || 'pending']
    );

    return sendSuccess(res, 201, { labResult: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateLabResult = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE lab_result
       SET test_name = COALESCE($1, test_name),
           result_value = COALESCE($2, result_value),
           normal_range = COALESCE($3, normal_range),
           status = COALESCE($4, status),
           updated_at = NOW()
       WHERE lab_result_id = $5
       RETURNING *`,
      [req.body.testName, req.body.resultValue, req.body.normalRange, req.body.status, req.params.id]
    );

    if (!result.rows.length) return sendError(res, 404, 'Lab result not found.');
    return sendSuccess(res, 200, { labResult: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
