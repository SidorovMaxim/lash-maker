// ---------- PAGES ----------
// Login page
function loginPage() {
	prevPages.unshift('loginPage');

	// Generate this page
	$('.header').replaceWith(textHeaderLoginPage);
	$('.mainContainer').empty().append(
		"<textarea class='clientInfoArea' id='login' maxlength='31' cols='31' rows='1' placeholder='Логин или e-mail'>max@mail.ru</textarea>" +
		"<textarea class='clientInfoArea' id='password' maxlength='31' cols='31' rows='1' placeholder='Пароль'>max.12345</textarea>" +
		"<button class='buttonLoginPage commonButton' onclick='loginIn();'>Войти</button>" +
		"<div><button class='buttonRegPage' onclick='regPage();'>Регистрация</button></div>"
	);
}

// Registration page
function regPage() {
	prevPages.unshift('regPage');

	// Generate this page
	$('.header').replaceWith(textHeaderRegPage);
	$('.mainContainer').empty().append(
		"<textarea class='clientInfoArea' id='login' maxlength='31' cols='31' rows='1' placeholder='Логин'>maxim</textarea>" +
		"<textarea class='clientInfoArea' id='email' maxlength='31' cols='31' rows='1' placeholder='E-mail'>max@mail.ru</textarea>" +
		"<textarea class='clientInfoArea' id='password' maxlength='31' cols='31' rows='1' placeholder='Пароль'>max.12345</textarea>" +
		"<textarea class='clientInfoArea' id='passwordConfirm' maxlength='31' cols='31' rows='1' placeholder='Подтверждение пароля'>max.12345</textarea>" +
		"<button class='buttonLoginPage commonButton' onclick='createAccount();'>Зарегистрироваться</button>"
	);
}

// Main page
function mainPage() {
	prevPages.unshift('mainPage');

	// Generate this page
	$('.header').remove();
	$('.headerContainer').append(textHeaderMainPage(user.login));
	$('.mainContainer').replaceWith(textMainPage);
}

// Page 'New client'
function newClientPage() {
	prevPages.unshift('newClientPage');

	// Set loading screen
	$('.header').replaceWith(textHeader(user.login));
	$('.mainContainer').replaceWith(
		"<div class='mainContainer'>" +
			"<div class='processContainer blocker'>" +
				`${loadingIcon}<div class='loading'>Страница загружается</div>` +
			"</div>" +
		"</div>"
	);

	// Get array 'clients'
	$.ajax({
		url: "/getClients",
		method: "POST",
		data: {
			user
		},
		success: function(response) {
			setTimeout(() => {
				// Update array 'clients'
				clients = response;

				// Generate this page
				$('.mainContainer').replaceWith(
					"<div class='mainContainer'>" +
						"<textarea class='clientInfoArea' id='fullName' maxlength='31' cols='31' rows='1' placeholder='ФИО клиента'></textarea>" +
						"<textarea class='clientInfoArea' id='phoneNumber' maxlength='31' cols='31' rows='1' placeholder='Номер телефона'></textarea>" +
						"<button class='buttonSaveNewClient commonButton' onclick='saveNewClient()'>Сохранить</button>" +
					"</div>"
				);

				// Create listeners of client info areas
				$('#fullName').bind('input propertychange', function() {
					$('#fullName').val($('#fullName').val().replace(/[^а-яёa-z ]/gi, ''));
				});
				$('#phoneNumber').bind('input propertychange', function() {
					$('#phoneNumber').val('+' + $('#phoneNumber').val().replace(/\D/g, ''));
				});
			}, 100);
		}
	});
}

// Page 'List of clients'
function clientsListPage() {
	prevPages.unshift('clientsListPage');

	// Set loading screen
	$('.header').replaceWith(textHeader(user.login));
	$('.mainContainer').replaceWith(
		"<div class='mainContainer'>" +
			"<div class='processContainer blocker'>" +
				`${loadingIcon}<div class='loading'>Список клиентов загружается</div>` +
			"</div>" +
		"</div>"
	);

	// Get array 'clients'
	$.ajax({
		url: "/getClients",
		method: "POST",
		data: {
			user
		},
		success: function(response) {
			setTimeout(() => {
				// Update array clients
				clients = response;

				// Create clients list
				createClientsList();

				// Activate clients list
				$('.processContainer').replaceWith(createSelectList(clientsList, 'clientsList', "onchange='selectClient()'"));
				activateSelectList('clientsList', 'Введите имя клиента', '90%', 2);
			}, 100);
		}
	});
}

