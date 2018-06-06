//<![CDATA[

<!--


    function Client(){
        this.min = false; if (document.getElementById){this.min = true;};

        this.ua = navigator.userAgent;
        this.name = navigator.appName;
        this.ver = navigator.appVersion;
    }

var C = new Client();

function FuncBtnOver(Btn){
    if (Btn.className != 'FuncButtonDown'){Btn.className = 'FuncButtonUp';}
}

function FuncBtnOut(Btn){
    Btn.className = 'FuncButton';
}

function FuncBtnDown(Btn){
    Btn.className = 'FuncButtonDown';
}

var topZ = 1000;

function ShowMessage(Feedback){
    var Output = Feedback + '<br /><br />';
    document.getElementById('FeedbackContent').innerHTML = Output;
    var FDiv = document.getElementById('FeedbackDiv');
    topZ++;
    FDiv.style.zIndex = topZ;
    FDiv.style.top = TopSettingWithScrollOffset(30) + 'px';

    FDiv.style.display = 'block';

    ShowElements(false, 'input');
    ShowElements(false, 'select');
    ShowElements(false, 'object');
    ShowElements(true, 'object', 'FeedbackContent');
    setTimeout("document.getElementById('FeedbackOKButton').focus()", 50);
}

function ShowElements(Show, TagName, ContainerToReverse){
    TopNode = document.getElementById(ContainerToReverse);
    var Els;
    if (TopNode != null) {
        Els = TopNode.getElementsByTagName(TagName);
    } else {
        Els = document.getElementsByTagName(TagName);
    }

    for (var i=0; i<Els.length; i++){
        if (TagName == "object") {
            //manipulate object elements in all browsers
            if (Show == true){
                Els[i].style.visibility = 'visible';
                //get Mac FireFox to manipulate display, to force screen redraw
                if (C.mac && C.gecko) {Els[i].style.display = '';}
            }
            else{
                Els[i].style.visibility = 'hidden';
                if (C.mac && C.gecko) {Els[i].style.display = 'none';}
            }
        }
        else {
            // tagName is either input or select (that is, Form Elements)
            // ie6 has a problem with Form elements, so manipulate those
            if (C.ie) {
                if (C.ieVer < 7) {
                    if (Show == true){
                        Els[i].style.visibility = 'visible';
                    }
                    else{
                        Els[i].style.visibility = 'hidden';
                    }
                }
            }
        }
    }
}



function HideFeedback(){
    document.getElementById('FeedbackDiv').style.display = 'none';
    ShowElements(true, 'input');
    ShowElements(true, 'select');
    ShowElements(true, 'object');
    if (Finished == true){
        Finish();
    }
}

function Asset(ID, Name, InitVal, DecPlace, ShowDuring, ShowEnd, ShowCount, CurrVal, Parent){
    this.ID = ID;
    this.Name=Name;
    this.InitVal=InitVal;
    this.DecPlace=DecPlace;
    this.ShowDuring=ShowDuring;
    this.ShowEnd=ShowEnd;
    this.ShowCount=ShowCount;
    this.CurrVal=CurrVal;
    this.Parent = Parent;
}

function AssetGetCurrValString(){
    var Num = this.CurrVal;
    if (this.DecPlace > 0){
        for (var i=0; i<this.DecPlace; i++){Num /= 10;}
    }
    var Result = Num.toString();
    if (this.DecPlace > 0){
        var DecLoc = Result.indexOf('.');
        if (DecLoc < 0){Result += '.';}
//Add leading zeros if required
        while (((Result.length-1) - Result.indexOf('.'))<this.DecPlace){Result += '0';}
//Truncate trailing places if required
        while (((Result.length-1) - Result.indexOf('.'))>this.DecPlace){Result = Result.substring(0, Result.length-1);}
    }
    return Result;
}
Asset.prototype.GetCurrValString=AssetGetCurrValString;

function AssetGetCurrValFloat(){
    var Num = this.CurrVal;
    if (this.DecPlace > 0){
        for (var i=0; i<this.DecPlace; i++){Num /= 10;}
    }
    return Num;
}
Asset.prototype.GetCurrValFloat=AssetGetCurrValFloat;

