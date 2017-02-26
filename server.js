var http = require("http");
var url = require('url');
var fs = require("fs");
var assert=require('assert');
var mongodb = require('mongodb')
var port = process.env.PORT || 8080;
var count = 0;
var database=[];
var gg="";

var MongoClient = mongodb.MongoClient;



MongoClient.connect("mongodb://localhost:27017/links", function(err, db) {
  if(!err) {
    console.log("We are connected");
    var collection = db.collection('links');
    collection.count({},function(err, num){
    	if(err){}
    	else{
    		count=num;
    		console.log("num: "+num);
    		}
    })
  }
  if(err){
  }
});


http.createServer(function(request, response) {
  var urlObj = request.url;
  console.log("urlObj:"+urlObj);
	
	if(urlObj.substring(0,5)==="/new/")
	{
		var suffix=urlObj.substring(5,urlObj.length);
		if(suffix.substring(0,7)=="http://" || suffix.substring(0,8)=="https://")
		{
			count++;
			MongoClient.connect(url, function(err,db){
				if(!err){
					console.log("Connected & ready to write");
					var collection = db.collection('links');
					collection.insert({original: suffix, generated:count}, function(err,data){
						if(!err){
							response.writeHead(200, {"Content-Type": "text/html"})
							response.write("{original: "+suffix+"  generated: "+count);
							response.end();
						}
					})
				}
				
			})
			
			
			writeInDB(suffix,count, function(err,doc){
				if(err){console.log("erre: "+err)}
				else{
					response.write(doc);
					response.end();
				//response.end("Your link has been created");
				}
			})
		}
		else
		{
			response.write("<html><body><p> There is a problem with the link you provided. Correct form: \"http://www.yourwebsite.com\" </p></body></html>");
			response.end();
		}
	
	}
	else if (Number.isInteger(parseInt(urlObj.replace(/\//g, ""))))
	{
	  console.log("fetched");
	  var no = urlObj.replace(/\//g, "");
	  if(no<count){
	  	MongoClient.connect(url, function(err,db){
	  		if(!err){
	  			var collection = db.collection('links');
  				var gene2 = parseInt(no);
  				var cursor =collection.find({generated: gene2});
  				cursor.toArray(function(err, docs){
  					if(!err){
  						console.log("test3");
  						console.log(docs);
  						var link = docs[0]['original'];
  						console.log("link: "+link);
  						response.writeHead(200,{"Content-Type": "text/html"});
  						response.write("<html>");
							response.write("<head>");
							response.write("<title>Redirection</title>");
							response.write("<meta http-equiv=\"refresh\" content=\"5\"; URL=\""+link+"\">");
							response.write("<script type=\"text/javascript\">window.location.href = \""+link+"\"</script>");
							response.write("</head>");
							response.write("<body>Redirection...");
							response.write("</body>");
							response.write("</html>");
							response.end();
  					}
  				}
	  		)}
	  		}
	  		);
    }
	else
	{
    fs.readFile("index.html", function(err, data){
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(data);
    response.end();
    }
    );
	}
}}).listen(port);


var url = 'mongodb://localhost:27017/links';      

function writeInDB(link,count, callback){
	MongoClient.connect(url, function(err, db) {
  if(!err) {
    console.log("We are connected2");
      var collection = db.collection('links');
  		collection.insert({ original: link, generated: count}, function(err,data)
  			{
  				if(!err){ return "{generated: "+count+" original: "+link+"}";}
  				if(err) { return "No such link..."}
  			});
  		}
  if(err){
  	//console.log(err)
  }
});
}
  	