const render = (chats) =>{
    const contChats = document.getElementById('contChats')
    contChats.innerHTML= ""
    chats.forEach(chat => {
        const newChat = document.createElement('div')
        if (chat.id === idChat){
            newChat.className= "constMessage MyMessage"
            newChat.innerHTML = `
                                    <div class="msgOut"></div>
                                    <p>${ chat.text } </p> 
                                    <div class="dateMSG">${chat.dateMessage}</div>
                                 `
        } else{
            newChat.className= "constMessage othersMessage"
            newChat.innerHTML = `
                                    <div class="msgIn"></div>
                                    <div class="autor"> ${chat.autor} </div>
                                    <p>  ${ chat.text } </p>
                                    <div class="dateMSG">${chat.dateMessage}</div> 
                                `
        }
        contChats.appendChild(newChat)
    });
    //Colocar el scroll siempre al final
    const span = document.createElement("span")
    span.innerHTML= `<span id="viewLastMsg"></span>`
    contChats.appendChild(span)
    document.getElementById('viewLastMsg').scrollIntoView(true)
}

//Metodo traido desde socket.io.js que enciende el socket del cliente
let socket = io()
//Variables que nos permite difenciar el chat propio de los demas clientes
let idChat;
let autorCurrent;

if(localStorage.getItem("autor")){

    autorCurrent = localStorage.getItem("autor")
    idChat =  localStorage.getItem("idChat") 

} else{
    Swal.fire({
        title: "Tu nombre",
        input: "text",
        confirmButtonText: "Guardar",
        allowOutsideClick: false,
        inputValidator: (value) => {
            if (!value) {
              return 'Necesitas escribir un nombre o nickname'
            }
          }
    })
    .then(res => {
        if (res.value) {
            autorCurrent = res.value;
            idChat = `${Date.now()} - ${autorCurrent}`
            localStorage.setItem("autor", res.value )
            localStorage.setItem("idChat", idChat) 
        }
    });
}

    

socket.on("chats", (data) => {
    render(data)
    const newMessage = () =>{
        const dayName = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"]
        const date = new Date()
        /* console.log(autorCurrent) */
        const message = {
            id: idChat,
            autor: autorCurrent,
            text: document.getElementById("text").value,
            dateMessage: `${dayName[date.getDay()]} ${date.getDate()} a las ${date.getHours()}:${date.getMinutes()}`
        }
        /* console.log(message) */
        document.getElementById("text").value = ""
        socket.emit('msg', message)
    }

    const form = document.getElementById("form")
    form.onsubmit = (e) =>{
        e.preventDefault()
        newMessage()
    } 
})