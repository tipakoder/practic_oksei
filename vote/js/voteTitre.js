
// Иконки соц. сетей
var socialIcons = {
    whatsapp: "img/whatsapp.png",
    youtube: "img/youtube.png",
    vk: "img/vk.png",
    vkcomm: "img/vk.png",
    vkgroup: "img/vk.png",
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

// Основной класс
class VoteTitre{
	// Конструктор
	constructor(debug = false){
		// Включён ли дэбаг
		this.debug = debug;
        // Откуда получаем титр (левый, правый, оба)
        this.from = get("from", "0");
        // Настройка тени карточки
        this.styleShadow = get("shadow", "none");
        // Настройка рамки карточки
        this.styleBorder = get("border", "6px solid yellow");
        // Настройка заднего фона карточки
        this.styleCardBg = get("cardBg", "rgba(0, 0, 0, 0.479)");
        // Цвет имени
        this.styleColorName = get("nameColor", "yellow");
        // Цвет текста
        this.styleColorText = get("textColor", "#FFF");
		// Цвет заднего фона
        this.styleBackgroundColor = get("backgroundColor", "rgba(0,0,0,0)");
		// Номер, который отслеживаем
		this.user = get("user", "79328532025");
		// Массив сообщений
		this.messages = [];
		// Массив содержания
		this.allMessages = [];
		// ID последнего сообщения
		this.lastMessageId = 0;
		// ID следующего сообщения
		this.nextMessageId = 0;
		// Время удерживания сообщения на экране (мс)
		this.duration = get("duration", 10000);
		// Пауза между сообщениями (мс)
		this.pause = get("pause", 5000);
		// Показываем ли комментарии (по умолчанию: да)
		this.showComments = get("showComments", "false");
		// Индекс отслеживаемой цели (номер от 0 до кол-ва вариантов голосования - 1)
		this.memberIndex = parseInt(get("memberIndex", "1"))-1;
		// Начался ли показ титра
		this.started = false;
		// Показывается ли титр
		this.showing = false;
		// Запускаем
		if(!this.debug) this.launch();
	}
	// Запускаем жц титра и начинаем взаимодействовать с контентом
	launch(){
		// Применяем стартовые настрйоки
		document.querySelector(".container").style.backgroundColor = this.styleBackgroundColor;
		// Получаем начальную информацию
		this.update();
	}
	// Обновление каждый неопределённый раз
	update(){
		this.load();
		// Если есть очередь на отрисовку
		if(this.messages.length > 0) this.draw();
        // Если очереди нет, отключаем индикатор показа сообщений (на всякий случай)
        else if(this.showing) this.showing = false;
	}
	// Берём с сервера информацию о текущем голосовании
	load(){
		// Получаем данные о голосовании
		fetch(`http://dev533.iactive.pro/scr/getPollInfo.php?user=${this.user}`, {}).then(async(res) => {
			try{
				let result = await res.json();
				return result;
			}catch(e){
				return null;
			}
		}).then((data) => {
			console.log(data);
			this.members = data.vars;
			if(!this.started) this.createBlock();
			if(data.vars[this.memberIndex] != undefined) document.getElementById("titre-count-votes").textContent = data.vars[this.memberIndex].count;
		}).catch((error) => {
			console.log(error);
		});

		// Получаем новые сообщения
		if(this.showComments == "true"){
			fetch(`http://api.stream.iactive.pro/titreInfo?user=${this.user}&from=${this.lastMessageId}&type=${this.from}`, {}).then(async(res) => {
				try{
					let dataRes = await res.json();
					return dataRes;
				}catch(e){
					return null;
				}
			}).then((data) => {
				console.log(data)
				// Если дата не пришла, выкидываем нас
				if(data == null || data.messagesList == null) return;
				if(this.debug) console.log(`Получено ${data.messagesList.length} сообщений`);
				if(this.debug) console.log(data);
				let newMessages = [];
				// Добавляем сообщения в общий массив
				for(let message of data.messagesList){
                    console.log(this.allMessages.findIndex(elm => elm.message.author == message.message.author));
					if(
						data.deletedMessagesIdList.indexOf(message.id) === -1 &&
						this.allMessages.findIndex(elm => elm.message.author == message.message.author) === -1 && 
						this.allMessages.findIndex(elm => elm.message.content == message.message.content) === -1 &&
						newMessages.findIndex(elm => elm.message.author == message.message.author) === -1 && 
						newMessages.findIndex(elm => elm.message.content == message.message.content) === -1 &&
                        message.message.content != ""
					){ 
						newMessages.push(message); 
					}
				}
				console.log(newMessages)
				if(newMessages.length > 0){
					for(let message of newMessages){
						this.messages.unshift(message);
						this.allMessages.unshift(message);
					}
					// Запоминаем индекс последнего полученного сообщения
					this.lastMessageId = newMessages[0].id;
					if(this.debug) console.log(`Добавлено ${newMessages.length} сообщений`);
					// Отрисовываем титр
					this.draw();
				}
			}).catch((error) => {
				if(this.debug && error == null) console.log("Неверный ответ от сервера");
				else if(this.debug) console.log(error);
			});
		}
	}
	// Рисуем нужный блок
	draw(){
        console.log(this.started && !this.showing);
		// Если показ сообщений начат
		if(this.started && !this.showing){
			// Включаем индиктор показа
			this.showing = true;
			// Если сообщений меньше, чем нужно, не отрисовываем
			if(this.messages.length == 0){
				//this.clearDraw();
				return;
			}
			let nextMessage = this.messages[this.nextMessageId].message;
			console.log(nextMessage);
			this.createMessage(nextMessage);
			// Отмеряем новый ID сообщения
			if(this.nextMessageId+1 < this.messages.length){
				this.nextMessageId++;
			} else {
                this.nextMessageId = 0;
				this.messages = [];
                this.showing = false;
			}
		}	
	}
	// Создаём блок
	createBlock(){
		// Настраиваем блок
		document.getElementById("member-number").textContent = this.memberIndex+1;
		document.getElementById("member-name").textContent = this.members[this.memberIndex].name;
		// Начальная анимация появления титра
		let upBlock = document.querySelector('.up-block');
        let numberSt = document.querySelector('.number-st');
        let info = document.querySelector('.info');
        let cout = document.querySelector('.voice-conter');
        let numberOrg = document.querySelector('.number-org');
        let voiteText = document.querySelector('.voite-text');
        // Показываем верхний блок
		setTimeout(() => {
            upBlock.classList.add('anim-show');
            numberSt.classList.add('anim-show');
        }, 1000);
    
        setTimeout(() => {
            upBlock.style.overflow = 'hidden';
            setTimeout(() => {
                info.classList.add('anim-show');
            }, 300);
        }, 3200);
       
        setTimeout(() => {
            cout.classList.add('anim-show');
            setTimeout(() => {
                voiteText.classList.add('anim-show');
            }, 1390);
            setTimeout(() => {
                numberOrg.classList.add('anim-show');
            }, 1420);
            
        }, 4500);
        // Скрываем верхний блок
        setTimeout(() => {
            info.classList.add('anim-hide');
            setTimeout(() => {
                info.style.display = 'none';
                upBlock.style.overflow = 'visible';
            }, 2200);
            setTimeout(() => {
                upBlock.classList.add('anim-hide');
                numberSt.classList.add('anim-hide');
                setTimeout(() => {
                    // Удаляем лишние классы
                    upBlock.classList.remove('anim-show', 'anim-hide');
                    // Включаем индикатор о начале работы титра
                    this.started = true;
                    // Запускаем интервал жизни титра
		            this.interval = setInterval(() => {this.update();}, this.duration+this.pause);
                    this.update();
                }, 4100);
            }, 2300);
        }, 12000);
	}
	// Создаём сообщение
	createMessage(data){
		let processedData = this.processMessageData(data);
        console.log(processedData);
        let upBlock = document.querySelector('.up-block');
        upBlock.innerHTML = `
            <div class="message">
            <div class="MPL">
            <div class="message-info" style="background-color: ${this.styleCardBg}; box-shadow: ${this.styleShadow};">
                <div class="message-left-block">
                    <div class = "icon"> 
                        <img id="processedDataImage" style="display: none;" src="${processedData.icon}" alt="">
                    </div>
                </div>
                <div class="message-right-block">
                    <div class="text">
                        <h1 style="color: ${this.styleColorName};">${processedData.author}</h1>
                        <p style="color: ${this.styleColorText};">${processedData.content}</p>
                    </div>
                </div>
            </div>
        </div>
        </div>`;
        let message = document.querySelector('.message');
        let messageInfo = document.querySelector('.message-info');
        upBlock.style.display = 'flex';
        message.classList.add('anim-show');
        setTimeout(() => { messageInfo.classList.add('anim-show'); }, 500);
        // Скрываем сообщение
        setTimeout(() => {
            messageInfo.classList.remove('anim-show');
            messageInfo.classList.add('anim-hide');
            setTimeout(() => {
                message.classList.remove('anim-show');
                message.classList.add('anim-hide');
                messageInfo.style.display = 'none'; //Что-бы сообщение больше не показывалось
                setTimeout(() => {
                    message.style.display = 'none'; //Что-бы блок с сообщением больше не показывался
                    // Выключаем индиактор показа сообщения
                    this.showing = false;
                }, 1900);
            }, 900);
        }, this.duration);
	}
	// Обработка полученных данных
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
        } else if(!data.image.includes("http")) {
            // icon = this.preUrl + data.image; // Добавляем к картинке локальный адрес
            icon = socialIcons[data.channel];
        } else {
            icon = socialIcons[data.channel]; // Добавляем картинку соц. сети
        }
		// Если есть картинка, проверяем на её доступность
		if(icon != "") {
			let iconTube = new Image();
			iconTube.src = icon;
			iconTube.onload = function(){
				let objImage = document.getElementById("processedDataImage");
				objImage.style.display = "block";
			}
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

}


var titre = new VoteTitre();
