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


function Basket(AList, Active){
    this.Active = Active;
    this.Assets = new Array();
    if (AList.length > 0){
        for (var i=0; i<AList.length; i++){
            this.Assets[i] = new Asset(i, AList[i][0], AList[i][1], AList[i][2], AList[i][3], AList[i][4], A[i][5], A[i][6], this);
        }
    }
}


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

var CurrBasket;
var CurrNode=0;
var strLinkCaption='OK';
var strDefaultRefusalMessage='Vous ne pouvez pas faire cela. ';
var strBookmarkExplanation = '';
var strExerciseComplete = 'L&#x2019;histoire est termin&#x00E9;e. ';
var HPNStartTime = (new Date()).getTime();
var FollowingTrack = false;
var CurrTime;
var Started=false;

var IsEndPoint = false;
var Finished = false;


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
    var B = CurrBasket.CloneSelf(B, false);

    for (var i=0; i<T.List.length; i++){
        if (B.AssetMeetsRequirement(T.List[i][0], T.List[i][7], T.List[i][6]) == true){
            B.PerformTransaction(T.List[i][0], T.List[i][1], B.GetEffectiveOperand(T.List[i]));
        }
        else{
            if (T.List[i][8].length > 0){
                return T.List[i][8];
            }
            else{
                return strDefaultRefusalMessage;
            }
        }
    }
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

function HNode(NNum, LNum, Bask){
    this.NNum = NNum;
    this.LNum = LNum;
    this.Basket = Bask.CloneSelf(A, false);
    this.EntryTime = CurrTime.getTime();
    var D = new Date();
}

function HNodeReportSelf(AddTime){
    var S = this.NNum + ':' + this.LNum;
    if (AddTime == true){
        S += ':' + this.EntryTime;
    }
    return S;
}
HNode.prototype.ReportSelf=HNodeReportSelf;

function HNodeList(){
    this.Nodes = new Array();
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


function ParseSearch(){
    if (document.location.search.length < 1){return;}
    var StateString = document.location.search.substring(document.location.search.lastIndexOf('___'), document.location.search.length);
    if (StateString.length > 0){
        ParseStateString(StateString);
    }
}

function ParseStateString(StateString){
    var S = StateString.split(';');
    if (S.length > 0){
        if (S[0] == '___b'){
            ShowMessage(strBookmarkExplanation);
        }
        if (S[0] == '___t'){
            ParseTrack(S[1]);
            return;
        }
    }
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


function ShowCurrNode(){
    var DPT = N[CurrNode][0];
    if ((FollowingTrack==true)&&(Footprints.length > 0)){
        if (Footprints[0][2] > 0){
            DPT += ' (' + MillisecondsToTimeReadout(Footprints[0][2]) + ')';
        }
    }
    document.getElementById('DPTitle').innerHTML = DPT;
    document.getElementById('DPContentsDiv').innerHTML = '<p class="text">'+N[CurrNode][1]+'</p>';
    var Links = '';
    var Refusal = '';
    var ValidLinks = 0;
    for (var LNum=0; LNum<N[CurrNode][3].length; LNum++){
        if ((FollowingTrack==true)&&(Footprints.length > 0)){
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
}

function MakeFunctionButton(Caption, Action){
    var Result = '';
    if (C.opera){
        Result = '<a href="javascript:' + Action + '">' + Caption + '</a>';
    }
    else{
        Result = '<button class="FuncButton" onfocus="FuncBtnOver(this)" onblur="FuncBtnOut(this)"  onmouseover="FuncBtnOver(this)" onmouseout="FuncBtnOut(this)" onmousedown="FuncBtnDown(this)" onmouseup="FuncBtnOver(this)" onclick="' + Action + '">' + Caption + '</button>';
    }
    return Result;
}

function MakeLink(NNum, LNum){
    var Result = '<tr><td>';
    Result += MakeFunctionButton(strLinkCaption, 'FollowLink(' + LNum + ')');
    Result += '</td>';
    Result += '<td>' + N[NNum][3][LNum][1] + '</td></tr>';
    return Result;
}

function FollowLink(LNum){

    H.Nodes.push(new HNode(CurrNode, LNum, CurrBasket));
    CurrTime = new Date();

    var T = new TransactionList(CurrNode, LNum);
    for (var i=0; i<T.List.length; i++){
        CurrBasket.PerformTransaction(T.List[i][0], T.List[i][1], CurrBasket.GetEffectiveOperand(T.List[i]));
    }
    CurrNode = N[CurrNode][3][LNum][0];
    ShowCurrNode();

}



function Finish(){
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
N[2][3][1][1] = 'Vous fuyez vers la cave';
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
N[4][1] = 'Vous arrivez dans la cave du bar. Au fond de la cave une porte sombre vous fait face, elle a l\'air plut&#x00F4;t effrayante, un peu comme belle-maman.';
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