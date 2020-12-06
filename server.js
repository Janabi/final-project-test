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
app.get('/search', showSearchEngine);
app.post('/search', searchMedia);

function indexPage(request, response) {
    response.render('public/index');
}

function showSearchEngine(request, response) {
    response.render('./search/search-engine', {images: []});
}

function searchMedia(request, response) {
    console.log(request.query);
    let category = request.body.category;
    console.log(category);
    let searchResult = request.body.search_engine;
    let key = process.env.PEXEL_Key;
    let keyPixabay = process.env.PIXABAY_KEY;

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
                response.render('./search/search-engine', {images: [imageResultPexel, imageResultPixabay]})
            })
            
        })
    }

    
}

function ImagesPexel(value){
    this.image_url = value.src.original;
    this.url = value.url;
}

function ImagesPixabay(value){
    this.image_url = value.previewURL;
    this.url = value.pageURL;
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