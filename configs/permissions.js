const ADMIN = [
    'update-project',
    'delete-project',
    'create-issue',
    'update-issue',
    'delete-issue',
    'create-sprint',
    'update-sprint',
    'delete-sprint',
];

const MANAGER_PROJECT = [
    'update-project',
    'create-issue',
    'update-issue',
    'delete-issue',
    'create-sprint',
    'update-sprint',
    'delete-sprint',
];

const MEMBER = ['update-issue'];

module.exports = {
    ADMIN,
    MANAGER_PROJECT,
    MEMBER,
};
