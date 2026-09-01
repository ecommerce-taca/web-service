import fs from 'fs';

const apps = ['admin', 'buyer', 'seller', 'shell'];

apps.forEach(app => {
  // Fix tailwind.config.js
  const twPath = `apps/${app}/tailwind.config.js`;
  if (fs.existsSync(twPath)) {
    let tw = fs.readFileSync(twPath, 'utf8');
    if (!tw.includes('/* eslint-env node */')) {
      fs.writeFileSync(twPath, '/* eslint-env node */\n' + tw);
    }
  }

  // Fix App.jsx
  const appPath = `apps/${app}/src/app/App.jsx`;
  if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');
    content = content.replace(/import React from 'react';\r?\n/, '');
    content = content.replace(/import \{ Routes, Route \} from 'react-router-dom';\r?\n/, '');
    fs.writeFileSync(appPath, content);
  }

  // Fix RemoteApp.jsx
  const remotePath = `apps/${app}/src/app/RemoteApp.jsx`;
  if (fs.existsSync(remotePath)) {
    let content = fs.readFileSync(remotePath, 'utf8');
    content = content.replace(/import React from 'react';\r?\n/, '');
    fs.writeFileSync(remotePath, content);
  }
});