// Page 'Existing client'
function clientPage() {
	prevPages.unshift('clientPage');

	// Find data of current client in array 'clients'
	currentClient = {};
	for (let i = 0; i < clients.length; i++) {
		if (clients[i].fullName == selectedClient) {
			currentClient = clients[i];
			i = clients.length;
		}
	}

	// Clear events list
	eventsList = '';

	// Events exist
	if (currentClient.events.length != 0) {

		firstEvent = `${currentClient.events[0].date} ${currentClient.events[0].description}`;

		for (let i = 0; i < currentClient.events.length; i++) {
			eventsList = eventsList +
						`<option value='${currentClient.events[i].id}'>` +
						`${currentClient.events[i].date} ` +
						`${currentClient.events[i].description}</option>`;
		}

	// Events not exist
	} else {
		firstEvent = 'Добавьте запись в календаре';
	}

	// Generate this page
	$('.header').replaceWith(textHeader(user.login));
	$('.mainContainer').replaceWith(
		"<div class='mainContainer'>" +

			"<div class='buttonsContainer'>" +
				"<button class='editButton buttonClientPage' onclick='editClient();'>Редактировать</button>" +
				"<button class='deleteButton buttonClientPage' onclick='deleteClient();'>Удалить</button>" +
			"</div>" +

			`<textarea class='lockedClientInfoArea' id='fullName' maxlength='31' cols='31' rows='1' readonly>${currentClient.fullName}</textarea>` +
			`<textarea class='lockedClientInfoArea' id='phoneNumber' maxlength='31' cols='31' rows='1' readonly>${currentClient.phoneNumber}</textarea>` +

			`<div class='title1'>Список записей:</div>` +
			createSelectList(eventsList, 'eventsList') +

			"<button class='buttonPageSelect commonButton' onclick='eyelashSchemesSelectPage();'>Редактор схем</button>" +

		"</div>"
	);

	// Activate events list
	activateSelectList('eventsList', firstEvent, '90%', -1);

	// Create listeners of client info areas
	$('#fullName').bind('input propertychange', function() {
		$('#fullName').val($('#fullName').val().replace(/[^а-яёa-z ]/gi, ''));
	});
	$('#phoneNumber').bind('input propertychange', function() {
		$('#phoneNumber').val('+' + $('#phoneNumber').val().replace(/\D/g, ''));
	});
}

// Page 'Eyelash scheme select'
function eyelashSchemesSelectPage() {
	prevPages.unshift('eyelashSchemesSelectPage');

	// Generate this page
	$('.mainContainer').empty().append(
		"<button class='buttonPageSelect commonButton' onclick='newEyelashScheme();'>Новая схема</button>" +
		"<button class='buttonPageSelect commonButton' onclick='eyelashSchemesListPage();'>Список схем</button>"
	);
}

// Page 'List of eyelash schemes'
function eyelashSchemesListPage() {
	prevPages.unshift('eyelashSchemesListPage');

	// Set loading screen
	$('.header').replaceWith(textHeader(user.login));
	$('.mainContainer').replaceWith(
		"<div class='mainContainer'>" +
			"<div class='processContainer blocker'>" +
				`${loadingIcon}<div class='loading'>Список клиентов загружается</div>` +
			"</div>" +
		"</div>"
	);
	
	// Update current client data
	for (let i = 0; i < clients.length; i++) {
		if (currentClient.fullName == clients[i].fullName) {
			currentClient = clients[i];
			i = clients.length;
		}
	}

	// Create eyelash schemes list
	let eyelashSchemesList = '';
	for (let i = 0; i < currentClient.eyelashSchemes.length; i++) {
		eyelashSchemesList = eyelashSchemesList + `<option value='${currentClient.eyelashSchemes[i].name}'>${currentClient.eyelashSchemes[i].name}</option>`;
	}

	// Activate eyelash schemes list
	$('.processContainer').replaceWith(createSelectList(eyelashSchemesList, 'eyelashSchemesList', "onchange='selectEyelashScheme();'"));
	activateSelectList('eyelashSchemesList', 'Введите название схемы', '90%', 2);
}

