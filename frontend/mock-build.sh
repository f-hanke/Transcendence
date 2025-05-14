#!/bin/bash

# Create a mock dist directory with a placeholder page
echo "Creating mock frontend build..."

# Create dist directory
mkdir -p dist

# Create a simple index.html
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transcendence Frontend</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
    }
    main {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 800px;
    }
    h1 { color: #3b82f6; }
    p { margin: 20px 0; line-height: 1.6; }
    .button { 
      background: #3b82f6; 
      color: white; 
      border: none; 
      padding: 10px 20px; 
      border-radius: 4px; 
      cursor: pointer; 
      transition: background 0.3s;
      text-decoration: none;
      display: inline-block;
      margin-top: 20px;
    }
    .button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <main>
    <h1>Transcendence Frontend</h1>
    <p>This is a placeholder for the Transcendence frontend application.</p>
    <p>The actual frontend is currently being developed and will be available soon.</p>
    <p>The frontend code has TypeScript errors that prevented a full build.</p>
    <p>For development, use: <code>./scripts/start_frontend.sh</code></p>
    <a href="/index.html" class="button">Refresh</a>
  </main>
</body>
</html>
EOF

echo "Mock frontend build created in 'dist' directory" 