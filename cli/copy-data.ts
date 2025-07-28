#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const PUBLIC_DATA_DIR = join(process.cwd(), 'public', 'data');

async function copyDataFiles() {
  try {
    // Create public/data directory if it doesn't exist
    await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });
    
    // Check if data directory exists
    try {
      await fs.access(DATA_DIR);
    } catch {
      console.log('No data directory found. Run CLI to fetch data first.');
      return;
    }
    
    // Read all files in data directory
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('No JSON files found in data directory.');
      return;
    }
    
    // Copy each JSON file
    for (const file of jsonFiles) {
      const sourcePath = join(DATA_DIR, file);
      const destPath = join(PUBLIC_DATA_DIR, file);
      
      const data = await fs.readFile(sourcePath, 'utf-8');
      await fs.writeFile(destPath, data);
      
      console.log(`Copied ${file} to public/data/`);
    }
    
    console.log(`✅ Copied ${jsonFiles.length} data files to public directory`);
  } catch (error) {
    console.error('Error copying data files:', error);
  }
}

// Auto-run when called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  copyDataFiles();
}

export { copyDataFiles };
