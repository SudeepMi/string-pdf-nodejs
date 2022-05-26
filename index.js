const http = require("http");
const port = process.env.PORT || 3001;

http.createServer(require('./app')).listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
});
