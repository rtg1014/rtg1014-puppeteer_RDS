module.exports = (sequelize, DataTypes) => {
  const posting_job = sequelize.define(
    'posting_job',
    {
      postingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );

  posting_job.associate = (db) => {
    db.posting_job.belongsTo(db.Posting, {
      foreignKey: 'postingId',
    });

    db.posting_job.belongsTo(db.Job, {
      foreignKey: 'jobId',
    });
  };

  return posting_job;
};
