var chai = require('chai');
var expect = chai.expect;

var util = require('../../index');

describe('Temperature', function() {
		
	describe('#cpuTemp', function() {
		
		it('CPU Temperature probe should return numeric value.', function() {
			expect(util.system.cpuTemp()).to.be.a('number');
		});
			
		it('CPU Temperature probe should return a positive number.', function() {
			expect(util.system.cpuTemp()).to.be.above(0);
		});
			
	});

		
	describe('#gpuTemp', function() {
		
		it('GPU Temperature probe should return numeric value.', function() {
			expect(util.system.cpuTemp()).to.be.a('number');
		});
		
		it('GPU Temperature probe should return a positive number.', function() {
			expect(util.system.gpuTemp()).to.be.above(0);
		});
		
	});

});

