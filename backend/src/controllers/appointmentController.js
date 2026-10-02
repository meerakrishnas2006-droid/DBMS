const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const mapAppointment = (row) => ({
  id: row.appointment_id,
  patientId: row.patient_id,
  doctorId: row.doctor_id,
  departmentId: row.department_id,
  branchId: row.branch_id,
  appointmentDate: row.appointment_date,
  startTime: row.start_time,
  endTime: row.end_time,
  appointmentType: row.appointment_type,
  status: row.status,
  notes: row.notes,
  createdAt: row.created_at,
});

exports.getAppointments = async (req, res, next) => {
  try {
    const { search, status, date } = req.query;
    let where = '';
    const params = [];

    if (status) {
      where = `${where ? ' AND ' : ' WHERE '} a.status = $${params.length + 1}`;
      params.push(status);
    }

    if (date) {
      where = `${where ? ' AND ' : ' WHERE '} a.appointment_date = $${params.length + 1}`;
      params.push(date);
    }

    if (search) {
      where = `${where ? ' AND ' : ' WHERE '} (lower(p.first_name || ' ' || COALESCE(p.last_name, '')) ILIKE $${params.length + 1} OR lower(d.doctor_name) ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    const result = await db.query(
      `SELECT a.*, p.first_name, p.last_name, d.doctor_name, dep.department_name
       FROM appointment a
       JOIN patient p ON p.patient_id = a.patient_id
       JOIN doctor d ON d.doctor_id = a.doctor_id
       JOIN department dep ON dep.department_id = a.department_id
       ${where}
       ORDER BY a.appointment_date DESC, a.start_time DESC`,
      params
    );

    return sendSuccess(res, 200, {
      appointments: result.rows.map((row) => ({
        ...mapAppointment(row),
        patientName: `${row.first_name}${row.last_name ? ` ${row.last_name}` : ''}`,
        doctorName: row.doctor_name,
        departmentName: row.department_name,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentById = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT a.*, p.first_name, p.last_name, d.doctor_name, dep.department_name
       FROM appointment a
       JOIN patient p ON p.patient_id = a.patient_id
       JOIN doctor d ON d.doctor_id = a.doctor_id
       JOIN department dep ON dep.department_id = a.department_id
       WHERE a.appointment_id = $1`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return sendError(res, 404, 'Appointment not found.');
    }

    return sendSuccess(res, 200, { appointment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, departmentId, branchId, appointmentDate, startTime, endTime, appointmentType, status, notes } = req.body;
    if (!patientId || !doctorId || !departmentId || !appointmentDate || !startTime || !endTime) {
      return sendError(res, 400, 'Patient, doctor, department, date, start time and end time are required.');
    }

    const result = await db.query(
      `INSERT INTO appointment (patient_id, doctor_id, department_id, branch_id, appointment_date, start_time, end_time, appointment_type, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'consultation'), COALESCE($9, 'pending'), $10)
       RETURNING *`,
      [patientId, doctorId, departmentId, branchId || 1, appointmentDate, startTime, endTime, appointmentType, status, notes || null]
    );

    return sendSuccess(res, 201, { appointment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE appointment
       SET patient_id = COALESCE($1, patient_id),
           doctor_id = COALESCE($2, doctor_id),
           department_id = COALESCE($3, department_id),
           branch_id = COALESCE($4, branch_id),
           appointment_date = COALESCE($5, appointment_date),
           start_time = COALESCE($6, start_time),
           end_time = COALESCE($7, end_time),
           appointment_type = COALESCE($8, appointment_type),
           status = COALESCE($9, status),
           notes = COALESCE($10, notes),
           updated_at = NOW()
       WHERE appointment_id = $11
       RETURNING *`,
      [
        req.body.patientId,
        req.body.doctorId,
        req.body.departmentId,
        req.body.branchId,
        req.body.appointmentDate,
        req.body.startTime,
        req.body.endTime,
        req.body.appointmentType,
        req.body.status,
        req.body.notes,
        req.params.id,
      ]
    );

    if (!result.rows.length) {
      return sendError(res, 404, 'Appointment not found.');
    }

    return sendSuccess(res, 200, { appointment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM appointment WHERE appointment_id = $1 RETURNING appointment_id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 404, 'Appointment not found.');
    return sendSuccess(res, 200, { message: 'Appointment deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
