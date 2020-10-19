exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [ { title: 'Some title', content: 'Some content' } ]
    });
};

exports.postPost = (req, res, next) => {
    const { title, content } = req.body;

    res.status(201).json({ message: 'Post created', post: { id: new Date().getTime(), title, content } });
};