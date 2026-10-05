const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getRooms = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM room ORDER BY room_id');
    return sendSuccess(res, 200, { rooms: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableRooms = async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM room WHERE status = 'available' ORDER BY room_id");
    return sendSuccess(res, 200, { rooms: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const { branchId, roomNumber, roomType, capacity, status } = req.body;
    if (!branchId || !roomNumber) return sendError(res, 400, 'Branch and room number are required.');

    const result = await db.query(
      `INSERT INTO room (branch_id, room_number, room_type, capacity, status)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'available'))
       RETURNING *`,
      [branchId, roomNumber, roomType || 'general', Number(capacity || 1), status || 'available']
    );

    return sendSuccess(res, 201, { room: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE room
       SET room_number = COALESCE($1, room_number),
           room_type = COALESCE($2, room_type),
           capacity = COALESCE($3, capacity),
           status = COALESCE($4, status),
           updated_at = NOW()
       WHERE room_id = $5
       RETURNING *`,
      [req.body.roomNumber, req.body.roomType, req.body.capacity, req.body.status, req.params.id]
    );

    if (!result.rows.length) return sendError(res, 404, 'Room not found.');
    return sendSuccess(res, 200, { room: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
