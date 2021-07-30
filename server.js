const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require("fs");
const app = express();

// Init server address
const host = '192.168.1.100';
const port = 80;

// Init mongodb
const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://localhost:27017/`;
const mongoClient = new MongoClient(url, {
	useUnifiedTopology: true
});

// Init common variables
let arrNames = ['clients', 'events', 'numOfClients', 'numOfEvents'];

// Get db 'users'
let db;
mongoClient.connect(function(err, client) {
	db = client.db("users");
});

app.use(bodyParser.json({
	limit: '4mb',
	extended: true
}));
app.use(bodyParser.urlencoded({
	limit: '4mb',
	extended: true
}));

// Get html file
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/client/index.html");
})

// Get js files
app.use("/\*.js", (req, res) => {
	res.sendFile(__dirname + '/client/' + req.baseUrl);
})

// Use static files
app.use(express.static('public'));

// Listen server address
app.listen(port, host, () => {
	console.log(`Server listens http://${host}:${port}`);
})



// Create new user account
app.post("/createAccount", (req, res) => {
	let {user} = req.body;

	// Get users list
	let collection = db.collection(`listOfUsers`);

	// Сreate promise to check user not exists
	let promise = new Promise(function(resolve, reject) {

		// Check login not exists
		collection.findOne({login: user.login}, function(err, result) {
			if (err) return console.error(err);

			// Login exists
			if (result != null) reject('loginExists');

			// Check email not exists
			collection.findOne({email: user.email}, function(err, result) {
				if (err) return console.error(err);

				// Email exists
				if (result != null) reject('emailExists');

				resolve();
			});
		});
	});

	promise.then(
		resolve => {

			// Create new user
			const newUser = {
				login: user.login,
				email: user.email,
				password: user.password
			};

			// Add new user to db
			collection.insertOne(newUser, function(err, result) {
				if (err) return console.error(err);

				// Create new user collection
				collection = db.collection(`${user.login}_${user.password}`);

				// Add common data to new user collection
				arrNames.forEach(function(item, i) {
					collection.insertOne({
							name: item,
							data: (item.indexOf('num') == -1) ? [] : 0
						}, function(err, result) {
						if (err) return console.error(err);

						// User created
						if (i == arrNames.length - 1) res.send('created');
					});
				});
			});
		},
		reject => {
			// User not created
			res.send(reject);
		}
	);
});



// Login user
app.post("/loginIn", (req, res) => {
	let {user} = req.body;

	// Get users list
	let collection = db.collection(`listOfUsers`);

	// Сreate promise to check user exists
	let promise = new Promise(function(resolve) {

		// Login is used
		if (user.login != undefined) {

			// Check login exists
			collection.findOne({login: user.login}, function(err, result) {
				if (err) return console.error(err);
				resolve(result);
			});

		// Email is used
		} else {

			// Check email not exists
			collection.findOne({email: user.email}, function(err, result) {
				if (err) return console.error(err);
				resolve(result);
			});
		}
	});
	
	promise.then(
		resolve => {

			// Check incorrect login
			if (resolve == null) {
				user.state = 'incorrectLogin';
				return res.send(user);
			}

			// Check incorrect password
			if (user.password != resolve.password) {
				user.state = 'incorrectPassword';
				return res.send(user);
			}

			// Login and password are correct
			user.state = 'correct';
			user.login = resolve.login;

			// Get user collection
			collection = db.collection(`${user.login}_${user.password}`);

			// Get user data
			arrNames.forEach(function(item, i) {
				collection.findOne({name: item}, function(err, result) {
					if (err) return console.error(err);

					// Get user arrays
					user[item] = result;

					// Send user data
					if (i == arrNames.length - 1) res.send(user);
				});
			});
		}
	);
});



// Create new client
app.post("/newClient", (req, res) => {
	let {user, newClient} = req.body;

	// Get user data from db
	getUserData(user, 'clients', 'numOfClients')
	.then(user => {

		// Init new client
		newClient.num = user.numOfClients;
		newClient.events = [];
		newClient.eyelashSchemes = [];

		// Add new client to array
		user.clients.push(newClient);

		// Sort array 'clients'
		user.clients.sort((prev, next) => {
			if (prev.fullName < next.fullName) return -1;
			if (prev.fullName < next.fullName) return 1;
		});

		// Update user data in db
		updateUserData(user, 'clients', 'numOfClients')
		.then(() => {

			// Send new user data
			res.send(user.clients);
		});
	});
});



