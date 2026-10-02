const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getPrescriptions = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.*, pat.first_name, pat.last_name, d.doctor_name
       FROM prescription p
       JOIN patient pat ON pat.patient_id = p.patient_id
       JOIN doctor d ON d.doctor_id = p.doctor_id
       ORDER BY p.prescription_id DESC`
    );
    return sendSuccess(res, 200, { prescriptions: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getPrescriptionById = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.*, pat.first_name, pat.last_name, d.doctor_name
       FROM prescription p
       JOIN patient pat ON pat.patient_id = p.patient_id
       JOIN doctor d ON d.doctor_id = p.doctor_id
       WHERE p.prescription_id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return sendError(res, 404, 'Prescription not found.');

    const details = await db.query(
      `SELECT pd.*, m.medicine_name
       FROM prescription_detail pd
       JOIN medicine m ON m.medicine_id = pd.medicine_id
       WHERE pd.prescription_id = $1`,
      [req.params.id]
    );

    return sendSuccess(res, 200, { prescription: { ...result.rows[0], medicines: details.rows } });
  } catch (error) {
    next(error);
  }
};

exports.createPrescription = async (req, res, next) => {
  try {
    const { patientId, doctorId, branchId, diagnosis, notes, medicines } = req.body;
    if (!patientId || !doctorId || !Array.isArray(medicines) || medicines.length === 0) {
      return sendError(res, 400, 'Patient, doctor, and at least one medicine are required.');
    }

    const prescriptionResult = await db.query(
      `INSERT INTO prescription (patient_id, doctor_id, branch_id, diagnosis, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [patientId, doctorId, branchId || 1, diagnosis || null, notes || null]
    );

    const prescription = prescriptionResult.rows[0];
    const detailValues = medicines.map((m) => [prescription.prescription_id, m.medicineId, m.dosage || '', m.frequency || '', Number(m.durationDays || 1), Number(m.quantity || 1), m.instructions || '']);

    await Promise.all(detailValues.map(([prescriptionId, medicineId, dosage, frequency, durationDays, quantity, instructions]) =>
      db.query(
        `INSERT INTO prescription_detail (prescription_id, medicine_id, dosage, frequency, duration_days, quantity, instructions)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [prescriptionId, medicineId, dosage, frequency, durationDays, quantity, instructions]
      )
    ));

    return sendSuccess(res, 201, { prescription });
  } catch (error) {
    next(error);
  }
};

exports.updatePrescription = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE prescription
       SET diagnosis = COALESCE($1, diagnosis),
           notes = COALESCE($2, notes),
           status = COALESCE($3, status),
           updated_at = NOW()
       WHERE prescription_id = $4
       RETURNING *`,
      [req.body.diagnosis, req.body.notes, req.body.status, req.params.id]
    );

    if (!result.rows.length) return sendError(res, 404, 'Prescription not found.');
    return sendSuccess(res, 200, { prescription: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
