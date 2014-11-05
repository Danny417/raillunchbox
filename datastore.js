var config = require('./config');
var helper = require('./utility');
var mysql = require('mysql');
var dbAccess = {};

var pool = mysql.createPool(config.DB);
pool.on('enqueue', function() {
	helper.log('INFO', 'Waiting for available connection slot.');
}).on('connection', function(connection) {
	helper.log('INFO', 'New connection is created within the pool.');
});

dbAccess.insert = function(table, rows, callback) {
	if(!rows || rows.length == 0 || !table) {
		helper.log('ERROR', 'Insert failed.  Not specify parameters.');
		throw new Error('Rows or table not defined.');
	}
	var fields;
	var values = [];
	rows.forEach(function(row, index) {
		var result = helper.splitKeyValue(row);
		if(index == 0) fields = result['keys'];
		values[index] = result['values'];
	});
	
	dbAccess.operate('INSERT INTO '+table+' ('+fields+') VALUES ?', [values], callback);
};

dbAccess.update = function(table, rows, callback) {
	if(!rows || rows.length == 0 || !table) {
		helper.log('ERROR', 'Insert failed.  Not specify parameters.');
		throw new Error('Rows or table not defined.');
	}
	dbAccess.operate('SHOW INDEX FROM ??', [table], function(err, result) {
		if(err) {
			callback(err, null);
			return false;
		}	
		result.forEach(function(col, index) { // DH: find out the primary key col
			if(col['Key_name'] === 'PRIMARY') {				
				var pkValues = [];
				var strings = {};
				var updateStr = 'UPDATE '+table+' SET ';
				rows.forEach(function(row, index) { // DH: construct the update string to update multiple records, can be improved
					pkValues[index] = row[col['Column_name']];
					for(var field in row) {		
						if(field === col['Column_name']) continue;
						if(!strings[field]) strings[field] = '';
						var quote1 = Number(row[col['Column_name']]) == NaN ? '\'' : '';
						var quote2 = Number(row[field]) == NaN ? '\'' : '';
						strings[field] += ' WHEN '+quote1+row[col['Column_name']]+quote1+' THEN '+quote2+row[field]+quote2;
					}
				});
				for(var field in strings) {
					updateStr += field + ' = CASE '+col['Column_name']+strings[field]+' END,';
				}
				updateStr = updateStr.substr(0, updateStr.length-1)+' WHERE '+col['Column_name']+' IN ('+pkValues.toString()+')';
				//helper.log('DEBUG', updateStr);
				dbAccess.operate(updateStr, null, callback);
				return;
			}
		});
	});
};

dbAccess.queryById = function(table, id, callback) {
	if(!table || !id || !callback) {
		helper.log('ERROR', 'Query failed.  Not specify parameters.');
		throw new Error('Id or table not defined.');
	}
	var queryString = 'SELECT * FROM ?? WHERE id = ?';
	dbAccess.queryByCol(table, {key:'id', value:id}, callback);
};

dbAccess.queryByCol = function(table, col, callback) {
	if(!table || !col || !callback) {
		helper.log('ERROR', 'Query failed.  Not specify parameters.');
		throw new Error('Column or table not defined.');
	}
	var queryString = 'SELECT * FROM ?? WHERE '+col.key+' = ?';
	dbAccess.operate(queryString, [table, col.value], function(err, result) {
		if(err) { 
			callback(err, null);
		} else {
			callback(null, result);			
		}
	});
};

dbAccess.operate = function(operationString, identifier, callback) {
	if(!callback) return;
	pool.getConnection(function(err, connection) {
		if(err) {
			helper.log('ERROR', err);
			callback(err, null);
		} else {
			connection.query(operationString, identifier, function(err, result){
				if(err) {		
					helper.log('ERROR', err);
					callback(err, null);
					return false;
				}
				if(!helper.isArray(result)) { 
					helper.log('INFO', result.affectedRows + ' rows are affected.');
				}			
				callback(null, result);	
				connection.release();
			});
		}
	});
};

module.exports = dbAccess;

// DH: Unused code, Keep in case need in the future
/*
var connection;

function errorHandle(connection) {
	connection.on('error', function(err) {
		if(err) {
			helper.log('ERROR', err);
			if(err.code === 'PROTOCOL_CONNECTION_LOST') {
				reconnect();
			} else {
				throw err;
			}
		}
	});
}

function reconnect() {
	helper.log('INFO', 'Reconnecting to '+config.DB.host+'...');
	connection = mysql.createConnection(config.DB);
	dbAccess.connect();
}

dbAccess.connect = function() {
	if(!!connection)
		dbAccess.close();
	connection = mysql.createConnection(config.DB);
	if(connection.state === 'disconnected') {
		connection.connect(function(err) {
			if(err) {
				helper.log('ERROR', err);
				setTimeout(reconnect, 3000);
			} else {
				helper.log('INFO', config.DB.host+' is connected as id : '+connection.threadId+'.');
			}
		});	
		errorHandle();
	}
}

dbAccess.close = function() {
	if(connection.state === 'disconnected') {
		return;
	} 
	connection.end(function(err) {
		if(err) {
			helper.log('ERROR', err);
			throw err;
		}
		helper.log('INFO', 'Database '+config.DB.host+' is disconnected.');
	});	
}
*/