function AssetSetCurrValFromFloat(Num){
    if (this.DecPlace > 0){
        for (var i=0; i<this.DecPlace; i++){Num *= 10;}
    }
    this.CurrVal = Num;
}
Asset.prototype.SetCurrValFromFloat=AssetSetCurrValFromFloat;

function AssetReportCurrState(){
    return this.Name + ': ' + this.GetCurrValString();
}
Asset.prototype.ReportCurrState=AssetReportCurrState;

function AssetMeetsRequirement(ReqType, Req){
    var Result = true;
    switch(ReqType){
        case 0: break;
        case 1: Result = (this.CurrVal > Req); break;
        case 2: Result = (this.CurrVal < Req); break;
        case 3: Result = (this.CurrVal == Req); break;
//New feature for 2.1.1.0: not equal to
        case 4: Result = (this.CurrVal != Req); break;
    }
    return Result;
}
Asset.prototype.MeetsRequirement=AssetMeetsRequirement;

function AssetPerformTransaction(OperatorType, Operand){
    if ((this.Name == '_Timer_Seconds')&&(this.Parent.Active == true)){
        this.CurrVal = Seconds;
    }
    switch(OperatorType){
//Operands coming into this function should already be massaged to be at the same decimal place level as
//the asset being manipulated; therefore +, -, and = operators can use the values directly, but *, /, %
//and ^ transactions will have to reduce the operand to its true value by dividing it.
        case 1: this.CurrVal += Operand; break; //add
        case 2: this.CurrVal -= Operand; break; //subtract
        case 3: for (var x=0; x<this.DecPlace; x++){Operand /= 10;}this.CurrVal *= Operand; break; //multiply
        case 4: for (var x=0; x<this.DecPlace; x++){Operand /= 10;}this.CurrVal /= Operand; break; //divide
        case 5: this.CurrVal = Operand; break; //set equal to
        case 6: for (var x=0; x<this.DecPlace; x++){Operand /= 10;}this.CurrVal *= (Operand/100); break; //percentage
//Difficult case (power of); need to change the operand and the value to core values, do the calculation, then
//change the value back
        case 7:
//Change the operand to core value
            for (var x=0; x<this.DecPlace; x++){Operand /= 10;}
//Change the asset value to core value
            var y = this.CurrVal; for (var x=0; x<this.DecPlace; x++){y /= 10;}
//Do the math
            x = y; for (var j=1; j<Operand; j++){y *= x;}
//Raise the val again
            for (var x=0; x<this.DecPlace; x++){y *= 10;}
//Set the value
            this.CurrVal = y;
            break;
    }
    this.CurrVal = Math.round(this.CurrVal);
    if ((this.Name == '_Timer_Seconds')&&(this.Parent.Active == true)){
        Seconds = this.CurrVal;
    }
}
Asset.prototype.PerformTransaction=AssetPerformTransaction;

function AssetCanBeShown(){
    var Result = true;
    if (IsEndPoint == true){
        switch (this.ShowEnd){
            case 0: Result = true; break;
            case 1: Result = false; break;
            case 2: Result = (this.CurrVal != 0); break;
        }
    }
    else{
        switch (this.ShowDuring){
            case 0: Result = true; break;
            case 1: Result = false; break;
            case 2: Result = (this.CurrVal != 0); break;
        }
    }
    return Result;
}
Asset.prototype.CanBeShown=AssetCanBeShown;

function Basket(AList, Active){
    this.Active = Active;
    this.Assets = new Array();
    if (AList.length > 0){
        for (var i=0; i<AList.length; i++){
            this.Assets[i] = new Asset(i, AList[i][0], AList[i][1], AList[i][2], AList[i][3], AList[i][4], A[i][5], A[i][6], this);
        }
    }
}

