// ---------- INIT VARIABLES ----------
//init user variables
let user = {},

// Init page variables
prevPages = [],

// Init client variables
clients,
clientsList,
selectedClient,
currentClient = {},

// Init event variables
calEvents = [],
eventsList,
firstEvent,

// Init calendar variables
selectedDate = (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/' + new Date().getFullYear(),
selectedTimeStart,
selectedTimeEnd,

// Init canvas array
canvasArr = {},





// ---------- Html code of common DOM elements ----------
// Init html code of the loading icon
loadingIcon = "<div class='cssload-container'><div class='cssload-progress cssload-float cssload-shadow'><div class='cssload-progress-item'></div></div></div>",

// Init html code of the main page
textMainPage = "<div class='mainContainer'>" +
					"<button class='buttonPageSelect commonButton' onclick='newClientPage();'>Новый клиент</button>" +
					"<button class='buttonPageSelect commonButton' onclick='clientsListPage();'>Список клиентов</button>" +
					"<button class='buttonPageSelect commonButton' onclick='calendarPage();'>Календарь</button>" +
				"</div>",

// Init html code of the login page
textHeaderLoginPage = "<div class='header' style='z-index:1053;'><div class='headerTextLogin'>Lashmaker v0.1 alpha</div></div>",

// Init html code of the registration page
textHeaderRegPage = "<div class='header'><div class='headerTextLogin'>Lashmaker v0.1 alpha</div></div>";

// Init html code of the main page header
function textHeaderMainPage(login) {
	return (
		"<div class='header' style='z-index:1053;'>" +
			`<div class='headerText' role='button' onclick='logOut();'>${login}</div>` +
			"<img class='iconUser' role='button' onclick='logOut();' src='images/user.png'>" +
		"</div>"
	);
};

// Init html code of common header
function textHeader(login) {
	return (
		"<div class='header'>" +
			`<div class='headerText' role='button' onclick='logOut();'>${login}</div>` +
			"<img class='iconUser' role='button' onclick='logOut();' src='images/user.png'>" +
		"</div>"
	);
};

// Init html code of the backward button
function textBackwardButton() {
	return (
		`<button class='mainPageButton' onclick='mainPage(); img='images/back.png'></button>`
	);
}





// ---------- INITIALIZATION ----------
// Init function
initialization();

// Call init function
function initialization() {
	// console.log(document.cookie);
	loginPage();
}





// ---------- SECONDARY FUNCTIONS ---------
function getClients() {
	$.ajax({
		url: "/getClients",
		method: "POST",
		success: function(response) {
			setTimeout(() => {
				clients = response;
				createClientsList();
			}, 100);
		}
	});
}

function getEvents() {
	$.ajax({
		url: "/getEvents",
		method: "POST",
		success: function(response) {
			setTimeout(() => {
				calEvents = response;
			}, 100);
		}
	});
}

function goToPrevPage() {
	// Init previous page name variable
	let nameOfPrevPage;

	// Check if the name of the current page is in the array to avoid looping
	for (let i = prevPages.length - 1; i >= 0; i--) {
		if (prevPages[0] == prevPages[i]) {
			prevPages.splice(0, i);
			i = -1;
		}
	}

	// Set the name of the previous page
	nameOfPrevPage = prevPages[1];

	// Clear array 'Previous pages' if the main page
	if (nameOfPrevPage == 'mainPage') prevPages = [];

	$('.select2-dropdown').remove();

	// Call function of previous page
	window[nameOfPrevPage]();
}





















// setTimeout(() => {

// }, 100);





// function listenerEventButtons() {
// 	let mousedown = 0;
// 	let mouseup = 0;
// 	$('.event-container').mousedown(function() {
// 		console.log('down');
// 		mouseup = 0;
// 		mousedown = 1;
// 		$('.event-container').mouseup(function() {
// 			console.log('up');
// 			mouseup = 1;
// 		});
// 		setTimeout(() => {
// 			if (mousedown != mouseup) {
// 				let temp = $(this).attr('data-event-index');
// 				$(`[data-event-index=${temp}]`).append("<button class='deleteEvent' onclick='deleteEvent()'>Удалить</button>");
// 				console.log(temp);
// 			}
// 		}, 700);
// 	});
// }

// let interval = 5;
// let intervalStart = true;
// let intervalEnd = false;
// if (intervalStart == true) {
// 	intervalStart = false;
// 	setTimeout(() => {
// 		intervalEnd = true;
// 	}, interval);
// }

// if (intervalEnd == true || numOfAreasPrev == 0) {
// 	intervalStart = true;
// 	intervalEnd = false;
// 	console.log(interval);
// }

//console.time('mark');
//console.timeEnd('mark');
// let t0 = performance.now();
// let t1 = performance.now();
// console.log(t1 - t0);