const path = require('path');

const { validationResult } = require('express-validator');

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

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty() || !req.file) {
        const error = new Error('Invalid input data');
        error.statusCode = 422;
        throw error;
    }
    
    const { title, content } = req.body;

    const post = new Post({
        title,
        content,
        creator: req.userId,
        imageUrl: req.file.filename
    });

    post.save().then(post => {
        return User.findById(req.userId)
            .then(user => { return { user, post }; });
    }).then(({ user, post }) => {
        user.posts.push(post);

        return user.save().then(user => {
            return { user, post };
        });
    }).then(({ user, post }) => {
        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
            creator: { _id: user._id.toString(), name: user.name }
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
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

exports.putPost = (req, res, next) => {
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

    Post.findById(postId).then(post => {
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

        if (image !== post.imageUrl) {
            deleteImageFile(post.imageUrl);
        }

        post.title = title;
        post.imageUrl = image;
        post.content = content;

        return post.save();
    }).then(result => {
        res.status(200).json({ message: 'Post updated', post: result });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.deletePost = (req, res, next) => {
    const { postId } = req.params;

    Post.findById(postId).then(post => {
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

        return Post.deleteOne({ _id: new ObjectId(postId) });
    }).then(() => {
        return User.findById(req.userId)
            .then(user => {
                user.posts = user.posts.filter(id => id.toString() !== postId);
                return user.save();
            });
    }).then(() => {
        res.status(200).json({ message: 'Post deleted' });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};