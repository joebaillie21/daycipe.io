import { expect } from 'chai';

function add(a, b) {
  return a + b;
}

// Mocha test
describe('add function', function () {
  it('should add two numbers correctly', function () {
    const result = add(2, 3);
    expect(result).to.equal(5); // Check if the result equals 5
  });

  it('should return a number', function () {
    const result = add(2, 3);
    expect(result).to.be.a('number'); // Ensure the result is a number
  });
});
