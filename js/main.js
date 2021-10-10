var temp = 0;
var curr = 1; // Keep track of the current box
var gravity = 5; // Used to control the speed the boxes fall at
var on_screen = 1; //Keep track of how many boxes are on the screen
var test = 0;

// Variables to deal with the score
var height = 0; //Players current height
var max_height = 0; // Players heighest height
var previous_Score = 0;
var score = 0;
var level = 1; // Level

var count = 0;
var jump_height = 130;
var jump_speed = 5;
var fall_speed = 5;
var counter = 3; //Counter used at the start of the game
var timer = 0;

var started = false; //Check if the game has started
var stopped = false;
var on_block = false; //Player is on top of a block
var jumping = false;
var moving = false;
var start = false;
// var dropped_all_blocks = false;
var completed_game = false;
var jumpId;
var fall_id;
var fall_id2;
var game_id;
var menu_id;
var falling = false;

// ----------- Buttons -------------
var musicbutton = {
	x: 15,
	y: 15,
	sizeX: 16,
	sizeY: 23,
	text: "",
	col: "black",
	textX: 145,
};
var soundbutton = {
	x: 40,
	y: 15,
	sizeX: 16,
	sizeY: 23,
	text: "",
	col: "grey",
	textX: 145,
};

// ------------ Pictures ------------
var music_on = new Image();
music_on.src = "img/menu/music.jpg";
var music_off = new Image();
music_off.src = "img/menu/nomusic.jpg";
var sound_on = new Image();
sound_on.src = "img/menu/sound.jpg";
var sound_off = new Image();
sound_off.src = "img/menu/nosound.jpg";

// ------------ Sounds ---------------
var menutune = new buzz.sound("sounds/menu", {
	formats: ["wav", "mp3"],
	preload: true,
	loop: true,
});

var jumpTune = new buzz.sound("sounds/jumping", {
	formats: ["wav", "mp3"],
	preload: true,
});

var squishTune = new buzz.sound("sounds/squish", {
	formats: ["wav", "mp3"],
	preload: true,
});

var musicvolume = 1.0;
var sfxvolume = 1.0;
var mouse_x = 0;
var mouse_y = 0;
var boxes = []; //array to hold the things we might collide with

// a constructor for a box class
function Box(x_loc, y_loc, wid, hig, col) {
	this.x = x_loc;
	this.y = y_loc;
	this.w = wid;
	this.h = hig;
	this.colour = col; // default is a black box
}
c_canvas = document.getElementById("GameCanvas");
ctx = c_canvas.getContext("2d");
//Snow variables
var delay = 150;
var snow_height;
var snow_width = c_canvas.width;
var snow_colour = "white";
var snow_speed = 0.08;
c_canvas.addEventListener("mousemove", seenmotion, false);
c_canvas.addEventListener("click", seenaclick, false);

function start_game() {
	boxes.length = 0;
	stopped = false;
	started = false;
	moving = false;
	start = false;
	jumping = false;
	level = 1;
	timer = 0;
	counter = 3;
	curr = 1;
	on_screen = 1;
	height = 0;
	max_height = 0;
	delay = 150;
	snow_height = 0 + delay;
	snow_speed = 0.08;
	var player = new Box(
		c_canvas.width / 2,
		c_canvas.height - 20,
		20,
		20,
		"#f00"
	);
	boxes.push(player);
	menu_id = setInterval(menu_loop, 100);
}

function menu_loop() {
	c_canvas.width = c_canvas.width;
	music_button();
	sound_button();
	if (!started) {
		ctx.font = "30px Arial";
		ctx.fillStyle = "#0b607c";
		ctx.textAlign = "right";
		if (get_localstorage_item("high") == null) {
			add_to_localstorage("high", 0);
		} else if (score > get_localstorage_item("high")) {
			add_to_localstorage("high", score);
		}
		ctx.fillText(
			"High-Score: " + get_localstorage_item("high"),
			c_canvas.width - 40,
			40
		);
		ctx.font = "100px Permanent Marker";
		ctx.fillStyle = "#0b607c";
		ctx.textAlign = "center";
		ctx.fillText("AVALANCHE", c_canvas.width / 2, 200);

		ctx.font = "30px Arial";
		ctx.fillStyle = "#0b607c";
		ctx.textAlign = "center";
		ctx.fillText("Click to play!", c_canvas.width / 2, 300);
		ctx.fillText("Score - " + score, c_canvas.width / 2, 400);
		if (completed_game) {
			ctx.fillText(
				"Congratulations You Have Completed the Game!",
				c_canvas.width / 2,
				440
			);
		}
	} else {
		completed_game = false;
		clearInterval(menu_id);
		counter_id = setInterval(draw_counter, 1000);
	}
}

