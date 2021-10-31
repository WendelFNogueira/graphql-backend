const jwt = require('jwt-simple');

module.exports = async ( { req } ) => {

    //Em desenvolvimento
    // await require('./simularUsuarioLogado')(req);

    const auth  = req.headers.authorization
    const token = auth && auth.substring(7);
    const authSecret = process.env.AUTH_SECRET;

    let usuario = null;
    let admin = false;
    let master = false;

    if(token) {
        try {
            let conteudoToken = jwt.decode(token, authSecret); 
            if(new Date(conteudoToken.exp * 1000) > new Date()) {
                usuario = conteudoToken;
            }
        } catch (err) {
            // console.log(err, err.message);
        }
    }

    if(usuario && usuario.perfis)  {
        admin = usuario.perfis.includes('admin');
        master = usuario.perfis.includes('master');
    }

    const err = new Error('Acesso Negado!');
    const notMaster = new Error('Apenas um master pode fazer isso!');

    return {
        usuario, 
        admin,
        master,
        validarUsuario() {
            if(!usuario) throw err;
        },
        validarAdmin(){
            if(!admin) throw err;
        },
        validarMaster(){
            if(!master) throw notMaster;
        },
        validarUsuarioFiltro(filtro) {
            if(admin) return;
            if(master) return;

            if(!usuario) throw err;
            if(!filtro) throw err;

            const { id, email } = filtro;
            if(!id && !email) throw err;
            if(id && id !== usuario.id) throw err;
            if(email && email !== usuario.email) throw err;
        }
    }
}