# BCON-Backend

Backend server for the BCON RFID Arcade project.

## Overview

The server is resposible for interfacing with the database containing player, game, and prize information and providing CRUD functionality to the other devices in the arcade. It is written in [Node.js](https://nodejs.org/en/) and designed to interface with a [MongoDB](https://www.mongodb.com) instance, which makes it scalable and easy to deploy on a variety of hardware platforms.

## Data Schema

For each of the supported collections, there exist properties that may be of interest to various entities in the system. The server uses the [Mongoose](https://mongoosejs.com) module to define and enforce schemas. Supported property types are detailed [here](https://mongoosejs.com/docs/schematypes.html). Subsequent sections detail how requests are made among entities in the system that utilize some/all of these properties.

### Game

| Property  | Type       | Required | Unique | Description |
| --------- | ---------- | -------- | ------ | ----------- |
| _id       | `ObjectId` | Yes      | Yes    | Generated ID from the database. |
| name      | `String`   | Yes      | No     | Display name within the arcade. |
| tokenCost | `Number`   | Yes      | No     | Tokens required for a single game. |
| topPlayer | `ObjectId` | No       | Yes    | The ID of the top-scoring player. |

### Player

| Property   | Type       | Required | Unique | Description |
| ---------- | ---------- | -------- | ------ | ----------- |
| _id        | `ObjectId` | Yes      | Yes    | Generated ID from the database. |
| playerId   | `String`   | Yes      | Yes    | Unique ID from the RFID card, used for making player-related requests with an ID as a parameter. |
| firstName  | `String`   | Yes      | No     | First name of the player. |
| lastName   | `String`   | Yes      | No     | Last name of the player. |
| screenName | `String`   | Yes      | Yes    | Screen name selected by the player for display within the arcade.
| tickets    | `Number`   | Yes      | No     | Total ticket balance earned by the player. |
| gameStats  | `Array`    | No       | No     | Gameplay statistics (see below). |

#### Gameplay Statistics

The _gameStats_ player property is an array of JSON objects published by an arcade game once a game has finished that contains the following:

| Property      | Type       | Description |
| ------------- | ---------- | ----------- |
| gameId        | `ObjectId` | ID of the game. |
| ticketsEarned | `String`   | Total tickets earned by the player on this game. |
| gamesPlayed   | `String`   | Total number of games played by the player on this game. |
| highScore     | `String`   | High score of the player on this game. |

There shall only be a single entry per game in this player property. The server will check to see if properties need to be updated once games publish data (i.e. an improved high score).

### Prize

| Property          | Type       | Required | Unique | Description |
| ----------------- | ---------- | -------- | ------ | ----------- |
| _id               | `ObjectId` | Yes      | Yes    | Generated ID from the database. |
| name              | `String`   | Yes      | No     | Display name within the arcade. |
| description       | `String`   | No       | No     | Brief user-facing prize description. |
| ticketCost        | `Number`   | Yes      | No     | Tickets required for a single unit. |
| availableQuantity | `Number`   | Yes      | No     | Number of available units. |
| image             | `Object`   | No       | No     | Prize image, consisting of a data buffer and content type. |

## Supported Requests

Requests are made to the server using standard HTTP protocol. With the exception of delete requests, all returned data will be JSON-formatted such that the data are self-describing and thus easy to parse. Required parameters are designated in the route with a colon (`:`). For types and other information on required keys in the request body, see the above schemas.

| Route                 | HTTP Method | Body | Description |
| --------------------- | ----------- | ---- | ----------- |
| `/games`              | GET         | | Returns all game objects currently in the database. |
| `/games/create`       | POST        | <ul><li>`name`</li><li>`tokenCost`</li></ul> | Creates a new game with the specified name and token cost and returns the new object. |
| `/games/:id`          | GET         | | Returns the game object associated with the specified ID. |
| `/games/:id/update`   | PUT         | <ul><li>`name` (optional)</li><li>`tokenCost` (optional)</li><li>`topPlayer` (optional)</li></ul> | Updates the game object associated with the specified ID with the specified properties. One or many properties can be updated in a single request. |
| `/games/:id/delete`   | DELETE      | | Deletes the game object associated with the specified ID and returns a confirmation message. |
| `/players`            | GET         | | Returns all player objects currently in the database. |
| `/players/create`     | POST        | <ul><li>`playerId`</li><li>`firstName`</li><li>`lastName`</li><li>`screenName`</li></ul> | Creates a new player with the specified ID, first name, last name, and screen name and returns the new object. |
| `/players/:id`        | GET         | | Returns the player object associated with the specified ID. |
| `/players/:id/update` | PUT         | <ul><li>`playerId` (optional)</li><li>`firstName` (optional)</li><li>`lastName` (optional)</li><li>`screenName` (optional)</li><li>`tickets` (optional)</li></ul> | Updates the player object associated with the specified ID with the specified properties. One or many properties can be updated in a single request. |
| `/players/:id/publishstats` | POST  | <ul><li>`gameId`</li><li>`ticketsEarned`</li><li>`highScore`</li></ul> | Updates the stored game statistics for the player associated with the specified ID and returns the player object. |
| `/players/:id/delete` | DELETE      | | Deletes the player object associated with the specified ID and returns a confirmation message. This does _not_ automatically clear the deleted player from any top scores held within games. |
| `/prizes`             | GET         | | Returns all prize objects currently in the database. |
| `/prizes/create`      | POST        | <ul><li>`name`</li><li>`description` (optional)</li><li>`ticketCost`</li><li>`availableQuantity`</li><li>`image` (optional)</li></ul> | Creates a new prize with the specified information and returns the new object. |
| `/prizes/:id`         | GET         | | Returns the prize object associated with the specified ID. |
| `/prizes/:id/update`  | PUT         | <ul><li>`name` (optional)</li><li>`description` (optional)</li><li>`ticketCost` (optional)</li><li>`availableQuantity` (optional)</li><li>`image` (optional)</li></ul> | Updates the prize object associated with the specified ID with the specified properties. One or many properties can be updated in a single request. |
| `/prizes/:id/redeem`  | POST        | <ul><li>`playerId`</li></ul> | Redeems a single unit of the prize associated with the specified ID by looking up the player ID, deducting the cost of the prize from the player's ticket balance, and decrementing the available quantity of the prize by 1. |
| `/prizes/:id/delete`  | DELETE      | | Deletes the prize object associated with the specified ID and returns a confirmation message. |

### Errors

The above table illustrates happy-case scenarios for each request. However, errors both expected and unexpected can arise. Any error messages related to processing a request will be returned to the client in JSON format, containing the status code and error detail.

For example, sending an invalid `ObjectId` to any of the above parameterized requests would return:

```
{"statusCode":400,"error":"Bad Request","message":"The specified ID is invalid!"}
```

## Running the Server

### Prerequisites

- [Node.js and npm](https://nodejs.org/en/) (bundled together)

### Installing node_modules

Once the repository is cloned or downloaded and Node.js is installed, navigate to the project directory in a console window and execute `npm install`. It may take a minute or two to fetch all of the required modules for the project. Once completed, a new directory *node_modules* should appear in the project directory.

### Creating the .env File

The server expects a *.env* file to be present in the project root that defines an environment variable `MONGODB_URI`. For security, this file is not committed to the repository and therefore needs to be created. This variable should contain a string representing the address of the database the server connects to.

For example, the file might contain:

```
MONGODB_URI = 'mongodb://username:password@somehost:12345/db'
```

### Starting the Server

The server can be started simply by executing `node server.js` from a console. To start a development configuration, run `npm start`, which will start the server locally on port 3000. Confirmation messages will appear on screen indicating that the server has started and that the database connection was successful. Any errors will have their stack traces outputted to the console.

#### Environment Variables

- Setting the environment variable `DEV=1` will run the server in development mode, which sets its port to 3000.
- To supply a custom port, be sure `DEV` is not defined and define it as `PORT=1234`. The port will default to 8080 if neither `DEV` nor `PORT` is set.
- To run in production mode, define the variable `NODE_ENV=production`.