function draw_counter() {
	c_canvas.width = c_canvas.width;
	music_button();
	sound_button();
	ctx.textAlign = "center";
	ctx.font = "30px Arial";
	ctx.fillStyle = "#0b607c";
	ctx.fillText("Get Ready!", c_canvas.width / 2, c_canvas.height / 2 - 40);
	ctx.fillText(counter, c_canvas.width / 2, c_canvas.height / 2);
	ctx.font = "40px Arial";
	if (level > 3) {
		lvl = "Freeplay";
	} else {
		lvl = level;
	}
	ctx.fillText(
		"Level - " + lvl,
		c_canvas.width / 2,
		c_canvas.height / 2 + 70
	); //Display Level
	counter--;
	if (counter < 0) {
		clearInterval(counter_id);
		new_blocks(); // Make new blocks
		start = true;
		stopped = false;
		game_id = setInterval(game_loop, 10);
	}
}

function game_loop() {
	c_canvas.width = c_canvas.width;
	music_button();
	sound_button();
	if (level == 1) guidance();
	//Snow
	if (boxes[0].y + boxes[0].h <= 0) {
		console.log("Reach top");
		clearInterval(jumpId);
		clearInterval(game_id);
		completed_level();
	} else if (boxes[0].y >= c_canvas.height + snow_height) {
		if (!(typeof jumpId === "undefined")) clearInterval(jumpId);
		if (!(typeof fall_id === "undefined")) clearInterval(fall_id);
		dead();
		clearInterval(game_id);
		return;
	}
	snow_fall();
	//Height
	ctx.font = "30px Arial";
	ctx.fillStyle = "#0b607c";
	ctx.textAlign = "right";
	ctx.fillText(height + "FT", c_canvas.width - 10, 30);
	ctx.fillText(max_height + "FT", c_canvas.width - 10, 60);
	ctx.fillText("Score-" + score, c_canvas.width - 10, 90);
	drop_block();
}
function snow_fall() {
	snow_height -= snow_speed;
	ctx.fillStyle = snow_colour;
	//x, y, w, h
	ctx.fillRect(0, c_canvas.height, snow_width, snow_height);
}

// This function will offer guidance to the user
function guidance() {
	ctx.font = "25px Arial";
	ctx.fillStyle = "white";
	if (timer < 500) {
		ctx.fillText("Move the mouse to move left and right", 150, 100);
	} else if (timer < 1000) {
		ctx.fillText("Click the left mouse button to jump", 150, 100);
	} else if (timer < 1500) {
		ctx.fillText("Avoid the blocks as they fall", 150, 100);
	} else if (timer < 2000) {
		ctx.fillText("Reach the top before the snow catches you", 150, 100);
	}
	timer++;
}

function new_blocks() {
	var n = 50;
	for (i = 1; i < n + 1; i++) {
		var big = 100;
		var small = 50;
		if (Math.random() > 0.5) {
			var length = big;
		} else {
			var length = small;
		}
		var xpos = Math.floor(Math.random() * (c_canvas.width - length)) + 1;
		//(x , y, w, h)
		var a = new Box(xpos, 0 - length, length, length, "#000");
		boxes.push(a);
	}
}

function drop_block() {
	//Check if current box collides with another
	if (collides(boxes[curr], curr)) {
		if (!stopped) {
			boxes[curr].y = boxes[temp].y - boxes[curr].h;
			if (on_screen + 1 < boxes.length) {
				on_screen++;
				curr++;
			}
		} else {
			return;
		}
	}
	//otherwise check if it hits the ground
	else if (boxes[curr].y < c_canvas.height - boxes[curr].h) {
		boxes[curr].y += gravity; // Drop the block if its not on ground
	} else {
		//If on the ground
		boxes[curr].y = c_canvas.height - boxes[curr].h;
		if (on_screen + 1 < boxes.length) {
			on_screen++;
			curr++;
		}
	}
	for (i = 0; i <= on_screen; i++) {
		ctx.fillStyle = boxes[i].colour;
		ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
	}
}

function seenmotion(e) {
	//make sure it not moving
	if (stopped) return;
	if (moving) return;
	var bounding_box = c_canvas.getBoundingClientRect();
	mouse_x =
		(e.clientX - bounding_box.left) * (c_canvas.width / bounding_box.width);
	mouse_y =
		(e.clientY - bounding_box.top) *
		(c_canvas.height / bounding_box.height);
	boxes[0].x = mouse_x;
	if (!falling) check_if_player_falls_off_box();
}

function check_if_player_falls_off_box() {
	//if it falls of the left
	if (on_block && boxes[0].x < boxes[test].x - boxes[0].w) {
		falling = true;
		fall_id2 = setInterval(fall, 10);
	}
	//if it falls off the right
	else if (on_block && boxes[0].x > boxes[test].x + boxes[test].w) {
		falling = true;
		fall_id2 = setInterval(fall, 10);
	}
}

