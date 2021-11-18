module.exports = class Logger {
    static log(message) {
        let currentdate = new Date();
        console.log(currentdate + ": " + message);
        return message;
    }
};

