const db = require('../../config/db');
const { perfil : obterPerfil } = require('../Query/perfil');

module.exports = {
    async novoPerfil(_, { dados }, ctx) {
        
        ctx && ctx.validarAdmin();

        try {
            const [ id ] = await db('perfis').insert(dados);
            return db('perfis').where({ id }).first();
        }catch(err) {
            throw new Error(err.sqlMessage, err);
        }
    },
    async excluirPerfil(_, { filtro }, ctx) {
        
        ctx && ctx.validarAdmin();
        
        try{
            let isAdmin = false;
            let isMaster = false;
            const perfil = await obterPerfil(_, { filtro });
            isAdmin = perfil.nome.includes('admin');
            isMaster = perfil.nome.includes('master');
            if(perfil) {
                if(isAdmin || isMaster) ctx && ctx.validarMaster();
                const { id } = perfil;
                await db('usuarios_perfis').where({ perfil_id: id }).delete();
                await db('perfis').where({ id }).delete();
            }
            return perfil;
        }catch(err) {
            throw new Error(err.sqlMessage, err);
        }
    },
    async updatePerfil(_, { filtro, dados }, ctx) {

        ctx && ctx.validarAdmin();    
    
        try{
            const perfil = await obterPerfil(_, { filtro });
            if(perfil) {
                const { id } = perfil;
                await db('perfis').where({ id }).update(dados);
            }
            return { ...perfil, ...dados };
        }catch(err) {
            throw new Error(err.sqlMessage, err);
        }
    }
}