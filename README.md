# Play Packet API Documentation (Node.js/Express/Postgres)

## Introduction

Hello!

Play Packet's API is a REST API built using Node.js accompanied with Express/Knex(Postgres)
that is used to:

A) Store Users House Rules for board games
B) Users can also search other User's rules
C) Users can add searched rules to their collections

### To Install Locally

1) Clone github repo to your machine
2) Run command 'npm install' to install dependencies locally
3) Run command 'npm run dev' to start up server locally

## API Documentation

### Authorization

Every API request will require a 'bearer ' token created by the json web token library,
there are no elements that does not require authoriztion of a signin.  2 dummy accounts have
been provided in the seed file.  If using postman or any other third party libray to put the
bearer token in the "Authorization" field

No API key required for access

### Responses

All GET requests will return JSON data of items listed in the associated endpoints (see further down),
POST of a new rule will also return a JSON version of that Rule (again, format will be listed below).

PATCH and DELETE will not return anything more that the associate status code listed at the bottom of
documentation

All Errors will return as follows:

{
  error: {Message: `this would be the message`}
}


### Endpoints

#### Auth Endpoints

```
POST /api/auth/login
```

For User authentication upon login

| Body Key    | Type        | Description |
| ----------- | ----------- | ----------- |
| user_name   | string      | Required. User username |
| password    | string      | Required. User password |

#### Users Endpoints

```
POST /api/users
```

For User account creation.  There are checks on password requirements and if the user_name is currently in
the database.  JSON Web Tokens are used to hash the password

| Body Key    | Type        | Description |
| ----------- | ----------- | ----------- |
| user_name   | string      | Required. User username |
| password    | string      | Required. User password |

#### /api/games

The User currently cannot POST games, all of that comes from what is already in the database
The user will get the games 1 of 3 ways, all games will output in the following format:

```json
[
  {
    "id": "int",
    "game_name": "string"
  }
]
```

### Status Codes

Right Routine returns the following status codes in its API:

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |
| 201 | `CREATED` |
| 204 | `NO CONTENT` |
| 400 | `BAD REQUEST` |
| 404 | `NOT FOUND` |
| 500 | `INTERNAL SERVER ERROR` |