module.exports = sqliteMongo;

const { MongoClient } = require('mongodb');
const sqlite3 = require('sqlite3');

async function sqliteMongo(sqlitepath, mongoURI, mongoDbName = 'sqlite3') {
	if (typeof sqlitepath !== `string`) {
		return console.error(`Èxpected a valid sqlite3 filepath but instead got ${sqlitepath}`);
	}
	if (typeof mongoURI !== `string`) {
		return console.error(`Èxpected a valid mongodb URI but instead got ${mongoURI}`);
	}

	var sqliteDb = new sqlite3.Database(sqlitepath);
	var mongoConnected = await MongoClient.connect(mongoURI);
	var mongoDb = mongoConnected.db(mongoDbName);

	async function uploadAllTablesToMongo() {
		var tables = await getSqliteTables();
		return Promise.all(tables.map(async function uploadTable(tableName) {
			let rows = await getSqliteRows(tableName);
			return uploadToMongo(tableName, rows);
		}));
	}
	return uploadAllTablesToMongo().finally(closeDb);

	function closeDb() {
		sqliteDb.close();
		mongoConnected.close();
	}

	async function uploadToMongo(tableName, rows) {
		return new Promise(function resolveLogError(resolve, reject) {
			if (rows.length === 0) {
				// TODO: Add document validation for Mongodb 3.6 and later
				mongoDb.createCollection(tableName, false, resolve);
				return;
			}
			// TODO: Add --overwrite option (fixes duplicate key errors)
			var params = { ordered: false };
			mongoDb.collection(tableName).insertMany(rows, params, function insertRes(err, result) {
				if (err) {
					return reject(`Failed to insert ${typeof rows} with error ${err}`);
				} 
				resolve()
			}, params);
		})
	}

	async function getSqliteRows(tableName) {
		return new Promise(function (resolve, reject) {
			let sql = `SELECT rowid as _id,* FROM "${tableName}"`;
			sqliteDb.all(sql, [], function ifErrorRejectElseResolve(err, rows) {
				if(err) {
					return reject(`Failed to get sqlite3 table data for ${tableName}.\n${err}`);
				}
				resolve(rows);
			});
		}); 
	}

	async function getSqliteTables() {
		return new Promise(function getTables(resolve,reject) {
			var allTablesQuery = `SELECT name FROM sqlite_master
				WHERE type ='table' AND name NOT LIKE 'sqlite_%';`
			sqliteDb.all(allTablesQuery, [], function resolveTables(err, tables) {
				if (err) {
					return reject(err);
				}
				if (!Array.isArray(tables)) {
					return reject(`There are no sqlite tables to upload to mongo`);
				}
				tables = tables.map(function mapToName(table) {
					return table.name;
				});
				resolve(tables);
			});
		})
	}
}
