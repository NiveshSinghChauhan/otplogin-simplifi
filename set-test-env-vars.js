require('dotenv').config({
    path: './.env.test'
});

const { nanoid } = require('nanoid')
const packageJson = require('./package.json')

process.env.SECRET = nanoid(10)
process.env.MONGODB_DBNAME = packageJson.name + '-test-db-' + nanoid(5);