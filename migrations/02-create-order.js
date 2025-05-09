'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('Orders', {
      order_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'user_id' },
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('BUY','SELL'),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(30,8),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(30,8),
        allowNull: false
      },
      filled_amount: {
        type: Sequelize.DECIMAL(30,8),
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('OPEN','PARTIAL','FILLED','CANCELLED'),
        allowNull: false,
        defaultValue: 'OPEN'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  down: async (qi) => {
    await qi.dropTable('Orders');
    await qi.sequelize.query('DROP TYPE IF EXISTS enum_Orders_type;');
    await qi.sequelize.query('DROP TYPE IF EXISTS enum_Orders_status;');
  }
};
