const fs = require("fs");

const files = [
  "d:/DATN/AnhEmMotor/AnhEmMotor-Management/src/modules/Marketing/view/intro/index.vue",
  "d:/DATN/AnhEmMotor/AnhEmMotor-Management/src/modules/Factory/view/service/workshop/banner/index.vue",
];

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  // Replace <i class="ri-xxx icon-blue"></i> -> <ArtSvgIcon icon="ri:xxx" class="icon-blue" />
  content = content.replace(
    /<i class="(ri-[a-zA-Z0-9-]+) ([^"]+)"><\/i>/g,
    (match, p1, p2) => {
      return `<ArtSvgIcon icon="${p1.replace("ri-", "ri:")}" class="${p2}" />`;
    },
  );

  // Replace <i class="ri-xxx"></i> -> <ArtSvgIcon icon="ri:xxx" />
  content = content.replace(
    /<i class="(ri-[a-zA-Z0-9-]+)"><\/i>/g,
    (match, p1) => {
      return `<ArtSvgIcon icon="${p1.replace("ri-", "ri:")}" />`;
    },
  );

  // Add import script if not exists
  if (!content.includes("import ArtSvgIcon")) {
    content = content.replace(
      '<script setup lang="ts">',
      '<script setup lang="ts">\nimport ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";',
    );
  }

  fs.writeFileSync(file, content);
});
console.log("Done");
