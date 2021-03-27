var jam = document.getElementById('jam')
var h1 = document.querySelector('.left-show')
var p = document.querySelector('.p-left-show')


function list(){
    jam.innerHTML = `
    <img src="img/a.png" alt="">
    <div class="message-info">
        <h1>Арина Л.</h1>
        <p>Желаю всем конкурсантам победы, в первую очередь - над собой!</p>
    </div>
`;
 jam.className = 'message'
}

window.onload = () => {
    setTimeout(() => {
        list()
    }, 7000);
    setTimeout(() => {
        h1.className = 'left-hide'
    }, 6500);
    setTimeout(() => {
        p.className = 'p-left-hide'
    }, 6000);
}