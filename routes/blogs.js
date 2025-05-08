const express = require('express');
const router = express.Router();
const fs = require('fs');

const BLOGS_FILE = 'blogs.json';

const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        console.log('No user found.');
        res.redirect('/login');
    }
}

router.get('/', requireAuth, function (req, res, next) {
    const blogs = JSON.parse(fs.readFileSync(BLOGS_FILE));

    const email = req.session.user.email;

    res.render('blogs', {blogs, email});
});

router.get('/new', requireAuth, function (req, res, next) {
    const email = req.session.user.email;
    res.render('new_blog', {error: null, email});
});

router.post('/new', requireAuth, function (req, res, next) {
    const {title, description, content} = req.body;

    if (!title || !content) {
        res.render("new_blog", {error: "Missing title or content"});
    }

    const blogs = JSON.parse(fs.readFileSync(BLOGS_FILE));
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
    const currentMonthString = months[currentMonth];
    const formatedDate = `${currentDay} ${currentMonthString} ${currentYear}`;
    const newBlog = {
        id: String(Date.now()),
        title,
        description,
        content,
        author: req.session.user.email,
        date: new Date().toLocaleString(),
        formatedDate
    }

    blogs.unshift(newBlog);
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2));
    res.redirect('/blogs');
});

router.get('/:blogId', requireAuth, function (req, res, next) {
    const email = req.session.user.email;
    const { blogId } = req.params

    const data = fs.readFileSync(BLOGS_FILE)
    const blogs = JSON.parse(data);

    const blog = blogs.find(blog => blog.id === blogId);
    console.log(blog);

    res.render('blog', { email, blogs, blog });
});

module.exports = router;
