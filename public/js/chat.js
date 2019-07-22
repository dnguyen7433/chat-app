const socket = io()
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocation = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")
const $messageName = document.querySelector(".message__name")
//Template
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML
//QueryString (qs) Config
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})
const autoscroll = () => {
    // New Message Element
    const $newMessage = $messages.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // Howfar have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset ){
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        user: message.user,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})
socket.on("locationMessage", (location) => {
    const html = Mustache.render(locationTemplate, {
        user: location.user,
        url: location.text,
        createdAt: moment(location.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})
socket.emit("join",{username,room}, (error) => {
    if(error) {
        alert(error)
        location.href = "/"
    }
})
socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})
$messageForm.addEventListener("submit", (e) => {
    e.preventDefault() // Preventing browser refreshing page by default
    $messageFormButton.setAttribute("disabled", "disabled")
    const message = e.target.elements.message.value
    socket.emit("sendMessage", message, (error) => {
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value = ""
        $messageFormInput.focus()
        if(error){
            console.log(error)
        }
        console.log("Delivered")
    })
})
$sendLocation.addEventListener("click", () => {
    
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser")
    }
    $sendLocation.setAttribute("disabled", "disabled")
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation",{
            latitude:  position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log("Location shared")
            $sendLocation.removeAttribute("disabled")
        })
    })
})
