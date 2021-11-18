const Logger = require("./Logger");

module.exports = class TelegramBot {
        constructor(options, https) {

	    //let sleep = ms => new Promise(resolve => setTimeout(resolve, 10000));
            this.token = options.token;
            this.chat_id = options.chat_id;
            this.path = '/bot' + this.token + '/sendMessage?chat_id=' + this.chat_id;
            this.startMsg = "Service monitoring GPIO started!";
            this.httpsObj = https;
            this.httpOptions = {
                host: 'api.telegram.org',
                port: 443,
                method: 'POST',
                timeout: options.requestTimeout
            };
        }

        startBot(startMsg = '') {
            (startMsg === "") ? this.sendMessage(this.startMsg) : this.sendMessage(startMsg);
        }

        buildMessageString(message) {
            let result = "&text=" + message + "";
            return result;
        }

	sendMessage(message) {
        return new Promise((resolve, reject) => {

                    let stringMsg = this.buildMessageString(message);
                    this.httpOptions.path = encodeURI(this.path + stringMsg);
                    let req = this.httpsObj.request(this.httpOptions, res => {
                        console.log(`Sending Message: ${stringMsg} | statusCode: ${res.statusCode}`);
                        res.on('data', d => {
                            resolve(d);
                        });

                        res.on('timeout', listener => {
                            Logger.log('Catch Timeout', listener);
                        });
                    });

                    req.on('error', error => {
                        let currentdate = new Date();
                        console.error(currentdate + ": " + error.toString());
                        reject(error.toString());
                    });

                    req.end();
        });
    }
};