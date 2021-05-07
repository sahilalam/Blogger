require('dotenv').config();
const mongodb=require('mongodb');
const mongoClient=mongodb.MongoClient;
const db_url=process.env.DB_URL;
const db_name=process.env.DB_NAME;
const comments_collection='comments';
const videos_collection='videos';
const objectId=mongodb.ObjectId;

let addComment=async(username,video_id,comment)=>{
    try{
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const step1=await db.collection(comments_collection).insertOne({
            username,video_id,comment
        });
        const comment_id=step1.ops[0]._id;
        const step2=await db.collection(videos_collection).updateOne({"_id":new objectId(video_id)},{$push:{"comments":comment_id}});
        client.close();
    }
    catch(err)
    {
        throw err;
    }
}
let getCommentByIds=async(ids)=>{
    try{
        ids=ids.map((id)=>{
            return new objectId(id);
        });
        const client=await mongoClient.connect(db_url);
        const db=await client.db(db_name);
        const data=await db.collection(comments_collection).find({"_id":{$in:ids}}).project({"_id":0,"video_id":0}).toArray();
        client.close();
        return data;
    }
    catch(err)
    {
        throw err;
    }
}
module.exports={
    addComment,getCommentByIds
}