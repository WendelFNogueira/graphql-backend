const db = require('../../config/db')
const { perfil : obterPerfil } = require('../Query/perfil');
const { usuario: obterUsuario } = require('../Query/usuario');
const { perfis: perfilUsuario } = require('../Type/Usuario');
const bcrypt = require('bcrypt-nodejs');

const mutations = {

    registrarUsuario(_, { dados }) {
        return mutations.novoUsuario(_, {
            dados: {
                nome: dados.nome,
                email: dados.email,
                senha: dados.senha,
            }
        });
    },
    async novoUsuario(_, { dados }, ctx) {

        ctx && ctx.validarAdmin();

        try {
            const idsPerfis = [];

            if(!dados.perfis || !dados.perfis.length) {
                dados.perfis = [{
                    nome: 'user'
                }];
            }

            let isAdmin = false;
            let isMaster = false;

            for(let perfilFiltro of dados.perfis) {
                const perfil = await obterPerfil(_, {  filtro: perfilFiltro });
                isAdmin = perfil.nome.includes('admin');
                isMaster = perfil.nome.includes('master');
                if(isAdmin || isMaster) ctx && ctx.validarMaster();
                if(perfil) idsPerfis.push(perfil.id);
            }

            //criptografar a senha
            const salt = bcrypt.genSaltSync();
            dados.senha = bcrypt.hashSync(dados.senha, salt);

            const [ id ] = await db('usuarios').insert({ 
                nome: dados.nome,
                email: dados.email,
                senha: dados.senha,
            });

            for(let perfil_id of idsPerfis){
                await db('usuarios_perfis').insert({ perfil_id, usuario_id: id });
            }

            return db('usuarios').where({ id }).first();

        }catch(err) {
            throw new Error(err.sqlMessage, err);
        }
    },
    async excluirUsuario(_, { filtro }, ctx) {

        ctx && ctx.validarAdmin();

        try{
            let isAdmin = false;
            let isMaster = false;
            const usuario = await obterUsuario(_, { filtro });
            const [ perfis ] = await perfilUsuario(usuario);
            isAdmin = perfis.nome.includes('admin');
            isMaster = perfis.nome.includes('master');

            if(usuario) {
                if(isAdmin || isMaster) ctx && ctx.validarMaster();
                const { id } = usuario;
                await db('usuarios_perfis').where({ usuario_id: id }).delete();
                await db('usuarios').where({ id }).delete();
            }
            return usuario;
        }catch(err) {
            throw new Error(err.sqlMessage, err);
        }
    },
    async updateUsuario(_, { filtro, dados }, ctx) {

        ctx && ctx.validarUsuarioFiltro(filtro);

        try{
            const usuario = await obterUsuario(_, { filtro });
            let isMaster = false;
            if(usuario) {
                const { id } = usuario;
                if(ctx.admin && dados.perfis) {
                    await db('usuarios_perfis').where({ usuario_id: id }).delete();

                    for(let filtro of dados.perfis) {
                        const perfil = await obterPerfil(_, { filtro });
                        isAdmin = perfil.nome.includes('admin');
                        isMaster = perfil.nome.includes('master');
                        if(isAdmin || isMaster) ctx && ctx.validarMaster();
                        perfil && await db('usuarios_perfis').insert({ perfil_id: perfil.id, usuario_id: id });
                    }
                }

                if(dados.senha){
                    //criptografar a senha
                    const salt = bcrypt.genSaltSync();
                    dados.senha = bcrypt.hashSync(dados.senha, salt);
                }

                await db('usuarios').where({ id }).update({
                    nome: dados.nome,
                    email: dados.email,
                    senha: dados.senha
                });
            }
            return !usuario ? null : { ...usuario, ...dados };
        }catch(err) {
            throw new Error(err.sqlMessage, err);
        }
    }
}

module.exports = mutations;