function BasketGetEffectiveOperand(Trans){
//The "effective operand" is the operand converted to the right decimal place level (so an operand of
//5, which is to act on an asset with 2dps, should be converted to 500). This is especially difficult
//when the operand is the value of another asset, since that may have its own dp setting, and the two
//settings must be harmonized
    var Operand = 0;
    switch(Trans[2]){
//First, a fixed value (this should already be specified at the right dp level)
        case 0: Operand = Trans[3]; break;
//Second, a random value; again, this should be specified at the right dp level already)
        case 1: Operand = GetRand(Trans[3], Trans[4]); break;
//Finally, the problem case: the value of another asset. In this case, we need to find out the dp
//settings of both the source and target asset
//First get the real value of the source asset (so 500 for an asset with 2dp would be 5)
        case 2: Operand = this.Assets[Trans[5]].GetCurrValFloat();
//Now multiply this up according to the dp setting of the target asset (so 5 operating on a target asset
//with dp2 would become 500)
            for (var i=0; i<this.Assets[Trans[0]].DecPlace; i++){Operand *= 10;}
            break;
    }
    return Operand;
}
Basket.prototype.GetEffectiveOperand=BasketGetEffectiveOperand;

function BasketReportCurrState(){
    if (this.Assets.length < 1){return '';}
    var Result = '';
    for (var i=0; i<this.Assets.length; i++){
        if (this.Assets[i].CanBeShown()==true){
            Result += '<tr><td style="text-align: right;">' + this.Assets[i].Name + ' </td>';
            Result += '<td style="text-align: left;"> '
            if (this.Assets[i].ShowCount==true){
                Result += '&nbsp;:&nbsp;' + this.Assets[i].GetCurrValString();
            }
            Result += ' </td></tr>';
        }
    }
    if (Result.length > 0){
        Result = '<table class="AssetTable"><tr><th colspan="2">' + strYouHave + '</th></tr>' + Result + '</table>';
    }
    return Result;
}
Basket.prototype.ReportCurrState=BasketReportCurrState;

function BasketCloneSelf(Copy, Active){
    Copy = new Basket(A, false);
    Copy.Active = Active;
    for (var i=0; i<this.Assets.length; i++){
        Copy.Assets[i].CurrVal = this.Assets[i].CurrVal;
    }
    return Copy;
}
Basket.prototype.CloneSelf=BasketCloneSelf;

function BAssetMeetsRequirement(ANum, ReqType, Req){
    return this.Assets[ANum].MeetsRequirement(ReqType, Req);
}
Basket.prototype.AssetMeetsRequirement=BAssetMeetsRequirement;

function BAssetPerformTransaction(ANum, OpType, Operand){
    this.Assets[ANum].PerformTransaction(OpType, Operand);
}
Basket.prototype.PerformTransaction=BAssetPerformTransaction;

function BGetAssetValByName(AssetName){
    var Result = 0;
    for (var i=0; i<this.Assets.length; i++){
        if (this.Assets[i].Name == AssetName){
            Result = this.Assets[i].CurrVal;
        }
    }
    return Result;
}
Basket.prototype.GetAssetValByName=BGetAssetValByName;

//VARIABLES AND INTERFACE STRINGS

var CurrBasket;
var TempBasket;
var CurrNode=0;
var strYouHave='Vous avez:';
var strLinkCaption='OK';
var strFinishCaption='OK';
var strDefaultRefusalMessage='Vous ne pouvez pas faire cela. ';
var strTimesUp = 'Your time is over!';
var strBookmarkExplanation = '';
var strExerciseComplete = 'L&#x2019;histoire est termin&#x00E9;e. ';
var ShowImpossibleLinks=true;
var StartTime = (new Date()).toLocaleString();
var HPNStartTime = (new Date()).getTime();
var SubmissionTimeout = 30000;
var FollowingTrack = false;
var CurrTime;
var Started=false;

var IsEndPoint = false;
var Finished = false; //for compatibility with hotpot 6
var TimeOver = false;

function TransactionList(NNum, LNum){
    this.List = new Array();
    var i;
    for (i=0; i<N[NNum][4].length; i++){this.List[this.List.length] = N[NNum][4][i];}
    for (i=0; i<N[NNum][3][LNum][2].length; i++){this.List[this.List.length] = N[NNum][3][LNum][2][i];}
    for (i=0; i<N[N[NNum][3][LNum][0]][2].length; i++){this.List[this.List.length] = N[N[NNum][3][LNum][0]][2][i];}
}

