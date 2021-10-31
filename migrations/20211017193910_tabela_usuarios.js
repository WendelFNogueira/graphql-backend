
exports.up = async function(knex) {
    return await knex.schema.createTable('usuarios', table => {
        table.increments('id').primary();
        table.string('nome').notNullable();
        table.string('email').notNullable().unique();
        table.string('senha', 60).notNullable();
        table.boolean('ativo').notNullable().defaultTo(true);
        table.timestamp('DH_Up').defaultTo(knex.fn.now());
    })
};

exports.down = async function(knex) {
    return await knex.schema.dropTableIfExists('usuarios');
};
