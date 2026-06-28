const mongo=require('mongodb');
const MongoClient=mongo.MongoClient;
const MONGO_URL="mongodb://aseem:aseem2211@ac-iiyvyup-shard-00-00.u3spnlg.mongodb.net:27017,ac-iiyvyup-shard-00-01.u3spnlg.mongodb.net:27017,ac-iiyvyup-shard-00-02.u3spnlg.mongodb.net:27017/?ssl=true&replicaSet=atlas-4zi1z4-shard-0&authSource=admin&appName=node";
let _db;
const mongoconnect=(callback)=>{
   MongoClient.connect(MONGO_URL).then(client=>{
    
    
    callback();
    _db=client.db("vibevault");
}).catch(err=>{
    console.log('Error while connecting to mongo:',err);
});
}
const getdb=()=>{
    if(!_db){
        throw new Error('mongo not connected');
    }
    return _db;
}
exports.mongoconnect=mongoconnect;
exports.getdb=getdb;
