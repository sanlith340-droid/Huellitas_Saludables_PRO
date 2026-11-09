// .sequelizerc
// Le indica a sequelize-cli dónde están la config, los modelos,
// las migraciones y los seeders dentro de la estructura actual del proyecto.
const path = require('path');

module.exports = {
  config: path.resolve('app/config', 'config.js'),
  'models-path': path.resolve('app/models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations'),
};
