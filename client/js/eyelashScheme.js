// ---------- EYELASH SCHEME FUNCTIONS ----------

// Create new eyelash scheme
function newEyelashScheme() {

	// Init canvas array of new eyelash scheme
	canvasArr = {
		numOfAreasMax: 15,
		numOfAreasMin: 2,
		numOfAreasPrev: 0,
		arcDegrees: 90,
		startDegrees: 225
	};

	eyelashSchemePage('new');
}



// Create new eyelash scheme
function saveEyelashScheme() {

	// Set loading screen
	$('.resultContainer').remove();
	$('.mainContainer').append(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Схема сохраняется</div></div>`);

	// Get name of new scheme
	let schemeName = $('#eyelashSchemeName').val().trim().toLowerCase().replace(/\s+/g, ' ').replace(/( |^)[а-яёa-z0-9]/g, function(x){return x.toUpperCase()});

	// Set eyelash scheme name area
	$('#eyelashSchemeName').val(schemeName);

	// Check scheme name
	if (schemeName != '') {

		// Сheck the existence of name
		let same = 0;
		for (let i = 0; i < currentClient.eyelashSchemes.length; i++) {
			if (schemeName == currentClient.eyelashSchemes[i].name) {
				same++;
			}
		}

		// Not exists
		if (same == 0) {
			// Edit canvas array
			canvasArr.ctx = {};
			canvasArr.canvas = {};
			canvasArr.numOfAreasPrev = 0;
			canvasArr.name = schemeName;

			// Convert canvas array to string
			canvasArr = JSON.stringify(canvasArr);

			// Post canvas array
			$.ajax({
				url: "/newEyelashScheme",
				method: "POST",
				data: {
					user,
					canvasArr,
					selectedClient
				},
				success: function(response) {
					setTimeout(() => {
						// Update array 'clients'
						clients = response;

						eyelashSchemesSelectPage();

						// Set success state
						$('.mainContainer').append("<div class='resultContainer'><div class='success'>Схема сохранена</div></div>");
					}, 100);
				}
			});

		// Already exists
		} else {
			$('.processContainer').replaceWith("<div class='resultContainer'><div class='error'>Схема с таким именем уже существует</div></div>");
		}

	// There are empty text areas
	} else {
		$('.processContainer').replaceWith("<div class='resultContainer'><div class='error'>Заполните все необходимые поля</div></div>");
	}
}




// Edit existing eyelash scheme
function editEyelashScheme() {

	// Unlock eyelash scheme name textarea
	$('#eyelashSchemeName').toggleClass('schemeInfoArea lockedSchemeInfoArea').prop('readonly', false);

	// Remove icon 'delete'
	$('.iconDelete').remove();

	// Replace the icon 'save' with the icon 'edit'
	$('.iconEdit').replaceWith("<img class='iconSave' role='button' onclick='saveEditedEyelashScheme();' src='images/save.png'>");

	// Show eyelash scheme editing elements
	$('.numOfAreasContainer, .parametersAreaContainer').show();

	// Create listeners of name area
	$('#eyelashSchemeName').bind('input propertychange', function() {
		$('#eyelashSchemeName').val($('#eyelashSchemeName').val().replace(/[^а-яёa-z0-9 ]/gi, ''));
	});
}




// Save esited eyelash scheme
function saveEditedEyelashScheme() {

	// Set loading screen
	$('.resultContainer').remove();
	$('.mainContainer').append(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Схема сохраняется</div></div>`);

	// Get old and new name edited eyelash scheme
	let oldName = canvasArr.name;
	let newName = $('#eyelashSchemeName').val().trim().toLowerCase().replace(/\s+/g, ' ').replace(/( |^)[а-яёa-z0-9]/g, function(x){return x.toUpperCase()});

	// Set eyelash scheme name area
	$('#eyelashSchemeName').val(newName);

	// Check scheme name
	if (newName != '') {

		// Сheck the existence of name
		let same = 0;
		for (let i = 0; i < currentClient.eyelashSchemes.length; i++) {
			if (oldName != currentClient.eyelashSchemes[i].name && newName == currentClient.eyelashSchemes[i].name) {
				same++;
			}
		}

		// Not exists
		if (same == 0) {
			// Edit canvas array
			canvasArr.ctx = {};
			canvasArr.canvas = {};
			canvasArr.numOfAreasPrev = 0;
			canvasArr.name = newName;
			canvasArr = JSON.stringify(canvasArr);

			// Post canvas array
			$.ajax({
				url: "/editEyelashScheme",
				method: "POST",
				data: {
					user,
					canvasArr,
					selectedClient,
					oldName
				},
				success: function(response) {
					setTimeout(() => {
						// Update array 'clients'
						clients = response;

						eyelashSchemesSelectPage();

						// Set success state
						$('.mainContainer').append("<div class='resultContainer'><div class='success'>Изменения сохранены</div></div>");
					}, 100);
				}
			});

		// Already exists
		} else {
			$('.processContainer').replaceWith("<div class='resultContainer'><div class='error'>Схема с таким именем уже существует</div></div>");
		}

	// There are empty text areas
	} else {
		$('.processContainer').replaceWith("<div class='resultContainer'><div class='error'>Заполните все необходимые поля</div></div>");
	}
}



