'use strict'
const { DataTypes, Model } = require('sequelize')

class Count extends Model {
    static init(sequelize) {
        super.init(
            {
                value: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    validate: {
                        notNull: {
                            msg: `The name VALUE cannot be empty`,
                        },
                        notEmpty: {
                            msg: `The name VALUE cannot be empty`,
                        },
                    },
                },
                ip: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    validate: {
                        notNull: {
                            msg: `The name IP cannot be empty`,
                        },
                        notEmpty: {
                            msg: `The name IP cannot be empty`,
                        },
                    },
                }
            },

            {
                sequelize,
            }
        )
    }

    static associate(models) {}
}


module.exports = Count