function TestTransactions(NNum, LNum){
    var T = new TransactionList(NNum, LNum);
    var Result = '';
//Create a clone of the current asset basket to operate on
    var B = CurrBasket.CloneSelf(B, false);

//For each transaction
    for (var i=0; i<T.List.length; i++){
//Test the requirement
        if (B.AssetMeetsRequirement(T.List[i][0], T.List[i][7], T.List[i][6]) == true){
//If it succeeds, do the transaction
            B.PerformTransaction(T.List[i][0], T.List[i][1], B.GetEffectiveOperand(T.List[i]));
        }
        else{
//If it fails, check the refusal message
            if (T.List[i][8].length > 0){
                return T.List[i][8];
            }
//If no refusal message, return a string with spaces, otherwise return refusal message
            else{
                return strDefaultRefusalMessage;
            }
        }
    }
//If all have passed, return an empty string
    return '';
}

function StartExercise(){
    CurrBasket = new Basket(A, true);

    ParseSearch();
    CurrTime = new Date();
    ShowCurrNode();

    Started = true;
}

function StartUp(){

    if (document.location.search.indexOf('___') > -1){
        StartExercise();
    }
}

function Restart(){
    var d = document.location;
    d.search = '';
    document.location = d;
}

//CODE FOR HANDLING UNDO FUNCTIONALITY AND TRACKING NODE SEQUENCE
function HNode(NNum, LNum, Bask){
    this.NNum = NNum; //Number of the node
    this.LNum = LNum; //Number of the link selected to leave the node
    this.Basket = Bask.CloneSelf(A, false); //Copy of current basket of assets
//	this.EntryTime = CurrTime.getTime() - HPNStartTime; //Stores time of entry to this node, offset by start time, in milliseconds
    this.EntryTime = CurrTime.getTime(); //Stores absolute time of entry to this node
    this.EntryTimeString = CurrTime.toLocaleString();
    var D = new Date();
//	this.ExitTime = D.getTime() - HPNStartTime; //Stores the time of exit from this node
    this.ExitTime = D.getTime(); //Stores the absolute time of exit from this node

    this.ExitTimeString = D.toLocaleString(); //Stores the time in human-readable format
}

function HNodeReportSelf(AddTime){
    var S = this.NNum + ':' + this.LNum;
    if (AddTime == true){
        S += ':' + this.EntryTime;
    }
    return S;
}
HNode.prototype.ReportSelf=HNodeReportSelf;

//Object containing the list of tracking node objects
function HNodeList(){
    this.Nodes = new Array();
    var D = new Date();
    this.StartTime = D.getTime(); // Stores the entry time of the exercise; =entry time to node 0
    this.StartTimeString = D.toLocaleString();
}

function HNodeListReportAsSearch(IncludeTime){
    var S = '___t;';
    if (this.Nodes.length > 0){
        S += this.Nodes[0].ReportSelf(IncludeTime);
        for (var i=1; i<this.Nodes.length; i++){
            S += ',' + this.Nodes[i].ReportSelf(IncludeTime);
        }
    }
    return S;
}
HNodeList.prototype.ReportAsSearch=HNodeListReportAsSearch;

var H = new HNodeList(); //array of HNode elements

function Undo(){
    if (H.Nodes.length < 1){
        return;
    }
    var LastNode = H.Nodes.pop();
    CurrNode = LastNode.NNum;
    CurrBasket = LastNode.Basket.CloneSelf(A, true);
    ShowCurrNode();
}

//CODE FOR HANDLING URL ENCODING OF STATE

function ParseSearch(){
    if (document.location.search.length < 1){return;}
//First, get the part of the search string we're interested in
    var StateString = document.location.search.substring(document.location.search.lastIndexOf('___'), document.location.search.length);
    if (StateString.length > 0){
        ParseStateString(StateString);
    }
}

