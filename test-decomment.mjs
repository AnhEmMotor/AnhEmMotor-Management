import decomment from 'decomment';

const content = `
/* eslint-disable no-unused-vars */
const a = 1;
// comment to remove
/* stylelint-disable */
.a { color: red; }
`;

let temp = content;
const directives = [];
// Match /* ... */ or // ... containing eslint, stylelint, etc.
temp = temp.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, (match) => {
    if (/eslint|stylelint|prettier|@ts-/.test(match)) {
        const id = \`__DIRECTIVE_\${directives.length}__\`;
        directives.push(match);
        return id;
    }
    return match;
});

let stripped = decomment(temp);
directives.forEach((directive, index) => {
    stripped = stripped.replace(\`__DIRECTIVE_\${index}__\`, directive);
});

console.log(stripped);
