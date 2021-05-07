require('dotenv').config();
const mongodb=require('mongodb');
const mongoClient=mongodb.MongoClient;
const db_url=process.env.DB_URL;
const db_name=process.env.DB_NAME;
const likes_collection='likes';
const videos_collection='videos';
const objectId=mongodb.ObjectId;

let like=async(email,video_id)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const step1=await db.collection(likes_collection).insertOne({
            email,video_id
        });
        const step2=await db.collection(videos_collection).updateOne({'_id':{$eq:new objectId(video_id)}},{$inc:{"likes":1}});
        client.close();
    }
    catch(err)
    {
        throw err;
    }
}
let dislike=async(email,video_id)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const step1=await db.collection(likes_collection).deleteOne({$and:[{'email':email},{"video_id":video_id}]});
        const step2=await db.collection(videos_collection).updateOne({'_id':{$eq:new objectId(video_id)}},{$inc:{"likes":-1}});
        client.close();
    }
    catch(err){
        throw err;
    }
}
let checkLike=async(email,video_id)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const data=await db.collection(likes_collection).findOne({$and:[{'email':email},{"video_id":video_id}]});
        client.close();
        if(data)
        {
            return true;
        }
        return false;
    }
    catch(err)
    {
        throw err;
    }
}
module.exports={
    like,dislike,checkLike
}