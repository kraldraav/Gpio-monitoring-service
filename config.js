module.exports = config = {
    telegram: {
        token: '', /* Need to disable Group Privacy in Telegram Bot Settings  */
        chat_id: '', /* Group Channel */
	requestTimeout: 3600000,
    },
    commands: {
        'reset': 'Reset switch state of interfaces', // Hardcode function
        'show pins': 'Show configured pins', // Hardcode function
        'restart': 'sudo /etc/init.d/gpio-service restart',
        'status': 'sudo /etc/init.d/gpio-service status | grep Active',
    },
	GpioHandleInterval: 200, // Interval in milliseconds
	pingSettings: {
		host: '10.20.0.1', // netwatch host
		timeout: 1000,
		retries: 6,
	},
    pins: {
		'GPIO4': {
			isUsed: true,
			description: 'Ethernet1',
			onFailMessage: 'Alarm message 1',
			command: 'sudo /etc/init.d/gpio-service status | grep Active',
		},
		'GPIO17': {
			isUsed: true,
			description: 'Ethernet2',
			onFailMessage: 'Alarm message 2',
			command: 'sudo w',
		},
		'GPIO18': {
			isUsed: false,
			description: 'Ethernet3',
			onFailMessage: 'ping',
			command: 'ping google.com -c 2',
		},
		'GPIO12': {
			isUsed: false,
			description: 'GPIO12 pin Ethernet4',
			onFailMessage: 'GPIO12 going down!',
			command: '',
		},
		'GPIO13': {
			isUsed: false,
			description: 'GPIO13 pin Ethernet5',
			onFailMessage: 'GPIO13 going down!',
			command: '',
		},
		'GPIO16': {
			isUsed: false,
			description: 'GPIO16 pin Ethernet6',
			onFailMessage: 'GPIO16 going down!',
			command: '',
		},
		'GPIO19': {
			isUsed: false,
			description: 'GPIO19 pin Ethernet7',
			onFailMessage: 'GPIO19 going down!',
			command: '',
		},
		'GPIO20': {
			isUsed: false,
			description: 'Kitchen',
			onFailMessage: 'Kitchen is going down!',
			command: '',
		},
		'GPIO21': {
			isUsed: false,
			description: 'Bathroom',
			onFailMessage: 'Bathroom is going down!',
			command: '',
		},
		'GPIO27': {
			isUsed: false,
			description: 'Living Room',
			onFailMessage: 'Living Room is going down!',
			command: '',
		},
    }
};
