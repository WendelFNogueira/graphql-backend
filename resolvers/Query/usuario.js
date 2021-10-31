const db = require('../../config/db');
const bcrypt = require('bcrypt-nodejs');
const { getUsuarioLogado } = require('../comum/usuario');

module.exports = {

    async login(_, { dados }) {
        const usuario = await db('usuarios').where({ email: dados.email }).first();

        if(!usuario) {
            throw new Error('Email inválido');
        }

        const saoIguais = bcrypt.compareSync(dados.senha, usuario.senha);

        if(!saoIguais) {
            throw new Error('Senha inválida');
        }

        return getUsuarioLogado(usuario);
    },

    async usuarios(parent, args, ctx) {
        ctx && ctx.validarAdmin();
        return await db('usuarios');
    },
    async usuario(_, { filtro }, ctx) {
        ctx && ctx.validarUsuarioFiltro(filtro);
        if(!filtro) return null;
        const { id, email } = filtro;

        return id 
            ? await db('usuarios').where({ id }).first() 
            : email 
                ? await db('usuarios').where({ email }).first() 
                : null;
    },
}