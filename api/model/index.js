// database config
const db = require('../config');
console.log();

// bcrypt module
const{hash, compare, hashSync} = require('bcrypt');
// Middleware for creating a token
const {createToken} = require('../middleware/AuthenticatedUser');
// user

class User {
    login(req, res) {
        const {emailAdd, userPass} = req.body;
        const strQry =
        `
        SELECT firstName, lastName, cellphoneNumber, emailAdd, userPass, userRole, gender , userProfile 
        FROM Users
        WHERE emailAdd = '${emailAdd}';
        `;
       db.query(strQry, async (err,data) => {
        if(err) throw err;
        if((!data.length) ||(data == null )) {
            res.status(401).json({err:
            "You provided the wrong email address"});
        }else{
            await compare(userPass,
                data[0].userPass,(cErr, cResult)=> {
                    if(cErr) throw cErr;
                    // create a token
                    const jwToken = 
                    createToken(
                        {
                            emailAdd,userPass
                        }
                    );
                    // Saving
                    res.cookie('LegitUser',
                    jwToken, {
                        maxAge: 3600000,
                        httpOnly: true
                    })
                    if(cResult) {
                        res.status(200).json({
                            msg: 'Logged in',
                            jwToken,
                            result:data[0]
                        })
                    }else {
                        res.status(401).json({
                            err: 'You entered an invalid password or did not register.'
                        })
                    }
                })
             }

       })
    }
 fetchUsers(req, res) { 
    const strQry = `SELECT userID, firstName, lastName, cellphoneNumber, emailAdd, userPass, userRole, gender , userProfile 
    FROM Users;`;
    db.query(strQry, (err, data)=>{
        if(err) throw err;
        else res.status(200).json(
            {results: data} );
    })
}
fetchUser(req, res) {
    
    db.query(`SELECT userID, firstName, lastName, cellphoneNumber, emailAdd, userPass, userRole, gender , userProfile  FROM Users WHERE userID = ?`,[req.params.id],
        (err, data)=>{
        if(err) throw err;
        else res.status(200).json(
            {results: data} );
    })
}
async createUser(req, res) {
    // Payload
    let detail = req.body;
    // Hashing user password
    detail.userPass = await
    hash(detail.userPass, 10);
    // This information will be used for authentication.
    let user = {
        emailAdd: detail.emailAdd,
        userPass: detail.userPass
    }
    // sql query
    const strQry =
    `INSERT INTO Users
    SET ?;`;
    db.query(strQry, [detail], (err)=> {
        if(err) {
            res.status(401).json({err});
        }else {
            // Create a token
            const jwToken = createToken(user);
            // This token will be saved in the cookie.
            // The duration is in milliseconds.
            res.cookie("LegitUser", jwToken, {
                maxAge: 3600000,
                httpOnly: true
            });
            res.status(200).json({msg: "A user record was saved."})
        }
    })
}
updateUser(req, res) {
    let data = req.body;
    if(data.userPass !== null ||
        data.userPass !== undefined)
        data.userPass = hashSync(data.userPass, 15);
    const strQry =
    `
    UPDATE Users
    SET ?
    WHERE userID = ?;
    `;
    //db
    db.query(strQry,[data, req.params.id],
        (err)=>{
        if(err) throw err;
        res.status(200).json( {msg:
            "A row was affected"} );
    })
}
deleteUser(req, res) {
    const strQry =
    `
    DELETE FROM Users
    WHERE userID = ?;
    `;
    //db
    db.query(strQry,[req.params.id],
        (err)=>{
        if(err) throw err;
        res.status(200).json( {msg:
            "A record was removed from a database"} );
    })
}
}

// Product
class Product {
    fetchProducts(req, res) {
        const strQry = `SELECT productID, prodName, prodCategory, prodDescription, prodPrice, prodType,
        prodQuantity, imgURL 
        FROM Products;`;
        db.query(strQry, (err, results)=> {
            if(err) throw err;
            res.status(200).json({results})
        });
    }
    fetchProduct(req, res) { 
        const strQry = `SELECT productID, prodName, prodCategory, prodDescription, prodPrice, prodType,
        prodQuantity, imgURL 
        FROM Products
        WHERE productID = ?;`;
        db.query(strQry, [req.params.id], (err, results)=> {
            if(err) throw err;
            res.status(200).json({results})
        });
    }
    addProduct(req, res) {
        const data = req.body;
        const strQry =
        `
        INSERT INTO Products
        SET ?;
        `;
        db.query(strQry,[data],(err)=> {
                if(err){
                    res.status(400).json({err: "Sorry unable to insert a new record."});
                }else {
                    res.status(200).json({msg: "AWESOME! a product was saved"});
                }
            }
        );
    }
    updateProduct(req, res) {
        const strQry =
        `
        UPDATE Products
        SET ?
        WHERE productID = ?
        `;
        db.query(strQry,[req.body, req.params.id],
            (err)=> {
                if(err){
                    res.status(400).json({err: "Sorry Unable to update a record."});
                }else {
                    res.status(200).json({msg: "COOL! a product was updated"});
                }
            }
        );
    }
    deleteProduct(req, res) {
        const strQry =
        `
        DELETE FROM Products
        WHERE productID = ?;
        `;
        db.query(strQry,[req.params.id], (err)=> {
            if(err) res.status(400).json({err: "Sorry could not remove product"});
            res.status(200).json({msg: "NICE! a product was deleted."});
        })
    }
}

class Cart {
    addCart(req, res) {
        const data = req.body;
        const strQry =
        `
        INSERT INTO Cart
        SET ?;
        `;
        db.query(strQry,[data],(err)=> {
                if(err){
                    res.status(400).json({err: "Sorry Unable to insert into cart."});
                }else {
                    res.status(200).json({msg: "GREAT! saved to cart"});
                }
            }
        );
    }
    fetchCart(req, res) {
        const strQry = 
        `SELECT prodName, prodPrice, imgURL
        FROM Users
        inner join Cart on Users.userID = Cart.userID
        inner join Products on Cart.productID = Products.productID
        where Cart.userID = ${req.params.id}
        `;
        db.query(strQry, (err, results)=> {
            if(err) throw err;
            res.status(200).json({results})
        });
    }

    deleteAllcart(req, res) {
        const strQry =
        `
        DELETE FROM Cart
        WHERE userID = ?;
        `;
        db.query(strQry,[req.params.id], (err)=> {
            if(err) res.status(400).json({err: "Sorry could not remove."});
            res.status(200).json({msg: "COMPLETE! all orders was removed."});
        })
    }
    deleteCart(req, res) {
        const strQry =
        `
        DELETE FROM Cart
        WHERE productID = ?;
        `;
        db.query(strQry,[req.params.id], (err)=> {
            if(err) res.status(400).json({err: "Sorry could not remove."});
            res.status(200).json({msg: "SUCCESSFUL! a order was removed."});
        })
    }

    updateCart(req, res) {
        const strQry =
        `
        UPDATE Cart
        SET ?
        WHERE orderID = ?
        `;
        db.query(strQry,[req.body, req.params.id],
            (err)=> {
                if(err){
                    res.status(400).json({err: "Sorry unable to update a record."});
                }else {
                    res.status(200).json({msg: "COOL! a product was updated"});
                }
            }
        );
    }
}  
    

// Export User class
module.exports = {
    User,
    Product,
    Cart
}