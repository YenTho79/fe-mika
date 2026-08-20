const fs = require('fs');
let c = fs.readFileSync('components/UI.js', 'utf8');

// Replace button styles
const oldButtons = `  button: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    ...shadowSmall
  },
  primaryButton: { backgroundColor: colors.primaryContainer },
  secondaryButton: { backgroundColor: colors.highlightBg, borderWidth: 1, borderColor: colors.primary },
  dangerButton: { backgroundColor: colors.dangerContainer },`;

const newButtons = `  button: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16
  },
  primaryButton: { backgroundColor: colors.primary },
  secondaryButton: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.primary },
  dangerButton: { backgroundColor: colors.dangerContainer },`;

c = c.replace(oldButtons, newButtons);

fs.writeFileSync('components/UI.js', c, 'utf8');
console.log('UI.js button shadow fix applied');
