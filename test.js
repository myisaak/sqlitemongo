const sqlitemongo = require('./sqlitemongo');
const { MongoClient } = require("mongodb");
const { assert } = require('console');
const SQLITE_PATH = "./test.sqlite3";
const GH_ACTION_MONGO_URI = "mongodb://localhost:42069";

function test () {
	if (!process.env.GITHUB_ACTIONS) {
		testLocal().catch(console.error);
	} else {
		testRemote().catch(err => {
			throw err;
		});
	}
}
test();

async function testLocal() {
	if (process.argv.length > 3) {
		var sqlitePath = process.argv[2];
		var mongoURI = process.argv[3];
		var mongoDb = process.argv.length > 4 && process.argv[4];
		return sqlitemongo(sqlitePath, mongoURI, mongoDb);
	} else {
		console.log(`Usage: node test.js <sqlitepath> <mongo uri> [<mongo database>]`);
	}
}

async function testRemote() {
	if (process.env.GITHUB_ACTIONS) {
		return sqlitemongo(SQLITE_PATH, GH_ACTION_MONGO_URI).then(verifyResult);
	}
	throw new Error("Environment unknown");
}

async function verifyResult() {
	const mongoConnected = await MongoClient.connect(GH_ACTION_MONGO_URI);
	const mongoDb = mongoConnected.db("sqlite3");
	let items = await mongoDb.collection("Test").find().toArray();
	assert(items.length === 1, "Count of items in Test database should be 1");
	const item = items[0];
	assert(item, "First item should be a value, instead is Falsy");
	assert(item.Test_Int === 12414142, "Test_Int should be 12414142");
	assert(item.Test_Str === "Hello", "Test_Str should be 'Hello'");
	assert(item.Test_Real === -241.3252, "Test_Real should be -241.3252");
	assert(item.Test_Num === -42522, "Test_Num should be -42522");

	items = await mongoDb.collection("Empty Table").find().toArray();
	assert(items.length === 0, "Cound of items in 'Empty Table' should be 0");
	assert()

	return mongoConnected.close();
}