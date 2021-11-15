const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json())


// database name: bycycle
// password:RzqrpJQwkfVqFCpo

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pr0er.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
try{
await client.connect();
console.log('connected to database');

// database and collections 
const database = client.db("cycleWebsite");
const productsCollection = database.collection("products");
const userCollection = database.collection("users");
const orderCollection = database.collection("orders");
const reviewCollection = database.collection("reviews");

// get api for all products
app.get('/products', async(req,res)=>{
  const cursor = productsCollection.find({});
  const products = await cursor.toArray();
  res.send(products);
});

// get api for all orders 
  app.get('/orders', async(req,res)=>{
    const cursor = orderCollection.find({});
   const orders = await cursor.toArray();
   res.send(orders);
  });

// get api for all reviews 
app.get('/reviews', async(req,res)=>{
  const cursor = reviewCollection.find({});
  const reviews = await cursor.toArray();
  res.send(reviews);
});

// get single product 
app.get('/products/:id', async(req,res)=>{
  const id = req.params.id;
  const query = {_id:ObjectId(id)};
  const product = await productsCollection.findOne(query);
  res.json(product);

})

// post api for posting all products
app.post('/products', async(req,res)=>{
  const product = req.body;
  console.log('hit the post api',product);

  const result = await productsCollection.insertOne(product);
   res.json(result)

});

// post api for posting reviews 
app.post('/reviews', async(req,res)=>{
  const review = req.body;
  console.log('hit the post api',review);

  const result = await reviewCollection.insertOne(review);
   res.json(result)

});

// post api for ordering products 
app.post('/orders', async(req,res)=>{
  const item = req.body;
  console.log('hit the post api again',item);

  const result = await orderCollection.insertOne(item);
   res.json(result)

});
// test 
app.get('/myOrders/:email', async(req,res)=>{
  const result = await orderCollection.find({email:req.params.email}).toArray();
   res.send(result);

});

// get users by their email address and make an user admin 
app.get('/users/:email', async(req,res)=>{
  const email = req.params.email;
  const query = {email:email};
  const user = await userCollection.findOne(query);
  let isAdmin= false;
  if(user?.role==='admin'){
isAdmin=true;
  }
  res.json({admin:isAdmin});
})


// post all the users info 
app.post('/users', async(req,res)=>{
  const user = req.body;
  const result = await userCollection.insertOne(user);
  console.log(result);
  res.json(result);
})

// upsert user 
app.put('/users', async(req,res)=>{
  const user = req.body;
  const filter = {email:user.email};
  const options={upsert:true};
  const updateDoc={$set:user};
  const result=await userCollection.updateOne(filter,updateDoc,options);
  res.json(result);
})

// test 1 
app.put("/updateStatus/:id", (req,res)=>{
  const id = req.params.id;
  const updatedStatus = req.body.status;
  const filter = {_id:ObjectId(id)};
  console.log(updatedStatus);
  const result =  orderCollection.updateOne(filter,{
    $set:{status:updatedStatus},
  })
  .then(result=>{
    console.log(result);
  })
})

// set user role admin for the admin 
 app.put('/users/admin', async(req,res) => {
   const user = req.body;
   const filter = {email:user.email};
   const updateDoc = {$set: {role: 'admin'}};
  const result = await userCollection.updateOne(filter,updateDoc);
   res.json(result);

 })


}
finally{

}

}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

