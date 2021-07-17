import express from "express"
import bodyParser from "body-parser";
import path from 'path'
import {MongoClient} from "mongodb";

const app=express();
app.use(express.static(path.join(__dirname,'/build')));
app.use(express.urlencoded({extended: true}));
app.use(express.json())
const WithDB= async (operations,res) =>{
    try
    {
    
    const client=await MongoClient.connect("mongodb://localhost:27017",{useNewUrlParser:true});
    const db=client.db('my-blog');
    await operations(db);
    client.close()
    }
    catch(error){
       res.status(500).json({message:"unable to connect to db",error})
    }
    
}
app.get('/api/articles/:name',async (req,res)=>{
     WithDB(async(db)=>{
        const articleName=req.params.name;
        const article=await db.collection('articles').findOne({name:articleName});
        res.status(200).json(article)
     },res)
 
    })

app.post('/api/articles/:name/comments',(req,res)=>{
    
    WithDB(async(db)=>{
        const articleName=req.params.name;
        const {username,comment}=req.body;
        const article=await db.collection('articles').findOne({name:articleName});
        await db.collection('articles').updateOne(
           {
               name : articleName
            },
           { $set : {comments : article.comments.concat({username,comment}) }}
         );
        
        const updatedarticles=await db.collection('articles').findOne({name:articleName})
        res.status(200).json(updatedarticles)
       },res)
        
})
app.post('/api/articles/:name/upvotes',async (req,res)=>
  {
   WithDB(async(db)=>{
    const articleName=req.params.name;
    const article=await db.collection('articles').findOne({name:articleName});
    await db.collection('articles').updateOne(
       {
           name : articleName
        },
       { $set : {upvotes : article.upvotes+1 }}
     );
    
    const updatedarticles=await db.collection('articles').findOne({name:articleName})
    res.status(200).json(updatedarticles)
   },res)
    
   }  )
   app.get('*',(req,res)=>{
       res.sendFile(path.join(__dirname+'/build/index.html'))
   })
app.listen(8000,()=>console.log("app is listening on port 8000"))