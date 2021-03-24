// Создаём нужный титр
var titre = new Titres(true);
titre.initVars();
// Иницализируем окно дэбага
function initDebugWindow(){
    // Если включён режим дэбага
    if(titre.debug) {
        debugLog("Запуск панели дэбага", "green", "16pt");
        document.getElementById("settings").innerHTML = "";
        // Перебираем все свойства титров и создаём поля
        for(let key in titre){
            // Если свойство не функция
            if(typeof titre[key] != "function" && key != "debug" && key != "theEnd" && key != "messages" && key != "lifeInterval"){
                if(key != "type"){
                    // Создаём поле для редакции свойства
                    let field = document.createElement("input");
                    field.id = key+"_field";
                    field.placeholder = titre[key];
                    let label = document.createElement("label");
                    label.textContent = key;
                    label.htmlFor = key+"_field";
                    document.getElementById("settings").appendChild(label);
                    document.getElementById("settings").appendChild(field);
                } else {
                    // Создаём поле для редакции свойства
                    let field = document.createElement("select");
                    field.id = key+"_field";
                    for(let type of ["drum", "carousel", "simple", "presentation"]){
                        let option = document.createElement("option");
                        option.value = type;
                        option.textContent = type;
                        field.appendChild(option);
                    }
                    field.value = titre[key];
                    let label = document.createElement("label");
                    label.textContent = key;
                    label.htmlFor = key+"_field";
                    document.getElementById("settings").appendChild(label);
                    document.getElementById("settings").appendChild(field);
                }
            }
        }
        function stopTitre(){
            titre.restart(true);
            debugLog("Титр остановлен", "red", "16pt");
        }
        function saveParams(restart = false){
            titre.initVars();
            let newOptions = {};
            // Перебираем все свойства титров
            for(let key in titre){
                // Если свойство не функция
                if(typeof titre[key] != "function" && key != "debug" && key != "theEnd" && key != "messages" && key != "lifeInterval"){
                    try{
                        // Сохраняем значение из исходных (если не пустое)
                        if(document.getElementById(key+"_field").value != "" || (titre[key] != document.getElementById(key+"_field").placeholder && titre[key] != null)) {
                            if(document.getElementById(key+"_field").value != ""){
                                newOptions[key] = document.getElementById(key+"_field").value;
                            } else {
                                newOptions[key] = document.getElementById(key+"_field").placeholder;
                            }
                            debugLog(`${key} = ${newOptions[key]}`, "pink", "12pt");
                        }
                    }catch{}
                }
            }
            // Перезапуск титра
            titre.restart(true);
            titre.type = newOptions.type;
            titre.initVars();
            // Приминяем новые значения
            for(let key in newOptions){
                if(key != "type") titre[key] = newOptions[key];
            }
            // Перезапуск панели дэбага
            if(restart) initDebugWindow();
            return newOptions;
        }
        // Добавляем кнопку для запуска и сохранения настроек
        let buttonSave = document.createElement("button");
        buttonSave.textContent = "Сохранить параметры";
        buttonSave.onclick = () => {saveParams(true);};
        document.getElementById("settings").appendChild(buttonSave);
        // Добавляем кнопку для запуска и сохранения настроек
        let buttonStart = document.createElement("button");
        buttonStart.textContent = "Запустить титр";
        buttonStart.onclick = function(){
            saveParams();
            if(!titre.isStarted) titre.init();
        }
        document.getElementById("settings").appendChild(buttonStart);
        // Добавляем кнопку для запуска и сохранения настроек
        let buttonStop = document.createElement("button");
        buttonStop.textContent = "Остановить титр";
        buttonStop.onclick = stopTitre;
        document.getElementById("settings").appendChild(buttonStop);
        // Добавляем кнопку для открытия рабочей версии титра
        let buttonOpen = document.createElement("button");
        buttonOpen.textContent = "В новой вкладке";
        buttonOpen.onclick = function(){
            let options = saveParams();
            let params = "";
            for(let key in options){
                // Создаём поле для редакции свойства
                try{ 
                    params += key+"="+options[key]+"&"; 
                }catch{}
            }
            // Обрезаем лишний символ
            params = params.substring(0, params.length-1);
            // Открываем ссылку в новой вкладке
            window.open("titre.html?"+params, '_blank').focus();
        }
        document.getElementById("settings").appendChild(buttonOpen);
    } else {
        // Удалить графу настроек
        document.getElementById("settings").remove();
    }
}
// Запускаем панель дэбага
initDebugWindow();