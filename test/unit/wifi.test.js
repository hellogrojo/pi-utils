var chai = require('chai');
var expect = chai.expect;

var util = require('../../index');

/*
 * These tests are non-invasive and don't require adapter to be connected.
 * We could perform other tests but would basically involve stubbing out 
 * the majority of the functionality.  
 */

describe('WiFi', function() {
	
	describe('#parseIwlist', function() {
		
		it('Should parse iwlist scan output and return object', function() {

			var sampleSSID = 'my-network';
			var fakeNetwork = `
				wlan0     Scan completed : 
				Cell 01 - Address: 00:00:00:00:00:00 
				    Channel:1  
				    Frequency:2.412 GHz (Channel 1) 
				    Quality=53/70  Signal level=-85 dBm   
				    Encryption key:on 
				    ESSID:"my-network" 
				    IE: IEEE 802.11i/WPA2 Version 1 
				        Group Cipher : CCMP 
				        Pairwise Ciphers (1) : CCMP 
				        Authentication Suites (1) : PSK`;
	         
	    	var networks = util.wifi.parseIwlist(fakeNetwork, sampleSSID);   
	    	expect( networks ).to.be.a('object');
	    	expect( networks[sampleSSID] ).to.have.property('current');
			
		});
		
	});
	
	describe('#getMacAddress', function() {
		
		it('Should return valid MAC address from wlan0 adapter', function() {
			var mac = util.wifi.getMacAddress();
			expect( mac ).to.match(/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i);
		})
	})

});