// Page 'Eyelash scheme'
function eyelashSchemePage(operation) {
	prevPages.unshift('eyelashSchemePage');

	// Generate this page
	$('.header').replaceWith(textHeader(user.login));
	$('.mainContainer').replaceWith(
		"<div class='mainContainer'>" +

			"<textarea class='schemeInfoArea' id='eyelashSchemeName' maxlength='31' cols='31' rows='1' placeholder='Название схемы'></textarea>" +
				
			"<div class='schemeAreaContainer'>" +
				"<img class='iconSave' role='button' onclick='saveEyelashScheme();' src='images/save.png'>" +
				"<canvas id='schemeArea'></canvas>" +
			"</div>" +

			"<div class='numOfAreasContainer'>" +
				"<div class='title1'>Количество зон:</div>" +
				"<div class='areaContainer' id='areaContainerMain'>" +
					"<div class='areaWidthContainer' id='areaWidthContainerMain'>" +
						"<div class='leftTrack' id='leftTrackMain'></div>" +
						"<div class='rightTrack' id='rightTrackMain'></div>" +
						`<input type='range' oninput='changeCanvas(this.id, "numOfAreas");'` + 
								`id='numOfAreas' class='areaWidth' min='${canvasArr.numOfAreasMin}' max='${canvasArr.numOfAreasMax}' value='5'>` +
					"</div>" +

					`<div class='numOfAreasText'></div>` +
				"</div>" +
			"</div>" +

			"<div class='parametersAreaContainer'>" +
				"<div class='title1'>Размер зон и длина ресниц:</div>" +
			"</div>" +

		"</div>"	
	);

	// Get input width
	canvasArr.inputWidth = $('.areaWidth').width();

	// Change page elements if editing is in progress
	if (operation === 'edit') {

		// Lock eyelash scheme name textarea
		$('#eyelashSchemeName').val(canvasArr.name).toggleClass('schemeInfoArea lockedSchemeInfoArea').prop('readonly', true);

		// Add the icon 'delete'
		$('.schemeAreaContainer').append("<img class='iconDelete' role='button' onclick='deleteEyelashScheme();' src='images/delete.png'>");

		// Replace the icon 'save' with the icon 'edit'
		$('.iconSave').replaceWith("<img class='iconEdit' role='button' onclick='editEyelashScheme();' src='images/edit.png'>");
		
		// Hide eyelash scheme editing elements 
		$('.numOfAreasContainer, .parametersAreaContainer').hide();
	}

	// Init canvas
	canvasArr.canvas = document.getElementById('schemeArea');
	canvasArr.ctx = canvasArr.canvas.getContext('2d');
	canvasArr.canvas.height = $(window).height() * 0.23;
	canvasArr.canvas.width = canvasArr.canvas.height * 2;

	// Init resizable canvas elements
	const resizableCanvasElements = {
		solidLength: 50,
		clearLength: 150,
		centerX: 150,
		centerY: 225,
		radius: 150,
		length: 200
	};

	// Set initial properties of canvasArr if a new schema is created
	if (operation === 'new') {
		canvasArr.areaWidths = [];
		canvasArr.areaLengths = [];
	}

	// Recalculate values according to dimensions of canvas
	canvasArr.sizeRatio = canvasArr.canvas.height / 150;

	for (let prop in resizableCanvasElements) {
		canvasArr[prop] = resizableCanvasElements[prop] * canvasArr.sizeRatio;
	}

	changeCanvas();
}

