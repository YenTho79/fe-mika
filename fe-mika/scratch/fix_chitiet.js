const fs = require('fs');
let c = fs.readFileSync('app/chi-tiet.jsx', 'utf8');
c = c.replace("'rgba(11,19,38,0.68)'", 'colors.headerBg');
fs.writeFileSync('app/chi-tiet.jsx', c);
console.log('Fixed chi-tiet.jsx');
