const { connect } = require('mongoose');


const client = () => connect(process.env.MONGODB_URL, {
    dbName: process.env.MONGODB_DBNAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
});



module.exports = client;