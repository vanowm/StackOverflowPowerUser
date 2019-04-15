function autoExpandVotesCounts() {
    if (userHasEnoughReputation()) { //avoid simulated clicks if user has less than 1000 rep
        // console.log("user has enough rep");
        setTimeout(function () {
            addListenerOnVoteCounts();

            expandVotesCountOnIndex(0, true);
        }, 1000);
    } else {
        // console.log("user hasn't got enough rep or isn't logged in");
    }
}


/**
 * Verify that user has more than 1000 reputation points
 */
function userHasEnoughReputation() {
    if (document.getElementsByClassName("-rep js-header-rep").length > 0) { //user is logged in
        let reputationString = document.getElementsByClassName("-rep js-header-rep")[0].innerHTML; //will have this kind of format, 342 | 1,872 | 13k
        console.log("rep string " + reputationString);
        if (reputationString.indexOf(",") !== -1 || reputationString.indexOf("k") !== -1) {
            return true;
        }
    }

    return false;
}



function addListenerOnVoteCounts() {
    let votesCountArray = document.getElementsByClassName("js-vote-count");

    for (let i = 0; i <votesCountArray.length;i++) {
        //wait until finish before launching the next fetch
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        let observer = new MutationObserver(function(mutations, observer) {
            //ICI on a reçu les votes details
            //console.log(mutations, observer);
            if (!votesCountArray[i].getElementsByTagName("DIV")[2]) //pour éviter les undefined
                return;

            votesCountArray[i].getElementsByTagName("DIV")[2].style.color = "#CC0000"; //change downvotes count text color for a brighter red (I find the stock one a bit dark)

            setPourcentageForIndex(i);

            if (i+1 < nbVotesCountsToAutoExpand)
                expandVotesCountOnIndex(i + 1, true);

            //observer.disconnect();
        });

        observer.observe(votesCountArray[i], {
            attributes: true
        });
    }
}


/**
 * Méthode récursive, dès qu'on a fetch le détail des votes de tel index,
 * on fait l'index suivant.
 * Obligé de faire ça car SO n'autorise pas les batchs requests sur le vote count
 * @param index
 * @param withDelay
 */
function expandVotesCountOnIndex(index, withDelay) {
    let delay = withDelay ? 1000 : 0;
    // let delay = withDelay ? 1000 : Math.min(1000, new Date().getTime() - lastExpandedVotesCountDateTime);
    if (!withDelay) {
        let timeSinceLastExpandedVotesCount = new Date().getTime() - lastExpandedVotesCountDateTime;
        delay = timeSinceLastExpandedVotesCount > 1200 ? 0 : 1200 - timeSinceLastExpandedVotesCount;
    }
    // let delay = Math.min(1000, Math.max(0, new Date().getTime() - lastExpandedVotesCountDateTime));
    setTimeout(function () {
        let votesCountArray = document.getElementsByClassName("js-vote-count");

        if (index < votesCountArray.length) {
            votesCountArray[index].click();

            lastExpandedVotesCountDateTime = new Date().getTime();
        }

    }, delay);
}


/**
 * Méthode appelée après que le détail de votes ait été obtenu, qui donne le % de positif
 * @param index
 */
function setPourcentageForIndex(index) {
    //console.log("index : " + index);

    let votesCountArray = document.getElementsByClassName("js-vote-count");
    let voteDiv = document.getElementsByClassName("js-voting-container")[index];

    let upVotes = parseInt(votesCountArray[index].getElementsByTagName("DIV")[0].innerHTML);
    let downVotes = Math.abs(parseInt(votesCountArray[index].getElementsByTagName("DIV")[2].innerHTML)); //turn it to positive number (remove -)

    let totalVotes = upVotes + downVotes;

    let pourcentPositive = 0;
    if (totalVotes > 0) pourcentPositive = Math.round(upVotes/totalVotes * 100);

    //console.log(upVotes, downVotes, pourcentPositive);

    if (voteDiv.getElementsByClassName("circlePercent").length > 0) { //si l'élément existe déjà on l'update
        if (upVotes === 0 && downVotes === 0) { //s'il n'y a actuellement aucun votes
            voteDiv.getElementsByClassName("circlePercent")[0].textContent = "?";
            voteDiv.getElementsByClassName("circlePercent")[0].style.backgroundColor = "#3399ff"; //blue color
        } else {
            voteDiv.getElementsByClassName("circlePercent")[0].textContent = pourcentPositive + "%";
            voteDiv.getElementsByClassName("circlePercent")[0].style.backgroundColor = getColorAccordingToPourcent(pourcentPositive);
        }
    } else { //sinon on le crée
        let pourcentDiv = document.createElement("DIV");
        pourcentDiv.className = "circlePercent";

        if (upVotes === 0 && downVotes === 0) { //s'il n'y a actuellement aucun votes
            pourcentDiv.textContent = "?";
            pourcentDiv.style.backgroundColor = "#3399ff"; //blue color
        } else {
            pourcentDiv.textContent = pourcentPositive + "%";
            pourcentDiv.style.backgroundColor = getColorAccordingToPourcent(pourcentPositive);
        }

        voteDiv.appendChild(pourcentDiv);
    }

}


/**
 * Méthode qui retourne du vert jusqu'au rouge. Les valeurs actuelles retournent vert pour 100 et rouge pour 90
 * Fiddle : http://jsfiddle.net/jongobar/sNKWK/
 * @param pourcentValue
 * @returns {string}
 */
function getColorAccordingToPourcent(pourcentValue){
    //version 90% min
    // if (pourcentValue < 90)  //car à 90 c'est déjà rouge
    //     pourcentValue = 90;
    //
    // //value from 100 to 90
    // var hue=((0.1-(1-(pourcentValue/100)))*1000).toString(10);
    // return ["hsl(",hue,",100%,50%)"].join("");

    //version 80% min
    if (pourcentValue < 80)  //car à 80 c'est déjà rouge
        pourcentValue = 80;

    //value from 100 to 90
    var hue=((0.2-(1-(pourcentValue/100)))*500).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}