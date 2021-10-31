const jwt = require('jwt-simple');
const { perfis: obterPerfis } = require('../Type/Usuario');

module.exports = {
    async getUsuarioLogado(usuario) {
        const perfis   = await obterPerfis(usuario);
        const agora    = Math.floor(Date.now() / 1000);
        const tresDias = 3*24*60*60;

        //payload
        const usuarioInfo = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfis: perfis.map(p => p.nome),
            iat: agora,
            exp: agora + tresDias,
        }

        const authSecret = process.env.AUTH_SECRET;
        return {
            ...usuarioInfo,
            token: jwt.encode(usuarioInfo, authSecret)
        };

    }
}
