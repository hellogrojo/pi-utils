var os = require('os');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

var commands = {
	loadAvg: "cat /proc/loadavg | cut -d ' ' -f 1 | tr -d '\n'",
	diskStats: "/bin/df -k",
}


var perf = {

	/**
	 * Get CPU load average
	 *
	 * @return {float}
     */	 
	loadAverage: function() {
		return parseFloat(execSync(commands.loadAvg).toString());
	},
	
	/**
	 * Get total memory available to OS
	 *
	 * @return {float}
     */	 
	totalMemory: function() {
		return Math.round(os.totalmem() / 1024 / 1024);
	},
	
	/**
	 * Get free memory
	 *
	 * @return {float}
     */	 
	freeMemory: function() {
		return Math.round(os.freemem() / 1024 / 1024);
	},
	
	
	/**
	 * Get total/free space on root mount
	 * 
	 * @return {object} of float, values in MB
	 *
	 */
	diskStats: function() {
		
		var df_stats = execSync(commands.diskStats).toString().split('\n');
		var root_disk = df_stats[1].replace( /[\s\n\r]+/g,' ').split(' ');
		
		return {
			total: Math.round(root_disk[1] / 1024),
			used: Math.round(root_disk[2] / 1024),
			free: Math.round(root_disk[3] / 1024)
		}
		
	}
		
}

module.exports = perf;
