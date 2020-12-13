const { Pool } = require('pg');
const Query = require('../query/queries');
const _ = require('lodash');


const pools = new Map();

function CreateConnections(req, res, next) {
    var resJson = {
        status: false,
        msg: null,
        error: false,
        data: null
    }

    var nullVar = [];
    try {

        var host = req.body.host;
        var user = req.body.user;
        var database = req.body.database;
        var password = req.body.password;
        var port = req.body.port || 5432;
        var connName = req.body.connName;

        // nullVar.push()
        if (host && user && database && password && port && connName) {

            pools.delete(connName);
            var connectionStr = {
                host: host,
                user: user,
                database: database,
                password: password,
                port: port
            }

            console.log(connectionStr);

            const pool = new Pool(connectionStr);

            pool.connect((err, client, done) => {
                done();
                if (err) {
                    resJson.error = true
                    resJson.msg = err.message;
                    res.send(resJson);
                } else {

                    client.query(`${Query.tablesInDatabse};${Query.funcitonsInDatabse};`, (err, response) => {
                        if (err) {
                            resJson.error = true
                            resJson.msg = err.message;
                            res.send(resJson);
                        } else {
                            console.log(err, response);
                            if (!pools.has(connName)) {
                                pools.set(connName, connectionStr)
                                SchemaData(req, res, next);
                            } else {
                                resJson.error = true
                                resJson.msg = 'Duplicate Connection Name.';
                                res.send(resJson);
                            }
                        }
                    });
                }
            })
        } else {
            resJson.error = true
            resJson.msg = 'Parameters missing.';
            res.send(resJson);
        }
    } catch (error) {
        console.log(error);
        resJson.error = true;
        resJson.msg = error.message;
        res.send(resJson);
    }
}
exports.CreateConnections = CreateConnections;

function CheckConnections(req, res, next) {
    var resJson = {
        status: false,
        msg: null,
        error: false,
        data: null
    }
    try {

        var connName = req.body.connName;

        if (pools.has(connName)) {
            var connectionStr = pools.get(connName);
            const pool = new Pool(connectionStr);
            pool.connect((err, client, done) => {
                done()
                if (err) {
                    resJson.data = { status: false, msg: err.message }
                    res.send(resJson);
                } else
                    client.query('SELECT NOW()', (err, response) => {
                        if (err) {
                            resJson.error = true
                            resJson.msg = err.message;
                            res.send(resJson);
                        } else {
                            console.log(err, response);
                            resJson.status = true;
                            resJson.msg = `${connName} is connected.`;
                            res.send(resJson);
                        }
                    })
            })
        } else {
            resJson.error = true;
            resJson.msg = `Connection not present.`;
            res.send(resJson);
        }
    } catch (error) {
        console.log(error);
        resJson.error = true;
        resJson.msg = error;
        res.send(resJson);
    }
}
exports.CheckConnections = CheckConnections;

function SchemaData(req, res, next) {
    var resJson = {
        status: false,
        msg: null,
        error: false,
        data: null
    }
    try {

        var connName = req.body.connName;

        if (pools.has(connName)) {
            var connectionStr = pools.get(connName);
            const pool = new Pool(connectionStr);
            pool.connect((err, client, done) => {
                done()
                if (err) {
                    resJson.error = true;
                    resJson.msg = err.message;
                    res.send(resJson);
                } else
                    client.query(`${Query.tablesInDatabse};${Query.funcitonsInDatabse};`, (err, response) => {
                        if (err) {
                            resJson.error = true;
                            resJson.msg = err.message;
                            res.send(resJson);
                        } else {
                            console.log(err, response);
                            resJson.status = true;
                            resJson.data = { table: response[0].rows || [], function: response[1].rows || [] };
                            res.send(resJson);
                        }
                    });
            })
        } else {
            resJson.error = true;
            resJson.msg = 'Connection not present.';
            res.send(resJson);
        }
    } catch (error) {
        console.log(error);
        resJson.error = true;
        resJson.msg = error;
        res.send(resJson);
    }
}
exports.SchemaData = SchemaData;

function CompareDatabase(req, res, next) {
    var resJson = {
        status: false,
        msg: null,
        error: false,
        data: null
    }

    var databaseManage = {
        conn1: { table: [], function: [] },
        conn2: { table: [], function: [] },
    }

    var databaseDiff = {
        conn1: { table: [], function: [], connection : null, database : null},
        conn2: { table: [], function: [], connection : null, database : null},
    }

    try {

        const conn1 = req.body.conn1;
        const conn2 = req.body.conn2;

        if (pools.has(conn1)) {
            var connectionStr1 = pools.get(conn1);
            const pool1 = new Pool(connectionStr1);
            pool1.connect((err1, client1, done1) => {
                done1()
                if (err1) {
                    resJson.error = true;
                    resJson.msg = err.message;
                    res.send(resJson);
                } else
                    client1.query(`${Query.tablesInDatabse};${Query.funcitonsInDatabse};`, (err, response) => {
                        if (err) {
                            resJson.error = true;
                            resJson.msg = err.message;
                            res.send(resJson);
                        } else {
                            databaseManage.conn1.table = response[0].rows || [];
                            databaseManage.conn1.function = response[1].rows || [];

                            if (pools.has(conn2)) {
                                var connectionStr2 = pools.get(conn2);
                                const pool2 = new Pool(connectionStr2);
                                pool2.connect((err, client2, done2) => {
                                    done2()
                                    if (err) {
                                        resJson.error = true;
                                        resJson.msg = err.message;
                                        res.send(resJson);
                                    } else
                                        client2.query(`${Query.tablesInDatabse};${Query.funcitonsInDatabse};`, (err, response) => {
                                            if (err) {
                                                resJson.error = true;
                                                resJson.msg = err.message;
                                                res.send(resJson);
                                            } else {
                                                databaseManage.conn2.table = response[0].rows || [];
                                                databaseManage.conn2.function = response[1].rows || [];

                                                databaseDiff.conn1.table = _.differenceWith(databaseManage.conn2.table, databaseManage.conn1.table, _.isEqual) || [];
                                                databaseDiff.conn2.table = _.differenceWith(databaseManage.conn1.table, databaseManage.conn2.table, _.isEqual) || [];
                                                databaseDiff.conn1.function = _.differenceWith(databaseManage.conn2.function, databaseManage.conn1.function, _.isEqual) || [];
                                                databaseDiff.conn2.function = _.differenceWith(databaseManage.conn1.function, databaseManage.conn2.function, _.isEqual) || [];
                                                databaseDiff.conn1.connection = conn1;
                                                databaseDiff.conn2.connection = conn2;
                                                databaseDiff.conn1.database = connectionStr1.database;
                                                databaseDiff.conn2.database = connectionStr2.database;


                                                resJson.status = true;
                                                resJson.data = databaseDiff;
                                                res.send(resJson);

                                            }
                                        });
                                })
                            } else {
                                resJson.error = true;
                                resJson.msg = `connection2 is not present`;
                                res.send(resJson);
                            }
                        }
                    });
            })
        } else {
            resJson.error = true;
            resJson.msg = `connection1 is not present`;
            res.send(resJson);
        }


    } catch (error) {
        console.log(error);
        resJson.error = true;
        resJson.msg = error;
        res.send(resJson);
    }
}
exports.CompareDatabase = CompareDatabase;