// Edit existing client
app.post("/editClient", (req, res) => {
	let {user, editedClient} = req.body;

	// Get user data from db
	getUserData(user, 'clients', 'events')
	.then(user => {

		// Сhange user data
		// Array 'clients'
		for (let i = user.clients.length - 1; i >= 0; i--) {
			if (user.clients[i].fullName == editedClient.oldFullName) {
				user.clients[i].fullName = editedClient.newFullName;
				user.clients[i].phoneNumber = editedClient.newPhoneNumber;
				i = -1;
			}
		}

		// Array 'events'
		if (user.events.length != 0) {
			for (let i = user.events.length - 1; i >= 0; i--) {
				if (user.events[i].name == editedClient.oldFullName) {
					user.events[i].name = editedClient.newFullName;
				}
			}
		}

		// Update user data in db
		updateUserData(user, 'clients', 'events')
		.then(() => {

			// Send new user data
			let resData = {
				clients: user.clients,
				events: user.events
			};
			res.send(resData);
		});
	});
});



// Delete existing client
app.post("/deleteClient", (req, res) => {
	let {user, deletedClient} = req.body;

	// Get user data from db
	getUserData(user, 'clients', 'events')
	.then(user => {

		// Delete old client from db
		for (let i = user.clients.length - 1; i >= 0; i--) {
			if (user.clients[i].fullName == deletedClient.fullName) {
				user.clients.splice(i, 1);
				i = -1;
			}
		}

		// Delete old client events from db
		if (user.events.length != 0) {
			for (let i = user.events.length - 1; i >= 0; i--) {
				if (user.events[i].name == deletedClient.fullName) {
					user.events.splice(i, 1);
				}
			}
		}

		// Sort array 'clients'
		user.clients.sort((prev, next) => {
			if (prev.fullName < next.fullName) return -1;
			if (prev.fullName < next.fullName) return 1;
		});

		// Update user data in db
		updateUserData(user, 'clients', 'events')
		.then(() => {

			// Send new user data
			let resData = {
				clients: user.clients,
				events: user.events
			};
			res.send(resData);
		});		
	});
});



// Save new event
app.post("/saveEvent", (req, res) => {
	let {user, newEvent} = req.body;

	// Get user data from db
	getUserData(user, 'clients', 'events', 'numOfEvents')
	.then(user => {

		// Create new event in client cell
		for (let i = 0; i < user.clients.length; i++) {
			if (user.clients[i].fullName == newEvent.selectedClient) {
				newEvent.fullName = user.clients[i].fullName;
				user.clients[i].events.unshift({
					id: user.numOfEvents,
					date: newEvent.selectedDate,
					description: newEvent.selectedTimeStart + ':00 - ' + newEvent.selectedTimeEnd + ':00'
				});
				i = user.clients.length;
			}
		}

		// Create new event in array 'events'
		newEvent = {
			id: user.numOfEvents,
			name: newEvent.fullName,
			date: newEvent.selectedDate,
			type: 'event',
			description: newEvent.selectedTimeStart + ':00 - ' + newEvent.selectedTimeEnd + ':00',
			everyYear: false
		};
		user.events.push(newEvent);

		// Update user data in db
		updateUserData(user, 'clients', 'events', 'numOfEvents')
		.then(() => {

			// Send new user data
			let resData = {
				clients: user.clients,
				events: user.events
			};
			res.send(resData);
		});
	});
});



// Delete existing event
app.post("/deleteEvent", (req, res) => {
	let {user, deletedEvent} = req.body;

	// Get user data from db
	getUserData(user, 'clients', 'events')
	.then(user => {

		// Delete old event from arrays 'events'
		for (let i = user.events.length - 1; i >= 0; i--) {
			if (user.events[i].id == deletedEvent.id) {
				deletedEvent.name = user.events[i].name;
				user.events.splice(i, 1);
				i = -1;
			}
		}

		// Delete old event from client cell
		for (let i = user.clients.length - 1; i >= 0; i--) {
			if (user.clients[i].fullName == deletedEvent.name) {
				for (let j = user.clients[i].events.length - 1; j >= 0; j--) {
					if (user.clients[i].events[j].id == deletedEvent.id) {
						user.clients[i].events.splice(j, 1);
						j = -1;
						i = -1;
					}
				}
			}
		}

		// Update user data in db
		updateUserData(user, 'clients', 'events')
		.then(() => {

			// Send new user data
			let resData = {
				clients: user.clients,
				events: user.events
			};
			res.send(resData);
		});		
	});
});



// Save new eyelash scheme
app.post("/newEyelashScheme", (req, res) => {
	let {user, canvasArr, selectedClient} = req.body;
	canvasArr = JSON.parse(canvasArr);

	// Get user data from db
	getUserData(user, 'clients')
	.then(user => {

		// Create new eyelash scheme in client cell
		for (let i = 0; i < user.clients.length; i++) {
			if (user.clients[i].fullName == selectedClient) {
				user.clients[i].eyelashSchemes.unshift(canvasArr);
				i = user.clients.length;
			}
		}

		// Update user data in db
		updateUserData(user, 'clients')
		.then(() => {

			// Send new user data
			res.send(user.clients);
		});
	});
});