function ParseStateString(StateString){
    var S = StateString.split(';');
//S[0] tells us this is a bookmark (b), a scorm suspend state(s), or a track (t)
    if (S.length > 0){
        if (S[0] == '___b'){
//It's a bookmark
            ShowMessage(strBookmarkExplanation);
        }
        if (S[0] == '___t'){
//It's tracking data
            ParseTrack(S[1]);
            return;
        }
    }
//S[1] is the current node
    if (S.length > 1){
        if (S[1].length > 0){
            var CN=parseInt(S[1]);
            if ((CN>-1)&&(CN<N.length)){
                CurrNode = CN;
            }
        }
    }
    if (S.length > 2){
        if (S[2].length > 0){
            var AA=S[2].split(',');
            if (AA.length > 0){
                for (var i=0; i<AA.length; i++){
                    var Val = parseInt(AA[i]);
                    if ((i<A.length)&&(Val != NaN)){
                        CurrBasket.Assets[i].CurrVal = Val;
                    }
                }
            }
        }
    }

}

var Footprints = new Array();

function ParseTrack(Track){
    if (Track.length < 3){
        return;
    }

    var Steps = Track.split(',');
    if (Steps.length < 2){
        return;
    }
//We have valid track data, so the exercise can be displayed accordingly
    FollowingTrack = true;
    var NNum = 0;
    var LNum = 0;
    var T = 0;
    for (var i=0; i<Steps.length; i++){
        var Step = Steps[i].split(':');
        NNum = parseInt(Step[0]);
        if (NNum > -1){
            LNum = parseInt(Step[1]);
            if (LNum > -1){
                if (Step.length > 2){
                    T = parseInt(Step[2]);
                }
                Footprints.push(new Array(NNum, LNum, T));
            }
        }
    }
}

function CreateBookmark(Prefix){
    var S = '___' + Prefix + ';' + CurrNode + ';';
    if (CurrBasket.Assets.length > 0){
        S += CurrBasket.Assets[0].CurrVal;
        for (var i=1; i<CurrBasket.Assets.length; i++){
            S += ',' + CurrBasket.Assets[i].CurrVal;
        }
    }

    return S;
}

function SetBookmark(){
    if (Started == false){return;}
    var Temp = document.location.search;
    if (Temp.length < 1){
        Temp = '?';
    }
    else{
        Temp += '&';
    }
    document.location.search = Temp + CreateBookmark('b');
}

function MillisecondsToTimeReadout(MS){
    var DT = new Date(MS);
    return DT.getHours() + ':' + DT.getMinutes() + ':' + DT.getSeconds() + ':' + DT.getMilliseconds();
}

function ShowCurrNode(){
    var DPT = N[CurrNode][0];
    if ((FollowingTrack==true)&&(Footprints.length > 0)){
        if (Footprints[0][2] > 0){
            DPT += ' (' + MillisecondsToTimeReadout(Footprints[0][2]) + ')';
        }
    }
    document.getElementById('DPTitle').innerHTML = DPT;
    document.getElementById('DPContentsDiv').innerHTML = N[CurrNode][1];
    var Links = '';
    var Refusal = '';
    var ValidLinks = 0;
    for (var LNum=0; LNum<N[CurrNode][3].length; LNum++){
        if ((FollowingTrack==true)&&(Footprints.length > 0)){
//We're following a track, so we only want to make a working link for the correct item
            if (LNum == Footprints[0][1]){
                Links += MakeLink(CurrNode, LNum);
                ValidLinks++;
            }
            else{
                Links += MakeDummyLink(CurrNode, LNum);
            }

        }
        else{
            Refusal = TestTransactions(CurrNode, LNum);
            if (Refusal.length > 0){
                if (N[CurrNode][3][LNum][4] < 1){
                    N[CurrNode][3][LNum][3] = Refusal;
                    Links += MakeRefusalLink(CurrNode, LNum);
                }
            }
            else{
                Links += MakeLink(CurrNode, LNum);
                ValidLinks++;
            }
        }
    }
    if (Links.length > 0){
        Links = '<table class="LinkTable">' + Links + '</table>';
    }
//Next line added for 2.2.0.3 to hide final assets when retreating from an end point.
    IsEndPoint = false;
    if (ValidLinks < 1){
        IsEndPoint = true;
        Finished = true;
        if (document.getElementById('store') != null){
            Links = '<table class="LinkTable">' + MakeEndLink() + '</table>';
        }
        else{
            if (document.getElementById('UndoButton') == null){
                Links = '<table class="LinkTable"><tr><td>' + strExerciseComplete + '</td></tr></table>';
            }
        }

    }
    document.getElementById('LinkListDiv').innerHTML = Links;

//Show assets now -- endpoint issue may affect which are shown
    var AssetOutput = CurrBasket.ReportCurrState();
    if (AssetOutput.length > 0){
        document.getElementById('AssetsDiv').innerHTML = AssetOutput;
        document.getElementById('AssetDisplay').style.display = 'block';
    }
    else{
        document.getElementById('AssetsDiv').innerHTML = '';
        document.getElementById('AssetDisplay').style.display = 'none';
    }

//Remove the last footprint from the track
    if (Footprints.length > 0){Footprints.shift();}

    if ((IsEndPoint==true)&&(document.getElementById('UndoButton') == null)){
//Record current state in the history array
        H.Nodes.push(new HNode(CurrNode, LNum, CurrBasket));

//Reset the current time
        CurrTime = new Date();
        setTimeout('Finish()', SubmissionTimeout);
    }
}

