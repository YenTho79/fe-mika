const fs = require('fs');
const path = require('path');

const baseDir = 'e:/Mika-Mobile-Expo/fe-mika';
const srcDir = path.join(baseDir, 'app');
const componentsDir = path.join(baseDir, 'components');

function getRelativePath(from, to) {
  let rel = path.relative(path.dirname(from), to).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  // strip extension
  return rel.replace('.js', '');
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('import { colors') && !content.includes('import {') || !content.includes('constants/theme')) {
    return; // Doesn't import theme
  }

  // 1. Remove `colors` from theme import
  if (content.match(/import\s+{\s*colors\s*}\s+from\s+['"][^'"]+theme['"]/)) {
    content = content.replace(/import\s+{\s*colors\s*}\s+from\s+(['"][^'"]+theme['"]);/, '');
  } else if (content.match(/import\s+{([^}]*)colors([^}]*)}\s+from\s+(['"][^'"]+theme['"])/)) {
    content = content.replace(/import\s+{([^}]*)colors([^}]*)}\s+from\s+(['"][^'"]+theme['"]);/, (match, p1, p2, p3) => {
      let rest = (p1 + p2).split(',').map(s => s.trim()).filter(s => s && s !== 'colors').join(', ');
      if (rest) return `import { ${rest} } from ${p3};`;
      return '';
    });
  } else {
    return; // No colors import
  }

  console.log('Processing', filePath);

  // 2. Add useTheme import
  const useThemePath = path.join(baseDir, 'hooks', 'useTheme.js');
  const relPath = getRelativePath(filePath, useThemePath);
  
  const hasReactImport = content.includes("import React");
  const hasUseMemo = content.includes("useMemo");
  
  // add useTheme import at the top
  content = `import { useTheme } from '${relPath}';\n` + content;
  
  if (!hasUseMemo) {
    if (content.includes("import {") && content.includes("'react'")) {
      content = content.replace(/import\s+{/, 'import { useMemo, ');
    } else {
      content = `import { useMemo } from 'react';\n` + content;
    }
  }

  // 3. Find default export function and insert hook
  const defaultExportRegex = /export\s+default\s+function\s+(\w+)\s*\(([^)]*)\)\s*{/;
  if (content.match(defaultExportRegex)) {
    content = content.replace(defaultExportRegex, (match) => {
      return `${match}\n  const { colors } = useTheme();\n  const styles = useMemo(() => getStyles(colors), [colors]);\n`;
    });
  } else {
    // try just export function or function
    const funcRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*{/;
    // replace first function that looks like a component (starts with Capital letter)
    let replaced = false;
    content = content.replace(/function\s+([A-Z]\w*)\s*\(([^)]*)\)\s*{/g, (match, p1, p2) => {
      if (!replaced) {
        replaced = true;
        return `${match}\n  const { colors } = useTheme();\n  const styles = useMemo(() => getStyles(colors), [colors]);\n`;
      }
      return match;
    });
  }

  // 4. Change const styles = StyleSheet.create to const getStyles = (colors) => StyleSheet.create
  if (content.includes('const styles = StyleSheet.create')) {
    content = content.replace('const styles = StyleSheet.create', 'const getStyles = (colors) => StyleSheet.create');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      try {
        processFile(fullPath);
      } catch(e) {
        console.error('Error processing', fullPath, e);
      }
    }
  }
}

walk(srcDir);
walk(componentsDir);
console.log('Done refactoring');
