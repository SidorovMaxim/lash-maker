// ---------- USER FUNCTIONS ----------

// Login in
function loginIn() {
	user = {};

	// Get login
	let tempName = $('#login').val().toLowerCase();

	// Login or email?
	if (tempName.indexOf('@') == -1) {
		user.login = tempName;
	} else {
		user.email = tempName;
	}

	// Get password
	user.password = $('#password').val();

	// Set loading screen 
	$('.mainContainer').append(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Вход в аккаунт</div></div>`);

	// Post user credentials
	$.ajax({
		url: "/loginIn",
		method: "POST",
		data: {
			user
		},
		success: function(response) {
			setTimeout(() => {
				$('.processContainer, .resultContainer').remove();

				// Success response
				if (response.state == 'correct') {
					user.login = response.login;
					mainPage();

				// Failure responses
				} else if (response.state == 'incorrectLogin') {
					$('.mainContainer').append(`<div class='resultContainer'><div class='error'>Пользователь с таким именем не существует</div></div>`);

				} else if (response.state == 'incorrectEmail') {
					$('.mainContainer').append(`<div class='resultContainer'><div class='error'>Пользователь с таким e-mail не зарегистрирован</div></div>`);
				
				} else if (response.state == 'incorrectPassword') {
					$('.mainContainer').append(`<div class='resultContainer'><div class='error'>Введен неверный пароль</div></div>`);
				
				} else {
					$('.mainContainer').append(`<div class='resultContainer'><div class='error'>Ошибка входа в аккаунт</div></div>`);
				}
			}, 100);
		}
	});
}



// Create new account
function createAccount() {

	// Get user credentials
	user.login = $('#login').val().toLowerCase();
	user.email = $('#email').val().toLowerCase();
	user.password = $('#password').val();
	user.passwordConfirm = $('#passwordConfirm').val();

	// Regular expressions to validate user credentials
	const loginRegexp = /^[a-z][a-z0-9]{4,20}$/;
	const emailRegexp = /.+@.+\..+/i;
	const passwordRegexp = /(?=.*[0-9])(?=.*[.!@#$%^&*])(?=.*[a-z])[0-9a-zA-Z.!@#$%^&*]{8,}/gi;

	// Validate user credentials
	const loginValid = loginRegexp.test(user.login);
	const emailValid = emailRegexp.test(user.email);
	const passwordValid = passwordRegexp.test(user.password);

	// Check the result of validate
	// Correct credentials
	if (emailValid == true && loginValid == true && passwordValid == true && user.password == user.passwordConfirm) {

		// Display loading screen 
		$('.mainContainer').append(`<div class='processContainer blocker'>${loadingIcon}<div class='loading'>Создание аккаунта</div></div>`);

		// Post user credentials
		$.ajax({
			url: "/createAccount",
			method: "POST",
			data: {
				user
			},
			success: function(response) {
				setTimeout(() => {
					$('.processContainer, .resultContainer').remove();
					
					// Success response
					if (response == 'created') {
						loginPage();
						$('.mainContainer').append(`<div class='resultContainer'><div class=success>Аккаунт ${user.login} успешно зарегистрирован</div></div>`);
					
					// Failure responses
					} else if (response == 'loginExists') {
						$('.mainContainer').append("<div class='resultContainer'><div class='error'>Аккаунт с таким именем уже существует</div></div>");
					
					} else if (response == 'emailExists') {
						$('.mainContainer').append("<div class='resultContainer'><div class='error'>Указанный e-mail занят</div></div>");
					
					} else {
						$('.mainContainer').append("<div class='resultContainer'><div class='error'>Ошибка создания аккаунта</div></div>");
					}
				}, 100);
			}
		});

	// Incorrect credentials
	// Incorrect login
	} else if (loginValid == false) {
		$('.processContainer, .resultContainer').remove();
		$('.mainContainer').append(
			"<div class='resultContainer'>" +
				"<div class='error'>" +
					"Логин должен содержать:<br>" +
					"&nbsp;&nbsp;&nbsp;- не менее 5 символов;<br>" +
					"&nbsp;&nbsp;&nbsp;- буквы латинского алфавита и цифры<br>" +
				"</div>" +
			"</div>"
		);

	// Incorrect email
	} else if (emailValid == false) {
		$('.processContainer, .resultContainer').remove();
		$('.mainContainer').append("<div class='resultContainer'><div class='error'>Некорректный e-mail</div></div>");

	// Incorrect password
	} else if (passwordValid == false) {
		$('.processContainer, .resultContainer').remove();
		$('.mainContainer').append(
			"<div class='resultContainer'>" +
				"<div class='error'>" +
					"Пароль должен содержать:<br>" +
					"&nbsp;&nbsp;&nbsp;- не менее 8 символов;<br>" +
					"&nbsp;&nbsp;&nbsp;- включать мин. 1 символ каждого типа:<br>" +
					"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- цифры;<br>" +
					"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- буквы латинского алфавита;<br>" +
					"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- специальные символы (.!@#$%^&*)." +
				"</div>" +
			"</div>"
		);

	// Incorrect password confirmation 
	} else if (user.password != user.passwordConfirm) {
		$('.processContainer, .resultContainer').remove();
		$('.mainContainer').append("<div class='resultContainer'><div class='error'>Пароли не совпадают</div></div>");
	}
}



// Log out
function logOut() {
	// Replace the icon 'user' with icon 'yes' and 'no'
	$('.header').empty().append(
		"<button class='iconNoHeader'>&cross;</button>" +
		"<div class='headerText'>Выйти</div>" +
		"<button class='iconYesHeader'>&check;</button>"
	);

	// Clicked icon 'yes'
	$('.iconYesHeader').click(() => {
		loginPage();
	});

	// Clicked icon 'no'
	$('.iconNoHeader').click(() => {
		// Replace the icons 'yes' and 'no' with icon 'user'
		$('.header').empty().append(
			`<div class='headerText' role='button' onclick='logOut();'>${user.login}</div>` +
			"<img class='iconUser' role='button' onclick='logOut();' src='images/user.png'>"
			);
	});
}