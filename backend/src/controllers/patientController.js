const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const mapPatient = (row) => ({
  id: row.patient_id,
  name: `${row.first_name}${row.last_name ? ` ${row.last_name}` : ''}`,
  firstName: row.first_name,
  lastName: row.last_name,
  dateOfBirth: row.date_of_birth,
  gender: row.gender,
  bloodGroup: row.blood_group,
  phone: row.phone,
  email: row.email,
  address: row.address,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

exports.getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    let where = '';
    const params = [];

    if (search) {
      where = 'WHERE lower(first_name || \' \' || COALESCE(last_name, \'\')) ILIKE $1';
      params.push(`%${search}%`);
    }

    const result = await db.query(
      `SELECT * FROM patient ${where} ORDER BY patient_id DESC`,
      params
    );

    return sendSuccess(res, 200, { patients: result.rows.map(mapPatient) });
  } catch (error) {
    next(error);
  }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM patient WHERE patient_id = $1', [req.params.id]);

    if (!result.rows.length) {
      return sendError(res, 404, 'Patient not found.');
    }

    return sendSuccess(res, 200, { patient: mapPatient(result.rows[0]) });
  } catch (error) {
    next(error);
  }
};

exports.createPatient = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      phone,
      email,
      address,
      status,
    } = req.body;

    if (!firstName || !phone) {
      return sendError(res, 400, 'Patient name and phone are required.');
    }

    const result = await db.query(
      `INSERT INTO patient (first_name, last_name, date_of_birth, gender, blood_group, phone, email, address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'active'))
       RETURNING *`,
      [firstName, lastName || null, dateOfBirth || null, gender || 'Other', bloodGroup || null, phone, email || null, address || null, status || 'active']
    );

    return sendSuccess(res, 201, { patient: mapPatient(result.rows[0]) });
  } catch (error) {
    next(error);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE patient
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           date_of_birth = COALESCE($3, date_of_birth),
           gender = COALESCE($4, gender),
           blood_group = COALESCE($5, blood_group),
           phone = COALESCE($6, phone),
           email = COALESCE($7, email),
           address = COALESCE($8, address),
           status = COALESCE($9, status),
           updated_at = NOW()
       WHERE patient_id = $10
       RETURNING *`,
      [
        req.body.firstName,
        req.body.lastName,
        req.body.dateOfBirth || null,
        req.body.gender,
        req.body.bloodGroup,
        req.body.phone,
        req.body.email,
        req.body.address,
        req.body.status,
        req.params.id,
      ]
    );

    if (!result.rows.length) {
      return sendError(res, 404, 'Patient not found.');
    }

    return sendSuccess(res, 200, { patient: mapPatient(result.rows[0]) });
  } catch (error) {
    next(error);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM patient WHERE patient_id = $1 RETURNING patient_id', [req.params.id]);

    if (!result.rows.length) {
      return sendError(res, 404, 'Patient not found.');
    }

    return sendSuccess(res, 200, { message: 'Patient deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
