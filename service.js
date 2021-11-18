/* ############################## CONNECT LIBRARIES & CLASSES ############################## */
const https = require('https');
const raspi = require('raspi');
let fs = require('fs');
const gpioObj = require('raspi-gpio');
//const { util } = require('util');
let gpio = require("gpio");


console.log = function(d) {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    let log_file = fs.createWriteStream('/var/log/gpio_debug_'+year + "-" + month + "-" + date+'.log', {flags : 'a'});
    let log_stdout = process.stdout;
    log_file.write(d + '\n');
    log_stdout.write(d + '\n');
};

console.error = function(d) {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    let err_file = fs.createWriteStream('/var/log/gpio_error_'+year + "-" + month + "-" + date+'.log', {flags : 'a'});
    let err_stdout = process.stdout;
    err_file.write(d + '\n');
    err_stdout.write(d + '\n');
}


const Logger = require('./Logger');
const { Telegraf } = require('telegraf')

let config = require('./config');
let { IPinManager } = require('./IPin');
let TelegramBot = require('./telegram');
const { exec } = require("child_process");
const { exit, exitCode } = require('process');
//let ping = require('ping');
//const { Socket } = require('net');
//const { error } = require('console');
/* ############################## CONNECT LIBRARIES & CLASSES ############################## */

/* ############################## INIT COMPONENTS ############################## */
let ServiceCommands = new Object(config.commands);
let PinManager = new IPinManager(config.pins);
let telBot = new TelegramBot(config.telegram, https);
const botService = new Telegraf(config.telegram.token);
let sendMessage = (MsgText) => {
    return telBot.sendMessage(MsgText).catch((reason) => {
	Logger.log(reason);
    });
}
/* ############################## INIT COMPONENTS ############################## */
let isRunning = false;


raspi.init(() => {
    
    for(let [gpio_number] of Object.entries(config.pins)) {
        PinManager.pins.forEach((PIN) => {
            let gpioId = gpio_number.replace("GPIO","");
            if(PIN.name === gpioId) {
                PIN.gpioObj = gpio.export(PIN.name, {
                    direction: gpio.DIRECTION.IN,
                    interval: config.GpioHandleInterval,
                    ready: function() {
                        Logger.log("PIN" + PIN.name + " INITIALIZED!");
                    }
                 });


                PIN.gpioObj.on('change', (value) => {
                    if(value < 1 && !PIN.isSwitched) {
                        Logger.log(PIN.command);
                        if(PIN.command) {
                            execCustomCommand(PIN.command);
                            let msg = PIN.onFailMessage;
                            sendMessage(Logger.log(msg));
                            PIN.isSwitched = true;
                        }
                    }
                });
            }
        });
    }
});


botService.on('message', (ctx) => {
    let chatId = ctx.message.chat.id;

    if(config.telegram.chat_id == chatId) {

        let command = String(ctx.message.text).toLowerCase();
        Logger.log((command !== undefined) ? command:"");

        if(command === "reset") {
            PinManager.resetPins();
            let resetMsg = "Switch state of GPIO interfaces has been reset!";
            sendMessage(Logger.log(resetMsg));
        } else if(command === "show pins") {
            let strResponse = "";
            PinManager.pins.forEach((pin) => {
                strResponse += " ###\n " + pin.name;
                strResponse += " | state: " + ((!pin.isSwitched) ? "running" : "stoped");
                strResponse += " | description: " + pin.description + "'\n";
                strResponse += " | command: " + pin.command + "'\n";
                strResponse += " | onFailMessage: '" + pin.onFailMessage + "'\n";
                strResponse += " ### \n";
            });
            sendMessage(strResponse);
        } else if(ServiceCommands.hasOwnProperty(command)) {
            execCustomCommand(ServiceCommands[command]);
        }
    }
}).catch((err, ctx) => {
    Logger.log(err);
});


let BotCheckerDaemon = setInterval(() => {
    if(!isRunning) {
        botService.launch().then(() => {
            isRunning = true;
            sendMessage("Service monitoring GPIO started!");
        }).catch((reason) => {
            isRunning = false;
            Logger.log("Bot launching failed because of " + reason);
        });
    }
}, 6000);

botService.catch((err,ctx) => {
    isRunning = false;
    botService.stop();
    Logger.log("Bot launching failed because of " + err);
});

process
  .on('SIGTERM', () => {
    clearInterval(BotCheckerDaemon);
    shutdown('SIGTERM');
    sendMessage(Logger.log("Service stop by SIGTERM\n ...waiting, exiting..."));
  })
  .on('SIGINT', () => {
    clearInterval(BotCheckerDaemon);
    shutdown('SIGINT');
    sendMessage(Logger.log("Service stop by SIGINT\n ...waiting, exiting..."));
  })
  .on('uncaughtException', (error) => {
      Logger.log(error);
  })
  .on('unhandledRejection', (reason, p) => {
    Logger.log('=== UNHANDLED REJECTION ===');
    Logger.log(reason, p);
  });


function shutdown(signal) {
    return (err) => {
        botService.stop(signal);
        if (err) console.error(err.stack || err);
        setTimeout(() => {
            exit(err ? 1 : 0);
        }, 5000).unref();
    };
  }

function execCustomCommand(cmd) {
    exec(String(cmd), (error, stdout, stderr) => {
        if (error && error.code !== null) {
            sendMessage(Logger.log(error.message + " | " + error.code));
            return;
        }
        if (stderr) {
            sendMessage(Logger.log(stderr));
            return;
        }
        sendMessage(Logger.log(stdout));
    });
}

