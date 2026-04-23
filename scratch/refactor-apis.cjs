const fs = require('fs');
const path = require('path');

const routesDir = path.join(process.cwd(), 'app/routes');
const serverDir = path.join(process.cwd(), 'app/server');

const files = fs.readdirSync(routesDir).filter(f => f.startsWith('api.') && f.endsWith('.ts'));

for (const file of files) {
  const sourcePath = path.join(routesDir, file);
  const content = fs.readFileSync(sourcePath, 'utf8');
  
  const hasLoader = /export (async )?function loader/.test(content);
  const hasAction = /export (async )?function action/.test(content);
  
  const serverFilename = file.replace('.ts', '.server.ts');
  const serverPath = path.join(serverDir, serverFilename);
  
  const exportsList = [];
  if (hasLoader) exportsList.push('loader');
  if (hasAction) exportsList.push('action');
  
  if (exportsList.length === 0) continue;
  
  // 1. Move file
  fs.renameSync(sourcePath, serverPath);
  
  // 2. Create re-export file
  const reExportContent = `export { ${exportsList.join(', ')} } from "~/server/${serverFilename.replace('.ts', '')}";\n`;
  fs.writeFileSync(sourcePath, reExportContent);
  console.log(`Refactored ${file}`);
}
