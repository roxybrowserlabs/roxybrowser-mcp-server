#!/usr/bin/env node

// Simple test script for RoxyBrowser MCP server
// Simulates MCP client communication

import { spawn } from 'child_process';

const API_HOST = 'http://127.0.0.1:53031';
const API_KEY = 'd80046b67d4216b5a905ecfc54b32320';

console.log('🧪 Testing RoxyBrowser MCP Server\n');

// Start MCP server
const mcpServer = spawn('node', ['lib/index.js'], {
  env: {
    ...process.env,
    ROXY_API_HOST: API_HOST,
    ROXY_API_KEY: API_KEY
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseBuffer = '';

// Send MCP request
function sendMCPRequest(request) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 5000);

    const requestStr = JSON.stringify(request) + '\n';
    console.log('📤 Sending request:', JSON.stringify(request, null, 2));
    
    mcpServer.stdin.write(requestStr);

    const handleData = (data) => {
      responseBuffer += data.toString();
      const lines = responseBuffer.split('\n');
      
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line) {
          try {
            const response = JSON.parse(line);
            clearTimeout(timeout);
            mcpServer.stdout.off('data', handleData);
            resolve(response);
            return;
          } catch (e) {
            // Not JSON, continue
          }
        }
      }
      responseBuffer = lines[lines.length - 1];
    };

    mcpServer.stdout.on('data', handleData);
  });
}

async function runTests() {
  try {
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 1: List tools
    console.log('\n1️⃣ Testing list_tools');
    const toolsResponse = await sendMCPRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    });
    console.log('📥 Tools response:', JSON.stringify(toolsResponse, null, 2));

    // Test 2: List workspaces
    console.log('\n2️⃣ Testing roxy_list_workspaces');
    const workspacesResponse = await sendMCPRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'roxy_list_workspaces',
        arguments: {
          pageIndex: 1,
          pageSize: 5
        }
      }
    });
    console.log('📥 Workspaces response:', JSON.stringify(workspacesResponse, null, 2));

    // Test 3: List browsers
    console.log('\n3️⃣ Testing roxy_list_browsers');
    const browsersResponse = await sendMCPRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'roxy_list_browsers',
        arguments: {
          workspaceId: 6,
          pageIndex: 1,
          pageSize: 5
        }
      }
    });
    console.log('📥 Browsers response:', JSON.stringify(browsersResponse, null, 2));

    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mcpServer.kill();
    process.exit(0);
  }
}

// Handle server startup
mcpServer.stderr.on('data', (data) => {
  console.log('🔧 Server:', data.toString().trim());
});

mcpServer.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Start tests
runTests();