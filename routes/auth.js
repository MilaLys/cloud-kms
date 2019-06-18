const express = require('express');
const router = express.Router();


/* GET auth page. */

router.all('/', (req, res) => {
    res.render('index', { title: 'Auth' });
});


module.exports = router;
