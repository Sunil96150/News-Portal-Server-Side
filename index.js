const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000 ;


//midddleware

app.use(cors());
app.use(express.json());




//mongidb import




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxbb8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
       //await client.connect();
    
       const newsCollection = client.db('newsDB').collection('news');
       const newsUserCollection = client.db('newsDB').collection('newsUser');

       app.get('/news' , async(req , res) =>{
        const cursor = newsCollection.find();
        const result = await cursor.toArray();
        res.send(result)
       });

       app.get('/news/:id' , async(req , res) =>{
        const id = req.params.id;
        const query = { _id : new ObjectId(id)}
        const result = await newsCollection.findOne(query);
        res.send(result)
       })


       app.post('/news' , async(req , res) =>{
        const newNews = req.body
        console.log(newNews)
        const result = await newsCollection.insertOne(newNews);
        res.send(result)
       });

       app.put('/news/:id' , async(req , res) =>{
        const id = req.params.id;
        const filter ={ _id : new ObjectId(id)};
        const options = { upsert : true};
        const updateNews = req.body;
        const news = {
            $set : {
                title: updateNews.title,
                category: updateNews.category,
                author: updateNews.author,
                published_at: updateNews.published_at,
                image: updateNews.image,
                content: updateNews.content,
            }
        }

        const result = await newsCollection.updateOne(filter , news , options)
        res.send(result)


       })


       app.delete('/news/:id', async(req , res) => {
        const id = req.params.id;
        const query = { _id : new ObjectId(id)};
        const result = await newsCollection.deleteOne(query);
        res.send(result)
       })

       // news Users apis

       app.get('/newsUser', async(req , res) =>{
        const cursor = newsUserCollection.find();
        const result = await cursor.toArray();
        res.send(result);
       })

      app.get('/newsUser/:email', async (req, res) => {
            const email = req.params.email;
            const user = await newsUserCollection.findOne({ email: email });
            if(user) {
                res.send(user);
            } else {
                res.status(404).send({ message: 'User not found' });
            }
        });

        
       app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            try {
              const user = await newsUserCollection.findOne({ email: email });

              if (user && user.role === 'admin') {
                res.send({ isAdmin: true });
              } else {
                res.send({ isAdmin: false });
              }
            } catch (error) {
              console.error(error);
              res.status(500).send({ isAdmin: false });
            }
          });

       app.post('/newsUser' , async(req , res) =>{
        const newNewsUser = req.body;
       
        const result =await newsUserCollection.insertOne(newNewsUser);
        res.send(result)
       });


       app.patch('/newsUser/:id' , async(req , res) =>{
        const email = req.body.email;
        const filter = { _id: new ObjectId(req.params.id)};
        const UpdatedDoc ={
            $set:{
                role : req.body?.role,
                
            }
        }
        const result = await newsUserCollection.updateOne(filter , UpdatedDoc);
        res.send(result)
       })

       app.delete('/newsUser/:id' , async(req , res) =>{
        const id = req.params.id;
        const query = { _id : new ObjectId(id)};
        const result = await newsUserCollection.deleteOne(query);
        res.send(result);
       })

    
     client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);





app.get('/' , (req , res) =>{
    res.send('news server is running')
})

app.listen(port , () =>{
    console.log(`news server is running on port : ${port}`)
})