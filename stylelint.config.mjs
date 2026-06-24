export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-html/vue",
    "stylelint-config-recommended-scss",
    "stylelint-config-recommended-vue",
    "stylelint-config-recess-order",
  ],
  rules: {
    "no-empty-source": null,
    "selector-class-pattern": [
      "^([a-z][a-z0-9]*)(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$",
      {
        message: "Expected class selector to be kebab-case or BEM",
      },
    ],
  },
};
