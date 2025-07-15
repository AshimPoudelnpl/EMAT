// Debug script to check endpoint configuration
import { endpoints } from './src/services/api.js';

console.log('Endpoints configuration:');
console.log('elections.create:', endpoints.elections.create);
console.log('All elections endpoints:', endpoints.elections);
