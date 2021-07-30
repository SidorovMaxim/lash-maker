// ---------- CALENDAR FUNCTIONS ----------
// Initialize calendar
function initCalendar() {
	// Generate this page
	$('.mainContainer').replaceWith(
		"<div class='mainContainer'>" +
		"<div id='evoCalendar'></div>" +
		"</div>"
	);

	// Format date
	selectedDate = selectedDate.split('/');
	if (selectedDate[0].length == 1) {
		let temp = String(selectedDate[0]);
		selectedDate[0] = '0' + String(selectedDate[0]);
	}
	selectedDate = selectedDate.join('/');

	// Start calendar
	$('#evoCalendar').evoCalendar({
		color: '#9d81ba',
		language: 'ru',
		firstDayOfWeek: 1,
		todayHighlight: true,
		selectedDate: selectedDate,
		format: 'mm/dd/yyyy',
		titleFormat: 'MM',
		eventHeaderFormat: 'd MM, yyyy',
		calendarEvents: calEvents
	});
}




// Event's functions
// Create new event
function addEvent() {
	$('.buttonAddEvent').remove();

	// Create time lists
	let timeStartList = '';
	let timeEndList = '';
	for (let i = 8; i < 23; i++) {
		timeStartList = timeStartList + `<option value='${i}'>С ${i}:00</option>`;
		timeEndList = timeEndList + `<option value='${i}'>До ${i}:00</option>`;
	}

	// Add select lists to calendar events container
	$('.calendar-events').append(
		createSelectList(clientsList, 'clientsList clientsListCal') +
		createSelectList(timeStartList, 'timeList timeStartList') +
		createSelectList(timeEndList, 'timeList timeEndList') +
		"<button class='buttonAddEvent commonButton' onclick='saveEvent()'>Сохранить</button>"
	);

	// Activate select lists
	activateSelectList('clientsListCal', 'Введите имя клиента', '90%', 2);
	activateSelectList('timeStartList', 'С 00:00', '45%', 2);
	activateSelectList('timeEndList', 'До 00:00', '45%', 2);

}

// Save new event
function saveEvent() {
	// Set loading screen
	$('.resultContainer').remove();
	$('.mainContainer').append(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Запись сохраняется</div></div>`);

	// Get event data
	selectedDate = $('.calendar-active').attr('data-date-val');
	selectedClient = $('.clientsListCal').val();
	selectedTimeStart = $('.timeStartList').val();
	selectedTimeEnd = $('.timeEndList').val();

	// Create events data cell
	let newEvent = {selectedDate, selectedClient, selectedTimeStart, selectedTimeEnd};

	// Check client name
	if (selectedClient != '') {

		// Post new event data
		$.ajax({
			url: "/saveEvent",
			method: "POST",
			data: {
				user,
				newEvent
			},
			success: function(response) {
				setTimeout(() => {
					// Update client and event arrays
					clients = response.clients;
					calEvents = response.events;

					initCalendar();

					// Success status
					$('.mainContainer').append("<div class='resultContainer'><div class='success'>Запись добавлена</div></div>");
				}, 100);
			}
		});

	// Сlient not selected
	} else {
		$('.resultContainer, .processContainer').replaceWith("<div class='resultContainer'><div class='error'>Выберите клиента</div></div>");
	}
}

// Remove existing event
function deleteEvent(id) {
	// Replace icon 'delete' with icons 'yes' and 'no'
	$(`.event-container[data-event-index=${id}] > .event-icon > .iconDeleteRed`).replaceWith("<button class='iconNoRed'>&cross;</button><button class='iconYesRed'>&check;</button>");

	// Clicked icon 'yes'
	$('.iconYesRed').click(() => {
		// Get event id
		let deletedEvent = {id};

		// Set loading screen
		$('.mainContainer').append(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Запись удаляется</div></div>`);

		// Post deleted event
		$.ajax({
			url: "/deleteEvent",
			method: "POST",
			data: {
				user,
				deletedEvent
			},
			success: function(response) {
				setTimeout(() => {
					// Update client array
					clients = response.clients;
					calEvents = response.events;
					
					// Get selected date
					selectedDate = $('.calendar-active').attr('data-date-val');

					initCalendar();

					// Successs status
					$('.mainContainer').append("<div class='resultContainer'><div class='success'>Запись удалена</div></div>");
				}, 100);
			}
		});
	});

	// Clicked icon 'no'
	$('.iconNoRed').click(() => {
		$('.iconYesRed').remove();
		$('.iconNoRed').replaceWith(`<button class="iconDeleteRed" onclick="deleteEvent(this.parentNode.parentNode.getAttribute('data-event-index'));"></button>`);
		deleteEvent();
	});
}