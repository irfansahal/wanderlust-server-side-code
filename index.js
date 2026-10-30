
import dotenv from "dotenv"
dotenv.config()
import { MongoClient, ObjectId } from "mongodb"
import express from "express";
import  cors  from 'cors'
import { createRemoteJWKSet, jwtVerify } from "jose";


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

//  database.createCollection("destination", {

// })

const destanationCollection = database.collection("destination",{

});
const userCollections = database.collection("user")
const bookingsCollections = database.collection("bookings")

app.use(cors())
app.use(express.json())

const verifyMiddleware = async (req, res , next)=> {
     const authorization = req.headers.authorization
     if(!authorization){
        return res.status(401).send({ msc : 'Unauthorized'})
     }
     const token = authorization.split(" ")[1];
     
     if(!token){
        return res.status(401).send({ msc : 'Unauthorized'})
     }
     console.log("from backend", token);

      try {
        const JWKS = createRemoteJWKSet(
        new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
      )
      
      const { payload } = await jwtVerify(token, JWKS, {
         issuer: process.env.CLIENT_URL, // Should match your JWT issuer, which is the BASE_URL
         audience: process.env.CLIENT_URL, // 
      })
      console.log(payload);
      next()  
      
      } catch (error) {
        console.log('Token validation failed:',error)
      }
    
}

app.get('/', (req , res) => {
    res.send('Your Server Is Running On Port')
})


app.post('/destination-Create', verifyMiddleware , async (req , res)=>{
    
    const Body = req.body

      const newDestination = await destanationCollection.insertOne(Body);
     console.log("you create a new post successfully");
     
      res.send(newDestination)
})

app.get('/destination', (req, res, next)=> {
      console.log('This is form meddleware in the destination');
      next()
}, async (req , res)=>{
     const findedData = await destanationCollection.find().toArray()
     console.log("success");
     
     res.status(200).json(
          findedData
     )
})

app.get('/single-destination/:id', verifyMiddleware , async (req , res)=>{
   const destinationID = req.params.id

   const findedData = await destanationCollection.findOne({_id : new ObjectId(destinationID)});

   res.status(200).json({message : "success", findedData})
})

app.patch('/update-destination/:id', verifyMiddleware , async (req , res) => {
    
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

app.post('/booking/:email', async (req , res) => {
    const userEmail = req.params.email
    const bookingItem = req.body

    const currentUser = await userCollections.findOne({
          email : { $eq : userEmail}
        // email : userEmail
    }) 
    const newBooking = await bookingsCollections.insertOne({
        username : currentUser.name,
        ...currentUser,
        ...bookingItem
    });

    res.status(200).json({message : "success" , newBooking })
})

app.get('/find-booking/:email', async (req , res) => {
    const userEmail = req.params.email;
    const currentUserBookings = await bookingsCollections.find({
        email : { $eq : userEmail}
    }).toArray();
    res.status(200).json({message : "success" , currentUserBookings})
});

app.get('/featured', async (req , res)=>{
   const featuredData = await destanationCollection.find({}).limit(5).toArray();
   res.status(200).json({
    message : "You hit the url successfully",
    featuredData
   })
})

app.delete('/deleting/:id', async (req , res)=>{
   const myBookingId = req.params.id
   
   const deletedData = await bookingsCollections.deleteOne({_id :myBookingId});
    console.log("id",deletedData);
   res.status(200).send({
    message : "You bacome success to delete data",
    deletedData
   })
})

app.listen(port, ()=>{
    console.log(`the server is running on port ${port}`)   
})