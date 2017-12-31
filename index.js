

var express = require('express')
var request = require('request');
var jsonfile = require('jsonfile')
var cheerio = require('cheerio');
var Q = require('q');
var app = express()

var file = './data.json';
var file2 = '.testData.json';
var repos = './repos.json';
var stats = './stats.json';

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

//Call Github Search API
var username = "huynhkev7";
var password = "jjk13214";
var url = "https://api.github.com/search/repositories?q=topic:cryptocurrency pushed:>2017-02-10 fork:true forks:>=100";
var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

function writeStats(){
  jsonfile.readFile(file, function(err, reposData) {
    var statsObj = [];
    for(var key in reposData){
      var sizeArr = reposData[key].size;
      var forksArr = reposData[key].forks;
      var watchersArr = reposData[key].watchersCount;
      var stargazersArr = reposData[key].stargazersCount;
      var networkArr = reposData[key].networkCount;
      var subscribersArr = reposData[key].subscribersCount;
      var pushedEventArr = reposData[key].pushedEvents;
      statsObj.push({
        name: reposData[key].name,
        desc: reposData[key].desc,
        url: key,
        updatedDate: reposData[key].updatedDate,
        currentSize: sizeArr[sizeArr.length - 1].sizeCount,
        currentWatchers: watchersArr[watchersArr.length - 1].watchersCount,
        currentForks: forksArr[forksArr.length - 1].forkCount,
        sizeDailyGrowth: sizeArr[sizeArr.length - 1].sizeCount - sizeArr[0].sizeCount,
        watchersDailyGrowth: watchersArr[watchersArr.length - 1].watchersCount - watchersArr[0].watchersCount,
        forksDailyGrowth: forksArr[forksArr.length - 1].forkCount - forksArr[0].forkCount,
        stargazersDailyGrowth: stargazersArr[stargazersArr.length - 1].stargazersCount - stargazersArr[0].stargazersCount,
        networkDailyGrowth: networkArr[networkArr.length - 1].networkCount - networkArr[0].networkCount,
        subscribersDailyGrowth: subscribersArr[subscribersArr.length - 1].subscribersCount - subscribersArr[0].subscribersCount,
        pushedEventsDailyGrowth: pushedEventArr.length
      });
    }
    console.log('writing to file...');
    jsonfile.writeFile(stats,statsObj, function(err){
      console.log('error ' + err);
    });
  });
}

function getStats(){
  jsonfile.readFile(repos, function(err, reposData) {
    // var reposData = {
    //   'listOfRepos': ['https://api.github.com/repos/ripple/ilp-plugin-xrp-paychan']
    // };

    var list = [];
    for(var i = 0; i < reposData.listOfRepos.length; i++){
      let deferred = Q.defer();
      var repoOptions = {
        url: reposData.listOfRepos[i],
        headers: {
          'User-Agent': 'huynhkev7',
          'Authorization': 'token f5c7d965fdb12a4fded11c6948fde86a9cd09713'
        },
      }
      request(repoOptions, function(error, response, body){
        if (!error && response.statusCode == 200) {
          try{
            var info = JSON.parse(body);
            console.log("success");
             //console.log(info);
             console.log(info.url)
             deferred.resolve(info);
          }catch(e){
            console.log(repoOptions);
            console.log('error while parsing ' + e);
            deferred.resolve(null);
          }
        }else{
          console.log(repoOptions);
          console.log('error ' + body)
          //console.log(response);
           deferred.resolve(null);
        }
      });
      list.push(deferred.promise);
    }
    Q.all(list).then(function(data){
      //console.log(data);
      
      console.log("got data!!!");
      console.log(data.length);
      
      parseResponseFromGit(data);
    })
  });
}
//updateRepoList();
//getStats();
writeStats();
//getRateLimit();
function getRateLimit(){
  
  var repoOptions = {
    url:'https://api.github.com/rate_limit',
    headers: {
      'User-Agent': 'huynhkev7',
      'Authorization': 'token f5c7d965fdb12a4fded11c6948fde86a9cd09713'
    },
  }

  request(repoOptions, function(error, reponse, body){
    console.log(body);
  })


}
function repoCallBack(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    return info;
    // parseResponseFromGit(info);
  }
}


