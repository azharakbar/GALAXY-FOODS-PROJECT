'use strict'
const 	express = require('express'),
		custRouter = express.Router(),
		custController = require('../controllers/customer')

custRouter.route('/new')
	.post((req,res)=>{

	})

module.exports = custRouter