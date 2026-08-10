import stripComments from 'strip-comments';

const code = `
const a: number = 1_000_000;
// this is a comment
const b = "https://test.com"; // trailing comment
type MyType<T> = { value: T };
`;

try {
  console.log(stripComments(code));
} catch(e) {
  console.log("ERROR", e);
}
