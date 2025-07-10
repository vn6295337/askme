// Simple test without dependencies
function isValidModelSize(size) {
  const sizePattern = /^(\d+(\.\d+)?)(B|M|K|billion|million|thousand)$/i;
  return sizePattern.test(size) || size === 'Unknown';
}

console.log('Testing model size validation regex...');
console.log('5B:', isValidModelSize('5B'));
console.log('6B:', isValidModelSize('6B')); 
console.log('7.5B:', isValidModelSize('7.5B'));
console.log('13B:', isValidModelSize('13B'));
console.log('Unknown:', isValidModelSize('Unknown'));
console.log('invalid:', isValidModelSize('invalid'));