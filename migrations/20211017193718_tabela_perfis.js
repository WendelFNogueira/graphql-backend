
exports.up = async function(knex) {
    return await knex.schema.createTable('perfis', table => {
        table.increments('id').primary();
        table.string('nome').notNullable().unique();
        table.string('rotulo').notNullable();
        
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    }).then( _ => {
        return knex('perfis').insert([
            { nome: 'user', rotulo: 'Usuário' },
            { nome: 'admin', rotulo: 'Administrador' },
            { nome: 'master', rotulo: 'Master' },
        ]);
    });
};

exports.down = async function(knex) {
    return await knex.schema.dropTableIfExists('perfis');
};