var options = {
  url: url,
  headers: {
    'User-Agent': 'huynhkev7',
    'auth': auth
  },
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    parseResponseFromGit(info);
  }
}

//request(options, callback);

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

function parseResponseFromGit(info){
  var date = new Date();
  jsonfile.readFile(file, function(err, savedData) {
    if(!savedData){
      savedData = {};
    }
    var listOfRepos = info;
    console.log("aasds" + listOfRepos.length);
    for(var i = 0; i < listOfRepos.length; i++){
      if(listOfRepos[i] !== null){
        var repo = listOfRepos[i];
        var url = repo.url;
        var name = repo.name;
        console.log('success repo name: ' + repo.url);
        var desc = repo.description;
        var createdDate = repo.created_at;
        var updatedDate = repo.updated_at;
        var pushedDate = repo.pushed_at;
        var size = repo.size;
        var forks = repo.forks_count;
        var watchersCount = repo.watchers_count;
        var stargazersCount = repo.stargazers_count;
        var networkCount = repo.network_count;
        var subscribersCount = repo.subscribers_count;
        if(!savedData.hasOwnProperty(url)){
          var watchArray = [
            {
              'watchersCount': watchersCount,
              'date': date
            }
          ]; 
          var forkArray = [
            {
              'forkCount': forks,
              'date': date
            }
          ]; 
          var sizeArray = [
            {
              'sizeCount': size,
              'date': date
            }
          ]; 
          var starGazersArray = [
            {
              'stargazersCount': stargazersCount,
              'date': date
            }
          ]; 
          var networkArray = [
            {
              'networkCount': networkCount,
              'date': date
            }
          ]; 
          var subscribersArray = [
            {
              'subscribersCount': subscribersCount,
              'date': date
            }
          ];

          var pushedArray = [];
          pushedArray.push(pushedDate);

          savedData[url] = {
            'name': name,
            'desc': desc,
            'size': sizeArray,
            'createdDate': createdDate,
            'updatedDate': updatedDate,
            'pushedDate': pushedDate,
            'forks': forkArray,
            'watchersCount': watchArray,
            'stargazersCount': starGazersArray,
            'networkCount': networkArray,
            'subscribersCount': subscribersArray,
            'pushedEvents': pushedArray
          } 
        }else{
          var watchCount = {
            'watchersCount': watchersCount,
            'date': date
          }
          var forkCount = {
            'forkCount': forks,
            'date': date
          }
          var sizeCount = {
            'sizeCount': size,
            'date': date
          }
          var stargazersCount = {
            'stargazersCount': stargazersCount,
            'date': date
          }
          var networkCount = {
            'networkCount': networkCount,
            'date': date
          }
          var subscribersCount = {
            'subscribersCount': subscribersCount,
            'date': date
          }
          console.log(savedData[url]);
          savedData[url]['watchersCount'].push(watchCount);
          savedData[url]['forks'].push(forkCount);
          savedData[url]['size'].push(sizeCount);
          savedData[url]['stargazersCount'].push(stargazersCount);
          savedData[url]['networkCount'].push(networkCount);
          savedData[url]['subscribersCount'].push(subscribersCount);
          savedData[url]['updatedDate'] = updatedDate;
          savedData[url]['pushedDate'] = pushedDate;
          //if the last pushed date has not been recorded, then it must be a new push commit
          if(savedData[url]['pushedEvents'].indexOf(pushedDate) === -1){
            savedData[url]['pushedEvents'].push(pushedDate);
          }
        }
        //console.log('savedData length ' + savedData.length );
      }else{
        console.log('repo name: null');
      }
    }
    jsonfile.writeFile(file, savedData, function (err) {
      console.log("error: " + err);
    })
  })
}

  
var coinsEndpoint = 'https://coinmarketcap.com/all/views/all/';
var dumby = 'https://coinmarketcap.com/coins/';

