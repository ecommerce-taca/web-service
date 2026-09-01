import fs from 'fs';

const apps = ['buyer', 'seller', 'shell'];

apps.forEach(app => {
  const twPath = `apps/${app}/tailwind.config.js`;
  if (fs.existsSync(twPath)) {
    let tw = fs.readFileSync(twPath, 'utf8');
    tw = tw.replace(/export default \{/, "import sharedConfig from '../../shared/ui-components/tailwind-preset.js';\n\nexport default {");
    tw = tw.replace(/presets: \[require\('\.\.\/\.\.\/shared\/ui-components\/tailwind-preset\.js'\)\],/, "presets: [sharedConfig],");
    fs.writeFileSync(twPath, tw);
  }
});
