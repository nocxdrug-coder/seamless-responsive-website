const plugins = {};

try {
  require.resolve("tailwindcss");
  plugins.tailwindcss = {};
} catch {
  // Tailwind is optional in this project.
}

try {
  require.resolve("autoprefixer");
  plugins.autoprefixer = {};
} catch {
  // Autoprefixer is optional in this project.
}

module.exports = { plugins };
