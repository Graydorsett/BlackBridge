//$( document ).ready(function() {
//    console.log( "ready!" );
//    formChanged();
//    
//    
//});


var input;  
var output;
function formChanged() {
        input = document.getElementsByName("form")[0].value;
        console.log(input);

}

function clickFunction(){
    NLP();
}

//// DOM Variables
var title = document.getElementById("resultTitle");
var body = document.getElementById("resultBody");
var list = document.getElementById("resultList");
var image = document.getElementById("resultImage");


////////////////////////////////////////////////
/////////// LANGUAGE COMPREHENSION ////////////
//////////////////////////////////////////////

/// LUIS KEY: 256da7db4ce8459284d16aa3483bc63c
/// LUIS: (TEST) APP ID: 8b8b3ee3-ebaa-4906-b3dc-5dafeed53e10
/// WIT KEY: QMI4I2RW4PRFCFSBS56ESGICVVVYXUAE

var outputData;
function NLP(){
    $(function() {
        var params = {
            // Request parameters
        };
      
        $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/luis/v1.0/prog/apps/2b235935-3291-431f-ae70-700de468b14e/predict?example=" + input,
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","256da7db4ce8459284d16aa3483bc63c");
            },
            type: "GET",
            // Request body
            data: "{body}",
        })
        .done(function(data) {
//            console.log("success");
            console.log(data);
            var intentDegree=0.0;
            var intent;
            var entity = data.EntitiesResults[0].word;
            if (data.EntitiesResults[0] != null){
                entity = data.EntitiesResults[0].word;
            } else {
                alert("Sorry, our NLP processor couldn't understand what you're asking.  Try again with different wording.")
            }
//            console.log(data.IntentsResults[0].score)
            for (let i=0; i<data.IntentsResults.length; i++){
                if (data.IntentsResults[i].score >= intentDegree){
                    intentDegree=data.IntentsResults[i].score;
                    intent = data.IntentsResults[i].Name.toLowerCase();
                }
            }
            console.log(intentDegree);
            console.log(intent);
            console.log(entity);
            switch (intent) {
                case 'bartender' :
                    bartender(entity);
                    break;
                case 'distance' :
                    distance(entity);
                    break;
                case 'weather' :
                    weather(entity);
                    break;
                case 'news' :
                    news(entity);
                    break;
                default:
                    console.log("Shit, error");
            }
        })
        .fail(function() {
            alert("error");
        });
    });
}


//////////////////////////////////////////////////
//////////////// APPLICATIONS ////////////////////
/////////////////////////////////////////////////


///// WEATHER /////
function weather(_input){
    console.log('test')
    input = _input;
    $.ajax({
      url : "http://api.wunderground.com/api/750a8aed18ca4b7c/geolookup/conditions/q/IA/" + input + ".json",
      dataType : "jsonp",
      success : function(parsed_json) {
          console.log(parsed_json);
          var location = parsed_json['location']['city'];
          var temp_f = parsed_json['current_observation']['temp_f'];
          console.log("Current temperature in " + location + " is: " + temp_f);
          
          // DOM CHANGE
          clearResults();
          image.src = "assets/icons/weather.png";
          document.getElementById("resultTitle").innerHTML = "Current temperature in " + location + " is " + temp_f + " degrees faranheit";
  }
  });
}

/////// NEWS ///////
function news(_input){
    input = _input;
    //DOM icon/ clear
    clearResults();
    image.src="assets/icons/news.png";
    title.innerHTML = "Lastest " + input + " News";
    
    // Top Stories 'about' var
    var url = "https://api.nytimes.com/svc/topstories/v2/" + input + ".json";
    url += '?' + $.param({
      'api-key': "91c71d4a39714f1cb337ef73f951495f"
    });
    $.ajax({
      url: url,
      method: 'GET',
        }).done(function(result) {
//      console.log(result);
        output=result;
            }).fail(function(err) {
      throw err;
});
    // Object search
    console.log(output.results);
    for (let i=2; output.results[i]; i++){
        console.log(output.results[i].title);
        console.log(output.results[i].abstract);
        console.log("");
        
        var entry = document.createElement('li');
        var element = output.results[i].title;
        var link = output.results[i].url;
        console.log(link);
        entry.appendChild(document.createTextNode(element));
        list.appendChild(entry);
        
        entry = document.createElement('li');
        entry.id = "listSub";
        element = output.results[i].abstract;
        entry.appendChild(document.createTextNode(element));
        list.appendChild(entry);
        
        
        
    }
}