function MakeFunctionButton(Caption, Action){
    var Result = '';
//Opera cannot handle adding dynamic buttons to the page, so we have
//to use a link instead.
    if (C.opera){
        Result = '<a href="javascript:' + Action + '">' + Caption + '</a>';
    }
    else{
        Result = '<button class="FuncButton" onfocus="FuncBtnOver(this)" onblur="FuncBtnOut(this)"  onmouseover="FuncBtnOver(this)" onmouseout="FuncBtnOut(this)" onmousedown="FuncBtnDown(this)" onmouseup="FuncBtnOver(this)" onclick="' + Action + '">' + Caption + '</button>';
    }
    return Result;
}

function MakeRefusalLink(NNum, LNum){
    var Result = '<tr><td>';
    Result += MakeFunctionButton(strLinkCaption, 'ShowMessage(N[' + NNum + '][3][' + LNum + '][3])');
    Result += '</td>';
    Result += '<td>' + N[NNum][3][LNum][1] + '</td></tr>';
    return Result;
}

function MakeLink(NNum, LNum){
    var Result = '<tr><td>';
    Result += MakeFunctionButton(strLinkCaption, 'FollowLink(' + LNum + ')');
    Result += '</td>';
    Result += '<td>' + N[NNum][3][LNum][1] + '</td></tr>';
    return Result;
}

function MakeDummyLink(NNum, LNum){
    var Result = '<tr><td style="text-align: right;">&nbsp;&#x25cf;&nbsp;</td>';
    Result += '<td>' + N[NNum][3][LNum][1] + '</td></tr>';
    return Result;
}

function MakeEndLink(){
    var Result = '<tr><td>';
    Result += MakeFunctionButton(strFinishCaption, 'Finish()');
    Result += '</td>';
    Result += '<td>' + strExerciseComplete + '</td></tr>';
    return Result;
}

function FollowLink(LNum){

//Record current state in the history array
    H.Nodes.push(new HNode(CurrNode, LNum, CurrBasket));

//Reset the current time
    CurrTime = new Date();

    var T = new TransactionList(CurrNode, LNum);
//For each transaction
    for (var i=0; i<T.List.length; i++){
//Do the transaction
        CurrBasket.PerformTransaction(T.List[i][0], T.List[i][1], CurrBasket.GetEffectiveOperand(T.List[i]));
    }
//Now change the node
    CurrNode = N[CurrNode][3][LNum][0];
    ShowCurrNode();

}



