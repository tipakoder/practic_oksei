// Список титров
var titresList = [];
// Интервал титров
var titresInterval = null;
// Дэбаг
var debug = true;

// При старте
function ready(){
	// Стартуем интервал жизни цикла
	titresInterval = setInterval(titresLife, 10000);
	
	// Включаем дэбаг мод
	if(debug){
		// Добавляем тестовый вариант карусели
		let carouselId = addCarouselTiter();
		titresList[carouselId].addMessage({title: "hi!", text: "text"});
		titresList[carouselId].addMessage({title: "hi111!", text: "text1"});
	}
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
		life: function(){
			let currentMessage = this.messages[this.nextMessageIndex];
			this.nextMessageIndex = ( (this.nextMessageIndex+1) >= this.messages.length) ? 0 : this.nextMessageIndex+1;
			// Присваивем значения HTML
			document.getElementById(this.idTitre).querySelector(".title").textContent = currentMessage.title;
			document.getElementById(this.idTitre).querySelector(".text").textContent = currentMessage.text;
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
				titre.life();
				break;
		}
	}
}

// Задаём событие
document.addEventListener("DOMContentLoaded", ready);
