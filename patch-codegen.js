const fs = require('fs');
const f = 'node_modules/babel-preset-expo/node_modules/@react-native/codegen/lib/parsers/error-utils.js';
let c = fs.readFileSync(f, 'utf8');

// Patch throwIfBubblingTypeIsNull to not throw
c = c.replace(
  /function throwIfBubblingTypeIsNull\(bubblingType, eventName\) \{[\s\S]*?return bubblingType;\s*\}/,
  `function throwIfBubblingTypeIsNull(bubblingType, eventName) {
  if (!bubblingType) {
    return 'direct';
  }
  return bubblingType;
}`
);

// Patch throwIfArgumentPropsAreNull to not throw
c = c.replace(
  /function throwIfArgumentPropsAreNull\(argumentProps, eventName\) \{[\s\S]*?return argumentProps;\s*\}/,
  `function throwIfArgumentPropsAreNull(argumentProps, eventName) {
  if (!argumentProps) {
    return [];
  }
  return argumentProps;
}`
);

fs.writeFileSync(f, c);
console.log('✅ Patched codegen error-utils.js');