////// TRAVEL DISTANCE AND TIME ////////

// KEY: AIzaSyDKKBQF68Z_oUWiKCf9evYPC3yCo9kE7vo

function distance(_input){
    var destination = _input;
    var origin = "Seattle, WA";
    var distance_text = calculateDistance(origin, destination);
    
    
  function calculateDistance(origin, destination) {
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
    {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    }, callback);
  }

  function callback(response, status) {
    if (status != google.maps.DistanceMatrixStatus.OK) {
      $('#result').html(err);
        console.log("Location error")
    } else {
      var origin = response.originAddresses[0];
      var destination = response.destinationAddresses[0];
      if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
        $('#result').html("Better get on a plane. There are no roads between "
                          + origin + " and " + destination);
      } else {
        var distance = response.rows[0].elements[0].distance;
        var distance_value = distance.value;
        var distance_text = distance.text;
        console.log(response);
        var time = response.rows[0].elements[0].duration.text;
        var miles = distance_text.substring(0, distance_text.length - 3);
        var answer = "It is " + miles + " miles from " + origin + " to " + destination
        $('#result').html("It is " + miles + " miles from " + origin + " to " + destination);
        
          console.log(time);
          console.log(miles);
          
//          //DOM CHANGE
          clearResults();
          image.src="assets/icons/location.png";
          title.innerHTML = "It is " + miles + " miles from " + origin + " to " + destination;
          
      }
    }
  }
}


/////// BARTENDER /////////
function bartender(_input){
    clearResults();
    image.src ="assets/icons/bartender.png";
    
    input = _input;
    //Retreive JSON
    var recipeList;
    var items = [];
    var item;
    $.getJSON( "https://raw.githubusercontent.com/Graydorsett/iba-cocktails/master/recipes.json", function( data ) {
    
        
     recipeList = data;
    /// Search JSON
        for( let i =0; i<recipeList.length; i++){
            if (input.toLowerCase() == recipeList[i].name){
                console.log(recipeList[i].name);
                title.innerHTML = recipeList[i].name + " Recipe";
                
                for (let j=0; j<recipeList[i].ingredients.length; j++){
                    if (recipeList[i].ingredients[j].ingredient == null){
                        console.log(recipeList[i].ingredients[j].special);
                        item = recipeList[i].ingredients[j].special;
                        items.push(item);
                        
                        // DOM
                        var entry = document.createElement('li');
                        var element = item;
                        entry.appendChild(document.createTextNode(element));
                        list.appendChild(entry);

                    } else {
                        console.log(recipeList[i].ingredients[j].amount + ' parts ' + recipeList[i].ingredients[j].ingredient);
                        item = recipeList[i].ingredients[j].amount + ' parts ' + recipeList[i].ingredients[j].ingredient;
                        items.push(item.toString());
                        console.log('test' + item);
                        
                        // DOM
                        var entry = document.createElement('li');
                        var element = item;
                        entry.appendChild(document.createTextNode(element));
                        list.appendChild(entry);
                    }
                }
            }
        }
    });
}



//////////////////////////////////////////////
////////////// DOM FUNCTIONS ////////////////
////////////////////////////////////////////

function clearResults(){
    //Remove previous content
    title.innerHTML = ""
    image.src = "#";
    body.innerHTML = "";
    $('#resultList').empty();
}

function addSingle(element){
    title.innerHTML = element;
}



/////////// HELP & HOW TO ///////////

