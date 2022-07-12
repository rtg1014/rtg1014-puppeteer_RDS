const dotenv = require('dotenv');


// MySQL
const db = require('./models');
db.sequelize
  .sync()
  .then(() => {
    console.log('MySQL DB 연결 성공');
  })

  .catch((error) => {
    console.error(error);
  });