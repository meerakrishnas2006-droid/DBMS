const http = require('http');
const app = require('./app');
require('dotenv').config();

const PORT = Number(process.env.SERVER_PORT || 5000);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Hospital Management System backend running on http://localhost:${PORT}`);
});
