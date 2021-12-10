const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const firebaseController = require('../../controllers/firebase.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/test', firebaseController.test);

router.post('/getList', firebaseController.getList);

router.post('/createUser', firebaseController.createUser);

router.post('/updateUser', firebaseController.updateUser);

router.post('/deleteUser', firebaseController.deleteUser);

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Firebase
 *   description: Firebase apis
 */

/**
 * @swagger
 * /firebase/getList:
 *   post:
 *     summary: get user list
 *     tags: [Firebase]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *             properties:
 *             example:
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 * 
 */
