document.addEventListener('DOMContentLoaded', () => {
    let upBlock = document.querySelector('.up-block')
    let numberSt = document.querySelector('.number-st')
    let info = document.querySelector('.info')
    let cout = document.querySelector('.voice-conter')
    let numberOrg = document.querySelector('.number-org')
    let voiteText = document.querySelector('.voite-text')


    // Тайминги для показа блоко
    setTimeout(() => {
        upBlock.classList.add('anim-show')
        numberSt.classList.add('anim-show')
    }, 1000);

    setTimeout(() => {
        upBlock.style.overflow = 'hidden'
        setTimeout(() => {
            info.classList.add('anim-show')
        }, 300);
    }, 3200);
   
    setTimeout(() => {
        cout.classList.add('anim-show')
        setTimeout(() => {
            voiteText.classList.add('anim-show')
        }, 1390);
        setTimeout(() => {
            numberOrg.classList.add('anim-show')
        }, 1420);
        
    }, 4500);


    // таймингы для скрытия блоков
    setTimeout(() => {
        info.classList.add('anim-hide')
        setTimeout(() => {
            info.style.display = 'none'
            upBlock.style.overflow = 'visible'
        }, 2200);
        setTimeout(() => {
            upBlock.classList.add('anim-hide')
            numberSt.classList.add('anim-hide')
            setTimeout(() => {
                upBlock.classList.remove('anim-show', 'anim-hide')
            }, 4100);
        }, 2300);
    }, 12000);

    // Тайминги для появения сообщения

    setTimeout(() => {
        upBlock.style.display = 'flex'

        upBlock.innerHTML = `
        <div class="message">
        <div class="MPL">
        <div class="message-info">
            <div class="message-left-block">
                <img src="img/whatsapp.png" alt="">
            </div>
            <div class="message-right-block">
                <div class="text">
                    <h1>Арина Л.</h1>
                    <p>111111111111111111</p>
                </div>
            </div>
        </div>
    </div>
    </div>`
    setTimeout(() => {
        let message = document.querySelector('.message')
        let messageInfo = document.querySelector('.message-info')

        message.classList.add('anim-show')
        setTimeout(() => {
            messageInfo.classList.add('anim-show')
        }, 500);


        // Тайминги для скрытия сообщения
        setTimeout(() => {
            messageInfo.classList.add('anim-hide')
            setTimeout(() => {
                message.classList.add('anim-hide')
                messageInfo.style.display = 'none' //Что-бы сообщение больше не показывалось
                setTimeout(() => {
                    message.style.display = 'none' //Что-бы блок с сообщением больше не показывался
                }, 1900);
            }, 900);
        }, 16500);
    }, 1200);
    }, 17500);
})