function updateRepoList(){
  url = 'https://coinmarketcap.com/';
  var list = [];
  
  callCoinMarketCap(url).then(function(data){
    var finalListOfRepos = [];
    for(var i = 0; i < data.length; i++){
      for(var j = 0; (data[i] != null) && (j < data[i].length); j++){
        if(data[i][j].includes('bitbucket.org')){
          console.log('found ibitbucket');
          finalListOfRepos.push(data[i][j]);
        }else{
          finalListOfRepos.push('https://api.github.com/repos' + data[i][j]);
        }
      }
    }
    console.log('FINAL DATA  : ' + finalListOfRepos);
    jsonfile.readFile(file, function(err, currentRepoList) {
        var obj = {
          'lastUpdated': new Date(),
          'listOfRepos': finalListOfRepos
        }
        jsonfile.writeFile(repos, obj, function (err) {
          console.log("error: " + err);
        })
    })
  })  
}


function callCoinMarketCap(url){
  console.log('entering callCoinMarketCap');
  let deferred = Q.defer();
  request(url, function(error, response, html){
      if(!error){
        getCoinSourceCodeEndpoints(html).then(function(result){
          deferred.resolve(result);
        })
      }
  })
  return deferred.promise;
}


function getCoinSourceCodeEndpoints(html){
  console.log('entering getCoinSourceCodeEndpoints');
  let deferred = Q.defer();
  var tempList = [];
  var baseEndpoint = 'https://coinmarketcap.com';
  var $ = cheerio.load(html);
  $('.currency-name-container').each(function(i){
    let d2 = Q.defer();
    var linkToCoin = $(this).attr('href');
    console.log('link to coin: ' + linkToCoin);
    //console.log('i ' + i);
    call(baseEndpoint, linkToCoin, i).then(function(listPromise){
        //console.log("promise " +  listPromise);
        d2.resolve(listPromise);
        
        //return 
     })
     tempList.push(d2.promise);
     //console.log(tempList);
    //  if(i === 500){
    //     return false;
    //  }
    })

  Q.all(tempList).then(function(data){
    console.log('data returned from array of promises - ' + data.length + ' entries');
    //console.log(data)
    deferred.resolve(data);
  });

  // setInterval(function(){
  //   console.log(tempList);
  // },1000 )
  return deferred.promise;
}

function callTwo(baseEndpoint, linkToCoin){
  let d2 = Q.defer();
  call(baseEndpoint, linkToCoin).then(function(listPromise){
    d2.resolve(listPromise); 
  })
 return d2.promise;
}

function call(baseEndpoint, linkToCoin, i){
  let d3 = Q.defer();
  console.log('retrieving ' + baseEndpoint + linkToCoin);
  request(baseEndpoint + linkToCoin, function(error, response, html){
    if(!error){
      getGitPageEndpoints(html, i).then(function(result){
        //console.log(result);
        d3.resolve(result);
        //console.log(tempList);
      })
    }else{
      console.log('error while retrieving git page : ' + error);
      d3.resolve(null);
    }
  })
  return d3.promise;
}

function getGitPageEndpoints(html, i){
  var tempList = [];
  var $ = cheerio.load(html);
  let deferred = Q.defer();
  if($( "a:contains('Source Code')" ).attr('href') !== undefined){
    var sourceCodeEndpoint = $( "a:contains('Source Code')" ).attr('href');
    request(sourceCodeEndpoint, function(error, response, html){
        if(!error){
          try{
            var $ = cheerio.load(html);
            if($('a[itemprop="name codeRepository"]').length > 0){
              $('a[itemprop="name codeRepository"]').each(function(index) {
                var endpoint = $(this).attr('href').replace('https://github.com', '').replace(/\/$/, '');
                tempList.push(endpoint);
                console.log('adding : ' + endpoint);
               });
            }else{
              sourceCodeEndpoint = sourceCodeEndpoint.replace('https://github.com', '').replace(/\/$/, '');
              tempList.push(sourceCodeEndpoint);
              console.log('adding : ' + sourceCodeEndpoint);
            }
            deferred.resolve(tempList);
          }catch(e){
            console.log('Error while parsing git page ' + e);
            deferred.resolve(null);
          }
        }else{
          console.log('Response ' + response + '. Error while calling Git link: ' + error)
          deferred.resolve(null);
        }
     })
  }else{
    console.log('No Source Code Link Found');
    deferred.resolve(null);
  }
  return deferred.promise;
}
