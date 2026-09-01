import fs from 'fs';

const apps = ['admin', 'buyer', 'seller', 'shell'];

apps.forEach(app => {
  // Fix tailwind.config.js
  const twPath = `apps/${app}/tailwind.config.js`;
  if (fs.existsSync(twPath)) {
    let tw = fs.readFileSync(twPath, 'utf8');
    // Remove the invalid /* eslint-env node */
    tw = tw.replace(/\/\* eslint-env node \*\/\r?\n/, '');
    
    // Convert to ESM
    tw = tw.replace(/const sharedConfig = require\('\.\.\/\.\.\/shared\/ui-components\/tailwind-preset\.js'\);/, "import sharedConfig from '../../shared/ui-components/tailwind-preset.js';");
    tw = tw.replace(/module\.exports = \{/, 'export default {');
    
    fs.writeFileSync(twPath, tw);
  }
});
