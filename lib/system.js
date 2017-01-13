var os = require('os');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

var commands = {
	cpuTemp: 'cat /sys/class/thermal/thermal_zone0/temp',
	gpuTemp: '/opt/vc/bin/vcgencmd measure_temp',
	vcc: '/opt/vc/bin/vcgencmd measure_volts ',
	getCamera: '/opt/vc/bin/vcgencmd get_camera',
	getSerial: "cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2 | tr -d '\n'",
	getRevision: "cat /proc/cpuinfo | grep Revision | cut -d ' ' -f 2 | tr -d '\n'",
	getMemory: '/opt/vc/bin/vcgencmd get_mem ',
	configInfo: '/opt/vc/bin/vcgencmd get_config int',
	kernel: '/bin/uname -a',
	firmware: "/opt/vc/bin/vcgencmd version | grep version | cut -d ' ' -f 2 | tr -d '\n'",
	clockSpeed: '/opt/vc/bin/vcgencmd measure_clock ',
}


var system = {
	
	/**
	 * List of RPi revision codes and friendly names
	 */
	board_revisions: {
		'0002': 'Model B Rev. 1.0',
		'0003': 'Model B Rev. 1.0 + Fuses mod and D14 removed',
		'0004': 'Model B Rev. 2.0 256MB (Sony)',
		'0005': 'Model B Rev. 2.0 256MB (Qisda)',
		'0006': 'Model B Rev. 2.0 256MB (Egoman)',
		'0007': 'Model A Rev. 2.0 256MB (Egoman)',
		'0008': 'Model A Rev. 2.0 256MB (Sony)',
		'0009': 'Model A Rev. 2.0 256MB (Qisda)',
		'000d': 'Model B Rev. 2.0 512MB (Egoman)',
		'000e': 'Model B Rev. 2.0 512MB (Sony)',
		'000f': 'Model B Rev. 2.0 512MB (Qisda)',
		'0010': "Model B+ Rev. 1.0 512MB (Sony)",
		'0011': 'Compute Module Rev. 1.0 512MB (Sony)',
		'0012': 'Model A+ Rev. 1.1 256MB (Sony)',
		'0013': 'Model B+ Rev. 1.2 512MB',
		'0014': 'Compute Module Rev. 1.0 512MB (Embest)',
		'0015': 'Model A+ Rev. 1.1 256MB/512MB (Embest)',
		'a01040': 'Pi 2 Model B Rev. 1.0 1GB',
		'a01041': 'Pi 2 Model B Rev. 1.1 1GB (Sony)',
		'a21041': 'Pi 2 Model B Rev. 1.1 1GB (Embest)',
		'a22042': 'Pi 2 Model B Rev. 1.2 w/ BCM2837 1GB (Embest)',
		'900021': 'Model A+ Rev. 1.1 512MB',
		'900092': 'Pi Zero Rev. 1.2 512MB (Sony)',
		'900093': 'Pi Zero Rev. 1.3 512MB (Sony)',
		'920093': 'Pi Zero Rev. 1.3 512MB (Sony)',
		'a02082': 'Pi 3 Model B Rev. 1.2 1GB (Sony)',
		'a22082': 'Pi 3 Model B Rev. 1.2 1GB (Embest)'
	},

	/**
	 * Get CPU temp
	 *
	 * @param {boolean} fahrenheit - return in Fahrenheit
	 * @return {float}
     */	 
	cpuTemp: function(fahrenheit) {
		var cpuTempC = parseInt( execSync(commands.cpuTemp).toString() ) / 1000;
		
		if(fahrenheit) return (cpuTempC * 1.8) + 32.0;
		return cpuTempC;
	},
	
	/**
	 * Get GPU temp
	 *
	 * @param {boolean} fahrenheit - return in Fahrenheit
	 * @return {float}
     */	 
	gpuTemp: function(fahrenheit) {
		var gpuTemp = execSync(commands.gpuTemp).toString();
		var gpuTempC = parseFloat( gpuTemp.substring(gpuTemp.lastIndexOf("=")+1, gpuTemp.lastIndexOf("'")) );
		
		if(fahrenheit) return (gpuTempC * 1.8) + 32.0;
		return gpuTempC;
	},
	
	/**
	 * Get System Voltages
	 *
	 * @return {object}
     */	
    vcc: function () {
	    var vcc = ['core', 'sdram_c', 'sdram_i', 'sdram_p'];
	    var response = {};

        for (var i = 0; i < vcc.length; i++) {
	        response[vcc[i]] = parseFloat(execSync(commands.vcc + vcc[i]).toString().split('=')[1].trim().slice(0, -1));
        }
        return response;
    },
    
	/**
	 * Get System Uptime
	 *
	 * @return {integer}
     */	
    uptime: function () {
        return os.uptime();
    },
    
    
	/**
	 * Get Serial Number
	 *
	 * @return {string}
     */	
    serial: function () {
        return execSync(commands.getSerial).toString();
    },
    
    
	/**
	 * Get Hardware Revision
	 *
	 * @return {string}
     */	
    hardwareRevision: function() {
		
		var revision = execSync(commands.getRevision).toString();
		
		if(system.board_revisions[revision] === undefined) {
			return null;
		}
		
		return {'code': revision, 'name': system.board_revisions[revision]};
		    
    },


	/**
	 * Get Camera information (supported and detected)
	 *
	 * @return {object}
     */	
    cameraInfo: function() {
	    
	    var result = execSync(commands.getCamera).toString().trim().split(' ');
	    var response = {};
	    
	    for(var i = 0; i < result.length; i++) {
		    var data = result[i].split('=');
		    response[data[0]] = (data[1] === '1');
	    }
		
		return response;

    },
    
    
	/**
	 * Get configured memory split info (between ARM and GPU)
	 *
	 * @return {object}
     */	
    memoryConfig: function() {
	    var types = ['arm', 'gpu'];
	    var response = {};
	    
	    for(var i = 0; i < types.length; i++) {
		    response[types[i]] = execSync(commands.getMemory + types[i]).toString().trim().split('=')[1];
	    }
	    
	    return response;
	},
	
	
	/**
	 * Get various config settings from vcgencmd
	 *
	 * @return {object}
     */	
	configData: function() {
		
	    var result = execSync(commands.configInfo).toString().trim().split('\n');
	    var response = {};
	    
	    for(var i = 0; i < result.length; i++) {
		    var data = result[i].split('=');
		    response[data[0]] = parseInt(data[1]);
	    }
		
		return response;

	},
	
	/**
	 * Get kernel version
	 *
	 * @return {string}
	 */
	kernel: function() {
		return execSync(commands.kernel).toString().trim();
	},
	
	/**
	 * Get GPU firmware version
	 *
	 * @return {string}
	 */
	firmware: function() {
		return execSync(commands.firmware).toString().trim();
	},
	
	/**
	 * Get ARM, Core, UART clock speeds
	 *
	 * @return {object}
     */	
    clockSpeed: function () {
	    var clocks = ['core', 'arm', 'uart'];
	    var response = {};

        for (var i = 0; i < clocks.length; i++) {
	        response[clocks[i]] = parseFloat(execSync(commands.clockSpeed + clocks[i]).toString().split('=')[1].trim().slice(0, -1));
        }
        return response;
    },
	   	
}

module.exports = system;
