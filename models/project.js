'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Project extends Model {
        static associate(models) {
            Project.belongsTo(models.Repository, { foreignKey: 'repositoryID', as: 'repository' });

            Project.hasMany(models.Sprint, { foreignKey: 'projectID', as: 'sprints' });

            Project.hasMany(models.Task, { foreignKey: 'projectID', as: 'tasks' });

            Project.belongsToMany(models.User, {
                through: models.UserProject,
                foreignKey: 'projectID',
                otherKey: 'userID',
                as: 'users'
            });
        }
    }

    Project.init({
        projectID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        repositoryID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
            references: {
                model: 'Repositories',
                key: 'repositoryID',
            },
        },
    }, {
        sequelize,
        modelName: 'Project',
        tableName: 'Projects',
        timestamps: false,
    });

    return Project;
};