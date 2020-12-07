'use strict';
// App Dependencies
const express = require('express');
const httpMsgs = require('http-msgs');
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

let usernameAccount = '';
let userID = [];

// Routes
app.get('/', indexPage);
// Routes of Search Engine
app.get('/search', showSearchEngine);
app.post('/search', searchMedia);
app.post('/loadMore', loadMore);
// Routes of Login System
app.get('/joinus', loginSystem);
app.post('/signup', signupSystem);
app.post('/signin', signinSystem);
app.post('/logout', logoutSystem);
// Routes for adding item to favorites
app.post('/addFavorite', addFavorite);


// Main Page
function indexPage(request, response) {
    response.render('public/index');
}

// First attempt to the search page
function showSearchEngine(request, response) {
    response.render('./search/search-engine', {images: [], videos: [], gifs: [], noChoice: ''});
}

// 
function addFavorite (request, response) {
    if (usernameAccount != ''){
        let {download_url, url, data_type} = request.body;
        let SQL = `INSERT INTO favoriteLists (download_url, page_url, data_type, user_id) VALUES ($1, $2, $3, $4);`;
        let safeValues = [download_url, url, data_type, userID[0]];
        client.query(SQL, safeValues)
        .then(()=>{
            let SQL = `SELECT * FROM favoriteLists WHERE user_id=${userID[0]};`;
            client.query(SQL)
            .then(results=>{
                response.render('./user/bookmark-list', {userData: results.rows, name: usernameAccount});
            })
        })
    }
}

// Press Log out button
function logoutSystem(request, response) {
    usernameAccount = '';
    response.redirect('/joinus');
}
let page= 0;
let category, searchResult;
function loadMore (request, response) {
    searchMedia(request, response)
    .then(result=>{
        console.log(result);
        let imageUrl = [];
        let url1 = [];
        let type = [];
        let finalArr=[];
        result[0].forEach(item=>{
            imageUrl.push(item.image_url);
            type.push(result[2]);
        });
        result[1].forEach(item=>{
            imageUrl.push(item.image_url);
            type.push(result[2]);
        });
        result[0].forEach(item=>{
            url1.push(item.url);
        });
        result[1].forEach(item=>{
            url1.push(item.url);
        });
        for (let i=0; i< 10;i++){
            let obj = new Object();
            obj.imageURL = imageUrl[i];
            obj.url = url1[i];
            obj.data_type = type[i];
            finalArr.push(obj);

        }
        
        console.log(finalArr);
        httpMsgs.sendJSON(request,response,finalArr)
    })
}
// Getting data from API in the search page
function searchMedia(request, response) {
    const numPerPage = 5;
    ++page;
    const start = ((page - 1) * numPerPage + 1);
    if(!category && !searchResult) {
        category = request.body.category;
        searchResult = request.body.search_engine;
    }
    let key = process.env.PEXEL_Key;
    let keyPixabay = process.env.PIXABAY_KEY;
    let keyGiphy = process.env.GIPHY_KEY;

    if (category === 'images') {
        let url = `https://api.pexels.com/v1/search?query=${searchResult}&per_page=${numPerPage}&page=${start}`;
        return superagent.get(url)
        .set({'Authorization': 'Bearer ' + key})
        .then(results=>{
            let url1 = `https://pixabay.com/api/?key=${keyPixabay}&q=${searchResult}&image_type=photo&per_page=${numPerPage}&page=${start}`;
            let imageResultPexel = results.body.photos.map(item=>{
                return new ImagesPexel(item);
            })
            return superagent.get(url1)
            .then(results=>{
                let imageResultPixabay = results.body.hits.map(item=>{
                    return new ImagesPixabay(item);
                })
                if (page === 1) {
                    response.render('./search/search-engine', {images: [imageResultPexel, imageResultPixabay], videos: [], gifs: [], noChoice: ''})
                }
                let type = 'image';
                return [imageResultPexel, imageResultPixabay, type];
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
    console.log(usernameAccount);
    response.render('./user/sign-up-in');
}

function signupSystem(request, response) {
    let {email, username, password} = request.body;
    checkUsername(username).then(data=>{
        if(data.length === 0) {
            let SQL = `INSERT INTO users (email, username, password) VALUES ($1, $2, $3);`;
            let safeValues = [email, username, password];
            client.query(SQL, safeValues)
            .then(()=>{
                response.redirect('/joinus');
            })
        }
    })
}

function signinSystem (request, response) {
    let {username, password} = request.body;
    checkUsername(username).then(data=>{
        if(data.length >0){
            let SQL = `SELECT id, username, email FROM users WHERE username=$1 AND password=$2;`;
            let safeValues = [username, password];
            client.query(SQL, safeValues)
            .then(results=>{
                userID = [results.rows[0].id];
                usernameAccount = results.rows[0].username;
                let SQL= `SELECT download_url, page_url, note FROM favoriteLists WHERE user_id=$1`;
                client.query(SQL, userID)
                .then(results=>{
                    response.render('./user/bookmark-list', {userData: results.rows, name: usernameAccount});

                })
            })
        }
    })
}

function checkUsername(username){
    let SQL = `SELECT * FROM users WHERE username=$1;`;
    let safeValue = [username];
    return client.query(SQL, safeValue)
    .then(result=>{
        return result.rows;
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