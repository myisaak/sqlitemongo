#!/usr/bin/env ts-node
import sqlitemongo from "../sqlitemongo";

async function test() {
	if (process.argv.length > 3) {
		const sqlitePath = process.argv[2];
		const mongoURI = process.argv[3];
		const mongoDb = process.argv.length > 4 ? process.argv[4] : undefined;
		return sqlitemongo(sqlitePath, mongoURI, mongoDb);
	} else {
		console.log(`Usage: sqlitemongo <sqlitepath> <mongo uri> [<mongo database>]`);
	}
}
test().catch(console.error);
