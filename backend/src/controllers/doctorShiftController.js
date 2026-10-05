const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getDoctorShifts = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM doctor_shift ORDER BY shift_date DESC, start_time DESC');
    return sendSuccess(res, 200, { shifts: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.createDoctorShift = async (req, res, next) => {
  try {
    const { doctorId, branchId, shiftDate, startTime, endTime, status } = req.body;
    if (!doctorId || !branchId || !shiftDate || !startTime || !endTime) {
      return sendError(res, 400, 'Doctor, branch, date, start and end times are required.');
    }

    const result = await db.query(
      `INSERT INTO doctor_shift (doctor_id, branch_id, shift_date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'scheduled'))
       RETURNING *`,
      [doctorId, branchId, shiftDate, startTime, endTime, status || 'scheduled']
    );

    return sendSuccess(res, 201, { shift: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateDoctorShift = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE doctor_shift
       SET shift_date = COALESCE($1, shift_date),
           start_time = COALESCE($2, start_time),
           end_time = COALESCE($3, end_time),
           status = COALESCE($4, status),
           updated_at = NOW()
       WHERE shift_id = $5
       RETURNING *`,
      [req.body.shiftDate, req.body.startTime, req.body.endTime, req.body.status, req.params.id]
    );

    if (!result.rows.length) return sendError(res, 404, 'Doctor shift not found.');
    return sendSuccess(res, 200, { shift: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.deleteDoctorShift = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM doctor_shift WHERE shift_id = $1 RETURNING shift_id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 404, 'Doctor shift not found.');
    return sendSuccess(res, 200, { message: 'Doctor shift deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
