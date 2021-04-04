document.addEventListener('DOMContentLoaded', () => {
    const upBlock = document.querySelector('.up-block-show');
    const info = document.querySelector('.info');
    const voiceConter = document.querySelector('.voice-conter');
    const numberSt = document.querySelector('.number-st-show');
    const numberOrg = document.querySelector('.number-org');
    const voiteText = document.querySelector('.voite-text');

    setTimeout(() => {
        upBlock.style.overflow = 'hidden';
    }, 1450);
    
    setTimeout(() => {
        info.className = 'info-show';
    }, 720);

    setTimeout(() => {
        voiceConter.className = 'voice-conter-show';
    }, 400);

    setTimeout(() => {
        voiceConter.style.overflow = 'hidden';
    }, 2100);

    // Показ информации нижнего блока
    setTimeout(() => {
        numberOrg.className = 'number-org-show';
        voiteText.className = 'voite-text-show';
    }, 200);

    // Скрытие информации верхнего блока
    setTimeout(() => {
        info.className = 'info-hide';
    }, 10000);

    setTimeout(() => {
        info.style.display = 'none';
        upBlock.style.overflow = 'visible';
        upBlock.className = 'up-block-hide';
        numberSt.className = 'number-st-hide';
    }, 11100);

    setTimeout(() => {
        upBlock.innerHTML = `
        <div class="message-show">
            <div class="MPL">
                <div class="message-info-hide">
                    <div class="message-left-block">
                        <img src="img/whatsapp.png" alt="">
                    </div>
                    <div class="message-right-block">
                        <div class="text-show">
                            <h1>Арина Л.</h1>
                            <p>Желаю всем конкурсантам победы, в первую очередь - над собой!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        const messageHi = document.querySelector('.message-info-hide');
        const mS = document.querySelector('.message-show');
        setTimeout(() => {
            messageHi.className = 'message-info-show';
        }, 200);

        setTimeout(() => {
            messageHi.className = 'hide-message-info'
        }, 6000);

        setTimeout(() => {
            messageHi.style.display = 'none'
        }, 6100);

        setTimeout(() => {
            mS.style.overflow = 'hidden';
        }, 150);
    }, 11700);
})