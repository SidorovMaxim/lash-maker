// ---------- CLIENT FUNCTIONS ----------

// Save new client
function saveNewClient() {
	// Set loading screen
	$('.resultContainer, .processContainer').remove();
	$('.mainContainer').append(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Сохранение клиента</div></div>`);

	// Get new client info
	let fullName = $('#fullName').val().trim().toLowerCase().replace(/\s+/g, ' ').replace(/( |^)[а-яёa-z]/g, function(x){return x.toUpperCase()}),
		phoneNumber = $('#phoneNumber').val(),
		newClient = {fullName, phoneNumber};

	// Set new client name
	$('#fullName').val(fullName);

	// Check new client info
	if (fullName != '' && phoneNumber != '') {

		// Сheck the existence of client info
		let same = 0;
		for (let i = 0; i < clients.length; i++) {
			if (fullName == clients[i].fullName || phoneNumber == clients[i].phoneNumber) {
				same++;
			}
		}

		// Client not exists
		if (same == 0) {

			// Set loading screen
			$('.resultContainer, .processContainer').replaceWith(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Сохранение клиента</div></div>`);

			// Post new client data
			$.ajax({
				url: "/newClient",
				method: "POST",
				data: {
					user,
					newClient
				},
				success: function(response) {
					setTimeout(() => {
						// Update array 'clients'
						clients = response;
						createClientsList();

						mainPage();

						// Success status
						$('.mainContainer').append("<div class='resultContainer'><div class='success'>Новый клиент добавлен</div></div>");
					}, 100);
				}
			});

		// Client already exists
		} else {
			$('.resultContainer, .processContainer').replaceWith("<div class='resultContainer'><div class='error'>Имя или номер телефона заняты</div></div>");
		}

	// There are empty text areas
	} else {
		$('.resultContainer, .processContainer').replaceWith("<div class='resultContainer'><div class='error'>Заполните все необходимые поля</div></div>");
	}
}




// Select client in the list
function selectClient() {
	selectedClient = $('.clientsList').val();
	clientPage();
}




// Edit existing client
function editClient() {
	// Get client old name
	let oldFullName = $('#fullName').val();

	// Unlock input areas
	$('textarea').prop('readonly', false).toggleClass('clientInfoArea');
	$('.deleteButton').remove();
	$('.editButton').addClass('confirmButton').removeClass('editButton').text('Сохр').attr('onclick', '');
	$('.buttonsContainer').prepend("<button class='cancelButton buttonClientPage'>Отмена</button>");

	// Clicked confirm button
	$('.confirmButton').click(() => {
		$('.resultContainer, .processContainer').replaceWith('');
		$('.mainContainer').append(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Изменения сохраняются</div></div>`);

		let newFullName = $('#fullName').val().trim().toLowerCase().replace(/\s+/g, ' ').replace(/( |^)[а-яёa-z]/g, function(x){return x.toUpperCase()}),
			newPhoneNumber = $('#phoneNumber').val().trim(),
			editedClient = {oldFullName, newFullName, newPhoneNumber};

			$('#fullName').val(newFullName);

		if (newFullName != '' && newPhoneNumber != '') {

			// Сheck the existence of client info
			let same = 0;
			for (let i = 0; i < clients.length; i++) {
				if (selectedClient != clients[i].fullName && (newFullName == clients[i].fullName || newPhoneNumber == clients[i].phoneNumber)) {
					same++;
				}
			}

			// There is no client with same info
			if (same == 0) {
				// Set loading screen
				$('.resultContainer, .processContainer').replaceWith(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Изменения сохраняются</div></div>`);

				// Post edited client
				$.ajax({
					url: "/editClient",
					method: "POST",
					data: {
						user,
						editedClient
					},
					success: function(response) {
						setTimeout(() => {
							// Update arrays 'events' and 'clients'
							clients = response.clients;
							calEvents = response.events;

							// Set new client name
							selectedClient = newFullName;

							clientPage();

							// Success status
							$('.mainContainer').append("<div class='resultContainer'><div class='success'>Изменения сохранены</div></div>");
						}, 100);
					}
				});

			// There is client with same info
			} else {
				$('.resultContainer, .processContainer').replaceWith("<div class='resultContainer'><div class='error'>Имя или номер телефона заняты</div></div>");
			}

		// There are empty text areas
		} else {
			$('.resultContainer, .processContainer').replaceWith("<div class='resultContainer'><div class='error'>Заполните все необходимые поля</div></div>");
		}
	});

	// Clicked cancel button
	$('.cancelButton').click(() => {
		clientPage();
	});
}



// Delete existing client
function deleteClient() {
	// Replace button 'delete' with 'yes' and 'no' buttons
	$('.deleteButton').addClass('yesButton').removeClass('deleteButton').text('Да').attr('onclick', '');
	$('.buttonsContainer').append("<button class='noButton buttonClientPage'>Нет</button>");
	$('.editButton').remove();

	// Clicked 'yes' button
	$('.yesButton').click(() => {
		// Set loading screen
		$('.mainContainer').append(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Удаление клиента</div></div>`);

		// Get client name
		let fullName = $('#fullName').val();
		let deletedClient = {fullName};

		// Post deleted client
		$.ajax({
			url: "/deleteClient",
			method: "POST",
			data: {
				user,
				deletedClient
			},
			success: function(response) {
				setTimeout(() => {
					// Update arrays 'clients' and 'events'
					clients = response.clients;
					calEvents = response.events;

					mainPage();

					// Success status
					$('.mainContainer').append("<div class='resultContainer'><div class='success'>Клиент удален</div></div>");
				}, 100);
			}
		});
	});

	// Clicked 'no' button
	$('.noButton').click(() => {
		clientPage();
	});
}



// Go to the page of the selected client
function toClientPage(id) {
	// Get client name according to id 
	selectedClient = $(`[data-event-index="${id}"] .event-info .event-title`).text();

	clientPage();
}