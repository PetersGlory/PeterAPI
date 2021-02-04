var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const fs  = require('fs');
var mysql = require('mysql');
const ports = process.env.PORT || 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// homepage route
app.get('/',  (req, res)=> {
	fs.readFile('./index.html',(err,data)=>{
		res.writeHead(200,{'Content-Type':'text/html'});
		res.write(data);
    return res.end();
	});
});         

// connection configurations
var dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Glory2200',
    database: 'myapi'
});
  
// connect to database
dbConn.connect();

// add a new book  
app.post('/book',  (req, res)=> {

    let name = req.body.name;
    let author = req.body.author;
    
    // validation
    if (!name || !author)
        return res.status(400).send({ error:true, message: 'Please provide book name and author' });

    // insert to db
    dbConn.query("INSERT INTO books (name, author) VALUES (?, ?)", [name, author ],  (error, results, fields)=> {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Book successfully added' });
    });
});

// retrieve all books 
app.get('/books',  (req, res)=> {
    dbConn.query('SELECT * FROM books',  (error, results, fields) =>{
        if (error) throw error;

        // check has data or not
        let message = "";
        if (results === undefined || results.length == 0)
            message = "Books table is empty";
        else
            message = "Successfully retrived all books";

        return res.send({ error: false, data: results, message: message });
    });
});

// retrieve book by id 
app.get('/book/:id',  (req, res)=> {
  
    let id = req.params.id;
  
    if (!id) {
        return res.status(400).send({ error: true, message: 'Please provide book id' });
    }
  
    dbConn.query('SELECT * FROM books where id=?', id,  (error, results, fields)=> {
        if (error) throw error;

        // check has data or not
        let message = "";
        if (results === undefined || results.length == 0)
            message = "Book not found";
        else
            message = "Successfully retrived book data";

        return res.send({ error: false, data: results[0], message: message });
    });
});

// update book with id
app.put('/book',  (req, res)=> {
  
    let id = req.body.id;
    let name = req.body.name;
    let author = req.body.author;
  
    // validation
    if (!id || !name || !author) {
        return res.status(400).send({ error: book, message: 'Please provide book id, name and author' });
    }
  
    dbConn.query("UPDATE books SET name = ?, author = ? WHERE id = ?", [name, author, id],  (error, results, fields)=> {
        if (error) throw error;

        // check data updated or not
        let message = "";
        if (results.changedRows === 0)
            message = "Book not found or data are same";
        else
            message = "Book successfully updated";

        return res.send({ error: false, data: results, message: message });
    });
});

// delete book by id
app.delete('/book',  (req, res) =>{
  
    let id = req.body.id;
  
    if (!id) {
        return res.status(400).send({ error: true, message: 'Please provide book id' });
    }
    dbConn.query('DELETE FROM books WHERE id = ?', [id],  (error, results, fields) =>{
        if (error) throw error;

        // check data updated or not
        let message = "";
        if (results.affectedRows === 0)
            message = "Book not found";
        else
            message = "Book successfully deleted";

        return res.send({ error: false, data: results, message: message });
    });
});



// set port
app.listen(ports, console.log(`Node app is running on port ${ports}`)
);
 
module.exports = app;