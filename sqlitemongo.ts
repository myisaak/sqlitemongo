export { sqliteMongo as default };
import * as sqlite3 from "sqlite3";
import {MongoClient} from "mongodb";

async function sqliteMongo(sqlitepath: string, mongoURI: string, mongoDbName = 'sqlite3') {
	if (typeof sqlitepath !== `string`) {
		return console.error(`Expected a valid sqlite3 filepath but instead got ${sqlitepath}`);
	}
	if (typeof mongoURI !== `string`) {
		return console.error(`Expected a valid mongodb URI but instead got ${mongoURI}`);
	}

	const sqliteDb = new sqlite3.Database(sqlitepath);
	const mongoConnected = await MongoClient.connect(mongoURI);
	const mongoDb = mongoConnected.db(mongoDbName);

	async function uploadAllTablesToMongo() {
		const tables = await getSqliteTables();
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
				mongoDb.createCollection(tableName, {}, resolve);
				return;
			}
			// TODO: Add --overwrite option (fixes duplicate key errors)
			const params = { ordered: false };
			mongoDb.collection(tableName).insertMany(rows, params, function insertRes(err, _result) {
				if (err) {
					return reject(`Failed to insert ${typeof rows} with error ${err}`);
				} 
				resolve(undefined)
			});
		})
	}

	async function getSqliteRows(tableName: string) {
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

	async function getSqliteTables(): Promise<string[]> {
		return new Promise(function getTables(resolve,reject) {
			const allTablesQuery = `SELECT name FROM sqlite_master
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
