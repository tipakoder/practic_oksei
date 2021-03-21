class Titres{
    // Конструктор класса
    constructor(debug = false){
        // Пользователь, которого мониторим
        this.user = get("user", "79328532025");
        // Id последнего полученного сообщения
        this.lastMessageId = 0;
        // Время показа сообщения (по умолчанию 10 секунд)
        this.duration = get("duration", 10000);
        // Тип титра (по умолчанию барабан)
        this.type = get("type", "drum");
        // Свойства для разных типов
        switch(this.type){
            case "drum":
                // ID следующего сообщения
                this.nextMessageId = 0;
                // Максимальное кол-во сообщений в барабане
                this.maxCountMessages = get("maxCountMessages", 10);
                // Полный круг пройден
                this.theEnd = false;
                break;
            case "carousel":
                // ID следующего сообщения
                this.nextMessageId = 0;
                // Максимальное кол-во сообщений в каруселе
                this.maxCountMessages = get("maxCountMessages", 10);
                // Кол-во сообщений для просмотра
                this.viewCountMessages = get("viewCountMessages", 5);
                // Полный круг пройден
                this.theEnd = false;
                break;
        }
        // Включён ли дэбаг
        this.debug = debug;
        // Инициализируем объекты
        this.messages = [];
        this.init();
        this.load();
    }
    // Иницализация объектов
    init(){
        // Для дебага (и презентации) указываем наглядно подзаголовок титра
        if(this.debug){
            debugLog("Инициализация объектов", "green", "16pt");
            let nameType = "";
            switch(this.type){
                case "drum":
                    nameType = "Барабан";
                    break;
                case "carousel":
                    nameType = "Карусель";
                    break;
                case "vote":
                    nameType = "Голосование";
                    break;
                case "voteComment":
                    nameType = "Голосование с комментариями";
                    break;
            }
            debugLog(`Текущий титр: ${nameType}`, "yellow", "16pt");
            document.getElementById("subtitle").textContent = nameType;
        } else {
            document.getElementById("subtitle").remove();
        }
        // Запускаем цикл обновления
        this.lifeInterval = setInterval(() => {this.update()}, parseInt(this.duration));
    }
    // Создание блока
    createBlock(data = null){
        if(this.debug) debugLog("Создание блока");
        if(data == null && this.debug) return;
        // Создаём основу
        let baseTitre = document.createElement("div");
        baseTitre.classList.add("titre");
        baseTitre.classList.add(this.type);
        let innerBase = "";
        // Делаем соответствующий блок
        switch(this.type){
            // Барабан
            case "drum":
                // Конечные данные
                let processedData = this.processMessageData(data);
                // Генерация блока
                baseTitre.classList.add("anim-drum-show");
                innerBase = '<div class="wrapper">'+
                `<img class="icon" src="${processedData.icon}">`+
                '<div class="content">'+
                `<h2 class="title">${processedData.author}</h2>`+
                `<p class="text">${processedData.content}</p>`;
                if(processedData.srcAttachment != "") innerBase += `<img class="attachment" src="${processedData.srcAttachment}" alt="">`;
                innerBase += '</div></div>';
                break;
            case "carousel":
                baseTitre.classList.add("anim-carousel-show");
                for(let message of data){
                    // Конечные данные
                    let processedData = this.processMessageData(message.message);
                    innerBase += '<div class="wrapper">'+
                    `<img class="icon" src="${processedData.icon}">`+
                    '<div class="content">'+
                    `<h2 class="title">${processedData.author}</h2>`+
                    `<p class="text">${processedData.content}</p>`;
                    if(processedData.srcAttachment != "") innerBase += `<img class="attachment" src="${processedData.srcAttachment}" alt="">`;
                    innerBase += '</div></div>';
                }
                break;
        }
        baseTitre.innerHTML = innerBase;
        // Возвращаем готовую базу
        return baseTitre;
    }
    processMessageData(data){
        // Обработка времени нового сообщения
        let date = new Date(data.date);
        let offset = ((date.getTimezoneOffset() / 60) + 2) * 60;
        date.setTime(date.getTime() - offset * 60 * 1000);
        // Обработка контента
        let content = data.content;
        content = content.replace(/(<([^>]+)>)/ig, ""); // Срезаем спец символы
        content = content.replace(/&(.+?);/ig, ""); // Срезаем html теги и спец символы
        // Обработка автора
        let author = (data.author) ? data.author : data.senderNumber; // Если у автора нет имени, оно заменяется номером
        if(author[0] === "+") author = author.substr(1); // Если имя автора включает первый +, срезаем его
        // if(parseInt(author)) author = hideNumber(author); НЕПОНЯТНАЯ ИСХОДНАЯ СТРОКА
        // Обработка иконки
        let icon = "";
        if(data.image && data.image !== "" && data.image.includes("http")){
            icon = data.image; // Присваиваем картинку с другого сервера
        } else {
            icon = socialIcons[data.channel];
        }
        // Обработка вложений
        let srcAttachment = "";
        if(data.attachments && data.attachments.length > 0 && data.attachments[0].type == "image"){
            let urlAttachment = data.attachments[0].url;
            srcAttachment = (urlAttachment.includes("http")) ? urlAttachment : this.preUrl + data.attachments[0].url;
        }
        // Выводим конечные обработанные данные
        return {
            date: date,
            content: content,
            author: author,
            icon: icon,
            srcAttachment: srcAttachment,
            channel: data.channel,
        };
    }
    // Обновление титра
    update(){
        if(this.debug) debugLog("Обновленение");
        this.load();
        this.draw();
    }
    // Загрузка свежих сообщений
    load(){
        // Если полный круг пройден
        if(this.theEnd){
            if(this.debug) debugLog("Полный круг пройден");
            this.messages = [];
            this.theEnd = false;
        }

        fetch(`http://api.stream.iactive.pro/titreInfo?user=${this.user}&from=${this.lastMessageId}&type=1`, {}).then(async(res) => {
            try{
                let dataRes = await res.json();
                return dataRes;
            }catch(e){
                return null;
            }
        }).then((data) => {
            // Если дата не пришла, выкидываем нас
            if(data == null || data.messagesList == null) return;
            if(this.debug) debugLog(`Получено ${data.messagesList.length} сообщений`, "pink");
            console.log(data);
            let newMessages = [];
            // Добавляем сообщения в общий массив
            for(let message of data.messagesList){
                if(
                    data.deletedMessagesIdList.indexOf(message.id) === -1 &&
                    this.messages.findIndex(elm => elm.message.author == message.message.author) === -1
                ){ 
                    if(newMessages.length < this.maxCountMessages){
                        newMessages.push(message); 
                    }
                }
            }
            // Если у нас пришли новые сообщения, то старые удаляем
            if(newMessages.length > 0 && this.messages.length >= this.maxCountMessages && this.theEnd){
                this.messages = this.messages.splice(this.messages.length-newMessages.length, newMessages.length);
            }
            if(newMessages.length > 0){
                for(let message of newMessages){
                    this.messages.push(message);
                }
                // Запоминаем индекс последнего полученного сообщения
                this.lastMessageId = newMessages[0].id;
                if(this.debug) debugLog(`Добавлено ${newMessages.length} сообщений`, "green");
            }
        }).catch((error) => {
            if(this.debug && error == null) debugLog("Неверный ответ от сервера", "red");
            else if(this.debug) debugLog(error, "red");
        });
    } 
    // Отрисовка сообщений
    draw(){
        // Отрисовываем в зависимости от типа
        switch(this.type){
            case "drum":
                // Если сообщений меньше, чем нужно, не отрисовываем
                if(this.maxCountMessages > this.messages.length || this.messages.length == 0){
                    this.clearDraw();
                    return;
                }
                // Следующий ID
                if(document.getElementById("titreBody").querySelector(".titre.drum")){
                    document.getElementById("titreBody").querySelector(".titre.drum").classList.remove("anim-drum-show");
                    document.getElementById("titreBody").querySelector(".titre.drum").classList.add("anim-drum-hide");
                }
                setTimeout(() => {
                    let nextMessage = this.messages[this.nextMessageId].message;
                    let newBlock = this.createBlock(nextMessage);
                    document.getElementById("titreBody").innerHTML = "";
                    document.getElementById("titreBody").appendChild(newBlock);
                    // След. сообщение
                    this.getNextMessageId();
                }, 1000);
                break;
            case "carousel":
                // Если сообщений меньше, чем нужно, не отрисовываем
                if(this.maxCountMessages > this.messages.length || this.messages.length == 0){
                    this.clearDraw();
                    return;
                }
                // Следующий ID
                if(document.getElementById("titreBody").querySelector(".titre.carousel")){
                    document.getElementById("titreBody").querySelector(".titre.carousel").classList.remove("anim-carousel-show");
                    document.getElementById("titreBody").querySelector(".titre.carousel").classList.add("anim-carousel-hide");
                }
                setTimeout(() => {
                    let nextMessage = this.messages.slice(this.nextMessageId, this.nextMessageId+this.viewCountMessages);
                    let newBlock = this.createBlock(nextMessage);
                    document.getElementById("titreBody").innerHTML = "";
                    document.getElementById("titreBody").appendChild(newBlock);
                    // След. сообщение
                    this.getNextMessageId();
                }, 2000);
                break;
        }
    }
    // ID следующего сообщения
    getNextMessageId(){
        switch(this.type){
            case "drum":
                // Если ID следующего сообщеняи не найден, назначим его на первое
                if(this.nextMessageId+1 < this.messages.length){
                    this.nextMessageId++;
                } else {
                    this.theEnd = true;
                    this.nextMessageId = 0;
                }
                break;
            case "carousel":
                // Если ID следующего сообщеняи не найден, назначим его на первое
                if(this.nextMessageId+this.viewCountMessages <= this.messages.length){
                    this.nextMessageId += this.viewCountMessages;
                } else {
                    this.theEnd = true;
                    this.nextMessageId = 0;
                }
                break;
        }
    }
    // Отчищаем контент
    clearDraw(){
        // Если контент присутствует
        if(document.getElementById("titreBody").innerHTML != ""){
            // Делаем действия в зависимости от типа титра
            switch(this.type){
                case "drum":
                    if(document.getElementById("titreBody").querySelector(".titre.drum")){
                        document.getElementById("titreBody").querySelector(".titre.drum").classList.remove("anim-drum-show");
                        document.getElementById("titreBody").querySelector(".titre.drum").classList.add("anim-drum-hide");
                    }
                    setTimeout(() => {
                        document.getElementById("titreBody").innerHTML = "";
                    }, 1000);
                    break;
                case "carosel":
                    if(document.getElementById("titreBody").querySelector(".titre.carousel")){
                        document.getElementById("titreBody").querySelector(".titre.carousel").classList.remove("anim-carousel-show");
                        document.getElementById("titreBody").querySelector(".titre.carousel").classList.add("anim-carousel-hide");
                    }
                    setTimeout(() => {
                        document.getElementById("titreBody").innerHTML = "";
                    }, 2000);
                    break;
            }
        }
    }
}