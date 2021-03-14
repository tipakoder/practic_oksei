// Список титров
var titresList = [];
// Интервал титров
var titresInterval = null;
// Дэбаг
var debug = true;

// Настройки
var carouselDurationUpdate = 10000; // seconds
var carouselDurationAnimation = 1000; // seconds
var carouselDefaultImage = "img/cover.png";

// При старте
function ready(){
	// Включаем дэбаг мод
	if(debug){
		// Добавляем тестовый вариант карусели
		addCarouselTiter('79647090506');
		addCarouselTiter('79619002008', "carousel1");
		addCarouselTiter('79325503338', "carousel2");
	}

	// Стартуем интервал жизни цикла
	titresInterval = setInterval(titresLife, carouselDurationUpdate);
}

function onKey(e){
	switch(e.code){
		case "KeyD":
			if(debug){
				titresLife();
			}
			break;
	}
}

// Добавить титр карусели
function addCarouselTiter(user, idTitre = "carousel"){
	// Добавляем в массив новый цикл
	titresList.push({
		type: "carousel",
		messages: [],
		user: user,
		lastMessageId: 0,
		nextMessageIndex: 0,
		isStarted: false,
		idTitre: idTitre,
		addMessage: function(data){
			this.messages.push(data);
		},
		load: function() {
			fetch(`http://api.stream.iactive.pro/titreInfo?user=${this.user}&from=${this.lastMessageId}&type=1`, {}).then(async(res) => {
				try{
					let dataRes = await res.json();
					return dataRes;
				}catch(e){
					alert("Неверный ответ от сервера");
				}
			}).then((data) => {
				// Отладка
				if(debug) console.log(data);
				// Добавляем сообщения в общий массив
				for(let message of data.messagesList){
					if(data.deletedMessagesIdList.indexOf(message.id) == -1) {
						this.addMessage(message);
					}
				}
				// Запоминаем индекс последнего сообщения
				this.lastMessageId = this.messages[0].id;
			}).catch((error) => {
				console.log(error);
			});
		},
		life: function(){
			// Делаем ссылку на титр
			let titreObject = document.getElementById(this.idTitre);
			// Скрываем старое сообщение	
			if(titreObject.classList.contains("anim-carousel-show")){
				titreObject.classList.remove("anim-carousel-show");
				titreObject.classList.add("anim-carousel-hide");
			}
			// Убираем анимацию скрытия и показываем
			setTimeout(() => {
				// Берём следующее сообщение
				let currentMessage = this.messages[this.nextMessageIndex];
				// Отладка
				if(debug) console.log(currentMessage);
				// Отбиваем брак аватарки
				titreObject.querySelector(".icon").src = carouselDefaultImage;
				if(currentMessage.message.image != ""){
					verifyImage(currentMessage.message.image, function(){
						titreObject.querySelector(".icon").src = this.src;
					});
				}
				// Присваивем значения HTML
				titreObject.querySelector(".title").textContent = currentMessage.message.author;
				titreObject.querySelector(".text").textContent = currentMessage.message.content;
				titreObject.querySelector(".attachment").style.display = "none";
				// Проверяем вложения
				if(currentMessage.message.attachments.length > 0 && currentMessage.message.attachments[0].type == "image"){
					// Отсекаем брак фотки
					verifyImage(currentMessage.message.attachments[0].url, function(){
						titreObject.querySelector(".attachment").src = this.src;
						titreObject.querySelector(".attachment").style.display = "block";
					});
				}
				// Присваиваем анимацию появления
				titreObject.classList.remove("anim-carousel-hide"); 
				titreObject.classList.add("anim-carousel-show");
				// Загужаем ID следующего сообщения
				this.nextMessage();
			}, carouselDurationAnimation + 500);
		},
		nextMessage: function(){
			let choice = false;
			while(!choice) {
				this.nextMessageIndex = ( (this.nextMessageIndex+1) >= this.messages.length) ? 0 : this.nextMessageIndex+1;
				if(this.messages[this.nextMessageIndex].message.image != ""){
					choice = true;
				}
			}
		}
	});
	// Выводим ID нового титра
	return (titresList.length-1);
}

// Обработка титров (ЖЦ)
function titresLife(){
	for(let titre of titresList){
		switch(titre.type){
			case "carousel":
				titre.load();
				titre.life();
				break;
		}
	}
}

// Подтверждение наличия картинки
function verifyImage(url, func){
	let img = new Image();
	img.src = url;
	img.onload = func;
}

// Получение GET параметров
function get(name){ // получение параметров get
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
    else return false;
}

// Задаём события
document.addEventListener("DOMContentLoaded", ready);
document.addEventListener("keypress", onKey);