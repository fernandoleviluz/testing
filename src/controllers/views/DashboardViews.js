const userByToken = require('../../middlewares/auth')
const User = require('../../models/User')
const Client = require('../../models/Client')
const { Op } = require('sequelize')

module.exports = {
    async view(req, res) {
        try {
            const token = req.cookies.token || ''

            if (!token) return res.redirect('/login')

            const { user_id } = await userByToken(token)
            //userName

            const clients = await Client.findAll({
                where: {
                    [Op.not]: { status: 'finish' },
                },
                order: [['id', 'DESC']],
                include: { association: `operator` },
            })

            const theClients = clients.map((client) => {
                const result = client.toJSON()

                const { updatedAt } = result

                let start = new Date(updatedAt)
                let end = new Date()
                let time = new Date(end - start)

                let seconds = time.getSeconds()
                let minutes = time.getMinutes()

                result.timer = ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2)

                return result
            })

            const user = await User.findByPk(user_id)

            return res.render('dashboard', {
                title: `Dashboard`,
                page: `dashboard`,
                token,
                user: user.toJSON(),
                clients: theClients,
                panel: true,
            })
        } catch (error) {
            console.log(error)
            return res.redirect('/login')
        }
    },
}
