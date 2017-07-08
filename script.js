/*
* Declared in php:
* var game_mode = 0; 0->offline multiplayer, 1->online multiplayer, 2->bot
* var me; //1 or 2
* var gameid;
* */

var game, source, timeout, lose=0;
if(game_mode==1) {
    game = new Phaser.Game(800, 600, Phaser.CANVAS, 'HeX', {preload: preloadGame, create: createGame, update: updateGame, render: renderGame });
}
else {
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preloadMenu, create: createMenu });
}

//Main Menu

WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function() { game.time.events.add(Phaser.Timer.SECOND, createMenu, this); },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
        families: ['Revalia']
    }

};

function preloadMenu() {

    game.load.spritesheet('button', 'assets/menu_button.png', 600, 800);
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

}

function createMenu() {
    game.stage.backgroundColor = '#182d3b';

    var button = game.add.button(game.world.centerX - 150, 400, 'button', actionOnlineMulti, this, 2, 1, 0);
    button.width = 300;
    button.height = 80;
    var txt = game.add.text(game.world.x+70, game.world.y+80, "Online Multiplayer", {font: "40px Revalia", fill: "#ff0000"});
    button.addChild(txt);

    button.onInputOver.add(over, this);
    button.onInputOut.add(out, this);
    button.onInputUp.add(up, this);



    var button2 = game.add.button(game.world.centerX - 150, 300, 'button', actionOfflineSingle, this, 2, 1, 0);
    button2.width = 300;
    button2.height = 80;
    var txt2 = game.add.text(game.world.x+50, game.world.y+80, "Offline Single Player", {font: "40px Revalia", fill: "#ff0000"});
    button2.addChild(txt2);

    button2.onInputOver.add(over, this);
    button2.onInputOut.add(out, this);
    button2.onInputUp.add(up, this);



    var button3 = game.add.button(game.world.centerX - 150, 200, 'button', actionOfflineMulti, this, 2, 1, 0);
    button3.width = 300;
    button3.height = 80;
    var txt3 = game.add.text(game.world.x+70, game.world.y+80, "Offline Multiplayer" , {font: "40px Revalia", fill: "#ff0000"});
    button3.addChild(txt3);

    button3.onInputOver.add(over, this);
    button3.onInputOut.add(out, this);
    button3.onInputUp.add(up, this);

}

function up(button) {
    //console.log('button up', arguments);
}

function over(button) {
    button.width+=30;
    button.height+=10;
    button.x-=15;
    button.y-=5;
    //console.log('button over');
}

function out(button) {
    button.width-=30;
    button.height-=10;
    button.x+=15;
    button.y+=5;
    //console.log('button out');
}

function actionOfflineMulti () {
    game.destroy();
    game = new Phaser.Game(800, 600, Phaser.CANVAS, 'HeX', {preload: preloadGame, create: createGame, update: updateGame, render: renderGame });
}
function actionOnlineMulti() {
    var txt = game.add.text(game.world.centerX-140, 500, "Creating Online Game..." , {font: "20px Revalia", fill: "#ffffff"});
    $.post('index.php', {sse:'newGame'}, function($data, $status) {
        if($data!="error") {
            gameid = $data.split("gameid=")[1];
            //alert("Share this link with your opposition:\n" + $data);
            createModal("<strong>Share this link with your opposition:</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; " +
                "<a href='#' id='player2link'>" + $data + "</a>");
            txt.text = "Waiting For Opponent...";
            createEventListener();
        }
        else {
            alert("Something went wrong. Please try again later");
            txt.text = "Server Error Occured";
        }
    });

}
function actionOfflineSingle() {

}
//Main Menu ends


//game starts
var graphics;

//board variables
var recording_click = true;

var turn_player = 1;
var player1_last;
var player2_last;

var wrong_move = false;
var move_count = 0;

var cell = [];
var adj_list = [];
var adj_list2 = [];
var idx = 0;
var init_x = 250;
var init_y = 100;
var dimension = 20;
var row = 5;
var column = 5;
var spacing = 1;

var colors = {colors_unoccupied:0xffd8bf, colors_hover_default: 0x939aa5 ,colors_hover_player1:0x9bc1ff, colors_hover_player2:0xf97f7f, colors_player1:0x239cff, colors_player2:0xff2626}


function initGame() {
    //game starts
    graphics = null;

//board variables
    recording_click = true;

    turn_player = 1;
    player1_last;
    player2_last;

    wrong_move = false;
    move_count = 0;

    cell = [];
    adj_list = [];
    adj_list2 = [];
    idx = 0;
    init_x = 250;
    init_y = 100;
    dimension = 20;
    row = 5;
    column = 5;
    spacing = 1;

    colors = {colors_unoccupied:0xffd8bf, colors_hover_default: 0x939aa5 ,colors_hover_player1:0x9bc1ff, colors_hover_player2:0xf97f7f, colors_player1:0x239cff, colors_player2:0xff2626}
    game_mode = 0;  //0->offline multiplayer, 1->online multiplayer, 2->bot
}