// Edit existing eyelash scheme
app.post("/editEyelashScheme", (req, res) => {
	let {user, canvasArr, selectedClient, oldName} = req.body;
	canvasArr = JSON.parse(canvasArr);

	// Get user data from db
	getUserData(user, 'clients')
	.then(user => {

		// Create new eyelash scheme in client cell
		for (let i = 0; i < user.clients.length; i++) {
			if (user.clients[i].fullName == selectedClient) {
				let length = user.clients[i].eyelashSchemes.length;
				for (let j = 0; j < length; j++) {
					if (user.clients[i].eyelashSchemes[j].name == oldName) {
						user.clients[i].eyelashSchemes[j] = canvasArr;
						j = user.clients[i].eyelashSchemes.length;
						i = user.clients.length;
					}
				}
			}
		}

		// Update user data in db
		updateUserData(user, 'clients')
		.then(() => {

			// Send new user data
			res.send(user.clients);
		});
	});
});



// Delete existing eyelash scheme
app.post("/deleteEyelashScheme", (req, res) => {
	let {user, fullName, deletedEyelashScheme} = req.body;

	// Get user data from db
	getUserData(user, 'clients')
	.then(user => {

		// Delete old eyelash scheme in client cell
		for (let i = user.clients.length - 1; i >= 0; i--) {
			if (user.clients[i].fullName == fullName) {
				for (let j = user.clients[i].eyelashSchemes.length - 1; j >= 0; j--) {
					if (user.clients[i].eyelashSchemes[j].name == deletedEyelashScheme.name) {
						user.clients[i].eyelashSchemes.splice(j, 1);
						j = -1;
						i = -1;
					}
				}
			}
		}

		// Update user data in db
		updateUserData(user, 'clients')
		.then(() => {

			// Send new user data
			res.send(user.clients);
		});		
	});
});



// Get array 'clients'
app.post("/getClients", (req, res) => {
	let {user} = req.body;

	// Get array 'clients' from db
	getUserData(user, 'clients')
	.then(() => {

		// Send array 'clients'
		res.send(user.clients);
	});	
});



// Get array 'events'
app.post("/getEvents", (req, res) => {
	let {user} = req.body;

	// Get array 'events' from db
	getUserData(user, 'events')
	.then(() => {

		// Send array 'events'
		res.send(user.events);
	});	
});



async function getUserData(user, ...arrNames) {
	// Open user's collection
	const collection = db.collection(`${user.login}_${user.password}`);

	// Сreate promises to get user data from db
	let promises = [];
	arrNames.forEach(function(item, i) {
		promises[i] = new Promise(function(resolve) {
			collection.findOne({name: item}, function(err, result){
				if (err) return console.error(err);
				resolve(result);
			})
		});
	});
	
	// Process promises
	await Promise.allSettled(promises)
	.then(results => {
		results.forEach(result => {
			user[result.value.name] = result.value.data;
		});
	});

	return user;
}

async function updateUserData(user, ...arrNames) {
	// Open user's collection
	const collection = db.collection(`${user.login}_${user.password}`);

	// Create promises to update data in db
	let promises = [];
	arrNames.forEach(function(item, i) {
		promises[i] = new Promise(function(resolve) {
			collection.updateOne({
				name: item
			}, {
				$set: {
					data: (item.indexOf('num') == -1) ? user[item] : user[item] + 1
				}
			},
			function(err, result) {
				if (err) return console.error(err);
				resolve(result);
			})
		});
	});

	// Process promises
	await Promise.allSettled(promises);
}

// async function checkUserExists(user) {
// 	// Get users list
// 	const collection = db.collection(`listOfUsers`);

// 	let promise = new Promise(function(resolve, reject) {
// 		collection.findOne({login: user.login}, function(err, result) {
// 			if (result != null) {
// 				reject();
// 			}

// 			collection.findOne({email: user.email}, function(err, result) {
// 				if (result != null) {
// 					reject();
// 				}
// 				resolve();
// 			});
// 		});
// 	});
	
	
// 	// Process promises
// 	await promise.then(
// 		resolve => 
// 		reject =>
// 	);

// 	return user;
// }
// async function updateOneClient(user, editedClient) {
// 	console.log(editedClient);
// 	// Open user's collection
// 	const collection = db.collection(`${user.login}_${user.password}`);

// 	// Create promises to update client data in db
// 	let promise = new Promise(function(resolve) {
// 		collection.updateOne({name: 'client', 'data.value': editedClient.selectedClientNum}, {$set: {'items.$.fullName': editedClient.fullName}}, function(err, result){
// 			if (err) {
// 				return console.error(err);
// 			}
// 			console.log(result);
// 			resolve(result);
// 		})
// 	});
	
// 	// Process promises
// 	await promise;
// }

// const collection = db.collection(`${user.login}_${user.password}`);
// collection.findOne({
// 	name: 'clients'
// }, function(err, result) {

// 	if (err) {
// 		user.state = 'error';
// 		console.log(err);

// 	} else {
// 		user['clients'] = result.data;
// 	}
// });