//HOTPOTNET FUNCTIONS
function Finish(){
//If there's a form, fill it out and submit it
    try{
        var F = document.getElementById('store');
        if (F != null){
            F.starttime.value = HPNStartTime;
            F.endtime.value = (new Date()).getTime();
            F.mark.value = CurrBasket.GetAssetValByName('Score'); //if an asset called "Score" exists, this value will be submitted as the mark
            var Temp = '<?xml version="1.0"?><hpnetresult><fields>';
            Temp += '<field><fieldname>endbookmark</fieldname><fieldtype>url-search</fieldtype><fieldlabel>Click here to see the final position in the maze</fieldlabel><fieldlabelid>QuandaryViewFinalPosition</fieldlabelid><fielddata>' + CreateBookmark('b') + '</fielddata></field>';
            Temp += '<field><fieldname>track</fieldname><fieldtype>url-search</fieldtype><fieldlabel>Click here to track the student through the maze.</fieldlabel><fieldlabelid>QuandaryViewTrack</fieldlabelid><fielddata>' + H.ReportAsSearch(false) + '</fielddata></field>';
            Temp += '<field><fieldname>timedtrack</fieldname><fieldtype>url-search</fieldtype><fieldlabelid>QuandaryViewTimedTrack</fieldlabelid><fieldlabel>Click here to track the student through the maze with timing data.</fieldlabel><fielddata>' + H.ReportAsSearch(true) + '</fielddata></field>';
            Temp += '</fields></hpnetresult>';
            F.detail.value = Temp;
            F.submit();

        }
    }
    catch(er){
        return;
    }
}

//UTILITY FUNCTIONS

function GetScrollTop(){
    if (document.documentElement && document.documentElement.scrollTop){
        return document.documentElement.scrollTop;
    }
    else{
        if (document.body){
            return document.body.scrollTop;
        }
        else{
            return window.pageYOffset;
        }
    }
}

function GetViewportHeight(){
    if (window.innerHeight){
        return window.innerHeight;
    }
    else{
        return document.getElementsByTagName('body')[0].clientHeight;
    }
}

function TopSettingWithScrollOffset(TopPercent){
    var T = Math.floor(GetViewportHeight() * (TopPercent/100));
    return GetScrollTop() + T;
}

function GetRand(Lower, Upper){
    var Rng = Upper-Lower;
    return (Math.round(Math.random()*Rng)) + Lower;
}

var A = new Array();


var N = new Array();
N[0] = new Array();
N[0][0] = 'Arriv\u00E9e dans le bar';
N[0][1] = 'Apr&#x00E8;s une dure journ&#x00E9;e de travail, vous arrivez dans le bar pour boire une douce chope, le patron annonce "Y A PLUS QU\'UNE BIERE !!!"';
N[0][2] = new Array();

N[0][3] = new Array();
N[0][3][0] = new Array();
N[0][3][0][0] = 1;
N[0][3][0][1] = 'Vous partez';
N[0][3][0][2] = new Array();

N[0][3][0][3] = '';
N[0][3][0][4] = 0;

N[0][3][1] = new Array();
N[0][3][1][0] = 2;
N[0][3][1][1] = 'Vous rentrez dans le bar';
N[0][3][1][2] = new Array();

N[0][3][1][3] = '';
N[0][3][1][4] = 0;


N[0][4] = new Array();


N[1] = new Array();
N[1][0] = 'Vous partez';
N[1][1] = 'Vous &#x00EA;tes trop faible pour &#x00E7;a, vous allez acheter une Kro au franprix du coin.';
N[1][2] = new Array();

N[1][3] = new Array();

N[1][4] = new Array();


N[2] = new Array();
N[2][0] = 'Bagarre dans le bar';
N[2][1] = 'C\'EST LA GUERRE, les clients deviennent fous, tous veulent avoir la bi&#x00E8;re. Un client vous agresse. Il a l\'air bien &#x00E9;m&#x00E9;ch&#x00E9;.';
N[2][2] = new Array();

N[2][3] = new Array();
N[2][3][0] = new Array();
N[2][3][0][0] = 3;
N[2][3][0][1] = 'Vous vous pr\u00E9parez \u00E0 vous battre';
N[2][3][0][2] = new Array();

N[2][3][0][3] = '';
N[2][3][0][4] = 0;

N[2][3][1] = new Array();
N[2][3][1][0] = 4;
N[2][3][1][1] = 'Vous fuyez';
N[2][3][1][2] = new Array();

N[2][3][1][3] = '';
N[2][3][1][4] = 0;


N[2][4] = new Array();


N[3] = new Array();
N[3][0] = '1v1 mais pas gare du nord';
N[3][1] = 'Il tente de riposter par une bonne grosse droite. Vous esquivez. Le seul moyen de vous en sortir, c\'est de lui p&#x00E9;ter la gueule.';
N[3][2] = new Array();

