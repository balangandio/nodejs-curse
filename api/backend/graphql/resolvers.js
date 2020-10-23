const path = require('path');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const { deleteFile } = require('../util/file');
const { SERVER_JWT_TOKEN_KEY } = require('../middleware/auth');
const User = require('../models/user');
const Post = require('../models/post');

module.exports = {
    createUser: async function({ userInput }, req) {
        const { name, email, password} = userInput;

        const errors = [];

        if (!validator.isEmail(email)) {
            errors.push('Invalid E-mail!');
        }

        if (validator.isEmpty(name)) {
            errors.push('Empty name input!');
        }

        if (errors.length > 0) {
            const error = new Error('Validation error!');
            error.code = 422;
            error.data = errors;
            throw error;
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error('User E-mail exists already!');
            error.code = 422;
            error.data = email;
            throw error;
        }

        const hashedPw = await bcrypt.hash(password, 12);
        let user = new User({ email, name, password: hashedPw});

        user = await user.save();

        return {
            ...user._doc,
            _id: user._id.toString()
        };
    },
    login: async function({email, password}, req) {
        const user = await User.findOne({ email });
        
        if (!user) {
            const error = new Error('User not found!');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            const error = new Error('Incorrect password!');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        }, SERVER_JWT_TOKEN_KEY, { expiresIn: '1h' });

        return { token, userId: user._id.toString() };
    },
    createPost: async function({ postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const errors = [];

        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
            errors.push({ message: 'Title is invalid.' });
        }

        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
            errors.push({ message: 'Content is invalid.' });
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input.');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('Invalid user.');
            error.code = 401;
            throw error;
        }

        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user
        });

        const createdPost = await post.save();
        user.posts.push(createdPost);
        await user.save();

        return {
            ...createdPost._doc,
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()
        };
    },
    posts: async function({ page }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        if (!page) {
            page = 1;
        }
        const perPage = 2;

        const totalPosts = await Post.collection.countDocuments();
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('creator');

        return {
            posts: posts.map(p => {
                return {
                    ...p._doc,
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString()
                };
            }),
            totalPosts
        };
    },
    post: async function({ id }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id)
            .populate('creator');

        if (!post) {
            const error = new Error('No post found!');
            error.code = 404;
            throw error;
        }

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }
    },
    updatePost: async function({ id, postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const errors = [];

        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
            errors.push({ message: 'Title is invalid.' });
        }

        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
            errors.push({ message: 'Content is invalid.' });
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input.');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        let post = await Post.findById(id).populate('creator');

        if (!post) {
            const error = new Error('No post found!');
            error.code = 404;
            throw error;
        }

        post.title = postInput.title;
        post.content = postInput.content;
        if (postInput.imageUrl) {
            post.imageUrl = postInput.imageUrl;
        }

        await post.save();

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };
    },
    deletePost: async function({ id }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        let post = await Post.findById(id);

        if (!post) {
            const error = new Error('No post found!');
            error.code = 404;
            throw error;
        }

        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized!');
            error.code = 403;
            throw error;
        }

        deleteFile(path.join('images', post.imageUrl));

        await Post.deleteOne({ _id: new ObjectId(id) });

        const user = await User.findById(req.userId);
        user.posts.pull(id);
        await user.save();

        return true;
    },
    user: async function(args, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('No user found!');
            error.code = 404;
            throw error;
        }

        return { ...user._doc, _id: user._id.toString() };
    },
    updateStatus: async function({ status }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('No user found!');
            error.code = 404;
            throw error;
        }

        user.status = status;
        await user.save();

        return { ...user._doc, _id: user._id.toString() };
    }
};