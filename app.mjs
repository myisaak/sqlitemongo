import sqlitemongo from 'sqlitemongo';

async function test() {
	var sqlitePath = './sample.db';
	var mongoURI = 'mongodb://localhost:27017';
	var mongoDbName = 'test-database';
	await sqlitemongo(sqlitePath, mongoURI, mongoDbName /* optional */);
}
test().catch(console.error);