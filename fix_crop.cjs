const fs = require("fs");

const files = [
  "d:/DATN/AnhEmMotor/AnhEmMotor-Management/src/modules/Factory/view/service/workshop/banner/index.vue",
  "d:/DATN/AnhEmMotor/AnhEmMotor-Management/src/modules/Marketing/view/intro/index.vue",
  "d:/DATN/AnhEmMotor/AnhEmMotor-Management/src/modules/Order/view/intro/index.vue",
  "d:/DATN/AnhEmMotor/AnhEmMotor-Management/src/modules/Warehouse/view/intro/index.vue",
];

files.forEach((file) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, "utf8");

    // Replace max-height: ...; with height: auto;
    content = content.replace(/max-height:\s*calc\([^)]+\);/g, "height: auto;");
    content = content.replace(/max-height:\s*\d+px;/g, "height: auto;");

    // Replace object-fit: cover/contain with just normal rendering (or keep it, but it doesn't matter if height is auto)
    content = content.replace(/object-fit:\s*cover;/g, "object-fit: contain;");

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
