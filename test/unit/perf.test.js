var chai = require('chai');
var expect = chai.expect;

var util = require('../../index');

describe('Perf Metrics', function() {
	
	describe('#loadAverage', function() {
		
		it('Load Average (1-min) should be >= 0.00', function() {
			expect(util.perf.loadAverage()).to.be.at.least(0);
		});
		
		it('Load Average (1-min) should be a number', function() {
			expect(util.perf.loadAverage()).to.be.a('number');
		});
		
	});
	
	describe('#totalMemory', function() {
		
		it('Total Memory should be a positive number', function() {
			expect(util.perf.totalMemory()).to.be.above(0);
		});
		
	});
	
	describe('#freeMemory', function() {
		
		it('Free Memory should be >= 0', function() {
			expect(util.perf.freeMemory()).to.be.at.least(0);
		});
		
	});
	
	describe('#diskStats', function() {
		
		it('Disk stats object should contain values for total/free/used', function() {
			expect(util.perf.diskStats()).to.have.all.keys('total', 'free', 'used');
		});
		
		it('Disk stats values should all be >= 0', function() {
			
			var diskVals = Object.values(util.perf.diskStats());
			
			expect(diskVals).to.satisfy(function(vals) {
				return vals.every(function(val) {
					return (val >= 0);
	    		}); 
			});
			
		});
		
	});
	
});