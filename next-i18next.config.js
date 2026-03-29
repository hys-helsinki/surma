/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "fi",
    locales: ["fi", "en"],
    localeDetection: false
  },
  localePath: path.resolve("./public/locales")
};
