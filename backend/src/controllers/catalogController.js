const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getBranches = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let where = '';
    const params = [];

    if (status) {
      where += `${where ? ' AND ' : ' WHERE '} status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      where += `${where ? ' AND ' : ' WHERE '} lower(branch_name) ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    const result = await db.query(`SELECT * FROM branch ${where} ORDER BY branch_id DESC`, params);
    return sendSuccess(res, 200, { branches: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.createBranch = async (req, res, next) => {
  try {
    const { branchName, address, phone, email, status } = req.body;
    if (!branchName) return sendError(res, 400, 'Branch name is required.');

    const result = await db.query(
      `INSERT INTO branch (branch_name, address, phone, email, status)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'active')) RETURNING *`,
      [branchName, address || null, phone || null, email || null, status || 'active']
    );

    return sendSuccess(res, 201, { branch: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getDepartments = async (req, res, next) => {
  try {
    const { branchId, search } = req.query;
    let where = '';
    const params = [];

    if (branchId) {
      where += `${where ? ' AND ' : ' WHERE '} d.branch_id = $${params.length + 1}`;
      params.push(branchId);
    }

    if (search) {
      where += `${where ? ' AND ' : ' WHERE '} lower(d.department_name) ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    const result = await db.query(
      `SELECT d.*, b.branch_name
       FROM department d
       JOIN branch b ON b.branch_id = d.branch_id
       ${where}
       ORDER BY d.department_id DESC`,
      params
    );

    return sendSuccess(res, 200, { departments: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { branchId, departmentName, description, status } = req.body;
    if (!branchId || !departmentName) return sendError(res, 400, 'Branch and department name are required.');

    const result = await db.query(
      `INSERT INTO department (branch_id, department_name, description, status)
       VALUES ($1, $2, $3, COALESCE($4, 'active')) RETURNING *`,
      [branchId, departmentName, description || null, status || 'active']
    );

    return sendSuccess(res, 201, { department: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getNurses = async (req, res, next) => {
  try {
    const { departmentId, branchId, search } = req.query;
    let where = '';
    const params = [];

    if (departmentId) {
      where += `${where ? ' AND ' : ' WHERE '} n.department_id = $${params.length + 1}`;
      params.push(departmentId);
    }
    if (branchId) {
      where += `${where ? ' AND ' : ' WHERE '} n.branch_id = $${params.length + 1}`;
      params.push(branchId);
    }
    if (search) {
      where += `${where ? ' AND ' : ' WHERE '} lower(n.nurse_name) ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    const result = await db.query(
      `SELECT n.*, d.department_name, b.branch_name
       FROM nurse n
       JOIN department d ON d.department_id = n.department_id
       JOIN branch b ON b.branch_id = n.branch_id
       ${where}
       ORDER BY n.nurse_id DESC`,
      params
    );

    return sendSuccess(res, 200, { nurses: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.createNurse = async (req, res, next) => {
  try {
    const { branchId, departmentId, nurseName, phone, email, status } = req.body;
    if (!branchId || !departmentId || !nurseName) return sendError(res, 400, 'Branch, department and nurse name are required.');

    const result = await db.query(
      `INSERT INTO nurse (branch_id, department_id, nurse_name, phone, email, status)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'active')) RETURNING *`,
      [branchId, departmentId, nurseName, phone || null, email || null, status || 'active']
    );

    return sendSuccess(res, 201, { nurse: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getAdmissions = async (req, res, next) => {
  try {
    const { patientId, status } = req.query;
    let where = '';
    const params = [];

    if (patientId) {
      where += `${where ? ' AND ' : ' WHERE '} a.patient_id = $${params.length + 1}`;
      params.push(patientId);
    }
    if (status) {
      where += `${where ? ' AND ' : ' WHERE '} a.status = $${params.length + 1}`;
      params.push(status);
    }

    const result = await db.query(
      `SELECT a.*, p.first_name, p.last_name, d.doctor_name, r.room_number, dep.department_name, b.branch_name
       FROM admission a
       JOIN patient p ON p.patient_id = a.patient_id
       JOIN doctor d ON d.doctor_id = a.doctor_id
       JOIN room r ON r.room_id = a.room_id
       JOIN department dep ON dep.department_id = a.department_id
       JOIN branch b ON b.branch_id = a.branch_id
       ${where}
       ORDER BY a.admission_id DESC`,
      params
    );

    return sendSuccess(res, 200, { admissions: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.createAdmission = async (req, res, next) => {
  try {
    const { patientId, doctorId, roomId, branchId, departmentId, status, notes } = req.body;
    if (!patientId || !doctorId || !roomId || !branchId || !departmentId) {
      return sendError(res, 400, 'Patient, doctor, room, branch and department are required.');
    }

    const result = await db.query(
      `INSERT INTO admission (patient_id, doctor_id, room_id, branch_id, department_id, status, notes)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'admitted'), $7)
       RETURNING *`,
      [patientId, doctorId, roomId, branchId, departmentId, status || 'admitted', notes || null]
    );

    return sendSuccess(res, 201, { admission: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getEquipment = async (req, res, next) => {
  try {
    const { theatreId, status } = req.query;
    let where = '';
    const params = [];
    if (theatreId) {
      where += `${where ? ' AND ' : ' WHERE '} e.theatre_id = $${params.length + 1}`;
      params.push(theatreId);
    }
    if (status) {
      where += `${where ? ' AND ' : ' WHERE '} e.status = $${params.length + 1}`;
      params.push(status);
    }

    const result = await db.query(
      `SELECT e.*, ot.theatre_name
       FROM equipment e
       JOIN operation_theatre ot ON ot.theatre_id = e.theatre_id
       ${where}
       ORDER BY e.equipment_id DESC`,
      params
    );

    return sendSuccess(res, 200, { equipment: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getShiftLogs = async (req, res, next) => {
  try {
    const { staffId, status } = req.query;
    let where = '';
    const params = [];
    if (staffId) {
      where += `${where ? ' AND ' : ' WHERE '} sl.staff_id = $${params.length + 1}`;
      params.push(staffId);
    }
    if (status) {
      where += `${where ? ' AND ' : ' WHERE '} sl.status = $${params.length + 1}`;
      params.push(status);
    }

    const result = await db.query(
      `SELECT sl.*, s.staff_name, b.branch_name
       FROM shift_log sl
       JOIN staff s ON s.staff_id = sl.staff_id
       JOIN branch b ON b.branch_id = sl.branch_id
       ${where}
       ORDER BY sl.shift_date DESC, sl.start_time DESC`,
      params
    );

    return sendSuccess(res, 200, { shifts: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getPayStructures = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT ps.*, s.staff_name
       FROM pay_structure ps
       JOIN staff s ON s.staff_id = ps.staff_id
       ORDER BY ps.pay_structure_id DESC`
    );
    return sendSuccess(res, 200, { payStructures: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.createPayStructure = async (req, res, next) => {
  try {
    const { staffId, positionTitle, baseSalary, allowance, overtimeRate, effectiveFrom } = req.body;
    if (!staffId || !positionTitle || !baseSalary) return sendError(res, 400, 'Staff, position title and base salary are required.');

    const result = await db.query(
      `INSERT INTO pay_structure (staff_id, position_title, base_salary, allowance, overtime_rate, effective_from)
       VALUES ($1, $2, $3, COALESCE($4, 0), COALESCE($5, 0), COALESCE($6, CURRENT_DATE)) RETURNING *`,
      [staffId, positionTitle, Number(baseSalary), Number(allowance || 0), Number(overtimeRate || 0), effectiveFrom || null]
    );

    return sendSuccess(res, 201, { payStructure: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getSalaries = async (req, res, next) => {
  try {
    const { staffId } = req.query;
    let where = '';
    const params = [];
    if (staffId) {
      where += `${where ? ' AND ' : ' WHERE '} s.staff_id = $${params.length + 1}`;
      params.push(staffId);
    }

    const result = await db.query(
      `SELECT sa.*, st.staff_name
       FROM salary sa
       JOIN staff st ON st.staff_id = sa.staff_id
       ${where}
       ORDER BY sa.pay_period_start DESC`,
      params
    );
    return sendSuccess(res, 200, { salaries: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.createSalary = async (req, res, next) => {
  try {
    const { staffId, payPeriodStart, payPeriodEnd, grossSalary, deductions, netSalary, status } = req.body;
    if (!staffId || !payPeriodStart || !payPeriodEnd || !grossSalary) {
      return sendError(res, 400, 'Staff, pay period and gross salary are required.');
    }

    const result = await db.query(
      `INSERT INTO salary (staff_id, pay_period_start, pay_period_end, gross_salary, deductions, net_salary, status)
       VALUES ($1, $2, $3, $4, COALESCE($5, 0), COALESCE($6, $4), COALESCE($7, 'pending')) RETURNING *`,
      [staffId, payPeriodStart, payPeriodEnd, Number(grossSalary), Number(deductions || 0), Number(netSalary || grossSalary), status || 'pending']
    );

    return sendSuccess(res, 201, { salary: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateAdmission = async (req, res, next) => {
  try {
    const { status, dischargeDate, notes } = req.body;
    const result = await db.query(
      `UPDATE admission
       SET status = COALESCE($1, status),
           discharge_date = COALESCE($2, discharge_date),
           notes = COALESCE($3, notes),
           updated_at = NOW()
       WHERE admission_id = $4
       RETURNING *`,
      [status || null, dischargeDate || null, notes || null, req.params.id]
    );
    if (!result.rows.length) return sendError(res, 404, 'Admission not found.');
    return sendSuccess(res, 200, { admission: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.createEquipment = async (req, res, next) => {
  try {
    const { theatreId, equipmentName, equipmentType, serialNumber, status } = req.body;
    if (!theatreId || !equipmentName) return sendError(res, 400, 'Theatre and equipment name are required.');
    const result = await db.query(
      `INSERT INTO equipment (theatre_id, equipment_name, equipment_type, serial_number, status)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'active')) RETURNING *`,
      [theatreId, equipmentName, equipmentType || 'general', serialNumber || null, status || 'active']
    );
    return sendSuccess(res, 201, { equipment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateEquipment = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE equipment
       SET equipment_name = COALESCE($1, equipment_name),
           status = COALESCE($2, status),
           last_maintenance = COALESCE($3, last_maintenance),
           updated_at = NOW()
       WHERE equipment_id = $4 RETURNING *`,
      [req.body.equipmentName || null, req.body.status || null, req.body.lastMaintenance || null, req.params.id]
    );
    if (!result.rows.length) return sendError(res, 404, 'Equipment not found.');
    return sendSuccess(res, 200, { equipment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.createShiftLog = async (req, res, next) => {
  try {
    const { staffId, branchId, shiftDate, shiftType, startTime, endTime, status, notes } = req.body;
    if (!staffId || !branchId || !shiftDate) return sendError(res, 400, 'Staff, branch, and shift date are required.');
    const result = await db.query(
      `INSERT INTO shift_log (staff_id, branch_id, shift_date, shift_type, start_time, end_time, status, notes)
       VALUES ($1, $2, $3, COALESCE($4,'day'), $5, $6, COALESCE($7,'present'), $8) RETURNING *`,
      [staffId, branchId, shiftDate, shiftType || 'day', startTime || null, endTime || null, status || 'present', notes || null]
    );
    return sendSuccess(res, 201, { shiftLog: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateSalary = async (req, res, next) => {
  try {
    const { status, paymentDate } = req.body;
    const result = await db.query(
      `UPDATE salary
       SET status = COALESCE($1, status),
           payment_date = COALESCE($2, payment_date),
           updated_at = NOW()
       WHERE salary_id = $3 RETURNING *`,
      [status || null, paymentDate || new Date().toISOString().split('T')[0], req.params.id]
    );
    if (!result.rows.length) return sendError(res, 404, 'Salary record not found.');
    return sendSuccess(res, 200, { salary: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

