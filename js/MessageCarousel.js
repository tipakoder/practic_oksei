class MessageCarousel {
    constructor() {
        this.carousel = [];
        this.nextMessageIndex = 0;
        this.lastMessageId = 0;
        this.unique = [];
        this.isStarted = false;
        this.li = null;

        this.DOM = {
            hiddenBlock: document.querySelector('.hidden-block')
        }
        console.log('updated888');
        this.init();
        this.imgLoader = document.querySelector('.img-loader');
    }

    init() {
        // this.startDebug();
        setInterval(this.getNewMessages.bind(this), 5000)
        this.startQuery();
    }

    startQuery() {
        let _this = this;
        $.ajax({
            url: `http://api.stream.iactive.pro/titreInfo?user=${user}&from=${_this.lastMessageId}&type=1`,
            dataType: 'json',
        })
            .done((res) => {
                if (res === null) {
                    alert('Трансляция отчищена');
                    return;
                }

                let { messagesList, deletedMessagesIdList } = res;
                deletedMessagesIdList.sort((a, b) => b - a);

                messagesList.forEach(el => {
                    let { attachments } = el.message;
                    if (typeof attachments === "string" && attachments.replace(/&quot;/g, '"') !== '') {
                        attachments = JSON.parse(attachments.replace(/&quot;/g, '"'));
                    }

                    if (Array.isArray(attachments) && attachments.length > 0) {
                        const createImage = (url) => {
                            const img = document.createElement('img');
                            img.src = url;
                            img.onload = () => {
                                attachments[0].isLoaded = true;
                            }
                            return img;
                        }
                        const url = attachments[0].url;
                        this.imgLoader.appendChild(createImage(url));
                    }

                })

                //очищаем повторяющиеся сообщения
                messagesList.forEach(el => {
                    if (_this.unique.findIndex(elm => elm.message.author == el.message.author) === -1)
                        _this.unique.push(el);
                })

                //если сообщений не осталось выходим
                if (_this.unique.length === 0)
                    return;

                //запоминаем id последнего сообщения, для дальнейших запросов
                _this.lastMessageId = messagesList[0].id;

                messagesList = _this.unique;

                //берем последние n сообщений, n - размер карусели
                messagesList = messagesList.slice(Math.max(messagesList.length - messageRepeatCount, 0))

                //пихаем сообщения в карусель
                _this.carousel.push(...messagesList);
                console.log('кол-во сообщений в карусели: ', _this.carousel.length);
                console.log('сообщения: ', _this.carousel);
                //запускаем карусель
                _this.starCarousel();
            })
            .fail(function (xhr, status, error) {
                console.log(xhr, status, error);
            })
    }

    starCarousel() {
        //отмечаем, что мы запустили карусель
        this.isStarted = true;
        //выводим сообщение на экран
        this.showNextMessage();
        setInterval(() => {
            this.showNextMessage();
        }, duration + pause);
    }

    showNextMessage() {
        //начинаем вывод когда сообщений больше чем startFrom
        if (this.carousel.length < startFrom)
            return;
        //сообщение на вывод
        let nextMessage = this.carousel[this.nextMessageIndex];

        const isImgLoaded = (nextMessage) => {
            const { attachments } = nextMessage.message;
            //если есть изображение и оно не подгрузилось
            if (Array.isArray(attachments) && attachments.length > 0 && !attachments[0].isLoaded)
                return false
            else
                return true;
        }

        // || 
        if (nextMessage === undefined || !isImgLoaded(nextMessage)) {
            this.iterateIndex();
            nextMessage = this.carousel[this.nextMessageIndex];
        }

        const li = this.createBlock(nextMessage.message);
        li.style.width = '0px';
        li.style.height = '0px';



        $('.msg').fadeOut("slow");
        // setTimeout(() => {
        //     $('.msg').remove();
        //     document.getElementById('lbMsg').appendChild(li);
        //     $('.msg').fadeTo("slow", opacity);
        // }, pause);
        setTimeout(() => {
            // $('.msg').remove();
            document.getElementById('lbMsg').appendChild(li);
            // $('.msg').fadeTo("slow", opacity);
            const img = li.querySelector('.msg-img');
            if (img) {
                img.style.width = '0px';
                img.style.height = '0px';
            }

            setTimeout(() => {
                li.style.width = li.dataset.width + 'px';
                li.style.height = li.dataset.height + 'px';
            }, 100);
            setTimeout(() => {
                if (img) {
                    img.style.width = img.dataset.width + 'px';
                    img.style.height = img.dataset.height + 'px';
                }
            }, 100);
            setTimeout(() => {
                li.style.animationName = 'fadeOutDown';
            }, duration - 6000);
            setTimeout(() => {
                li.remove();
            }, duration);
        }, 1000);

        //иттерация индекса карусели
        this.iterateIndex();
    }

    iterateIndex() {
        //пока не дошли до конца делаем иттерацию
        if (this.nextMessageIndex < this.carousel.length - 1)
            this.nextMessageIndex++;
        else {
            //если дошли до конца, оставляем последние n сообщений, n - размер карусели
            this.carousel = this.carousel.slice(Math.max(this.carousel.length - messageRepeatCount, 0))
            this.nextMessageIndex = 0;
        }
    }

    getNewMessages() {
        let _this = this;
        $.ajax({
            url: `http://api.stream.iactive.pro/titreInfo?user=${user}&from=${_this.lastMessageId}&type=1`,
            dataType: 'json',
        })
            .done((res) => {
                if (res === null) {
                    alert('Трансляция отчищена');
                    return;
                }

                let { messagesList, deletedMessagesIdList } = res;
                deletedMessagesIdList.sort((a, b) => b - a);

                //удаляем сообщения по запросу пользователя
                _this.carousel = _this.carousel.filter(el => !deletedMessagesIdList.includes(+el.id));
                console.log('удалено сообщение');
                console.log('сообщения: ', _this.carousel);

                messagesList.forEach(el => {
                    let { attachments } = el.message;
                    if (typeof attachments === "string" && attachments.replace(/&quot;/g, '"') !== '')
                        attachments = JSON.parse(attachments.replace(/&quot;/g, '"'));

                    if (Array.isArray(attachments) && attachments.length > 0) {
                        const createImage = (url) => {
                            const img = document.createElement('img');
                            img.src = url;
                            img.onload = () => {
                                attachments[0].isLoaded = true;
                            }
                            return img;
                        }
                        const url = attachments[0].url;
                        this.imgLoader.appendChild(createImage(url));
                    }
                })

                let un = [];
                //берем сообщения, которых еще не было
                messagesList.forEach(el => {
                    if ((Array.isArray(el.message.attachments) && el.message.attachments.length > 0) || _this.unique.findIndex(elm => elm.message.content == el.message.content && elm.message.author == el.message.author) === -1) {
                        _this.unique.push(el);
                        un.push(el);
                    }
                })
                //если ничего не осталось выходи
                if (un.length === 0)
                    return;
                //запоминаем индекс последнего сообщения
                _this.lastMessageId = messagesList[0].id;

                messagesList = un;

                //смотрим сколько сообщений можно удалить
                let countToDel = messagesList.length - (messageRepeatCount - _this.carousel.length)
                if (countToDel > 0) {
                    //проходимся по каждому новому элементу 
                    messagesList.forEach(el => {
                        //до тех пор пока мы имеем право на удаление
                        while (countToDel > 0) {
                            //ищем автора в карусели
                            const toDel = _this.carousel.find(elm => elm.message.author === el.message.author);
                            //если есть удаляем
                            if (toDel)
                                _this.carousel = _this.carousel.filter(elm => elm !== toDel);
                            else
                                break;//иначе выходим из цикла
                            //если удалили уменьшаем счетчик
                            countToDel--;
                        }
                    })
                }
                //пихаем сообщения в карусель
                _this.carousel.push(...messagesList.reverse());
                console.log('кол-во сообщений в карусели: ', _this.carousel.length);
                console.log('сообщения: ', _this.carousel);
                //если еще не запустили запускаем
                if (!_this.isStarted)
                    _this.starCarousel();
            })
            .fail(function (xhr, status, error) {
                console.log(xhr, status, error);
            })
    }

    createBlock(data) { // создание и вставка блока
        let date = new Date(data.date);
        let offset = ((date.getTimezoneOffset() / 60) + 2) * 60;
        date.setTime(date.getTime() - offset * 60 * 1000);

        let content = data.content;
        let rex = /(<([^>]+)>)/ig;              //
        content = content.replace(rex, "");    //
        //  Отрезаю html тэги и спец символы html
        rex = /&(.+?);/ig;                      //
        content = content.replace(rex, "");    //

        let h = '';

        let autor = (data.author) ? data.author : data.senderNumber;
        if (autor[0] === '+')
            autor = autor.substr(1);

        if (parseInt(autor)) {
            function hideNumber(string, replaceTo = '*', elemsHide = 4, sliceFromback = 4) {

               let result = string.match(/^(\(?\+?\d{1,2}\)? ?\(?\d{1,3}\)? ?\d+\-? ?\d+\-? ?\d+)$/);
                if (result !== null) {
                    return Array.from(string).reduceRight(function (ctx, char) {
                        var isDigit = char >= '0' && char <= '9';
                        var offset = ctx.offset + (isDigit ? 1 : 0);
                        var filteredChar = isDigit ? offset >= 4 && offset < 8 ? '*' : char : char;
                        var filtered = filteredChar + ctx.filtered;
                        return { offset: offset, filtered: filtered };
                    }, { offset: -1, filtered: '' }).filtered;
                } else {
                    return string;
                }
            }

            autor = hideNumber(autor);
        }

        let li = document.createElement('li');

        li.className = `msg ${classes[data.channel]}`;

        let needIcon = '';
        if (data.image && data.image !== '' && data.image.includes('http')) {
            needIcon = data.image;//'style="background-image: url(' + data.image + ')"'
        }
        if (data.attachments && data.attachments.length > 0 && data.attachments[0].type == 'image') {
            // type: "image"
            // url: "/media/images/09_59_33__24_07_2020__Vladislav_Kasimov__image___XtdeilO7myE.jpg"

            const url = data.attachments[0].url;
            const src = (url.includes('http')) ? url : preUrl + data.attachments[0].url;

            li.innerHTML = `
            <div class="msg-header">
                <div class="icon-wrapper">
                    <div class="icon">
                        <img class='avatar-img' src="${needIcon}" alt="">
                    </div>
                </div>
                <div class="author-wrapper">
                    <span class="author">${autor}</span>
                </div>
            </div>
            <div class="msg-body">
                ${this.getContent(content)}
            </div>
            `;

            this.setImgHeight(li, src, Boolean(content));

        } else {
            li.innerHTML = `
            <div class="msg-header">
                <div class="icon-wrapper">
                    <div class="icon">
                        <img class='avatar-img' src="${needIcon}" alt="">
                    </div>
                </div>
                <div class="author-wrapper">
                    <span class="author">${autor}</span>
                </div>
            </div>
            <div class="msg-body">
                <div style="max-height: 490px;" class="text hyphens sel-on">${content}</div>
            </div>
                  `;
            this.setLiHeight(li);
        }

        if (!(data.image && data.image !== '' && data.image.includes('http')))
            li.querySelector('.avatar-img').style.display = 'none';

        const getSize = (length) => {
            const size = 26 - (length - 12)
            return size > 26 ? 26 : size;
        }

        li.querySelector('.author').style.fontSize = getSize(autor.length) + 'px';

        // li.querySelector('.author').style.color = nameColor;
        // li.querySelector('.text').style.color = textColor;
        // li.style.background = cardBg;
        // li.style.boxShadow = shadow;
        // li.style.border = border;
        // li.style.display = 'none';
        return li;
    }

    getContent(content) {
        if (!(content === 'Изображение')) {
            return `<div style="max-height: 135px;" class="text hyphens sel-on">${content}</div>`;
        }
        return '<div style="max-height: 135px;" class="text hyphens sel-on"></div>';
    }

    setImgHeight(li, url, hasContent) {
        const cloneLi = li.cloneNode(true)
        this.DOM.hiddenBlock.appendChild(cloneLi);
        let el = document.querySelector(`.msg`);
        let ul = document.createElement('ul');
        ul.className = "lbMsg-copy";
        ul.appendChild(cloneLi);
        const styles = window.getComputedStyle(cloneLi, null);
        this.DOM.hiddenBlock.appendChild(ul);

        const maxH = hasContent ? 760 : 722;
        const h = +styles.height.slice(0, -2);
        var imgH = maxH - h;

        const tagImg = document.createElement('img');
        tagImg.className = "msg-img";
        tagImg.onload = this.imgOnload.bind(tagImg, li, cloneLi, imgH);
        tagImg.src = url;
        // this.DOM.hiddenBlock.innerHTML = "";
    }

    setLiHeight(li) {
        const cloneLi = li.cloneNode(true)
        this.DOM.hiddenBlock.appendChild(cloneLi);
        let el = document.querySelector(`.msg`);
        let ul = document.createElement('ul');
        ul.className = "lbMsg-copy";
        ul.appendChild(cloneLi);
        const styles = window.getComputedStyle(cloneLi, null);
        this.DOM.hiddenBlock.appendChild(ul);

        const rect = cloneLi.getBoundingClientRect();
        li.dataset.width = rect.width;
        li.dataset.height = rect.height;
        // this.DOM.hiddenBlock.innerHTML = "";
    }

    imgOnload(li, cloneLi, imgH) {
        let scale = imgH / this.height;
        let newWidth = +(this.width * scale).toFixed(3);
        if (newWidth > 378) {
            this.style.height = 'auto';
            this.style.width = 378 + 'px';
        } else {
            this.style.height = imgH + "px";
            this.style.width = 'auto';
        }
        li.querySelector('.msg-body').insertBefore(this, li.querySelector('.text'));
        const cloneImg = this.cloneNode(true);
        cloneLi.querySelector('.msg-body').insertBefore(cloneImg, cloneLi.querySelector('.text'));
        const rect = cloneLi.getBoundingClientRect();
        li.dataset.width = rect.width;
        li.dataset.height = rect.height;
        const imgRect = cloneLi.querySelector('.msg-img').getBoundingClientRect()
        li.querySelector('.msg-img').dataset.width = imgRect.width;
        li.querySelector('.msg-img').dataset.height = imgRect.height;
    }
    // {
    //     "type": "image",
    //     "url": "img/h.jpg"
    // }
    startDebug() {
        const msg = {
            "author": "Антон Решетов",
            "content": `Выпечка с добавлением тыквы имеет красивый цвет и отличный вкус.`,
            "channel": "whatsapp",
            "id": "3040851",
            "attachments": [

            ],
            "labels": [
                ""
            ],
            "date": "2020-06-19 12:14:27",
            "status": [
                ""
            ],
            "favorite": "",
            "senderNumber": "79266763437",
            "region": "\u041c\u043e\u0441\u043a\u0432\u0430 \u0438 \u041c\u043e\u0441\u043a\u043e\u0432\u0441\u043a\u0430\u044f \u043e\u0431\u043b\u0430\u0441\u0442\u044c",
            "answer": "",
            "socialData": "",
            "social_href": "",
            "image": "",
            "isCreated": "0",
            "timeId": "m9sjwhu3wehm9bdbu77as"
        };
        // http:\/\/mb.iactive.pro\/bot_itr\/avatar\/79266763437_whatsapp.jpg

        if (true) {
            msg.attachments.push({
                "type": "image",
                "url": "img/b.png"
            })
        }

        const li = this.createBlock(msg);
        li.style.width = '0px';
        li.style.height = '0px';

        $('.msg').fadeOut("slow");
        setTimeout(() => {
            // $('.msg').remove();
            document.getElementById('lbMsg').appendChild(li);
            // $('.msg').fadeTo("slow", opacity);
            const img = li.querySelector('.msg-img');
            img.style.width = '0px';
            img.style.height = '0px';
            setTimeout(() => {
                li.style.width = li.dataset.width + 'px';
                li.style.height = li.dataset.height + 'px';
            }, 200);
            setTimeout(() => {
                img.style.width = img.dataset.width + 'px';
                img.style.height = img.dataset.height + 'px';
            }, 300);
            setTimeout(() => {
                li.style.animationName = 'fadeOutUp';
            }, 1000);
            // setTimeout(() => {
            //     li.remove();
            // }, 6000);
        }, pause);
    }

}