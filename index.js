
const app = require('./app');
const { log } = require('./logger');
const client = require('./db');

const PORT = process.env.PORT;

app.listen(PORT, () => {
    log.info(`Server started @ ${PORT}`)

    client().then(() => {
        log.info(`Database connected on ${process.env.MONGODB_URL}`)
    })
});