const express = require('express');

const User = require('../model/user');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth');

const router = express.Router();

function GenerateToken(params = {}) {
    return token = jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

router.post('/register', async (req, res) => {
    try {

        const { email } = req.body;

        if (await User.findOne({ email })) {
            return res.status(400).send({ error: 'User alredy exists' });
        }

        const user = await User.create(req.body);

        user.password = undefined;

        res.send({ user, token: GenerateToken({ id: user.id }) });
    } catch{
        return res.status(400).send({ error: 'Registration failed' });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(400).send({ error: 'User not found' });
    }

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Invalid password' });
    }

    user.password = undefined;

    res.send({ user, token: GenerateToken({ id: user.id }) });
});

module.exports = app => app.use('/auth', router);