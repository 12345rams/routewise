const app=require('./app');
const config=require('./config/config');
const port=config.port;
const URL_DB=config.URL_DB;
const mongoose=require('mongoose');
const http = require('http');
mongoose.connect(URL_DB).then(()=>{
    console.log('Connected to database');
}).catch((error)=>{
    console.log('Error connecting to database',error);
})
const { initializeSocket } = require('./socket');
const server = http.createServer(app);
initializeSocket(server);
server.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})

