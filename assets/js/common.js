document.querySelectorAll('.delete-button').forEach(element => {
    element.addEventListener('click', () => {
        const id = element.getAttribute('data-id')

        fetch('http://localhost:3000/delete-client/' + id, {
            method: 'delete' 
        })
        .then(resp => resp.json())
        .then(resp => {
            if(resp.status == 'ok') {
                console.log('Pavyko')
                console.log(resp.message)
            }

            if(resp.status == 'failed') {
                console.log('Nepavyko')
                console.log(resp.message)
            }
        })
    })
})