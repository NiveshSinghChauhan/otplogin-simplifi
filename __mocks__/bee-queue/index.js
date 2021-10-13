const mockUser = require("../../mock/data/user");


class Queue {
    constructor(name, settings) { }

    on(ev, fn = () => { }) {
        fn();
        return this;
    }

    process(fn = (job, done) => { }) {
        fn({ data: { user_id: mockUser._id } }, (error, data) => { })
    }

    createJob(data) { return new Job(); }
}


class Job {
    delayUntil(timestamp) { return this; }

    async save() { return this; }
}


module.exports = Queue;