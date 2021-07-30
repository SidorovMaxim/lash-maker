// ---------- SELECT LIST FUNCTIONS ----------
function createClientsList() {
	clientsList = '';
	for (let i = 0; i < clients.length; i++) {
		clientsList = clientsList + `<option value='${clients[i].fullName}'>${clients[i].fullName}</option>`;
	}
}

function createLengthList() {
	let lengthList = '';
	for (let i = 0; i < 21; i++) {
		lengthList = lengthList + `<option value='${i}'>${i}</option>`;
	}
	return lengthList;
}

function createSelectList(listData, listName, event) {
	let selectList =
		`<select class='${listName}' name='mainContainer' ${event}>` +
		"<option value=''></option>" +
		`${listData}` +
		"</select>";
	return selectList;
}

function activateSelectList(listName, placeholder, width, search) {
	$(`.${listName}`).select2({
		width: width,
		placeholder: placeholder,
		maximumSelectionLength: 2,
		minimumResultsForSearch: search,
		language: "ru"
	});
}