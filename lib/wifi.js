const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const promiseRetry = require('promise-retry');

const WLAN = 'wlan0';
const NET_ID = 0;
const MAX_CONNECT_RETRIES = 1;

const ERR_CONNECT = 'Could not connect to network.';
const ERR_START = 'Could not start wifi adapter.';
const ERR_STOP = 'Could not stop wifi adapter.';
const ERR_DHCP = 'Could not renew DHCP lease.';
const ERR_MAX_RETRIES = 'Could not start wifi adapter - Max retries exceeded.'; 
const ERR_HANDSHAKE = 'Could not get an IP address from the network. Please check credentials.';
	
var commands = {
	startInterface: 'sudo /sbin/ifup ' + WLAN,
	stopInterface: 'sudo /sbin/ifdown ' + WLAN,
	dhcpRenew: 'sudo /sbin/dhclient -v ' + WLAN,
	scanUtil: 'sudo /sbin/iwlist ' + WLAN + ' scan',
	iwGetId: "/sbin/iwgetid -r | tr -d '\n'",
	getLocalIP: "sudo /sbin/ifconfig " + WLAN + " | grep 'inet addr' | cut -d: -f2 | awk '{print $1}'",
	getExternalIP: '/usr/bin/wget http://icanhazip.com -qO-',
	getMacAddress: 'cat /sys/class/net/' + WLAN + '/address',
	signalQuality: "/sbin/iwconfig wlan0 | grep -i --color quality | cut -d '=' -f 2 | cut -d '/' -f 1 | tr -d '\n'",
	wpaCli: 'sudo /sbin/wpa_cli',
}

