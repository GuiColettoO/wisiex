'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('Trades', {
      trade_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      buy_order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Orders', key: 'order_id' }
      },
      sell_order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Orders', key: 'order_id' }
      },
      price: {
        type: Sequelize.DECIMAL(30,8),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(30,8),
        allowNull: false
      },
      makerFee: {
        type: Sequelize.DECIMAL(30,8),
        allowNull: false
      },
      takerFee: {
        type: Sequelize.DECIMAL(30,8),
        allowNull: false
      },
      executed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },
  down: async (qi) => {
    await qi.dropTable('Trades');
  }
};