function Cell(dimension, x, y, state, serial) {
    this.dimension = dimension;
    this.state = state;
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.serial = serial;
    
    var h = Math.sqrt(3)*dimension/2;
    this.poly  = new Phaser.Polygon([ new Phaser.Point(x-dimension, y), new Phaser.Point(x-dimension/2, y+h), new Phaser.Point(x+dimension/2, y+h), 
        new Phaser.Point(x+dimension, y), new Phaser.Point(x+dimension/2, y-h), new Phaser.Point(x-dimension/2, y-h)]);
    
    this.isAdjacent = function () {
        for (k = 0; k < adj_list[this.serial].length; k++) {
            if (cell[adj_list[this.serial][k]].state == turn_player) {
                return true;
            }
        }
        return false;
    };

    this.isAdjacent2ndOrder = function() {
        var flag = false;
        adj_list2[this.serial].forEach(function (node) {
            if(cell[node].state == turn_player) {
                flag = true;
            }
        });
        return flag;
    };
}

function preloadGame() {

    game.load.spritesheet('button', 'assets/menu_button.png', 600, 800);

}

function createGame() {
    //initGame();

    var button = game.add.button(game.world.centerX - 350, 500, 'button', actionOnExit, this, 2, 1, 0);
    button.width = 100;
    button.height = 60;
    var txt = game.add.text(game.world.x+70, game.world.y+50, "<< EXIT", {font: "80px Revalia", fill: "#ff0000"});
    button.addChild(txt);

    button.onInputOver.add(over, this);
    button.onInputOut.add(out, this);
    button.onInputUp.add(up, this);

    for(i = 1; i<row; i++) {
        for (j = 0; j < i; j++) {
            cell.push(new Cell(dimension, init_x+(column*.5+j-i*.5)*(3*dimension+2*spacing) , init_y+i*(Math.sqrt(3)*dimension/2+spacing), 0, idx));
            poly = cell[idx++].poly;

            graphics = game.add.graphics(0, 0);

            graphics.beginFill(colors.colors_unoccupied);
            graphics.drawPolygon(poly.points);
            graphics.endFill();
        }
    }
    init_y += row*(Math.sqrt(3)*dimension/2+spacing);
    for(i = 0; i<2*row-1; i++) {

        for (j = 0; j < column - (i%2==1 ? 1:0); j++) {
            cell.push(new Cell(dimension, (init_x + (i%2==1 ? (dimension*1.5+spacing):0)) + j*(3*dimension+2*spacing) , init_y+i*(Math.sqrt(3)*dimension/2+spacing), 0, idx));
            poly = cell[idx++].poly;

            graphics = game.add.graphics(0, 0);

            graphics.beginFill(colors.colors_unoccupied);
            graphics.drawPolygon(poly.points);
            graphics.endFill();
        }
    }
    for(i = 1; i<row; i++) {
        init_x += (dimension*1.5+spacing);
        for (j = 0; j < (column-i); j++) {
            cell.push(new Cell(dimension, init_x + j*(3*dimension+2*spacing) , init_y+(2*(row-1)+i)*(Math.sqrt(3)*dimension/2+spacing), 0, idx));
            poly = cell[idx++].poly;

            graphics = game.add.graphics(0, 0);

            graphics.beginFill(colors.colors_unoccupied);
            graphics.drawPolygon(poly.points);
            graphics.endFill();
        }
    }

    //adjacency precalculation
    var dist2 = (Math.sqrt(3)*dimension/2+2*spacing)*2;
    for(i=0; i<idx; i++) {
        adj_list.push([]);
        for(j=0, count=0; j<idx && count<7; j++) {
            x = cell[i].x-cell[j].x;
            y = cell[i].y-cell[j].y;
            if(Math.sqrt(x*x+y*y)<=dist2) {
                count++;
                adj_list[i].push(j);
            }//console.log(Math.sqrt(x*x+y*y) + " " + dist2);
        }
    }

    
    //2nd order adjacency list
    for(i=0; i<idx; i++) {
        adj_list2.push(new Set());
        for (k = 0; k < adj_list[i].length; k++) {
            var node = adj_list[i][k];
            for (l = 0; l < adj_list[node].length; l++) {
                adj_list2[i].add(adj_list[node][l]);
            }
        }
        for (l = 0; l < adj_list[i].length; l++) {
            adj_list2[i].delete(adj_list[i][l]);
        }
    }
    //console.log(adj_list2);

    cell[0].state = 1;
    cell[idx-1].state = 2;
    player1_last = 0;
    player2_last = idx-1;

    if(game_mode==1 && turn_player!=me)
    {
        //game.paused = true;
    }

    graphics.clear();
    graphics.beginFill(colors.colors_player1);
    graphics.drawPolygon(cell[0].poly.points);
    graphics.endFill();

    graphics.beginFill(colors.colors_player2);
    graphics.drawPolygon(cell[idx-1].poly.points);
    graphics.endFill();
}

