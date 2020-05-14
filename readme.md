# sqlitemongo

Migrate your sqlite3 database to mongodb.

## Why?

- Uses sqlite3 ids to avoid uploading duplicates
- Copy all tables into mongo collections in a single command

## What

It copies all tables from sqlite3 into mongo collections under a specified database. For example, if you have a sqlite3 database file `db.sqlite3` with tables: `table1` and `table2`, this tool uploads to a mongo database with collections `table1` and `table2`.

## Usage

Just import sqlitemongo from npm `npm i sqlitemongo`, and start using as below:

```js
const sqlitemongo = require('sqlitemongo');

async function test() {
	var sqlitePath = './test.sqlite3';
	var mongoURI = 'mongo+srv://username:password@hostname.domain/test';
	var mongoDbName = 'test-database';
	await sqlitemongo(sqlitePath, mongoURI, mongoDbName /* optional */);
}
test().catch(console.error);
```