
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


class VoteTitre{
	// Конструктор
	constructor(debug = false){
		// Включён ли дэбаг
		this.debug = debug;
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
		this.memberIndex = get("memberIndex", "0");
		// Начался ли показ титра
		this.started = false;
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
			fetch(`http://stream.iactive.pro/scr/messagesGetter.php?user=${this.user}&from=${this.from}`, {}).then(async(res) => {
				try{
					let result = await res.json();
					return result;
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
					if(this.debug) console.log(`Добавлено ${newMessages.length} сообщений`);
					// Если есть функция todo - делаем
					this.draw();
				}
			}).catch((error) => {
				consolg.log(error);
			});
		}
	}
	// Создаём блок
	createBlock(){
		// Создаём и настраиваем блок
		let baseTable = document.createElement("div");
		baseTable.className = "jamming-show";
		baseTable.id = "jam";
		baseTable.innerHTML = `<h1 class="left-show">${Number(this.memberIndex++)}</h1>
            <p class="p-left-show">${this.members[this.memberIndex].name}</p>`;
		// Вставляем табличку с именем участника
		document.querySelector(".all-block").prepend(baseTable);
		// Биндим созданее сообщение через 7 секунд после старта первой анимации
		setTimeout( () => {document.querySelector(".left-show").className = "left-hide";}, 6000 );
		setTimeout( () => {document.querySelector(".p-left-show").className = "p-left-hide";}, 6500 );
		setTimeout( () => {this.createMessage();}, 7000 );
		this.started = true;
	}
	// Создаём сообщение
	createMessage(){
		let jam = document.getElementById("jam");
		jam.innerHTML = `
		<img src="img/a.png">
		<div class="message-info">
		<h1>Арина Л.</h1>
		<p>Желаю всем конскурсантам победы, в первую очередь - над собой!</p>
		</div>
		`;
		jam.className = "message";
		setTimeout(()=>{
			jam.classList.add("hide");
			setTimeout(()=>{jam.innerHTML = "";}, 1200);
		}, 5000);
	}
}


var titre = new VoteTitre();