// Delete existing eyelash scheme
function deleteEyelashScheme() {

	// Remove the icon 'edit'
	$('.iconEdit').remove();

	// Replace the icon 'delete' with icon 'yes' and 'no'
	$('.iconDelete').replaceWith("<button class='iconNo'>&cross;</button><button class='iconYes'>&check;</button>");

	// Clicked icon 'yes'
	$('.iconYes').click(() => {
		// Set loading screen
		$('.mainContainer').append(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Удаление схемы</div></div>`);

		// Get client name and eyelash scheme name
		let name = $('#eyelashSchemeName').val();
		let deletedEyelashScheme = {name};
		let fullName = currentClient.fullName;

		// Post deleted eyelash scheme
		$.ajax({
			url: "/deleteEyelashScheme",
			method: "POST",
			data: {
				user,
				fullName,
				deletedEyelashScheme
			},
			success: function(response) {
				setTimeout(() => {
					// Update array 'clients'
					clients = response;

					eyelashSchemesSelectPage();

					// Set success state
					$('.mainContainer').append("<div class='resultContainer'><div class='success'>Схема удалена</div></div>");
				}, 100);
			}
		});
	});

	// Clicked icon 'no'
	$('.iconNo').click(() => {
		// Remove the icon 'yes'
		$('.iconYes').remove();
		// Replace the icon 'no' with icons 'delete' and 'edit'
		$('.iconNo').replaceWith(
			"<img class='iconDelete' role='button' onclick='deleteEyelashScheme();' src='images/delete.png'>" +
			"<img class='iconEdit' role='button' onclick='editEyelashScheme();' src='images/edit.png'>"
			);
	});
}




// Select eyelash scheme
function selectEyelashScheme() {

	// Get value of the selected scheme
	let selectedEyelashScheme = $('.eyelashSchemesList').val();

	// Get params selected eyelash scheme from client array
	for (let i = 0; i < currentClient.eyelashSchemes.length; i++) {
		if (currentClient.eyelashSchemes[i].name == selectedEyelashScheme) {
			canvasArr = currentClient.eyelashSchemes[i];
			i = currentClient.eyelashSchemes.length;
		}
	}

	eyelashSchemePage('edit');
}




// Change canvas area
function changeCanvas(id, changedElement) {

	// Init canvasArr
	let _ = canvasArr;

	// Get num of areas from input form
	if (_.numOfAreas == undefined || _.numOfAreasPrev != 0) _.numOfAreas = +$('#numOfAreas').val();

	// Set num of areas in the text area
	$('.numOfAreasText').empty().append(_.numOfAreas);

	// Check length of array 'areaWidths'
	if (_.areaWidths.length != 0) {

		// Check value of previous num of areas
		if (_.numOfAreasPrev != 0) {

			// Get areaWidths values
			for (let i = 0; i < _.numOfAreas; i++) {

				// If areaWidth exist get values from input form
				if ($(`#areaWidth${i}`).val() != undefined) {
					_.areaWidths[i][1] = +$(`#areaWidth${i}`).val() / 10;
					_.areaLengths[i] = +$(`#areaLength${i}`).val();

				// Else set default values
				} else {
					_.areaWidths[i] = [];
					_.areaWidths[i][1] = 90;
					_.areaLengths[i] = 10;
				}
			}	

		// If prev is zero get num of areas value from input form
		} else {
			$('#numOfAreas').val(_.numOfAreas);
		}

	// If length of array 'areaWidths' is zero calculate the default values of widths and lengths
	} else {
		_.zoneDegrees = _.arcDegrees / _.numOfAreas;

		for (let i = 0; i < _.numOfAreas; i++) {
			_.areaWidths[i] = [];
			_.areaWidths[i][1] = _.zoneDegrees * i + _.zoneDegrees;
			_.areaLengths[i] = 10;
		}
	}

	// If num of areas value is changed calculate new track values
	if (_.numOfAreas != _.numOfAreasPrev) {
		$(`#leftTrackMain`).width(`${((_.numOfAreas-_.numOfAreasMin)/(_.numOfAreasMax-_.numOfAreasMin)*_.inputWidth)}px`);
		$(`#rightTrackMain`).width(`${_.inputWidth-((_.numOfAreas-_.numOfAreasMin)/(_.numOfAreasMax-_.numOfAreasMin)*_.inputWidth)}px`);
		$(`#rightTrackMain`).css('left', `${((_.numOfAreas-_.numOfAreasMin)/(_.numOfAreasMax-_.numOfAreasMin)*_.inputWidth)}px`);

		// If prev value is greater than current num of areas value generate additional input forms
		if (_.numOfAreas > _.numOfAreasPrev) {
			for (let i = _.numOfAreasPrev; i < _.numOfAreas; i++) {
				$('.parametersAreaContainer').append(
					`<div class='areaContainer' id='areaContainer${i}'>` +

						`<div class='areaWidthContainer' id='areaWidthContainer${i}'>` +
							`<input id='areaWidth${i}'>` +
						"</div>" +

						`<select id='areaLength${i}'>` +

					"</div>"
				);
			}

		// If prev value is less than current num of areas value delete input forms and array values
		} else if (_.numOfAreas < _.numOfAreasPrev) {
			for (let i = _.numOfAreasPrev; i > _.numOfAreas - 1; i--) {
				$(`#areaContainer${i}`).remove();
				_.areaWidths.splice(i, 1);
				_.areaLengths.splice(i, 1);
			}
		}
	}

	// Set value of last element in array 'areaWidth'
	_.areaWidths[_.areaWidths.length - 1][1] = 90;

	// Сycle of updating input forms
	for (let i = 0; i < _.numOfAreas; i++) {

		// Update this input form if any 'widthArea' or 'numOfAreas' have been changed (also if first cycle)
		if (changedElement == 'widthArea' || changedElement == 'numOfAreas' || _.numOfAreasPrev == 0) {

			// Update 'areaWidths' of adjacent elements
			if ('areaWidth' + (i - 1) == id || 'areaWidth' + (i + 1) == id || id == 'numOfAreas' || _.numOfAreasPrev == 0) {
				_.areaWidths[i][0] = i == 0 ? 0 : _.areaWidths[i - 1][1];
				_.areaWidths[i][2] = i == _.areaWidths.length - 1 ? 90 : _.areaWidths[i + 1][1];

				$(`#areaWidthContainer${i}`).replaceWith(
					`<div class='areaWidthContainer' id='areaWidthContainer${i}'>` +
						`<div class='leftTrack' id='leftTrack${i}'></div>` +
						`<div class='rightTrack' id='rightTrack${i}'></div>` +
						//"<input type='range' class='areaWidth' oninput='changeCanvas(this.id);' onmouseover='drawCanvas(this.id);' onmouseout='drawCanvas(-1);'" +
						`<input type='range' class='areaWidth' oninput='changeCanvas(this.id, "widthArea");'` +
								`id='areaWidth${i}' min='${_.areaWidths[i][0]*10}' max='${_.areaWidths[i][2]*10}' value='${_.areaWidths[i][1]*10}'>` +
					"</div>"
				);
			}

			// Update tracks of changed element and adjacent elements
			if ('areaWidth' + i == id || 'areaWidth' + (i - 1) == id || 'areaWidth' + (i + 1) == id || id == 'numOfAreas' || _.numOfAreasPrev == 0) {
				let leftTrackWidth = ((_.areaWidths[i][1] - _.areaWidths[i][0]) / (_.areaWidths[i][2] - _.areaWidths[i][0]) * _.inputWidth);
				$(`#leftTrack${i}`).width(`${leftTrackWidth}px`);
				$(`#rightTrack${i}`).width(`${_.inputWidth-leftTrackWidth}px`).css('left', `${leftTrackWidth}px`);
			}
		}

		// Update 'areaLengths' if lengthArea or numOfArea have been changed (also if first cycle)
		if (changedElement == 'lengthArea' || changedElement == 'numOfAreas' || _.numOfAreasPrev == 0) {
			$(`#areaLength${i}`).replaceWith(
				`<select class='areaLength' id='areaLength${i}' value='${_.areaLengths[i]}' onchange='changeCanvas(this.id, "lengthArea");'>` +
					`<option selected='selected'>${_.areaLengths[i]}</option>` +
					createLengthList() +
				"</select>"
			);
		}
	}

	// Set prev value of num of areas
	_.numOfAreasPrev = _.numOfAreas;

	// Hide last input form
	$(`#areaWidthContainer${_.areaWidths.length - 1}`).hide();

	canvasArr = _;
	drawCanvas(id, canvasArr);
}




