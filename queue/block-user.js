const Queue = require('bee-queue');
const dayjs = require('dayjs');
const redis = require('redis');
const { log } = require('../logger');
const userModel = require('../models/user');



const blockedUsersQueue = new Queue('blocked-users', {
    activateDelayedJobs: true,
    redis: redis.createClient(process.env.REDIS_URL),
});



blockedUsersQueue.on('ready', function () {
    log.info('Queue ready to process jobs');

    blockedUsersQueue.process(async (job, done) => {
        await unBlockUser(job.data.user_id);
        return done(null, job.data);
    });

});


async function unBlockUser(user_id) {
    log.info(`Unblocked user ${user_id}`);
    await userModel.updateOne({ _id: user_id }, { $set: { blocked: false }, $unset: { blocked_at: 1 } }).exec();
}

function addUserToBlockedQueue(user_id, timestamp) {
    const delayUntil = dayjs(timestamp).add(5, 'm').toDate();
    return blockedUsersQueue.createJob({ user_id }).delayUntil(delayUntil).save();
}


module.exports = {
    addUserToBlockedQueue,
}