N[3][3] = new Array();
N[3][3][0] = new Array();
N[3][3][0][0] = 5;
N[3][3][0][1] = 'Vous tentez un low-kick rotatif';
N[3][3][0][2] = new Array();

N[3][3][0][3] = '';
N[3][3][0][4] = 0;

N[3][3][1] = new Array();
N[3][3][1][0] = 7;
N[3][3][1][1] = 'Vous tentez de lui mettre un ouraken (en 3/4 face bien s\u00FBr)';
N[3][3][1][2] = new Array();

N[3][3][1][3] = '';
N[3][3][1][4] = 0;


N[3][4] = new Array();


N[4] = new Array();
N[4][0] = 'Dans la cave';
N[4][1] = 'Vous arrivez dans la cave du bar pour pensez vos plaies. Au fond de la cave une porte sombre vous fait face, elle a l\'air plut&#x00F4;t effrayante, un peu comme belle-maman.';
N[4][2] = new Array();

N[4][3] = new Array();
N[4][3][0] = new Array();
N[4][3][0][0] = 2;
N[4][3][0][1] = 'Vous remontez';
N[4][3][0][2] = new Array();

N[4][3][0][3] = '';
N[4][3][0][4] = 0;

N[4][3][1] = new Array();
N[4][3][1][0] = 6;
N[4][3][1][1] = 'Vous ouvrez la porte';
N[4][3][1][2] = new Array();

N[4][3][1][3] = '';
N[4][3][1][4] = 0;


N[4][4] = new Array();


N[5] = new Array();
N[5][0] = 'Vous vous \u00EAtes fait d\u00E9foncer';
N[5][1] = 'Mauvais choix de coup, vous &#x00EA;tes trop vieux pour ces conneries, vous vous &#x00EA;tes fait assomez, les clients vous marchent dessus, et vous n\'avez pas bu de bi&#x00E8;re, bref, sale soir&#x00E9;e.';
N[5][2] = new Array();

N[5][3] = new Array();

N[5][4] = new Array();


N[6] = new Array();
N[6][0] = 'La salle secr\u00E8te';
N[6][1] = 'Vous arrivez dans une salle sombre, la lumi&#x00E8;re s\'allume, vos amis sont tous l&#x00E0;, ils vous souhaitent un joyeux anniversaire, c\'est beau l\'amiti&#x00E9; !';
N[6][2] = new Array();

N[6][3] = new Array();

N[6][4] = new Array();


N[7] = new Array();
N[7][0] = 'Vous l\'avez \u00E9clat\u00E9';
N[7][1] = 'Jolie droite ! Il est &#x00E0; terre, vous arrivez devant le bar. Le Barman vous regarde de travers.';
N[7][2] = new Array();

N[7][3] = new Array();
N[7][3][0] = new Array();
N[7][3][0][0] = 8;
N[7][3][0][1] = 'Vous l\'assomez avec la rage d\u00FBe aux pr\u00E9c\u00E9dents combats';
N[7][3][0][2] = new Array();

N[7][3][0][3] = '';
N[7][3][0][4] = 0;

N[7][3][1] = new Array();
N[7][3][1][0] = 9;
N[7][3][1][1] = 'Vous tentez de le soudoyer avec un billet de 5';
N[7][3][1][2] = new Array();

N[7][3][1][3] = '';
N[7][3][1][4] = 0;


N[7][4] = new Array();


N[8] = new Array();
N[8][0] = 'La tireuse est cass\u00E9e';
N[8][1] = 'En lui explosant la dentition, vous avez cass&#x00E9; la tireuse, impossible de prendre une bi&#x00E8;re, vous devez vous rabattre sur une tourtel twist. Eh oui, la violence ne r&#x00E9;sout rien.';
N[8][2] = new Array();

N[8][3] = new Array();

N[8][4] = new Array();


N[9] = new Array();
N[9][0] = 'Il vous sert une chope';
N[9][1] = 'Vous l\'avez, vous la buvez, vous l\'appr&#x00E9;ciez. Vous pouvez rentrer chez vous et prendre un repos bien m&#x00E9;rit&#x00E9; en regardant le Big Deal, avec Bill et Vincent.';
N[9][2] = new Array();

N[9][3] = new Array();

N[9][4] = new Array();