function help(){
    clearResults();
    image.src="assets/icons/help.png";
    title.innerHTML = "What can I tell you?";
    
    var entry1 = document.createElement('li');
    entry1.appendChild(document.createTextNode("What is the weather like in Seattle?"));
    entry1.style.marginBottom = "25px";
    entry1.style.textAlign = "center";
    list.appendChild(entry1);
    
    var entry2 = document.createElement('li');
    entry2.appendChild(document.createTextNode("How far is it to Portland?"));
    entry2.style.marginBottom = "25px";
    entry2.style.textAlign = "center";
    list.appendChild(entry2);
    
    var entry4 = document.createElement('li');
    entry4.appendChild(document.createTextNode("How do I make a moscow mule?"));
    entry4.style.marginBottom = "25px";
    entry4.style.textAlign = "center";
    list.appendChild(entry4);
    
    var entry3 = document.createElement('li');
    entry3.appendChild(document.createTextNode("What is the latest world news?"));
    entry3.style.marginBottom = "25px";
    entry3.style.textAlign = "center";
    list.appendChild(entry3);
    
    alert("BlackBridge is powered by Microsoft's LUIS.ai language processing engine along with API's from Weather Underground, The New York Times and Google Maps.  Sometimes inputs aren't recognized by the application so try different wording to test it out!")
}








///////// RECIPE SEARCJ ///////////
/// API KEY:  J4aw4oPdp67VTKVU9EaDBH2L6e667v6g
function recipeSearch(){
//        function getRecipeJson() {
//            var apiKey = "J4aw4oPdp67VTKVU9EaDBH2L6e667v6g";
//            var TitleKeyword = "lasagna";
//            var url = "http://api2.bigoven.com/Recipes?pg=1&rpp=25&title_kw="
//                  + TitleKeyword 
//                  + "&api_key="+apiKey;
//            $.ajax({
//                    type: "GET",
//                    dataType: 'json',
//                    cache: false,
//                    url: url,
//                    success: function (data) {
//                    alert('success');
//                    console.log(data);
//                    }
//                });
//        }
//    getRecipeJson();
    
//        function getRecipeJson() {
//        var apiKey = "J4aw4oPdp67VTKVU9EaDBH2L6e667v6g";
//        var RecipeId = 196149;
//        var url = "httpss://api2.bigoven.com/recipe/" + RecipeId + "?api_key=" + apiKey;
//        $.ajax({
//            type: "GET",
//            dataType: 'json',
//            cache: false,
//            url: url,
//            success: function (data) {
//                console.log(data);
//  
//            }
//        });
//    }
//
//    getRecipeJson();
    
}









//var request = unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/324694/analyzedInstructions?stepBreakdown=true")
//.header("X-Mashape-Key", "LZHYusgNOamshhr4WkFFpa2ap79Tp1WrEr4jsnmt4muvfJdFZk")
//.header("Accept", "application/json")
//.end(function (result) {
//  console.log(result.status, result.headers, result.body);
//});




//function stockQuotes(){
//    for (ticker in quote) {
//        var symbol = quote[ticker];
//        console.log('Price of ' + ticker + ' is ' + symbol['Last'] + );
//   }
//}

//function calendar(){
//    var Cronofy = require('cronofy');
//
//    var client = new Cronofy({
//      access_token: 'RsF3h-Y5RK0hBr7bzVryzMWzUwOdsuIi',
//    });
//
//    var options = {
//      tzid: 'Etc/UTC'
//    };
//
//    client.readEvents(options)
//  .then(function (response) {
//      var events = response.events;
//        console.log(events);
//  });
//}

//CALENDAR API ATTEMPT
//var xhr = new XMLHttpRequest();
//xhr.open('GET', 'https://api.cronofy.com');
//xhr.setRequestHeader( 'Access-Control-Allow-Origin', '*');
//xhr.setRequestHeader('Content-Type', "application/json; charset=utf-8")
//xhr.setRequestHeader('Authorization', 'Bearer RsF3h-Y5RK0hBr7bzVryzMWzUwOdsuIi');
//xhr.send();
//console.log(xhr.status);