// If a click is spotted make the player jump
function seenaclick(e) {
	if (check_button(musicbutton)) {
		if (get_localstorage_item("music") == "true") {
			add_to_localstorage("music", false);
		} else {
			add_to_localstorage("music", true);
		}
	} else if (check_button(soundbutton)) {
		if (get_localstorage_item("sound") == "true") {
			add_to_localstorage("sound", false);
		} else {
			add_to_localstorage("sound", true);
		}
	} else if (!started) {
		// if (jumping == false && start && !stopped && level > 1) {
		//   count = 0;

		//   jumpId = setInterval(jump, 10);
		// }
		started = true; // Start the game
	} else if (jumping == false && start && !stopped && !falling) {
		count = 0;
		jumpTune.play().setVolume(20 * sfxvolume);
		jumpId = setInterval(jump, 10);
	}
	//menutune.setVolume(10 * musicvolume); //set volume
}

function jump() {
	console.log(
		"Count = " +
			count +
			" Box = " +
			boxes[0].y +
			" Height = " +
			(c_canvas.height - boxes[0].h)
	);
	jumping = true;
	on_block = false;
	boxes[0].y -= jump_speed;
	count += jump_speed;
	height += jump_speed;
	if (max_height < height) max_height = height;
	score = previous_Score + max_height;
	if (count > jump_height) {
		clearInterval(jumpId);
		fall_id = setInterval(fall, 10);
	}
}

function fall() {
	falling = true;
	console.log("fall");
	if (boxes[0].y >= c_canvas.height - boxes[0].h) {
		//If the player hits the ground
		console.log("fall ground");
		boxes[0].y = c_canvas.height - boxes[0].h;
		height = 0;
		jumping = false;
		on_block = false;
		falling = false;
		clearInterval(fall_id);
		clearInterval(fall_id2);
	} else if (on_top()) {
		//if the player lands on a block
		console.log("fall block");
		on_block = true;
		jumping = false;
		boxes[0].y = boxes[test].y - boxes[0].h;
		falling = false;
		clearInterval(fall_id);
		clearInterval(fall_id2);
	} else {
		//if neither keep falling
		console.log("fall more");
		boxes[0].y += fall_speed;
		height -= fall_speed;
	}
}

function on_top() {
	var box1left = boxes[0].x;
	var box1right = boxes[0].x + boxes[0].w;
	if (on_screen < 2) return false;
	for (i = 1; i <= on_screen; i++) {
		var box2left = boxes[i].x;
		var box2right = boxes[i].x + boxes[i].w;
		if (box1right < box2left) continue;
		if (box1left > box2right) continue;
		if (boxes[0].y == Math.ceil(boxes[i].y / 10) * 10 - boxes[0].h) {
			test = i;
			return true;
		}
	}
	return false;
}

function collides(box1, curr) {
	for (i = on_screen - 1; i >= 0; i--) {
		if (i == curr) {
			continue;
		}
		var box1top = box1.y;
		var box1bottom = box1.y + box1.h;
		var box1left = box1.x;
		var box1right = box1.x + box1.w;

		var box2top = boxes[i].y;
		var box2bottom = boxes[i].y + boxes[i].h;
		var box2left = boxes[i].x;
		var box2right = boxes[i].x + boxes[i].w;

		if (box1bottom < box2top) continue; //return(false);
		if (box1top > box2bottom) continue; //return (false);
		if (box1right < box2left) continue; // return (false);
		if (box1left > box2right) continue; //return (false);

		temp = i;
		if (temp == 0) {
			if (!(typeof jumpId === "undefined")) clearInterval(jumpId);
			if (!(typeof fall_id === "undefined")) clearInterval(fall_id);
			dead();
			clearInterval(game_id);
		}
		return true; //collision
	}
	return false; //no collision
}

function dead() {
	squishTune.play().setVolume(100 * sfxvolume);
	stopped = true;
	started = false;
	jumping = false;
	counter = 3;
	curr = 1;
	on_screen = 1;
	max_height = 0;
	var player = new Box(
		c_canvas.width / 2,
		c_canvas.height - 20,
		20,
		20,
		"#f00"
	);
	boxes.length = 0;
	boxes.push(player);
	snow_height = 0 + delay;
	menu_id = setInterval(menu_loop, 100);
	//start_game();
}

