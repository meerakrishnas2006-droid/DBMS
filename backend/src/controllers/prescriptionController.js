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

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const patient = await client.query('SELECT patient_id FROM patient WHERE patient_id = $1', [patientId]);
      if (!patient.rows.length) {
        throw new Error('PATIENT_NOT_FOUND');
      }

      const doctor = await client.query('SELECT doctor_id, branch_id FROM doctor WHERE doctor_id = $1', [doctorId]);
      if (!doctor.rows.length) {
        throw new Error('DOCTOR_NOT_FOUND');
      }

      const prescriptionResult = await client.query(
        `INSERT INTO prescription (patient_id, doctor_id, branch_id, diagnosis, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [patientId, doctorId, branchId || doctor.rows[0].branch_id || 1, diagnosis || null, notes || null]
      );

      const prescription = prescriptionResult.rows[0];
      for (const med of medicines) {
        if (!med.medicineId) {
          throw new Error('MEDICINE_ID_REQUIRED');
        }

        const medCheck = await client.query('SELECT medicine_id, stock_quantity, status FROM medicine WHERE medicine_id = $1', [med.medicineId]);
        if (!medCheck.rows.length) {
          throw new Error('MEDICINE_NOT_FOUND');
        }

        const quantity = Number(med.quantity || 1);
        if (quantity <= 0) {
          throw new Error('INVALID_PRESCRIPTION_QUANTITY');
        }

        await client.query(
          `INSERT INTO prescription_detail (prescription_id, medicine_id, dosage, frequency, duration_days, quantity, instructions)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [prescription.prescription_id, med.medicineId, med.dosage || '', med.frequency || '', Number(med.durationDays || 1), quantity, med.instructions || '']
        );
      }

      await client.query('COMMIT');
      return sendSuccess(res, 201, { prescription });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.message === 'PATIENT_NOT_FOUND') return sendError(res, 404, 'Patient not found.');
      if (error.message === 'DOCTOR_NOT_FOUND') return sendError(res, 404, 'Doctor not found.');
      if (error.message === 'MEDICINE_NOT_FOUND') return sendError(res, 404, 'Medicine not found.');
      if (error.message === 'MEDICINE_ID_REQUIRED') return sendError(res, 400, 'Each medicine must include a valid medicine id.');
      if (error.message === 'INVALID_PRESCRIPTION_QUANTITY') return sendError(res, 400, 'Prescription quantities must be greater than zero.');
      next(error);
    } finally {
      client.release();
    }
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
