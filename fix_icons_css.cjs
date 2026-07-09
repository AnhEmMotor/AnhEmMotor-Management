const fs = require("fs");
const glob = require("glob");

const files = glob.sync("src/**/*.vue");

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  const regex =
    /\.text-(\w+)\s*\{\s*color:\s*([^;]+);\s*\}\s*\.icon-\s*\{\s*color:;\s*font-size:\s*18px;\s*\}/g;

  if (regex.test(content)) {
    content = content.replace(
      regex,
      ".text-$1 {\n  color: $2;\n}\n\n.icon-$1 {\n  color: $2;\n  font-size: 18px;\n}",
    );
    fs.writeFileSync(file, content);
    console.log("Fixed " + file);
  }
});
