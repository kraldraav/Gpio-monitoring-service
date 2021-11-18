class iPin {
    constructor(pin_name, desc, isUsed, onFailMessage, gpioObj = null, command = null) {
        this.name = pin_name.replace("GPIO", "");
        this.description = desc;
        this.isSwitched = false
        this.isUsed = isUsed;
        this.onFailMessage = onFailMessage;
        this.gpioObj = gpioObj;
        this.command = command;
    }
}

class IPinManager {
    _loadPins(options) {

        if(Object.entries(options).length > 10) {
            console.error('Number of GPIO interfaces over 10 count!!!');
            throw new Error('Number of GPIO interfaces over 10 count!!!');
        }
        let pins_arr = [];
        for(let [gpio_number, option] of Object.entries(options)) {
            if(option.isUsed === true) {
                pins_arr.push(new iPin(gpio_number, option.description, option.isUsed, option.onFailMessage, null, option.command));
            }
        }

        return pins_arr;
    }

    constructor(options) {
        this.pins = this._loadPins(options);
    }

    resetPins() {
        this.pins.forEach((pin) => {
            pin.isSwitched = false;
        });
    }
}

module.exports = {
    iPin,
    IPinManager
}