// Draw canvas
function drawCanvas(id, _) {

	// Reset canvas area
	_.canvas.width = _.canvas.width;

	// Draw middle dividing dash line 
	_.ctx.beginPath();
	_.ctx.setLineDash([12.8 * _.sizeRatio, 12.8 * _.sizeRatio]);
	_.ctx.moveTo(_.centerX, _.centerY);
	_.ctx.lineTo(Math.sin((Math.PI / 180) * (_.startDegrees - 45)) * (_.length + 30) + _.centerX,
		Math.cos((Math.PI / 180) * (_.startDegrees - 45)) * (_.length + 30) + _.centerY);
	_.ctx.stroke();

	// Draw an arc of the eyelid
	_.ctx.beginPath();
	_.ctx.setLineDash([]);
	_.ctx.arc(_.centerX, _.centerY, _.radius, ((Math.PI / 180) * 225), ((Math.PI / 180) * 315));
	_.ctx.stroke();

	// Draw the bounding left line
	_.ctx.beginPath();
	_.ctx.setLineDash([0, _.clearLength, _.solidLength]);
	_.ctx.moveTo(_.centerX, _.centerY);
	_.ctx.lineTo(Math.sin((Math.PI / 180) * _.startDegrees) * _.length + _.centerX,
		Math.cos((Math.PI / 180) * _.startDegrees) * _.length + _.centerY);
	_.ctx.stroke();

	// Cycle of drawing the main dividing lines of the zones
	for (let i = 0; i < _.numOfAreas; i++) {
		_.ctx.beginPath();

		// Coloring and highlighting the line currently being modified
		if (('areaWidth' + i) == id) {
			_.ctx.strokeStyle = '#8773c1';
			_.ctx.lineWidth = 2;
		} else {
			_.ctx.strokeStyle = '#000';
			_.ctx.lineWidth = 1;
		}

		// Draw this main dividing line of this zone
		_.ctx.moveTo(_.centerX, _.centerY);
		_.ctx.lineTo(Math.sin((Math.PI / 180) * (_.startDegrees - _.areaWidths[i][1])) * _.length + _.centerX,
			Math.cos((Math.PI / 180) * (_.startDegrees - _.areaWidths[i][1])) * _.length + _.centerY);
		_.ctx.stroke();

		// Draw the length of the eyelash into the given zone
		_.ctx.font = 11 * _.sizeRatio + 'px Times New Roman';

		_.ctx.fillText(
			_.areaLengths[i],

			Math.sin((Math.PI / 180) * (_.startDegrees - (_.areaWidths[i][1] + _.areaWidths[i][0]) / 2 + 1.75)) * 
			(_.length - 15 - (_.areaWidths[i][1] + _.areaWidths[i][0]) / 15) + _.centerX,

			Math.cos((Math.PI / 180) * (_.startDegrees - (_.areaWidths[i][1] + _.areaWidths[i][0]) / 2 + 1.75)) * 
			(_.length - 15 - (_.areaWidths[i][1] + _.areaWidths[i][0]) / 15) + _.centerY
		);
	}
}




