const fs = require('fs');
const path = require('path');

// Fix inline JSX hardcoded colors
const inlineReplacements = [
  [/color="#ede0ff"/g, 'color={colors.buttonText}'],
  [/color={'#ede0ff'}/g, 'color={colors.buttonText}'],
  [/color={active \? '#ede0ff'/g, "color={active ? colors.chipActiveText"],
];

let fixedFiles = [];

function fix(dir) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) fix(fp);
    else if ((fp.endsWith('.jsx') || fp.endsWith('.js')) && !fp.includes('node_modules')) {
      let c = fs.readFileSync(fp, 'utf8');
      let original = c;

      for (const [from, to] of inlineReplacements) {
        c = c.replace(from, to);
      }

      // Fix chi-tiet.jsx backdrop
      c = c.replace("backgroundColor: 'rgba(11,19,38,0.96)'", 'backgroundColor: colors.headerBg');
      c = c.replace("backgroundColor: 'rgba(11,19,38,0.88)'", 'backgroundColor: colors.headerBg');
      
      // Fix xem-truoc-chia-se.jsx
      c = c.replace("backgroundColor: 'rgba(11,19,38,0.88)'", 'backgroundColor: colors.headerBg');
      
      // Fix AdminUI.js
      c = c.replace("backgroundColor: 'rgba(23,31,51,0.98)'", 'backgroundColor: colors.navBg');

      if (c !== original) {
        fs.writeFileSync(fp, c, 'utf8');
        fixedFiles.push(path.relative('e:/Mika-Mobile-Expo/fe-mika', fp));
      }
    }
  }
}

fix('e:/Mika-Mobile-Expo/fe-mika/app');
fix('e:/Mika-Mobile-Expo/fe-mika/components');
console.log('Fixed inline colors in', fixedFiles.length, 'files:');
fixedFiles.forEach(f => console.log(' ', f));
