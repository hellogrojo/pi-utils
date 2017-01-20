var chai = require('chai');
var expect = chai.expect;

var util = require('../../index');

describe('System Configuration', function() {
	
	describe('#uptime', function() {
		
		it('System uptime should return positive integer value', function() {
			expect(util.system.uptime()).to.be.above(0);
		});
		
	})
	
	describe('#serial', function() {
			
		it('System Serial Number should return valid 16-char hex string', function() {
			
			expect(util.system.serial()).to.match(/^([A-Fa-f0-9]{2}){8}$/);
			
		});
		
	});
	
	describe('#hardwareRevision', function() {
		
		it('Board revision code should be present in pre-defined list.', function() {
			
			revision_codes = Object.keys(util.system.board_revisions);			
			expect( revision_codes ).to.contain.members([ util.system.hardwareRevision().code ]);
			
		});
		
	});
	
	describe('#cameraInfo', function() {
		
		it('Camera config object should be returned with supported/detected config keys present.', function() {
		
			expect(util.system.cameraInfo()).to.have.all.keys('supported', 'detected');
			
		});

	});
	
	describe('#memoryConfig', function() {
		
		it('Memory config split object should be returned with arm/gpu config keys present.', function() {
		
			expect(util.system.memoryConfig()).to.have.all.keys('arm', 'gpu');
			
		});

	});
	

	describe('#configData', function() {
			
		it('System configuration readings should return all numeric values', function() {
			var configVals = Object.values(util.system.configData());
			
			expect(configVals).to.satisfy(function(vals) {
				return vals.every(function(val) {
					return (typeof(val) == 'number');
	    		}); 
			});
		});		
		
	});
	
	describe('#kernel', function() {
		
		it('Kernel should return valid string starting containing \'Linux\'', function() {
			expect(util.system.kernel()).to.have.string('Linux');
			
		});
		
	});
	
	describe('#firmware', function() {
		
		it('Firmware version should return a valid 40-char hex string', function() {
			expect(util.system.firmware()).to.match(/^([A-Fa-f0-9]{2}){20}$/);
			
		});
		
	});
	
	describe('#clockSpeed', function() {
		
		it('Clock speed object should return three expected keys: arm, core, uart', function() {
			expect(util.system.clockSpeed()).to.have.all.keys('arm', 'core', 'uart');
		});
	
		
		it('Clock speed object should return numeric values for all keys', function() {
			var clockVals = Object.values(util.system.clockSpeed());
			
			expect(clockVals).to.satisfy(function(vals) {
				return vals.every(function(val) {
					return (typeof(val) == 'number');
	    		}); 
			});
		});

	});
	
	describe('#machineId', function() {
		
		it('Machine id should return a valid 32-char hex string', function() {
			expect(util.system.machineId()).to.match(/^([A-Fa-f0-9]{2}){16}$/);
		});
		
	});
	
	describe('#hostname', function() {
		
		it('Hostname should return valid string', function() {
			expect(util.system.hostname()).to.be.a('string');
		});
		
		it('Hostname should be at least 1 char long', function() {
			expect(util.system.hostname()).to.have.length.above(1);
		})
		
	});
	
});