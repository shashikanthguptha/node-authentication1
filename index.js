const express=require('express');
const {open} = require('sqlite');
const sqlite3=require('sqlite3');
const bcrypt=require('bcrypt');
const app = express();
const path = require('path');
const dbPath=path.join(__dirname, 'goodreads.db');
app.use(express.json());
const database = null;

const intialiseDatabaseAndServer = async () => {
    try{
        database =await open({
            filename : dbPath,
            driver :  sqlite3.Database,
        })
        app.listen(3000, () => console.log("server Running at http://localhost:3000/"))
    }
    catch(error){
        console.log(error.message);
        process.exit(1)
    }
}
intialiseDatabaseAndServer();

//register user 
app.post('/users/', async (request, response) => {
    const {username, name, password, location, gender} = request.body
    const hashedPassword = await bcrypt.hash(password, 10);

    // is user name is valid or not, is name is already exist or not.
    const selectUserQuery = `
    SELECT 
    *
    FROM
    user
    WHERE
    username = '${username}';`;
    const dbUser = await database.get(selectUserQuery);
    if (dbUser == undefined){
        //create new username
        const createUserQuery = `
        INSERT INTO 
        user (username, name, password, location, gender)
        VALUES
        (
            '${username}',
            '${name}',
            '${hashedPassword}',
            '${location}',
            '${gender}'
        );`;
        await database.run(createUserQuery);
        response.send('user created successfully');
    }else{
        //user already exits, change username and create new user
        response.status(400);
        response.send('user already exists')
    }
});
//user Login
app.post('/login/', async (request, response) => {
    const {username, password} = request.body;
    // user details
    const selectUserQuery = `
    SELECT
    *
    FROM
    user
    WHERE
    username = '${username}';`;
    const dbUser = await database.get(selectUserQuery)
    if (dbUser == undefined){
        //user not found
        response.status(400),
        response.send('Invalid user')
    } else{
        //compare is password matches or not
        const isPasswordMatches = await bcrypt.compare(password, dbUser.password);
        if (isPasswordMatches == true){
            //login success
            response.send('login success')
        } else{
            //password is wrong 
            response.status(400);
            response.send('Invalid password')
        }
    }
});