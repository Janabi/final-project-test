'use strict';
// App Dependencies
const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());
const superagent = require('superagent');
const methodOverride = require('method-override');

const PORT = process.env.PORT;
// App Setups
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

// Routes
app.get('/', indexPage);
// Routes of Search Engine
app.get('/search', showSearchEngine);
app.post('/search', searchMedia);
// Routes of Login System
app.get('/joinus', loginSystem);
app.post('/signup', signupSystem);
app.post('/signin', signinSystem)


// Main Page
function indexPage(request, response) {
    response.render('public/index');
}

// First attempt to the search page
function showSearchEngine(request, response) {
    response.render('./search/search-engine', {images: [], videos: [], gifs: [], noChoice: ''});
}

// Getting data from API in the search page
function searchMedia(request, response) {
    console.log(request.query);
    let category = request.body.category;
    console.log(category);
    let searchResult = request.body.search_engine;
    let key = process.env.PEXEL_Key;
    let keyPixabay = process.env.PIXABAY_KEY;
    let keyGiphy = process.env.GIPHY_KEY;

    if (category === 'images') {
        let url = `https://api.pexels.com/v1/search?query=${searchResult}&total_results=5`;
        superagent.get(url)
        .set({'Authorization': 'Bearer ' + key})
        .then(results=>{
            
            let url1 = `https://pixabay.com/api/?key=${keyPixabay}&q=${searchResult}&image_type=photo`;
            let imageResultPexel = results.body.photos.map(item=>{
                return new ImagesPexel(item);
            })
            superagent.get(url1)
            .then(results=>{
                let imageResultPixabay = results.body.hits.map(item=>{
                    return new ImagesPixabay(item);
                })
                response.render('./search/search-engine', {images: [imageResultPexel, imageResultPixabay], videos: [], gifs: [], noChoice: ''})
            })
            
        })
    } else if (category==='videos'){
        let url =`https://api.pexels.com/videos/search?query=${searchResult}&total_results=5`;
        superagent.get(url)
        .set({'Authorization': 'Bearer ' + key})
        .then(results=>{
            let videoResultPexel= results.body.videos.map(item=>{
                return new VideosPexel(item);
            })
            let url1=`https://pixabay.com/api/videos/?key=${keyPixabay}&q=${searchResult}`;
            superagent.get(url1)
            .then(results=>{
                let videoResultPixabay= results.body.hits.map(item=>{
                    return new VideoPixabay(item);
                })
                response.render('./search/search-engine',{images:[], videos: [videoResultPexel,videoResultPixabay], gifs: [], noChoice: ''})
            })
        })
    } else if(category === 'gifs') {
        let url =`https://api.giphy.com/v1/gifs/search?api_key=${keyGiphy}&q=${searchResult}&limit=5`;
        superagent.get(url)
        .then(results=>{
            let giphyResult = results.body.data.map(item=>{
                return new Giphy(item);
            });
            response.render('./search/search-engine', {images: [], videos: [], gifs: giphyResult, noChoice: ''})
        })
    } else {
        response.render('./search/search-engine', {images: [], videos: [], gifs: [], noChoice: 'You have to pick a category'})
    }
    
}

// Login System
function loginSystem (request, response) {
    response.render('./user/sign-up-in');
}

function signupSystem(request, response) {
    let {email, username, password} = request.body;
    if (checkUsername(username) === undefined){
        let SQL = `INSERT INTO users (email, username, password) VALUES ($1, $2, $3);`;
        let safeValues = [email, username, password];
        client.query(SQL, safeValues)
        .then(()=>{
            response.redirect('/joinus');
        })
    }
}

function signinSystem (request, response) {
    let {username, password} = request.body;
    if (checkUsername(username)) {
        let SQL = `SELECT username, email FROM users WHERE username=$1 AND password=$2;`;
        let safeValues = [username, password];
        client.query(SQL, safeValues)
        .then(results=>{
            console.log(results.rows);
            response.render('./user/bookmark-list', {userData: results.rows[0]});
        })
    }
    console.log('hello')
}

function checkUsername(username){
    let SQL = `SELECT * FROM users WHERE username=$1;`;
    let safeValue = [username];
    client.query(SQL, safeValue)
    .then(result=>{
        return result.rows[0];
    })
}

function ImagesPexel(value){
    this.image_url = value.src.original;
    this.url = value.url;
}

function ImagesPixabay(value){
    this.image_url = value.previewURL;
    this.url = value.pageURL;
}

function VideosPexel(value){
    this.video_url = value.video_files[0].link;
    this.url = value.url;
}
function VideoPixabay(value){
    this.video_url=value.videos.medium.url;
    this.url=value.pageURL;
}

function Giphy(value){
    this.gif_url = value.images.original.mp4;
    this.url = value.url;
}

function errorHandler(error, request, response) {
    response.status(404).send(error);
}

client.connect()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`we are hearing on Port ${PORT}`);
    });
});