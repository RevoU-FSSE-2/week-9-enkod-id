const express = require('express')
const mysql = require('mysql2')
const bodyParser = require ('body-parser')


const app = express() 
app.use(express.json())

const commonResponse = function(data, error){
    if (error){
        return {
            success : false,
            error : error
        }
    }

    return {
            success: true,
            data : data
    }

}


const mysqlCon = mysql.createConnection({
    host: 'localhost',
    port:3306,
    user:'root',
    password:'',
    database:'2023_revou',
})



mysqlCon.connect((err) => {
    if (err) throw err
    console.log("mysql successfully connected")
})

app.use(bodyParser.json())

app.get('/user', (request, response) => {
    mysqlCon.query("select * from 2023_revou.user", (err, result, fields) => {
        if (err){
            response.status(500).json(commonResponse(null, "server error"))
            response.end()
            return
        }

        response.status(200).json(commonResponse(result, null))
        response.end() 
    })
})




app.get('/user/:id', (request, response) => {
    const id = request.params.id
    mysqlCon.query(`SELECT user.id, user.name, user.address, transaction.id, transaction.user_id, transaction.type, sum (transaction.amount)
    FROM user
    INNER JOIN transaction ON transaction.user_id = transaction.user_id WHERE transaction.user_id = ? GROUP by transaction.user_id;`, id, (err, result, fields) => {
        if (err){
            response.status(500).json(commonResponse(null, "server error"))
            response.end()
            return
        }

        response.status(200).json(commonResponse(result[0], null))
        response.end() 
    })

})

app.post('/transaction', (request, response) => {
    const body = request.body

    mysqlCon.query(`
        insert into 
        2023_revou.transaction (user_id, type, amount) values (?, ?, ?)
        `, [body.user_id, body.type, body.amount], (err, result, fields) => {
            if (err){
                response.status(500).json(commonResponse(null, "server error"))
                response.end()
                return
            }
    
            response.status(200).json(commonResponse(result[0], null))
            response.end() 
        }
    )
})
let data = []; 

app.put('/transaction/:id', (req, res) => {
   
    const transactionId = req.params.id;
    const { user_id, type, amount } = req.body;
  
    const sql = 'UPDATE transaction SET user_id = ?, type = ?, amount = ? WHERE id = ?';
    const values = [user_id, type, amount, transactionId];
  
    mysqlCon.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error updating transaction:', err);
        res.status(500).json({ error: 'An error occurred' });
      } else {
        if (result.affectedRows === 0) {
          res.status(404).json({ error: 'Transaction not found' });
        } else {
          res.json({ id: transactionId });
        }
      }
    });
});

app.delete('/transaction/:id', (request, response) => {
    const id = request.params.id
    mysqlCon.query("delete from 2023_revou.transaction where id = ?", id, (err, result, fields) => {
        if (err){
            response.status(500).json(commonResponse(null, "server error"))
            response.end()
            return
        }

        if(result.affectedRows == 0){
            response.status(404).json(commonResponse(null, "data not found"))
            response.end()
            return
        }

        response.status(200).json(commonResponse({
            id: id
        }, null))
        response.end() 
    })
})


app.listen(3000, () => {
    console.log("running in 3000")
})


