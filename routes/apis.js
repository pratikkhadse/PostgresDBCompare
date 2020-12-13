var express = require('express');
var router = express.Router();

const DynamicPG = require('../Controller/DynamicPG');

/* GET home page. */
router.post('/checkconnection', DynamicPG.CheckConnections);

router.post('/createconnection', DynamicPG.CreateConnections);

router.post('/checkschema', DynamicPG.SchemaData);

router.post('/comparedatabase', DynamicPG.CompareDatabase);

module.exports = router;