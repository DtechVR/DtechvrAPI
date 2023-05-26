const express = require('express');
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');
const config = require('config');
const app = new express();
const system = require('./routes/system');



app.use(express.json());
app.use(logger);
app.use(auth);

console.log('Application Name : ', config.get('name'));

app.use('/system', system);

const port = process.env.PORT || 1993;
app.listen(port,()=>{
        console.log(`Linstening on port ${port}`);
});