exports.tablesInDatabse = `SELECT *
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog' AND 
schemaname != 'information_schema';`;

exports.funcitonsInDatabse = `SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position
 FROM information_schema.routines 
 LEFT JOIN information_schema.parameters 
 ON routines.specific_name=parameters.specific_name
 WHERE routines.specific_schema='public' 
 ORDER BY routines.routine_name, parameters.ordinal_position;`;