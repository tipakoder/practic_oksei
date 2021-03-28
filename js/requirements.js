// Иконки соц. сетей
var socialIcons = {
    whatsapp: "img/whatsapp.png",
    youtube: "img/youtube.png",
    vk: "img/vk.png",
    vkcomm: "img/vk.png",
    viber: "img/viber.png",
    twitter: "img/twitter.png",
    telegram: "img/telegram.png",
    telegrambot: "img/telegram.png",
    sms: "img/sms.png",
    livechat: "img/sms.png",
    instagram: "img/instagram.png",
    facebook: "img/facebook.png",
};
// Получение GET параметров
function get(name, def = false){ // получение параметров get
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
    else return def;
}
// Функция дэбага
function debugLog(text, color = "orange", fonstSize = "12pt"){
    console.log(`%c${text}`, `color: ${color}; font-size: ${fonstSize};`);
}