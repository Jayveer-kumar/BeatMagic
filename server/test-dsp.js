// test-dsp.js
import { applyEffect } from './services/dspService.js';
import path from 'path';

async function test() {
  try {
    // const inputFile = 'uploads/1765395328468.mp3';
    const inputFile = 'uploads/1765271529955.mp3';
    
    console.log('Testing DSP service...\n');
    
    const output = await applyEffect(inputFile, '8d', { speed: 0.005 });
    
    console.log('\n✅ Test successful!');
    console.log('Output file:', output);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// test();