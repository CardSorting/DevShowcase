// Test script for ExtractZipService
import { ExtractZipService } from './server/core/infrastructure/services/ExtractZipService.js';
import * as path from 'path';
import * as fs from 'fs/promises';

async function testExtraction() {
  try {
    console.log('Testing ZIP extraction service...');
    
    // Create an instance of the service
    const extractZipService = new ExtractZipService();
    
    // Path to the test ZIP file and extraction target
    const zipFilePath = path.join(process.cwd(), 'test_extraction.zip');
    const targetDir = path.join(process.cwd(), 'test_extraction_output');
    
    // Extract the ZIP file
    console.log(`Extracting ${zipFilePath} to ${targetDir}`);
    const extractionResult = await extractZipService.extract(zipFilePath, targetDir);
    
    console.log(`Extraction result: ${extractionResult ? 'Success' : 'Failed'}`);
    
    if (extractionResult) {
      // Analyze the extracted files
      const filesAnalysis = await extractZipService.analyzeFiles(targetDir);
      
      console.log('Files analysis:');
      console.log(`- Root files: ${filesAnalysis.rootFiles.join(', ')}`);
      console.log(`- HTML files: ${filesAnalysis.htmlFiles.join(', ')}`);
      console.log(`- Has index.html: ${filesAnalysis.hasIndexHtml}`);
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testExtraction().then(() => console.log('Test completed'));

// Make this a module
export {};