// Page 'Calendar'
function calendarPage() {
	prevPages.unshift('calendarPage');

	// Set loading screen
	$('.header').replaceWith(textHeader(user.login));
	$('.mainContainer').replaceWith(
		"<div class='mainContainer'>" +

			"<div class='processContainer blocker'>" +
				`${loadingIcon}<div class='loading'>Календарь загружается</div>` +
			"</div>" +

			"<div id='evoCalendar'></div>" +

		"</div>"
	);

	// Generate the selected date 
	selectedDate = (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/' + new Date().getFullYear();

	// Generate the calendar
	$('#evoCalendar').evoCalendar({
		color: '#9d81ba',
		language: 'ru',
		firstDayOfWeek: 1,
		todayHighlight: true,
		selectedDate: selectedDate,
		format: 'mm/dd/yyyy',
		titleFormat: 'MM',
		eventHeaderFormat: 'd MM, yyyy'
	});

	// Get array 'clients'
	$.ajax({
		url: "/getClients",
		method: "POST",
		data: {
			user
		},
		success: function(response) {
			// Update clients list
			clients = response;

			// Create clients list
			createClientsList();

			// Get array 'events'
			$.ajax({
				url: "/getEvents",
				method: "POST",
				data: {
					user
				},
				success: function(response) {
					setTimeout(() => {
						// Update array 'events'
						calEvents = response;
						
						initCalendar();
					}, 100);
				}
			});
		}
	});
}







// $('.mainContainer').replaceWith(
	// "<div class='title1'>Коэф изгиба по Y</div>"+
	// `<textarea class='clientInfoArea' id='cY' maxlength='31' cols='31' rows='1'>3</textarea>` +
	// "<div class='title1'>Коэф верх. дуги</div>"+
	// `<textarea class='clientInfoArea' id='up' maxlength='31' cols='31' rows='1'>3.6</textarea>` +	
	// "<div class='title1'>Коэф нижн. дуги</div>"+
	// `<textarea class='clientInfoArea' id='down' maxlength='31' cols='31' rows='1'>10</textarea>` +	
// );

// let canvasOptionsDef = {
// 	numOfAreas: $('#numOfAreas').val(),
// 	numOfAreasPrev: 0,
// 	centerX: 150,
// 	centerY: 225,
// 	radius: 150,
// 	length: 200,
// 	arcDegrees: 90,
// 	startDegrees: 225,
// 	zoneDegrees: arcDegrees / numOfAreas,
// 	areaWidths: []
// }

// let numOfAreas = $('#numOfAreas').val();
// let numOfAreasPrev = 0;
// let centerX = 150;
// let centerY = 225;
// let radius = 150;
// let length = 200;
// let arcDegrees = 90;
// let startDegrees = 225;
// let zoneDegrees = arcDegrees / numOfAreas;
// let areaWidths = [];

// let init = true;

// if (canvas.getContext) {

// 	// schemeArea.addEventListener('mouseup', function(e) {
// 	// 	let x = e.pageX - e.target.offsetLeft,
// 	// 		y = e.pageY - e.target.offsetTop;
// 	// 	$('#numOfAreas').val(x + ' ' + y);
// 	// });
// } else {
// 	console.log('ERROR');
// }

// $('.header').replaceWith('');
// $('.mainContainer').replaceWith(
// 	//textMainPageButton +
// 	textHeader(user.login) +
// 	"<div class='mainContainer'>" +
// 	"<canvas id='schemesArea'></canvas>" +
// 	"<div class='title1'>Коэф изгиба по X</div>"+
// 	`<textarea class='lockedClientInfoArea' id='cX' maxlength='31' cols='31' rows='1'>7.5</textarea>` +
// 	"<div class='title1'>Коэф изгиба по Y</div>"+
// 	`<textarea class='lockedClientInfoArea' id='cY' maxlength='31' cols='31' rows='1'>3</textarea>` +
// 	"<div class='title1'>Коэф верх. дуги</div>"+
// 	`<textarea class='lockedClientInfoArea' id='up' maxlength='31' cols='31' rows='1'>3.6</textarea>` +	
// 	"<div class='title1'>Коэф нижн. дуги</div>"+
// 	`<textarea class='lockedClientInfoArea' id='down' maxlength='31' cols='31' rows='1'>10</textarea>` +		
// 	"</div>"
// );

// let canvas = document.getElementById('schemesArea');
// let ctx = canvas.getContext('2d');
// let cX = 7.5;
// let cY = 3;
// let up = 3.6;
// let down = 10;

// $('#cX, #cY, #up, #down').on('change', function() {
// 	cX = $('#cX').val();
// 	cY = $('#cY').val();
// 	up = $('#up').val();
// 	down = $('#down').val();

// 	canvas.width = canvas.width;
// 	ctx.beginPath();
// 	for (let i = 0; i < 16; i++) {	
// 		ctx.moveTo((150 + 5 * i), (70 + i * i / down));
// 		ctx.quadraticCurveTo((150 + cX * i), (45 + cY * i), (150 + 7.8 * i), (20 + (i * i) / up));
// 	}
// 	for (let i = 0; i < 16; i++) {	
// 		ctx.moveTo((150 - 5 * i), (70 + i * i / down));
// 		ctx.quadraticCurveTo((150 - cX * i), (45 + cY * i), (150 - 7.8 * i), (20 + (i * i) / up));
// 	}
// 	ctx.stroke();
// });