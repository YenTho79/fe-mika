const fs = require('fs');
let c = fs.readFileSync('app/chi-tiet.jsx', 'utf8');

c = c.replace("title: { ...typography.heading, color: colors.white },",
              "title: { ...typography.heading, color: colors.text },");

c = c.replace("rating: { ...typography.body, color: colors.white, fontWeight: '800' },",
              "rating: { ...typography.body, color: colors.text, fontWeight: '800' },");

c = c.replace("backdropShade: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.headerBg },",
              "backdropShade: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background, opacity: 0.85 },");

fs.writeFileSync('app/chi-tiet.jsx', c, 'utf8');
console.log('chi-tiet.jsx hero fixed');
