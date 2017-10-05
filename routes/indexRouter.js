'use strict'
const 	express = require('express'),
		isLoggedIn = require('../middlewares/middleware'),
		router = express.Router()

router.use('/login' , require('./authRouter').loginRouter)
router.use('/logout' , require('./authRouter').logoutRouter)
router.use('/loginFailure' , require('./authRouter').authFailureRouter)

router.use('/customer' , isLoggedIn , require('./custRouter'))
router.use('/item' , isLoggedIn , require('./itemRouter'))
router.use('/bill' , isLoggedIn , require('./billRouter'))
router.use('/order' , isLoggedIn , require('./orderRouter'))
router.use('/report' , isLoggedIn , require('./reportRouter'))

module.exports = router