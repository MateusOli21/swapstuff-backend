exports.seed = function (knex) {
  return knex('categories')
    .del()
    .then(function () {
      return knex('categories').insert([
        { id: 1, name: 'clothes' },
        { id: 2, name: 'books' },
        { id: 3, name: 'desktop' },
        { id: 4, name: 'mobile' },
      ]);
    });
};
