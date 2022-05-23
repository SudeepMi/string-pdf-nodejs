const http = require("http");
const port = process.env.PORT || 3001;

http.createServer(require('./app')).listen(port);
