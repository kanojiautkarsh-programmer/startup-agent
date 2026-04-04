const { spawn } = require('child_process');

const server = spawn('node', ['dist/index.js'], { 
  cwd: 'c:\\Users\\Admin\\Documents\\StartUp Agent\\ai-testing-mcp' 
});

let output = '';

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  console.error(`MCP Stderr: ${data}`);
});

server.on('close', (code) => {
  console.log('MCP Server Response:');
  console.log(output);
});

// Initialization request
const initMsg = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0" }
  }
};

server.stdin.write(JSON.stringify(initMsg) + '\n');

// Wait briefly for init to process, then call tool
setTimeout(() => {
  // Notifying initialized
  server.stdin.write(JSON.stringify({
    jsonrpc: "2.0",
    method: "notifications/initialized"
  }) + '\n');

  // Call the tool
  const toolMsg = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "analyze_codebase",
      arguments: {
        projectPath: "c:\\Users\\Admin\\Documents\\StartUp Agent"
      }
    }
  };
  server.stdin.write(JSON.stringify(toolMsg) + '\n');

  // Close stdin after a few seconds to allow processing
  setTimeout(() => {
    server.stdin.end();
  }, 5000);
}, 1000);