function updateGame() {

    var found_move = false;
    var move_count_legacy = move_count;
    graphics.clear();
    if(game.input.activePointer.isUp) recording_click = true;
    for(i=0; i<idx; i++) {
        if(cell[i].state == 1) graphics.beginFill(colors.colors_player1);
        else if(cell[i].state == 2) graphics.beginFill(colors.colors_player2);
        else graphics.beginFill(colors.colors_unoccupied);
        
        if (cell[i].poly.contains(game.input.x, game.input.y))
        {
            if(game.input.activePointer.isDown && recording_click && !(game_mode==1 && turn_player!=me)) {
                makeMove(i);
                updateOpponent(i);
            }
            if(game_mode!=1) graphics.beginFill((turn_player==1 ? colors.colors_hover_player1:colors.colors_hover_player2));
            else if(turn_player==me) graphics.beginFill((me==1 ? colors.colors_hover_player1:colors.colors_hover_player2));
        }
        

        graphics.drawPolygon(cell[i].poly.points);
        graphics.endFill();
        if(cell[i].state==0 && (cell[i].isAdjacent() || cell[i].isAdjacent2ndOrder())) found_move = true;
    }
    //if(game_mode==1 && move_count_legacy<move_count) game.paused = true;
    if(!found_move) lose = turn_player;
}

function updateOpponent(move) {
    $.post('index.php?sse=update&state=send&gameid=' + gameid, {move_count:move_count, move:move}, function($data, $status) {
        if(!$data) {
            alert("Something went wrong. Please try again later");
        }
    });
}

function updateSelf(data) {
    try{
        var json = JSON.parse(data);
        if(json.move_count > move_count && makeMove(json.move));// game.paused = false;
    }
    catch (e) {
        console.log(e);
    }
}

function makeMove(i) {
    var adjacency = 0;
    if(cell[i].state!=0) {
        wrong_move = true;
        adjacency = -1;
    }
    if(adjacency==0 && cell[i].isAdjacent()) adjacency = 1;
    if(adjacency==0 && cell[i].isAdjacent2ndOrder()) adjacency = 2;

    if(adjacency>0) {
        wrong_move = false;
        for(k=0; k<adj_list[i].length; k++) cell[adj_list[i][k]].state=turn_player;
        if(adjacency==2) cell[(turn_player==1 ? player1_last:player2_last)].state = 0;

        if(turn_player == 1) player1_last = i;
        else player2_last = i;

        turn_player = (turn_player==1 ? 2:1);
        recording_click = false;

        move_count++;
        return true;
    }
    else wrong_move = true;
    return false;
}

function renderGame() {

    game.debug.text(game.input.x + ' x ' + game.input.y, 32, 32);
    if(lose==0) {
        if(game_mode!=1) game.debug.text("Player" + (turn_player==1 ? " Blue":" Red") + "'s Turn", 300, 32);
        else game.debug.text((turn_player==me ? "Your":"Opponent's") + " move", 300, 32);
    }
    else {
        game.debug.text("Player" + (lose==2 ? " Blue":" Red") + " WINS!!!", 300, 32);
    }
    if(wrong_move) game.debug.text("Invalid Move! Please Try Again", 250, 50);
}

function actionOnExit() {
    game.destroy();
    window.location.href = "http://" + window.location.hostname + "/hex";
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//multiplayer under the hood comms

if(game_mode==1 && me==2) createEventListener();

function createEventListener() {
    if(typeof(EventSource) !== "undefined") {
        if(me==1)  {
            source = new EventSource("index.php?sse=update&state=waitingforplayer2&gameid=" + gameid);
            timeout = Date.now;
        }
        else source = new EventSource("index.php?sse=update&state=update_board&gameid=" + gameid);
        source.onmessage = function(event) {
            //update event.data to board (done)
            if(event.data == "player2joined") {
                source.close();
                source = new EventSource("index.php?sse=update&state=update_board&gameid=" + gameid);
                source.onmessage = function(e) {console.log(e.data);
                    updateSelf(e.data);
                }

                game.destroy();
                game = new Phaser.Game(800, 600, Phaser.CANVAS, 'HeX', {preload: preloadGame, create: createGame, update: updateGame, render: renderGame });
                me = 1;
                game_mode=1;
            }
            else if(event.data == "waitingforplayer2") {
                var tmp = Date.now()-timeout;
                // nothing in my mind
            }
            else { console.log(event.data);
                updateSelf(event.data);
            }
        };
    }
    else {
        alert("Online multiplayer mode is not supported by your browser. Please use a newer browser.");
    }
}


// var src = new EventSource("index.php?sse=update&state=waitingforplayer2&gameid=1");
// src.onmessage = function (event) {
//     console.log(event.data);
// }

function createModal(msg) {
    // Get the modal
    var modal = document.getElementById('myModal');

// Get the button that opens the modal
    var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

// When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

// When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    $("#modal-msg").html(msg);
    modal.style.display = "block";

    document.getElementById("copy-link").onclick = function() {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val($("#player2link").text()).select();
        document.execCommand("copy");
        $temp.remove();
        $("#copy-link").html("Link Copied")
    }
}