const fs = require('fs');
const path = require('path');

const replacements = [
  ["'rgba(255,255,255,0.08)'", 'colors.borderLight'],
  ["'rgba(255,255,255,0.05)'", 'colors.borderLight'],
  ["'rgba(255, 255, 255, 0.08)'", 'colors.borderLight'],
  ["'rgba(255, 255, 255, 0.05)'", 'colors.borderLight'],
  ["'rgba(255,255,255,0.1)'", 'colors.chipCountBg'],
  ["'rgba(34,42,61,0.82)'", 'colors.cardBg'],
  ["'rgba(34, 42, 61, 0.82)'", 'colors.cardBg'],
  ["'rgba(11,19,38,0.96)'", 'colors.headerBg'],
  ["'rgba(11, 19, 38, 0.96)'", 'colors.headerBg'],
  ["'rgba(23,31,51,0.96)'", 'colors.navBg'],
  ["'rgba(23, 31, 51, 0.96)'", 'colors.navBg'],
  ["'rgba(210,187,255,0.1)'", 'colors.emptyCircleBg'],
  ["'rgba(210, 187, 255, 0.1)'", 'colors.emptyCircleBg'],
  ["'rgba(124,58,237,0.15)'", 'colors.highlightBg'],
  ["'rgba(124, 58, 237, 0.15)'", 'colors.highlightBg'],
  ["'#ede0ff'", 'colors.chipActiveText'],
];

let fixedFiles = [];

function fix(dir) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) fix(fp);
    else if ((fp.endsWith('.jsx') || fp.endsWith('.js')) && !fp.includes('node_modules')) {
      let c = fs.readFileSync(fp, 'utf8');
      const idx = c.indexOf('const getStyles');
      if (idx === -1) continue;
      
      let before = c.substring(0, idx);
      let after = c.substring(idx);
      let changed = false;
      
      for (const [from, to] of replacements) {
        while (after.includes(from)) {
          after = after.replace(from, to);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fp, before + after, 'utf8');
        fixedFiles.push(path.relative('e:/Mika-Mobile-Expo/fe-mika', fp));
      }
    }
  }
}

fix('e:/Mika-Mobile-Expo/fe-mika/app');
fix('e:/Mika-Mobile-Expo/fe-mika/components');
console.log('Fixed files:', fixedFiles.length);
fixedFiles.forEach(f => console.log(' ', f));
