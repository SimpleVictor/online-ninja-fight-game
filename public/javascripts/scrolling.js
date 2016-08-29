function gotoBottom(){
   var div = document.getElementById("#msgList");
   div.scrollTop = div.scrollHeight - div.clientHeight;
}

gotoBottom();