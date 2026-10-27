
import dotenv from "dotenv"
dotenv.config()
import { MongoClient, ObjectId } from "mongodb"
import express from "express";
import  cors  from 'cors'


const app = express();

const port = 8000

const client = new MongoClient(process.env.MONOG_DB_CONNECTOR)

const connectToMongoDB = async () => {
    try {
        await client.connect()
        console.log("You successfully connected to MongoDB!");
        return client
    } catch (error) {
        console.dir(error)
    }
}

const Client = await connectToMongoDB()

const database = Client.db("wnaderlust")

const destanationCollection = database.collection("destination");

app.use(cors())
app.use(express.json())

app.get('/', (req , res) => {
    res.send('Your Server Is Running On Port')
})


app.post('/destination-Create',async (req , res)=>{
    
    const Body = req.body

      const newDestination = await destanationCollection.insertOne(Body);
     console.log("you create a new post successfully");
     
      res.send(newDestination)
})

app.get('/destination', async (req , res)=>{
     const findedData = await destanationCollection.find().toArray()
     console.log("success");
     
     res.status(200).json(
          findedData
     )
})

app.get('/single-destination/:id', async (req , res)=>{
   const destinationID = req.params.id

   const findedData = await destanationCollection.findOne({_id : new ObjectId(destinationID)});

   res.status(200).json({message : "success", findedData})
})

app.patch('/update-destination/:id', async (req , res) => {
    
    const destinationId = req.params.id
    const Body = req.body;
    
    const updatedData = await destanationCollection.updateOne(
        { _id : new ObjectId(destinationId)},
        { $set : Body }
    )
    res.status(200).json(updatedData)
})


app.delete('/delete-destination/:id', async (req , res)=> {
   const destinationId = req.params.id
   const deletedData = await destanationCollection.deleteOne({_id : new ObjectId(destinationId)})
   return res.status(200).json({
    message : "You deleted destination successfully",
    deletedData
   })
})

app.listen(port, ()=>{
    console.log(`the server is running on port ${port}`)   
})