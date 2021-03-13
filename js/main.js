// Список титров
var titresList = [];
// Интервал титров
var titresInterval = null;
// Дэбаг
var debug = true;

// Настройки
var carouselDurationUpdate = 10000; // seconds
var carouselDurationAnimation = 1000; // seconds

// При старте
function ready(){
	// Включаем дэбаг мод
	if(debug){
		// carouselDurationUpdate = 6000;
		// Добавляем тестовый вариант карусели
		let carouselId = addCarouselTiter();
		titresList[carouselId].addMessage({title: "hi!", text: "text"});
		titresList[carouselId].addMessage({title: "hi111!", text: "text1"});
	}

	// Стартуем интервал жизни цикла
	titresInterval = setInterval(titresLife, carouselDurationUpdate);
}

// Добавить титр карусели
function addCarouselTiter(idTitre = "carousel"){
	// Добавляем в массив новый цикл
	titresList.push({
		type: "carousel",
		messages: [],
		lastMessageId: 0,
		nextMessageIndex: 0,
		isStarted: false,
		idTitre: idTitre,
		addMessage: function(data){
			this.messages.push(data);
		},
		load: function() {
			fetch(`http://api.stream.iactive.pro/titreInfo?user=${user}&from=${_this.lastMessageId}&type=1`, {}).then(async(res) => {
				try{
					let dataRes = await res.json();
					return dataRes;
				}catch(e){
					alert("Неверный ответ от сервера");
				}
			}).then((data) => {
				console.log(data);
			}).catch((error) => {
				console.log(error);
			});
		},
		life: function(){
			// Скрываем старое сообщение	
			if(document.getElementById(this.idTitre).classList.contains("anim-carousel-show")){
				document.getElementById(this.idTitre).classList.remove("anim-carousel-show");
				document.getElementById(this.idTitre).classList.add("anim-carousel-hide");
			}
			// Убираем анимацию скрытия и показываем
			setTimeout(() => {
				// Берём следующее сообщение
				let currentMessage = this.messages[this.nextMessageIndex];
				this.nextMessageIndex = ( (this.nextMessageIndex+1) >= this.messages.length) ? 0 : this.nextMessageIndex+1;
				// Присваивем значения HTML
				document.getElementById(this.idTitre).querySelector(".title").textContent = currentMessage.title;
				document.getElementById(this.idTitre).querySelector(".text").textContent = currentMessage.text;
				document.getElementById(this.idTitre).classList.remove("anim-carousel-hide"); 
				document.getElementById(this.idTitre).classList.add("anim-carousel-show");
			}, carouselDurationAnimation);
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

// Задаём событие
document.addEventListener("DOMContentLoaded", ready);
