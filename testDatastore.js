var dbAccess = require('./datastore.js');
var testData = [{testcol1 : 2, testcol2 : 16, testcol3 : 'hi', testcol4 :'test'}, 
{testcol1 : 1, testcol2 : 17, testcol3 : 'hi', testcol4 :'test'},
{testcol1 : 2, testcol2 : 18, testcol3 : 'hi', testcol4 :'test'},
{testcol1 : 2, testcol2 : 19, testcol3 : 'hi', testcol4 :'test'},
{testcol1 : 2, testcol2 : 20, testcol3 : 'hi', testcol4 :'test'}];


/*dbAccess.insert('testtable', testData, function(res) {
	console.log(res);
});*/

dbAccess.update('testtable', [{testcol1 : 12, testcol2 : 18}], 
				function(err, res){
					console.log(res); 
				});
				
dbAccess.queryByCol('testtable', {key: 'testcol2', value:18}, function(err, data) {
	console.log(data);
});

var queryString = 'SELECT ?? FROM ??';
dbAccess.operate(queryString, [['testcol1', 'testcol2'], 'testtable'], function(err, result) {
	console.log(result);
});