function completed_level() {
	level++;
	if (level > 3) {
		finished_game();
	} else {
		// Set up variables
		stopped = true;
		start = false;
		jumping = false;
		counter = 3;
		curr = 1;
		on_screen = 1;
		height = 0;
		previous_Score += score;
		max_height = 0;
		gravity += 2;
		boxes.length = 0;
		var player = new Box(
			c_canvas.width / 2,
			c_canvas.height - 20,
			20,
			20,
			"#f00"
		);
		boxes.push(player);
		delay -= 50;
		snow_height = 0 + delay;
		snow_speed += 0.02;
		counter_id = setInterval(draw_counter, 1000);
	}
}

function finished_game() {
	console.log("finished");
	completed_game = true;
	started = false;
	previous_Score += score;
	stopped = true;
	start = false;
	jumping = false;
	counter = 3;
	curr = 1;
	on_screen = 1;
	height = 0;
	max_height = 0;
	gravity = 6;
	boxes.length = 0;
	var player = new Box(
		c_canvas.width / 2,
		c_canvas.height - 20,
		20,
		20,
		"#f00"
	);
	boxes.push(player);
	delay = 20;
	snow_height = 0 + delay;
	snow_speed = 0.3;

	menu_id = setInterval(menu_loop, 100);
}

/*-----------------------------------------
				Menu/Buttons
------------------------------------------*/
function music_button() {
	if (get_localstorage_item("music") == null) {
		add_to_localstorage("music", true);
		music_on_off = music_on;
		musicvolume = 1.0;
	} else if (get_localstorage_item("music") == "true") {
		music_on_off = music_on;
		musicvolume = 1.0;
	} else {
		music_on_off = music_off;
		musicvolume = 0.0;
	}
	ctx.drawImage(music_on_off, 15, 15);
	menutune.play().setVolume(20 * musicvolume);
}

function sound_button() {
	if (get_localstorage_item("sound") == null) {
		add_to_localstorage("sound", true);
		sound_on_off = sound_on;
		sfxvolume = 1.0;
	} else if (get_localstorage_item("sound") == "true") {
		sound_on_off = sound_on;
		sfxvolume = 1.0;
	} else {
		sound_on_off = sound_off;
		sfxvolume = 0.0;
	}
	ctx.drawImage(sound_on_off, 40, 15);
}

function check_button(button) {
	var top = { x: button.x + button.sizeX / 2, y: button.y };
	var right = { x: button.x + button.sizeX, y: button.y + button.sizeY / 2 };
	var bottom = { x: button.x + button.sizeX / 2, y: button.y + button.sizeY };
	var left = { x: button.x, y: button.y + button.sizeY / 2 };

	if (check_mouse_menu(top, right, bottom, left) == true) {
		return true;
	} else {
		return false;
	}
}

function check_mouse_menu(top, right, bottom, left) {
	if (
		top.y <= mouse_y &&
		bottom.y >= mouse_y &&
		right.x >= mouse_x &&
		left.x <= mouse_x
	) {
		return true;
	} else {
		return false;
	}
}

/*---------------------------------------
            Local Storage
-----------------------------------------*/
//This function tests whether localstorage works.
function supports_html5_storage() {
	try {
		return "localStorage" in window && window["localStorage"] !== null;
	} catch (e) {
		return false;
	}
}

function add_to_localstorage(key, val) {
	if (supports_html5_storage()) {
		var k = key;
		var v = val;
		if (k == null || v == null) {
			return;
		}
		localStorage.setItem(k, v);
	}
}

function delete_something_from_localstorage(key) {
	if (supports_html5_storage()) {
		localStorage.removeItem(key);
	}
}

function get_localstorage_item(key) {
	if (supports_html5_storage()) {
		return localStorage.getItem(key);
	}
}

/*----------------------------------------------------
				Alternative Controls
-----------------------------------------------------*/

document.onkeydown = function (event) {
	var keyCode;
	if (event == null) {
		keyCode = window.event.keyCode;
	} else {
		keyCode = event.keyCode;
	}
	console.log(keyCode);
	switch (keyCode) {
		// Left
		case 37:
			move_left();
			break;
		// right
		case 39:
			move_right();
			break;
		// Jump
		case 32:
			if (jumping == false && start && !stopped) {
				//Make sure player is not currently jumping
				count = 0;
				jumpId = setInterval(jump, 10);
			}
			break;
		default:
			break;
	}
};

function move_left() {
	if (stopped) return;
	if (moving) return;
	boxes[0].x -= 15;
	check_off_screen();
	check_if_player_falls_off_box();
}

function move_right() {
	if (stopped) return;
	if (moving) return;
	boxes[0].x += 15;
	check_off_screen();
	check_if_player_falls_off_box();
}

function check_off_screen() {
	if (boxes[0].x > c_canvas.width - boxes[0].w) boxes[0].x = 0; //c_canvas.width - boxes[0].w;
	if (boxes[0].x < 0) boxes[0].x = c_canvas.width - boxes[0].w;
}
