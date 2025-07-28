#!/usr/bin/env node

/**
 * Simple test script for the MCP server
 * Tests all available tools to ensure they work correctly
 */

import { spawn } from 'child_process';

const tests = [
  {
    name: 'List Tools',
    request: { jsonrpc: '2.0', id: 1, method: 'tools/list' }
  },
  {
    name: 'Get Existing Tags',
    request: { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'get_existing_tags', arguments: {} } }
  },
  {
    name: 'Get Tag Submissions (permitchallenge)',
    request: { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'get_tag_submissions', arguments: { tag: 'permitchallenge' } } }
  },
  {
    name: 'Get All Submissions',
    request: { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'get_all_submissions', arguments: {} } }
  }
];

async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Running test: ${test.name}`);
    
    const mcpServer = spawn('pnpm', ['run', 'mcp'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    let output = '';
    let errorOutput = '';
    
    mcpServer.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    mcpServer.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    mcpServer.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} - Success`);
        console.log(`📄 Output length: ${output.length} chars`);
        
        // Try to parse JSON response
        try {
          const lines = output.split('\n').filter(line => line.trim());
          const lastLine = lines[lines.length - 1];
          if (lastLine) {
            const result = JSON.parse(lastLine);
            if (result.result) {
              console.log(`📊 Result type: ${typeof result.result}`);
            }
          }
        } catch (e) {
          // Not JSON, that's okay
        }
        
        resolve(output);
      } else {
        console.log(`❌ ${test.name} - Failed (exit code: ${code})`);
        console.log(`Error: ${errorOutput}`);
        reject(new Error(`Test failed with exit code ${code}`));
      }
    });
    
    // Send the request
    mcpServer.stdin.write(JSON.stringify(test.request) + '\n');
    mcpServer.stdin.end();
  });
}

async function runAllTests() {
  console.log('🚀 Starting MCP Server Tests...\n');
  
  for (const test of tests) {
    try {
      await runTest(test);
    } catch (error) {
      console.error(`💥 Test "${test.name}" failed:`, error.message);
    }
  }
  
  console.log('\n🎉 All tests completed!');
}

runAllTests().catch(console.error);
