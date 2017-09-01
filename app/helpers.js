function returnRandomPhrase(phrasesObj, resArr) {
    //Bulding a array out of the phrases keys and picking a random one
    for (let i in phrasesObj) {
        for (let c = 0; c < phrasesObj[i].chance; c++) {
            resArr.push(i);
        }
    }
    let index = resArr[
        Math.round(Math.random() * (resArr.length - 1))
        ];
    return phrasesObj[index].phrase
};

function fadeIn(id, timeToOpaque = 1800) {
    $("#" + id).fadeOut(0);
    $("#" + id).fadeIn(timeToOpaque);
}
