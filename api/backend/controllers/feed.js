const path = require('path');

const { validationResult } = require('express-validator');

const { getIO } = require('../socket');
const { deleteFile } = require('../util/file');
const pathUtil = require('../util/path');
const Post = require('../models/post');
const User = require('../models/user');
const { ObjectId } = require('mongodb');


const deleteImageFile = (imageUrl) => {
    if (imageUrl.indexOf('data:image') !== 0) {
        deleteFile(path.join(pathUtil.path, 'images', imageUrl));
    }
};


exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;

    try {
        const total = await Post.collection.countDocuments();

        const posts = await Post.find()
            .populate('creator')
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
    
        res.status(200).json({
            message: 'Posts retrived',
            posts,
            totalItems: total
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

exports.postPost = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty() || !req.file) {
        const error = new Error('Invalid input data');
        error.statusCode = 422;
        throw error;
    }
    
    const { title, content } = req.body;

    let post = new Post({
        title,
        content,
        creator: req.userId,
        imageUrl: req.file.filename
    });

    try {
        post = await post.save();

        let user = await User.findById(req.userId);
        user.posts.push(post);

        user = await user.save();

        getIO().emit('posts', {
            action: 'create',
            post: {
                ...post._doc,
                creator: { _id: req.userId, name: user.name }
            }
        });

        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
            creator: { _id: user._id.toString(), name: user.name }
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getPost = (req, res, next) => {
    const { postId } = req.params;

    Post.findById(postId).then(post => {
        if (!post) {
            const error = new Error('Post not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: 'Post fetched', post });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.putPost = async (req, res, next) => {
    const { postId } = req.params;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Invalid input data');
        error.statusCode = 422;
        throw error;
    }

    let { title, content, image } = req.body;

    if (req.file) {
        image = req.file.filename;
    }

    if (!image) {
        const error = new Error('No image especified!');
        error.statusCode = 422;
        throw error;
    }

    try {
        let post = await Post.findById(postId)
            .populate('creator');

        if (!post) {
            const error = new Error('Post not found!');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator._id.toString() !== req.userId) {
            const error = new Error('Not Authorized!');
            error.statusCode = 403;
            throw error;
        }

        if (image !== post.imageUrl) {
            deleteImageFile(post.imageUrl);
        }

        post.title = title;
        post.imageUrl = image;
        post.content = content;

        post = await post.save();

        getIO().emit('posts', { action: 'update', post });

        res.status(200).json({ message: 'Post updated', post });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            const error = new Error('Post not found!');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized!');
            error.statusCode = 403;
            throw error;
        }

        deleteImageFile(post.imageUrl);

        await Post.deleteOne({ _id: new ObjectId(postId) });
    
        const user = await User.findById(req.userId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        getIO().emit('posts', { action: 'delete', post: postId });

        res.status(200).json({ message: 'Post deleted' });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};