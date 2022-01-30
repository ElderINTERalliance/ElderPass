/**
 * @module Router
 */

const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
// const { logger } = require('../src/loggers');

/**
 * @name get/
 * @description the main page the user sees
 */
router.get('/', function (req, res, next) {
	res.render('index', {
		title: 'ElderPass Home',
		isAuthenticated: req.oidc.isAuthenticated()
	});
});

/**
 * @name get/search
 * @description search for a student by their name to check them in/out
 */
router.get('/search', requiresAuth(), function (req, res, next) {
	res.render('search', {
		title: 'ElderPass Search',
	});
});

/**
 * @name get/scan
 * @description scans a student's QR code to check them in/out
 */
router.get('/scan', requiresAuth(), function (req, res, next) {
	res.render('scan', {
		title: 'ElderPass Scanner',
	});
});

/**
 * @name get/profile
 * @description the user's profile (requires authentication)
 */
router.get('/profile', requiresAuth(), function (req, res, next) {
	res.render('profile', {
		userProfile: JSON.stringify(req.oidc.user, null, 2),
		title: 'Profile page'
	});
});

module.exports = router;
