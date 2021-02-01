const User = require('../models/User')
const crypto = require('crypto')
const UserByToken = require('../middlewares/userByToken')
const Yup = require('yup')

module.exports = {
    async index(req, res) {
        const users = await User.findAll()
        return res.json(users)
    },

    async single(req, res) {
        const authHeader = req.headers.authorization

        if (!authHeader) return res.status(401).send({ error: 'No token provided' })

        const { user_id } = await UserByToken(authHeader)

        const userToken = await User.findByPk(user_id, {
            include: { association: 'avatar' },
        })

        if (!userToken) {
            return res.status(401).json({ message: 'User from token not found' })
        }

        return res.json(userToken)
    },

    async store(req, res) {
        try {
            //Get user id by token
            const authHeader = req.headers.authorization

            if (!authHeader) return res.status(401).json({ error: 'Falha de autenticação' })

            if (Object.keys(req.body).length === 0)
                return res.status(400).send({ error: `Por favor envie as infomações` })

            const { name, user, password, type } = req.body


            const { user_id } = await UserByToken(authHeader)

            const admin = await User.findByPk(user_id)

            if(admin.type != 'admin') return res.status(401).json({ error: 'Credenciais insuficiente' })

            const username = await User.findOne({ where: { user } })

            if (username) return res.status(401).json({ error: 'Este usuário já está cadastrado' })

            if (typeof password !== `string`) return res.status(401).json({ error: 'The password is a string' })

            const schema = Yup.object().shape({
                name: Yup.string().required(),
                user: Yup.string().required(),
                password: Yup.string().required().min(6),
            })

            await schema.validate(req.body, { abortEarly: false })

            const createUser = await User.create({
                name,
                user,
                password,
                type,
            })

            return res.json(createUser)
        } catch (error) {
            //Validação de erros
            if (error.name == `JsonWebTokenError`) return res.status(400).send({ error: error.message })

            if (
                error.name == `SequelizeValidationError` ||
                error.name == `SequelizeUniqueConstraintError` ||
                error.name == `userToken` ||
                error.name == `ValidationError`
            )
                return res.status(400).send({ error: error.message })

            console.log(`Erro ao criar novo usuário: `, error)

            return res.status(500).send({ error: `Erro de servidor` })
        }
    },
    async update(req, res) {
        try {
            //Get user id by token
            const authHeader = req.headers.authorization

            if (Object.keys(req.body).length === 0)
                return res.status(400).send({ error: `Por favor envie as infomações` })

            const { name, user, password, type } = req.body

            const { user_id } = await UserByToken(authHeader)

            const theUser = await User.findByPk(user_id)

            if (!theUser.type == `admin`) return res.status(401).json({ error: 'Credenciais insuficiente' })

            const updateUser = await theUser.update({
                name,
                user,
                password,
                type,
            })

            return res.json(updateUser)
        } catch (error) {
            //Validação de erros
            if (error.name == `JsonWebTokenError`) return res.status(400).send({ error })

            if (
                error.name == `SequelizeValidationError` ||
                error.name == `SequelizeUniqueConstraintError` ||
                error.name == `userToken`
            )
                return res.status(400).send({ error: error.message })

            console.log(`Erro ao criar novo usuário: `, error)

            return res.status(500).send({ error: `Erro de servidor` })
        }
    },

    async destroy(req, res) {
        try {
            //Get user id by token
            const authHeader = req.headers.authorization


            const { user_id: usuario } = req.params

            if(!usuario) return res.status(401).json({error: `Informe o id do usuário`})

            const { user_id } = await UserByToken(authHeader)

            const theUser = await User.findByPk(user_id)

            if (!theUser.type == `admin`) return res.status(401).json({ error: 'Credenciais insuficiente' })

            const user = await User.findByPk(usuario)

            if(!user) return res.status(400).send({ error: `Usuário não existe` })

            await user.destroy()

            return res.json(user)


        } catch (error) {
            //Validação de erros
            if (error.name == `JsonWebTokenError`) return res.status(400).send({ error })

            if (
                error.name == `SequelizeValidationError` ||
                error.name == `SequelizeUniqueConstraintError` ||
                error.name == `userToken`
            )
                return res.status(400).send({ error: error.message })

            console.log(`Erro ao criar novo usuário: `, error)

            return res.status(500).send({ error: `Erro de servidor` })
        }
    },

    async forgot(req, res) {
        const { email } = req.body

        try {
            const user = await User.findOne({ where: { email } })

            if (!user) {
                return res.status(401).json({ message: 'the email you entered not exists' })
            }

            const token = crypto.randomBytes(20).toString('hex')

            const now = new Date()

            now.setHours(now.getHours() + 1)

            await user.update(
                {
                    passwordResetToken: token,
                    passwordResetExpires: now,
                },
                { where: { email } }
            )
        } catch (error) {
            console.log(error)
            return res.status(400).send({ error: 'Erro on forgot password, try again' })
        }
    },

    async reset(req, res) {
        const { email, password, token } = req.body

        try {
            const user = await User.findOne({ where: { email } })

            if (!user) return res.status(400).json({ Error: 'the email you entered not exists' })

            if (token !== user.passwordResetToken) return res.status(400).json({ Error: 'Token invalid' })

            const now = new Date()

            if (now > user.passwordResetExpires)
                return res.status(400).json({ Error: 'Token Expired, generate a new one' })

            user.password = password

            await user.update({ user })

            return res.json({ message: 'success!' })
        } catch (error) {
            res.status(400).send({ error: 'Erro on reset password, try again' })
        }
    },
}
