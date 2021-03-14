document.getElementById('nav').onmouseover = function(event){
    var target = event.target;
    if(target.className == 'menu-item'){
        var s = target.getElementsByClassName('sub-menu');
        closemenu()
        s[0].style.display = 'block'
    }
}

// document.onmouseover = function (event){
//     var target = event.target
//     if(target.className!='menu-item' && target.className!='sub-menu' && target.className!='nav'){
//         closemenu()
//     }
// }

function closemenu(){
    var menu = document.getElementById('nav');
    var subm = document.getElementsByClassName('sub-menu');
    for(var i = 0; i < subm.length; i++){
        subm[i].style.display = 'none'
    }
}
