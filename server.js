const express = require("express");

const app = express();

const path = require("path");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'static')));

app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

mongoose.connect('mongodb://localhost/message_board_db')

mongoose.Promise = global.Promise;

var server = app.listen(3316, () => {
	console.log("App listening on port 3316");
});

//----------------------------------------Models--------------------------------------------------

var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
	name: {type: String, required: true, minlength: 4},
	post_content: {type: String, required: true},
	comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true});

mongoose.model('Post', PostSchema);
var Post = mongoose.model('Post');

var CommentSchema = new mongoose.Schema({
	name: {type: String, required: true, minlength: 4},
	_post: {type: Schema.Types.ObjectId, ref: 'Post'},
	comment_content: {type: String, required: true}
}, {timestamps: true});

mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');

//----------------------------------------Routes--------------------------------------------------
app.get('/', (req, res) => {
	Post.find({}).populate('comments').exec((err, data) => {
		if(err){
			console.log(err);
			return;
		}
		else{
			res.render('index', {posts: data})
		}
	});
});

app.post('/posts', (req, res) => {
	var post = new Post(req.body);
	post.save( (err, savedPost) => {
		if(err){
			console.log(err);
			return;
		}else{
			console.log(savedPost);
			res.redirect('/')
		}
	})
})

app.post('/comments/:post_id', (req, res) =>{
	console.log(req.body)
	Post.findOne({_id: req.params.post_id}, (findPostErr, foundPost) => {
		if(findPostErr){
			console.log("Line 77", findPostErr.errors);
		}else{
			console.log(foundPost)
			let comment = new Comment(req.body);
			console.log("Comment:", comment);
			comment._post = foundPost._id;
			comment.save( (saveCommentErr, savedComment) => {
				if (saveCommentErr){
					console.log("Line 83", saveCommentErr.errors);
				}else{
					foundPost.comments.push(savedComment);
					foundPost.save( (savePostErr, savedPost) => {
						if (savePostErr){
							console.log("line 88", savePostErr.errors);
						}else{
							res.redirect('/')
						}
					})
				}
			})
		}
	})

})
