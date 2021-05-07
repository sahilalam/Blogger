require('dotenv').config();
const mongodb=require('mongodb');
const mongoClient=mongodb.MongoClient;
const db_url=process.env.DB_URL;
const db_name=process.env.DB_NAME;
const videos_collection='videos';
const users_collection='users';
const objectId=mongodb.ObjectId;

let addVideo=async(title,category,description,date,thumbnail,video_url,email,name)=>{
    try{
        date=new Date(date);
        

        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const step1=await db.collection(videos_collection).insertOne({
            name,title,category,description,date,thumbnail,video_url,likes:0,comments:[],views:0
        });
        let video_id=step1.ops[0]._id;
        const step2=await db.collection(users_collection).updateOne({"email":email},{$push:{"videos":video_id}});
        client.close();

    }
    catch(err)
    {
        throw err;
    }

}
let getVideos=async(offset,filter)=>{
    try{
        let n=20;
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        let f=[{}];
        if(filter)
        {
            if(filter.category)
            {
                f.push({
                    'category':{$eq:filter.category}
                });
            }
            if(filter.date)
            {
               let from =new Date(filter.date.from);
              
               let to=new Date(filter.date.to);
              

                f.push({
                    'date':{$gte:from,$lte:to}
                });
            }
            if(filter.myvideos)
            {
                f.push({
                    "_id":{
                        $in:filter.myvideos
                    }
                })
            }
        }
        let data=await db.collection(videos_collection).find({$and:f}).project({"description":0}).sort({'views':-1}).skip(offset).limit(n+1).toArray();
        client.close();
        let next=false,prev=false;
        if(data.length>n)
        {
            next=true;
            data=data.slice(0,data.length-1);
        }
        if(offset>=10)
        {
            prev=true;
        }
        
       
        return {
            data,next,prev
        } 

    }
    catch(err){
        console.log(err.message)
        throw err;
    }
}

let getVideoById=async(id)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        id=new objectId(id);
        const data=await db.collection(videos_collection).findOne({'_id':{
            $eq:id
        }});
        const view=await db.collection(videos_collection).updateOne({'_id':{
            $eq:id
        }},{$inc:{"views":1}});
        client.close();
        return data;
    }
    catch(err)
    {
        throw err;
    }
}
module.exports={
    addVideo,getVideos,getVideoById
}