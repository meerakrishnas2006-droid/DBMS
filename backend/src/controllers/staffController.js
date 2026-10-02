const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getStaff = async (req, res, next) => {
  try {
    const { search } = req.query;
    let where = '';
    const params = [];

    if (search) {
      where = `WHERE lower(staff_name) ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    const result = await db.query(
      `SELECT * FROM staff ${where} ORDER BY staff_id DESC`,
      params
    );

    return sendSuccess(res, 200, { staff: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getStaffById = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM staff WHERE staff_id = $1', [req.params.id]);
    if (!result.rows.length) return sendError(res, 404, 'Staff member not found.');
    return sendSuccess(res, 200, { staff: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.createStaff = async (req, res, next) => {
  try {
    const { branchId, departmentId, name, role, phone, email, status } = req.body;
    if (!name || !role) return sendError(res, 400, 'Staff name and role are required.');

    const result = await db.query(
      `INSERT INTO staff (branch_id, department_id, staff_name, role, phone, email, status)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'active'))
       RETURNING *`,
      [branchId || 1, departmentId || 1, name, role, phone || null, email || null, status || 'active']
    );

    return sendSuccess(res, 201, { staff: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE staff
       SET branch_id = COALESCE($1, branch_id),
           department_id = COALESCE($2, department_id),
           staff_name = COALESCE($3, staff_name),
           role = COALESCE($4, role),
           phone = COALESCE($5, phone),
           email = COALESCE($6, email),
           status = COALESCE($7, status),
           updated_at = NOW()
       WHERE staff_id = $8
       RETURNING *`,
      [req.body.branchId, req.body.departmentId, req.body.name, req.body.role, req.body.phone, req.body.email, req.body.status, req.params.id]
    );

    if (!result.rows.length) return sendError(res, 404, 'Staff member not found.');
    return sendSuccess(res, 200, { staff: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM staff WHERE staff_id = $1 RETURNING staff_id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 404, 'Staff member not found.');
    return sendSuccess(res, 200, { message: 'Staff member deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
