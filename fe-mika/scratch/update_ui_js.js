const fs = require('fs');
let c = fs.readFileSync('components/UI.js', 'utf8');

// 1. DangerButton white text/icon -> colors.white
c = c.replace(/color="#ffffff"/g, 'color={colors.white}');
c = c.replace("color: '#ffffff'", 'color: colors.white');

// 2. StatusBadge colors
const oldStatusBadge = `if (status === 'active' || status === 'Full' || status === 'Hoàn thành' || status === 'completed' || status === 'success' || status === 'published' || status === 'approved') {
    badgeColor = 'rgba(78, 206, 105, 0.15)';
    textColor = colors.success;
  } else if (status === 'warning' || status === 'Đang ra' || status === 'pending' || status === 'Bản nháp' || status === 'draft' || status === 'Tạm dừng') {
    badgeColor = 'rgba(255, 183, 77, 0.15)';
    textColor = colors.warning;
  }`;

const newStatusBadge = `if (status === 'active' || status === 'Full' || status === 'Hoàn thành' || status === 'completed' || status === 'success' || status === 'published' || status === 'approved') {
    badgeColor = 'rgba(5, 150, 105, 0.12)';
    textColor = colors.success;
  } else if (status === 'warning' || status === 'Đang ra' || status === 'pending' || status === 'Bản nháp' || status === 'draft' || status === 'Tạm dừng') {
    badgeColor = 'rgba(217, 119, 6, 0.12)';
    textColor = colors.warning;
  }`;

c = c.replace(oldStatusBadge, newStatusBadge);

// 3. Stylesheet secondaryButton & dangerButton & chipActive & chipTextActive
c = c.replace("secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },",
              "secondaryButton: { backgroundColor: colors.highlightBg, borderWidth: 1, borderColor: colors.primary },");

c = c.replace("dangerButton: { backgroundColor: colors.dangerContainer },",
              "dangerButton: { backgroundColor: colors.dangerContainer },");

c = c.replace("chipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },",
              "chipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },");

c = c.replace("chipTextActive: { color: colors.chipActiveText },",
              "chipTextActive: { color: colors.white },");

fs.writeFileSync('components/UI.js', c, 'utf8');
console.log('UI.js successfully updated');
