var chai = require('chai');
var expect = chai.expect;

var util = require('../../index');

describe('Voltage', function() {
	
	it('VCC readings should return all expected keys', function() {
		expect(util.system.vcc()).to.have.all.keys('core', 'sdram_c', 'sdram_i', 'sdram_p');
	});
	

	it('VCC readings should return all numeric values', function() {
		var vccVals = Object.values(util.system.vcc());
		
		expect(vccVals).to.satisfy(function(vals) {
			return vals.every(function(val) {
				return (typeof(val) == 'number');
    		}); 
		});
	});		
	

	it('VCC readings should all be positive values', function() {
		var vccVals = Object.values(util.system.vcc());
		
		expect(vccVals).to.satisfy(function(vals) {
			return vals.every(function(val) {
				return (val > 0);
    		}); 
		});
	});		
	

});