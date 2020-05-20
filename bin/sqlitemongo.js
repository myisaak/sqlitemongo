#!/usr/bin/env node
const sqlitemongo = require('../sqlitemongo');
const path = require('path');

async function test() {
	if (process.argv.length > 3) {
		var sqlitePath = process.argv[2];
		var mongoURI = process.argv[3];
		var mongoDb = process.argv.length > 4 && process.argv[4];
		return sqlitemongo(sqlitePath, mongoURI, mongoDb);
	} else {
		console.log(`Usage: sqlitemongo <sqlitepath> <mongo uri> [<mongo database>]`);
	}
}
test().catch(console.error);