var wifi = {

	/**
	 * Scan for available wifi networks
	 *
	 * @return {Promise.<array, Error>} A promise that returns an array of network if resolved,
	 * or an Error if rejected.
	 */	 
	scanNetworks: function() {

		return new Promise((resolve, reject) => {

			wifi.getCurrentNetwork()
			.then(function(currentNetwork) {
				exec(commands.scanUtil, function(err, stdout, stderr) {
					(err) ? reject(stderr) : resolve(wifi.parseIwlist(stdout, currentNetwork));					
				});
				
			})
			.catch(err => {
				reject(err);
			})
			
		});
		
	},
	

	/**
	 * Set credentials for wifi network
	 *
	 * @param {string} ssid - SSID of the network to connect to
	 * @param {string} psk - PSK/passphrase of the network
	 *
	 * @return {boolean} returns true if no errors
	 */	
	setCreds: function(ssid, psk, key_mgmt) {

		return new Promise((resolve, reject) => {
			
			// make sure interface is up, this will throw exceptions if wlan0 is down
			wifi.startInterface()
			.then(started => {
				if(started) {
					
					// remove existing network 0
					execSync(`${commands.wpaCli} remove_network ${NET_ID}`).toString().split('\n')[1];

					// add network via wpa_cli
					execSync(`${commands.wpaCli} add_network`).toString().split('\n')[1];

					// set the SSID
					execSync(`${commands.wpaCli} set_network ${NET_ID} ssid '"${ssid}"'`);
						
					// set passphrase if required
					if(psk) {
						execSync(`${commands.wpaCli} set_network ${NET_ID} psk '"${psk}"'`);
					}
					
					// set key management
					if(key_mgmt) {
						execSync(`${commands.wpaCli} set_network ${NET_ID} key_mgmt ${key_mgmt}`);
					}
						
					// enable directed probe scan in case this is a hidden network
					execSync(`${commands.wpaCli} set_network ${NET_ID} scan_ssid 1`);

					// enable the network
					execSync(`${commands.wpaCli} enable_network ${NET_ID}`);

					// save config to wpa_supplicant file
					execSync(`${commands.wpaCli} save_config`);
					
					resolve(true);
					
				}
			})
			.catch(err => {
				reject(err);
			})
			
		});

	},
	
	
	/**
	 * Stop wlan adapter
	 *
	 * @return {Promise.<boolean, Error>} A promise that returns true if resolved,
	 * or an Error if rejected.
	 */	
	stopInterface: function() {

		return new Promise((resolve, reject) => {
				
			exec(commands.stopInterface, function(err, stdout) {

				if(stdout.indexOf('Killed') == -1) {
					resolve(true);
				} else {
					reject(ERR_STOP);
				}
				
			});
			
		});
		
	},
	
	/**
	 * Start wlan adapter
	 *
	 * @return {Promise.<boolean, Error>} A promise that returns true if resolved,
	 * or an Error if rejected.
	 */	
	startInterface: function() {
		
		return new Promise((resolve, reject) => {
					
			exec(commands.startInterface, function(err, stdout, stderr) {
				if(stdout.indexOf('Failed') == -1 || stdout.indexOf('already configured') > -1) {
					resolve(true);
				} else {
					console.log(stdout);
					reject(ERR_START);
				}
				
			});
			
		});		
		
	},
	
	/**
	 * Renew the dhcp lease
	 *
	 * @return {Promise.<boolean, Error>} A promise that returns true if resolved,
	 * or an Error if rejected.
	 */	
	dhcpRenew: function() {

		return new Promise((resolve, reject) => {
					
			exec(commands.dhcpRenew, function(err, stdout, stderr) {
				// verbose mode in command sends to stderr
				if(stderr.indexOf('bound to') > -1) {
					resolve(true);
				}
				
				reject(ERR_DHCP);
			});
			
		});		
		
	},
	
	/**
	 * Connect to the network. Attempts to:
	 * 
	 * 1) Set WiFi credentials
	 * 2) Stop Interface
	 * 3) Start Interface (with retries)
	 * 4) Renew DHCP Lease
	 * 
	 * @param {string} ssid - Network SSID
	 * @param {string} psk - Network PSK/Passphrase
	 *
	 * @return {Promise.<boolean, Error>} A promise that returns true if resolved,
	 * or an Error if rejected.
	 */
	connect: function(ssid, psk, key_mgmt) {
		
		key_mgmt = key_mgmt || null;
		
		return new Promise((resolve, reject) => {
			
			wifi.setCreds(ssid, psk, key_mgmt)
			.then(wifi.stopInterface)
			.then(function() {
	
				promiseRetry(function(retry, number) {
							
					return wifi.startInterface()
						.catch(function(err) {
							if(err == ERR_START && number > MAX_RETRIES) {
								throw(ERR_MAX_RETRIES);
							}
								
							retry(err);
						});
							
				})
				
			})
			.then(wifi.dhcpRenew)
			.then(wifi.getLocalIP)
			.then(function() {
				resolve(true);
			})
			.catch(function(err) {
				reject(err);
			});

		});
		
	},
	
	/**
	 * Get SSID of current connected network (if available)
	 *
	 * @param {Function} callback - called after exec
	 *
	 * @return {Promise.<boolean, Error>} A promise that returns true if resolved,
	 * or an Error if rejected.
	 */
	getCurrentNetwork: function() {
		
		return new Promise((resolve, reject) => {
			exec(commands.iwGetId, function(err, stdout, stderr) {
				if(err) {
					resolve(null);
				}
				
				resolve(stdout);
			});
			
		});
		
	},

	/**
	 * Parses the output of the iwlist scan
	 *
	 * @param {string} output - Raw results from iwlist
	 * @param {string} currentNetwork - SSID of currently connected network
	 *
	 * @return {array} of parsed network data objects from scan
	 */
	parseIwlist: function(output, currentNetwork) {

		var networks = {};
		
		 var out = output.replace(/^\s+/mg, '').split('\n')
		 var cells = [];
		 var line;
		 var info = {};
		 var fields = {
			 'mac' : /^Cell \d+ - Address: (.*)/,
			 'ssid' : /^ESSID:"(.*)"/,
			 'channel': /^Channel:(.*)/,
			 'quality' : /Quality(?:=|\:)([^\s]+)/,
			 'encryption_key' : /Encryption key:(.*)/,	
			 'wpa': /IE: (WPA Version .*)/,
			 'wpa2': /IE:.*(WPA2 Version .*)/,
		};
		
		 for (var i=0,l=out.length; i<l; i++) {
			  
			 line = out[i].trim();
	
			 if (!line.length) {
				 continue;
			 }
			 if (line.match("Scan completed :")) {
				 continue;
			 }
			 if (line.match("Interface doesn't support scanning.")) {
				 continue;
			 }
	
			 if (line.match(fields.mac)) {
				 cells.push(info);
				 info = {};
			 }
	
			 for (var field in fields) {
				 if (line.match(fields[field])) {
					 info[field] = (fields[field].exec(line)[1]).trim();
					 
					if(field == 'quality') {
						var parts = info[field].split('/');
						info['quality_pct'] = parseInt((parts[0] / parts[1]) * 100);
					} else if(field == 'ssid' && info[field] == currentNetwork) {
						info['current'] = true;
					} else if(field == 'encryption_key') {
						// change from 'on' to boolean
						info[field] = (info[field] == 'on' ? true : false);
					}
					
				 }
				 
			 }
			 
		 }
		 
		 cells.push(info);
		 cells.shift();
		 
		 /*
		 * Restructure into object keyed by ssid, preventing duplicate ssids 
		  * from showing in list when using mesh networks.
		  */
		 for(var i = 0; i < cells.length; i++) {
			  // only include if it is broadcasting ssid
			  if(cells[i].ssid.length) {
				   networks[cells[i].ssid] = cells[i];
			  }
		 }
		 
		 return networks;
		
	},
	
	/**
	 * Get IP address of wireless adapter
	 *
	 * @return {string} ip address or empty
	 */	
	getLocalIP: function() {
		return execSync(commands.getLocalIP).toString().trim();
	},
	
	/**
	 * Get External IP address of this network
	 *
	 * @return {Promise.<string, Error>} A promise that returns external IP if resolved,
	 * or an Error if rejected.
	 */	
	getExternalIP: function() {
		
		return new Promise((resolve, reject) => {
			
			exec(commands.getExternalIP, function(err, stdout, stderr) {
				(err) ? reject(stderr) : resolve(stdout);
			})
			
		});
		
	},
	
	/**
	 * Get MAC address of wireless adapter
	 *
	 * @return {string} mac address
	 */	
	getMacAddress: function() {
		return execSync(commands.getMacAddress).toString().trim();
	},
	
	/**
	 * Get local IP to determine if we are connected to router
	 *
	 * @return {boolean} 
	 */	
	isConnected: function() {
		return (wifi.getLocalIP().length >= 7);
	},
	
	/**
	 * Use 'is-online' lib to determine if we have Internet connectivity
	 *
	 * @return {Promise.<boolean, Error>} A promise that returns true if resolved,
	 * or an Error if rejected.
	 */	
	isOnline: function() {
		
		var online = require('is-online');
		
		return new Promise((resolve, reject) => {
			online().then(status => {
				resolve(status);
			})
			.catch(err => {
				reject(err);
			});
			
		});

	},
	
	/**
	 * Get signal quality of current wireless connection as a percentage
	 *
	 * @return {float} quality
	 */	
	getSignalQuality: function() {
		return Math.round(parseFloat(execSync(commands.signalQuality).toString()) / 70.0 * 1000) / 10;
	},
	
}

module.exports = wifi;
