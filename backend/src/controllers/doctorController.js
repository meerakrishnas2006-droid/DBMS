const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const mapDoctor = (row) => ({
  id: row.doctor_id,
  name: row.doctor_name,
  departmentId: row.department_id,
  branchId: row.branch_id,
  specialization: row.specialization,
  phone: row.phone,
  email: row.email,
  status: row.status,
  consultationFee: Number(row.consultation_fee),
  createdAt: row.created_at,
});

exports.getDoctors = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    let where = '';
    const params = [];

    if (department && department !== 'all') {
      where = `${where ? ' AND ' : ' WHERE '} d.department_id = $${params.length + 1}`;
      params.push(department);
    }

    if (search) {
      where = `${where ? ' AND ' : ' WHERE '} lower(d.doctor_name) ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    const result = await db.query(
      `SELECT d.*, dep.department_name
       FROM doctor d
       JOIN department dep ON dep.department_id = d.department_id
       ${where}
       ORDER BY d.doctor_id DESC`,
      params
    );

    return sendSuccess(res, 200, { doctors: result.rows.map(row => ({ ...mapDoctor(row), departmentName: row.department_name })) });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT d.*, dep.department_name
       FROM doctor d
       JOIN department dep ON dep.department_id = d.department_id
       WHERE d.doctor_id = $1`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return sendError(res, 404, 'Doctor not found.');
    }

    const row = result.rows[0];
    return sendSuccess(res, 200, { doctor: { ...mapDoctor(row), departmentName: row.department_name } });
  } catch (error) {
    next(error);
  }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const { branchId, departmentId, name, specialization, phone, email, status, consultationFee } = req.body;

    if (!name || !departmentId) {
      return sendError(res, 400, 'Doctor name and department are required.');
    }

    const result = await db.query(
      `INSERT INTO doctor (branch_id, department_id, doctor_name, specialization, phone, email, status, consultation_fee)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'available'), COALESCE($8, 0))
       RETURNING *`,
      [branchId || 1, departmentId, name, specialization || null, phone || null, email || null, status || 'available', consultationFee || 0]
    );

    return sendSuccess(res, 201, { doctor: mapDoctor(result.rows[0]) });
  } catch (error) {
    next(error);
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE doctor
       SET branch_id = COALESCE($1, branch_id),
           department_id = COALESCE($2, department_id),
           doctor_name = COALESCE($3, doctor_name),
           specialization = COALESCE($4, specialization),
           phone = COALESCE($5, phone),
           email = COALESCE($6, email),
           status = COALESCE($7, status),
           consultation_fee = COALESCE($8, consultation_fee),
           updated_at = NOW()
       WHERE doctor_id = $9
       RETURNING *`,
      [
        req.body.branchId,
        req.body.departmentId,
        req.body.name,
        req.body.specialization,
        req.body.phone,
        req.body.email,
        req.body.status,
        req.body.consultationFee,
        req.params.id,
      ]
    );

    if (!result.rows.length) {
      return sendError(res, 404, 'Doctor not found.');
    }

    return sendSuccess(res, 200, { doctor: mapDoctor(result.rows[0]) });
  } catch (error) {
    next(error);
  }
};
