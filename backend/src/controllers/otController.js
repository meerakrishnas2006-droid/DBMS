const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getOperationTheatres = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM operation_theatre ORDER BY theatre_id');
    return sendSuccess(res, 200, { theatres: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getOtSchedules = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM ot_schedule ORDER BY scheduled_date DESC, start_time DESC');
    return sendSuccess(res, 200, { schedules: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.createOtSchedule = async (req, res, next) => {
  try {
    const { theatreId, doctorId, patientId, procedureName, scheduledDate, startTime, endTime, status } = req.body;
    if (!theatreId || !doctorId || !patientId || !scheduledDate || !startTime || !endTime) {
      return sendError(res, 400, 'Theatre, doctor, patient, date, start and end times are required.');
    }

    const result = await db.query(
      `INSERT INTO ot_schedule (theatre_id, doctor_id, patient_id, procedure_name, scheduled_date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'scheduled'))
       RETURNING *`,
      [theatreId, doctorId, patientId, procedureName || 'Surgery', scheduledDate, startTime, endTime, status || 'scheduled']
    );

    return sendSuccess(res, 201, { schedule: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateOtSchedule = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE ot_schedule
       SET procedure_name = COALESCE($1, procedure_name),
           scheduled_date = COALESCE($2, scheduled_date),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE schedule_id = $6
       RETURNING *`,
      [req.body.procedureName, req.body.scheduledDate, req.body.startTime, req.body.endTime, req.body.status, req.params.id]
    );

    if (!result.rows.length) return sendError(res, 404, 'OT schedule not found.');
    return sendSuccess(res, 200, { schedule: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.deleteOtSchedule = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM ot_schedule WHERE schedule_id = $1 RETURNING schedule_id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 404, 'OT schedule not found.');
    return sendSuccess(res, 200, { message: 'OT schedule deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
