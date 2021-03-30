
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

// Основной класс
class VoteTitre{
	// Конструктор
	constructor(debug = false){
		// Включён ли дэбаг
		this.debug = debug;
		// Адрес для локальных картинок
        this.preUrl = get("preUrl", "http://megapolis.iactive.pro/");
        // Откуда получаем титр (левый, правый, оба)
        this.from = get("from", "0");
        // Настройка тени карточки
        this.styleShadow = get("shadow", "none");
        // Настройка рамки карточки
        this.styleBorder = get("border", "0");
        // Настройка заднего фона карточки
        this.styleCardBg = get("cardBg", "#2D3F53");
        // Цвет имени
        this.styleColorName = get("nameColor", "#EC4F6E");
        // Цвет текста
        this.styleColorText = get("textColor", "#FFFFFF");
		// Цвет заднего фона
        this.styleBackgroundColor = get("backgroundColor", "rgba(0,0,0,0)");
		// Номер, который отслеживаем
		this.user = get("user", "79328532025");
		// Массив сообщений
		this.messages = [];
		// ID последнего сообщения
		this.lastMessageId = 0;
		// ID следующего сообщения
		this.nextMessageId = 0;
		// Пауза между сообщениями (мс)
		this.duration = get("duration", 10000);
		// Показываем ли комментарии (по умолчанию: да)
		this.showComments = get("showComments", "true");
		// Какой из титров подгружать (левый, правый)
		this.from = get("from", "0");
		// Индекс отслеживаемой цели (номер от 0 до кол-ва вариантов голосования - 1)
		this.memberIndex = parseInt(get("memberIndex", "0"))+1;
		// Начался ли показ титра
		this.started = false;
		// Показывается ли титр
		this.showing = false;
		// Запускаем
		if(!this.debug) this.launch();
	}
	// Запускаем жц титра и начинаем взаимодействовать с контентом
	launch(){
		// Запускаем интервал
		this.interval = setInterval(() => {this.update();}, this.duration);
		// Запускаем сразу
		this.update();
	}
	// Обновление каждый неопределённый раз
	update(){
		this.load();
		// Если есть очередь на отрисовку
		if(this.messages.length > 0) this.draw();
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
			let titreCountVotes = document.getElementById("titre-count-votes");
			if(data.vars[this.memberIndex] != undefined) titreCountVotes.textContent = data.vars[this.memberIndex].count;
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
					if(
						data.deletedMessagesIdList.indexOf(message.id) === -1 &&
						this.messages.findIndex(elm => elm.message.author == message.message.author) === -1
					){ 
						newMessages.push(message); 
					}
				}
				console.log(newMessages)
				if(newMessages.length > 0){
					for(let message of newMessages){
						this.messages.unshift(message);
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
		console.log(this.started)
		console.log(this.showing)
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
				this.messages = [];
			}
		}	
	}
	// Создаём блок
	createBlock(){
		// Если уже есть блок, пропускаем этап создания
		if(document.getElementById("jam")) return;
		// Создаём и настраиваем блок
		let baseTable = document.createElement("div");
		baseTable.className = "jamming-show";
		baseTable.id = "jam";
		baseTable.innerHTML = `<h1 class="left-show">${this.memberIndex}</h1>
            <p class="p-left-show">${this.members[this.memberIndex-1].name}</p>`;
		// Вставляем табличку с именем участника
		document.querySelector(".all-block").prepend(baseTable);
		// Биндим созданее сообщение через 7 секунд после старта первой анимации
		setTimeout( () => {document.querySelector(".left-show").className = "left-hide";}, 6000 );
		setTimeout( () => {document.querySelector(".p-left-show").className = "p-left-hide";}, 6500 );
		setTimeout( () => {this.started = true;}, 7000 );
	}
	// Создаём сообщение
	createMessage(data){
		console.log(data)
		let processedData = this.processMessageData(data);
		let jam = document.getElementById("jam");
		jam.innerHTML = `
		<img src="${processedData.icon}">
		<div class="message-info">
		<h1>${processedData.author}</h1>
		<p>${processedData.content}</p>
		</div>
		`;
		jam.className = "message";
		setTimeout(()=>{
			jam.classList.add("hide");
			setTimeout(()=>{
				jam.innerHTML = "";
				this.showing = false;
			}, 1200);
		}, 5000);
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
