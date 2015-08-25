// Userlist data array for filling in info box
var userListData = [];
var APIKEY = "6f0cb802-778a-4714-8611-950b523ab634";
var tet2 = "100:1000";
var gameType = "";

// DOM Ready =============================================================
$(document).ready(function() {

    // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // Add User button click
    $('#btnFindSummoner').on('click', findSummoner);

    /*// Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
*/
});

// Functions =============================================================
//Get Mongo Best
function getMongoBest(summonerID){
    // Empty content string
    var best = '';
    var totalbest = 0;

    $.ajax({
        url: '/users/userlist',
        dataType: 'json',
        async: false,
        success: function(data){
            $.each(data, function(){
                if(this.wins>best){
                    best = this.wins;
                    gameType = this.playerStatSummaryType;
                }
                totalbest += parseInt(this.wins,10);
                tet2 = (parseInt(best)/totalbest) * 100;
            });
        }
    });
    return tet2;
}
function populateChart() {

    var test = "\<script type=\"text/javascript\">"+
        "window.onload = function () {var chart1 = new CanvasJS.Chart(\"chartContainer1\"," +
        "{" +

        "data: [" +
        "{" +
        "type: \"column\"," +
        "dataPoints: [" +
        "{ x: 10, y: 71 }," +
        "{ x: 20, y: 55}," +
        "{ x: 30, y: 50 }," +
        "{ x: 40, y: 65 }," +
        "{ x: 50, y: 95 }," +
        "{ x: 60, y: 68 }," +
        "{ x: 70, y: 28 }," +
        "{ x: 80, y: 34 }," +
        "{ x: 90, y: 14}" +
        "]" +
        "}" +
        "]" +
        "   });" +
        "chart1.render();}"+
        "\</script\>";
    document.getElementById("chartContainer").innerHTML = test;
    //$('#chartContainer').html("akash rocks");
    //var asd = $('#chartContainer').innerHTML;
};

function letsGetMasteries(summonerID,summonerLevel) {
    var tableContent = '';

    var season = "SEASON4";
    var total_kills =0;
    var total_assists = 0;
    var total_towers = 0;
    var total_wins = 0;
    var total_losses = 0;
    $.ajax({
        type: 'DELETE',
        url: '/users/deleteuser/' + $(this).attr('rel')
    }).done(function( response ) {

        // Check for a successful (blank) response
        if (response.msg === '') {
        }
        else {
            alert('Error: ' + response.msg);
        }
    });


    $.ajax({
        url: "https://na.api.pvp.net/api/lol/na/v1.3/stats/by-summoner/" + summonerID + "/summary?season=" + season + "&api_key=" + APIKEY,
        type: 'GET',
        dataType: 'json',
        data: {

        },
        success: function (resp) {

            for (var i = 0; i < resp.playerStatSummaries.length; i++) {

                type2 = resp.playerStatSummaries[i].playerStatSummaryType;
                kills = resp.playerStatSummaries[i].aggregatedStats.totalChampionKills;
                towers = resp.playerStatSummaries[i].aggregatedStats.totalAssists;
                assists = resp.playerStatSummaries[i].aggregatedStats.totalTurretsKilled;
                wins = resp.playerStatSummaries[i].wins;
                losses = resp.playerStatSummaries[i].losses;

                if(typeof kills == 'undefined'){
                    //do nothing
                }else{
                total_kills+= kills;
                }
                if(typeof towers == 'undefined'){
                    //do nothing
                }else{
                total_towers+= towers;
                }
                if(typeof assists == 'undefined'){
                    //do nothing
                }else
                {
                    total_assists += assists;
                }
                if(typeof wins == 'undefined'){
                    //do nothing
                }else{
                   total_wins+= wins;
                }
                if(typeof losses == 'undefined'){
                    //do nothing
                }else{
                total_losses+= losses;
                }

                var newUser = {
                    'summonerId': summonerID,
                    'playerStatSummaryType': type2,
                    'kills': kills,
                    'towers': towers,
                    'assists': assists,
                    'wins': wins,
                    'losses': losses
                };

                // Use AJAX to post the object to our adduser service
                $.ajax({
                    type: 'POST',
                    data: newUser,
                    url: '/users/adduser',
                    dataType: 'JSON'
                }).done(function( response ) {

                    // Check for successful (blank) response
                    if (response.msg === '') {

                        //Do nothing

                    }
                    else {

                        // If something goes wrong, alert the error message that our service returned
                        alert('Error: ' + response.msg);

                    }
                });


                if(typeof losses == 'undefined'){
                    wins = "100%";
                }else{
                    wins = ((wins/(wins+losses))*100) + "%";
                }
                if(typeof kills && typeof assists && typeof wins && typeof towers != 'undefined') {
                    tableContent += '<tr>';
                    tableContent += '<td>' + type2 + '</td>';
                    tableContent += '<td>' + kills + '</td>';
                    tableContent += '<td>' + assists + '</td>';
                    tableContent += '<td>' + wins + '</td>';
                    tableContent += '<td>' + towers + '</td>';
                    tableContent += '</tr>';

                }
            }
            // Inject the whole content string into our existing HTML table
            $('#userList table tbody').html(tableContent);
            document.getElementById("sAssists").innerHTML = total_assists;
            document.getElementById("sKills").innerHTML = total_kills;
            document.getElementById("sTurrets").innerHTML = total_towers;
            document.getElementById("sWins").innerHTML =  total_wins;
            asda = getMongoBest(summonerID);
            setTimeout(function(){},10000);
            var best = $('input#inputSummonerName').val() + " Level " + summonerLevel + " has the best record by " + parseFloat(tet2).toFixed(3)+ "% in "+gameType+".";
            document.getElementById('sBest').innerHTML =best;

        },

        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("error getting Summoner data 2!");
        }
    });
}
//Find Summoner Data
function findSummoner(event){

    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
        if($('input#inputSummonerName').val() === '') { errorCount++; }

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var sumName =  $('input#inputSummonerName').val();


        var season = "SEASON4";
        $.ajax({
            url: 'https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + sumName + '?api_key=' + APIKEY,
            type: 'GET',
            dataType: 'json',
            data: {

            },
            success: function (json) {
                var sumNamenospace = sumName.replace(" ", "");

                sumNamenospace = sumNamenospace.toLowerCase().trim();

                summonerLevel = json[sumNamenospace].summonerLevel;
                summonerID = json[sumNamenospace].id;

                // NEW FUNCTION!
                letsGetMasteries(summonerID,summonerLevel);

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Please enter Summoner Name");
            }
        });
    }
};
// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.matchId; }).indexOf(matchId);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#sLevel').text(thisUserObject.totalDamageDealtToChampion);
    $('#sKills').text(thisUserObject.totalHeals);
    $('#sAssists').text(thisUserObject.goldEarned);
    $('#sWins').text(thisUserObject.champLevel);

};

