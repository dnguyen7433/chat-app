const generateMessage = (username,message) => {
    return {
    user: username,
    text: message,
    createdAt: new Date().getTime()
    }
}
const generateLocationMessage = (username,url) => {
    return {
        user: username,
        text: url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}