// $('.text').empty().append(numOfAreas);
// canvas.width = canvas.width;

// ctx.setLineDash([5, 5]);
// ctx.beginPath();
// ctx.moveTo(centerX, centerY);
// ctx.lineTo(Math.sin((Math.PI / 180) * (startDegrees - 45)) * (length + 30) + centerX,
// 	Math.cos((Math.PI / 180) * (startDegrees - 45)) * (length + 30) + centerY);
// ctx.stroke();

// ctx.setLineDash([]);
// ctx.beginPath();
// ctx.arc(centerX, centerY, radius, ((Math.PI / 180) * 225), ((Math.PI / 180) * 315));
// for (let i = 0; i < numOfAreas; i++) {
// 	ctx.moveTo(centerX, centerY);
// 	ctx.lineTo(Math.sin((Math.PI / 180) * (startDegrees - areaWidths[i])) * length + centerX,
// 		Math.cos((Math.PI / 180) * (startDegrees - areaWidths[i])) * length + centerY);
// }
// ctx.stroke();

// ctx.beginPath();
// ctx.strokeStyle = '#8773c1';
// ctx.moveTo(centerX, centerY);
// ctx.lineTo(Math.sin((Math.PI / 180) * (startDegrees - areaWidths[1])) * length + centerX,
// 	Math.cos((Math.PI / 180) * (startDegrees - areaWidths[1])) * length + centerY);
// ctx.stroke();