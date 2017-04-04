//a list of clients that might report populations on the 'map'
var socket = io();

// Handle socket events here
//--------------------------
// Adds to the debug list
socket.on('debug', data => {
    var time = new Date();
    $('#debugLogList').append('<div>' + time + ': ' + data.type + ' | ' + data.msg + '</div>');

    if (data.type === 'UPDATE') {
        console.log(data);
        var msg = JSON.parse(data.msg);
        if (!clients[data.client]) clients[data.client] = {};
        clients[data.client].count = msg.count;
        clients[data.client].max = msg.max;
        render();
    }
});

// Handle any canvas code here
//----------------------------
var canv = $('#grid')[0];



function render() {

        // canv.width = canv.clientWidth;
        // canv.height = canv.width;
        // var keys = Object.keys(clients);
        // var px = canv.height / 100;
        // var width = canv.width / px;
        // var ctx = canv.getContext('2d');
        // ctx.fillStyle = "white";
        // ctx.beginPath();
        // ctx.rect(0, 0, 100 * px, 100 * px);
        // ctx.fill();
        // for (var i = 0; i < keys.length; i++) {
        //     var key = keys[i];
        //     var client = clients[key];
        //     if (client.count < 1) continue;
        //     var x = (i % 10) * 10 + 5 + (width - 100) / 2;
        //     var y = Math.floor(i / 10) * 10 + 5;
        //     var radius = 1 + client.count / 4;
        //     ctx.fillStyle = "green";
        //     if (client.count > client.max) ctx.fillStyle = "red";
        //     ctx.beginPath();
        //     ctx.ellipse(x * px, y * px, radius * px, radius * px, 0, Math.PI * 2, false);
        //     ctx.fill();
        // }
}