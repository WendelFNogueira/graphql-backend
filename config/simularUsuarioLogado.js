const db = require('./db');
const { getUsuarioLogado } = require('../resolvers/comum/usuario');

const sql = `
            SELECT u.* FROM usuarios u 
            LEFT JOIN usuarios_perfis up ON up.usuario_id=u.id
            LEFT JOIN perfis p ON p.id=up.perfil_id
            WHERE u.ativo = 1 AND p.nome = :nomePerfil 
            LIMIT 1
            `;

const getUsuario = async nomePerfil => {
    const res = await db.raw(sql, { nomePerfil });
    return res ? res[0][0] : null;
}

module.exports = async req => {
    const usuario = await getUsuario('admin');
    if(usuario) {
        const { token } = await getUsuarioLogado(usuario);
        req.headers = {
            authorization: `Bearer ${token}`
        };
    }
}
