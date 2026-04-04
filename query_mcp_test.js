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

setTimeout(() => {
  server.stdin.write(JSON.stringify({
    jsonrpc: "2.0",
    method: "notifications/initialized"
  }) + '\n');

  const toolMsg = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "run_tests",
      arguments: {
        projectPath: "c:\\Users\\Admin\\Documents\\StartUp Agent"
      }
    }
  };
  server.stdin.write(JSON.stringify(toolMsg) + '\n');

  setTimeout(() => {
    server.stdin.end();
  }, 10000); // Wait 10 seconds for tests to run
}, 1000);
