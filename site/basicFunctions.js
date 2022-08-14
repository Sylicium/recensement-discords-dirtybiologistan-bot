
let socket = io()

let Toasts = document.getElementById('toasts')
//let types = ['info', 'success', 'error']


socket.emit("IsAuthentified", {
    connectionToken: _getCookie("connectionToken")
})

let MyAccount_ = {
    connected: false,
    discord: {
        id: undefined,
        username: undefined,
        avatarURL: undefined,
        discriminator: undefined,
        locale: undefined,
        tag: undefined
    },
    website: {
        username: "Anonyme"
    }
}

if(!!_getCookie("myAccount")) {
    MyAccount_ = JSON.parse(_getCookie("myAccount"))
    __refreshDisplayAccount()
}

_setCookie("next_redirect_uri","",0)

socket.on("IsAuthentifiedBack", datas => {
        if(!datas) return console.log("[basicFunctions.js][sock][IsAuthentifiedBack] Server responded with no datas.")
        console.log(datas)
        if(datas.connected) {
            try {
                let myAccountButton = document.getElementById("myAccountButton")
                myAccountButton.onclick = () => {
                    document.location.href = `${document.location.origin}/account/me`
                }
                let label = document.getElementById("myAccountButton_label")
                label.textContent = "Mon compte"
               label.className = "myAccount"
            } catch(e) {
                console.warn(e)
            }
            /* Uniquement pour la page gouv ou plus tard à la premiere page chargée du site. (un cookie AlreadySaidConnectionMessage ?)*/
            console.log("[basicFunctions.js][sock][IsAuthentifiedBack] Connected.")
            _createNotification("info","Connecté.")

            
            MyAccount_.connected = true
            if(datas.account) {
                MyAccount_.discord.id = datas.account.id
                MyAccount_.discord.username = datas.account.username
                MyAccount_.discord.discriminator = datas.account.discriminator
                MyAccount_.discord.avatarURL = datas.account.avatarURL
                MyAccount_.discord.locale = datas.account.locale
                MyAccount_.discord.tag = `${datas.account.username}#${datas.account.discriminator}`
                MyAccount_.website.username = datas.account.username
                __refreshDisplayAccount()
                _setCookie("myAccount",JSON.stringify(MyAccount_))
            } else {
                console.log("[basicFunctions.js][sock][IsAuthentifiedBack] Server responded with no datas for the account informations")
            }
        } else {
            console.log("[basicFunctions.js][sock][IsAuthentifiedBack] Not connected")
            _createNotification("warn", "Vous n'êtes pas connecté.")
            //document.location.href = datas.redirectURI
            let myAccountButton = document.getElementById("myAccountButton")
            myAccountButton.onclick = () => {
                _setCookie("next_redirect_uri",document.location.href)
                setTimeout(() => {
                    if(!!datas.redirectURI) document.location.href = `${datas.redirectURI}`
                }, 50)
            }
            let label = document.getElementById("myAccountButton_label")
            label.textContent = "Se connecter"
            
        }

    })

function __refreshDisplayAccount() {
    if(MyAccount_) {
        document.getElementById("userAccountIcon").src = MyAccount_.discord.avatarURL
        let label = document.getElementById("myAccountButton_label")
        label.textContent = MyAccount_.website.username
        label.className = "myAccount"
    }
}

socket.on("IsAuthentifiedBack", datas => {
    /*
    datas = {
        connected: true,
        redirectURI: false,
        account: the_account
    }
    */
    console.log("AAAAAAAAAAAAAAAAAAAA")
    if(!datas) return;
    if(datas.connected) {
        MyAccount_ = datas.account
        console.log(`[basicFunctions.js][sock][IsAuthentifiedBack] Connecté.`)
        console.log("MyAccount_:",MyAccount_)
    }
})


function _fade(element, duration) {
    // duration in second
    var op = 1;// initial opacity
    let removeStep = 0.02
    var timer = setInterval(function () {
        if (op <= removeStep){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * removeStep;
    }, 5*duration);
}

function _showToast(a,b,c,d,e) {
    _createNotification(a,b,c,d,e)
}
function _createNotification(type = null, message = null) {
    displayDuration = 5000
    if(message == null || type == null) return;
    const notif = document.createElement('div')
    notif.classList.add('toast')
    notif.classList.add(type ? type : "info")
    notif.innerText = message ? message : "Notification message is null"
    Toasts.appendChild(notif)
    setTimeout(() => {
        _fade(notif,2)
    }, displayDuration)
    setTimeout(() => {
        notif.remove()
    }, displayDuration+3000)
}

function _setCookie(cname, cvalue, exdays) {
    if(!exdays) exdays = 1
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function _getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function _createNewElement(options) {
    /*
    options = {
        type: "div"
        id: "",
        className: "content",
        childrens: [list],
        textContent: undefined,
        text: undefined,
        value: undefined,
        href: undefined,
        onclick: undefined,
        target: undefined
    }
    */
    let elem = document.createElement(options.type)
    if(options.id != undefined) elem.id = options.id
    if(options.className != undefined) elem.className = options.className
    if(options.childrens != undefined) {
        for(let i in options.childrens) {
            elem.appendChild(options.childrens[i])
        }
    }
    if(options.textContent != undefined) elem.textContent = options.textContent
    if(options.text != undefined) elem.text = options.text
    if(options.value != undefined) elem.value = options.value
    if(options.href != undefined) elem.href = options.href
    if(options.target != undefined) elem.target = options.target
    if(options.onclick != undefined) elem.onclick = options.onclick
    return elem
}


function _formatTime(millisecondes, format) {
    /*
    Renvoie un dictionnaire avec le formatage de la durée en ms, en jour, heures, etc...
    YYYY: year
    MM: month
    DDDDD: jour de l'année
    DD: jours du mois
    hh: heure
    mm: minute
    ss: seconde
    */
    let v = {
        y: 31536000000,
        mo: 2628000000,
        d: 86400000,
        h: 3600000,
        m: 60000,
        s: 1000
    }
    let la_date = {
        years: Math.floor(millisecondes/v.y),
        months: Math.floor((millisecondes%v.y)/v.mo), // value de l'année divisée en douze poue faire à peu pres
        all_days: Math.floor(millisecondes/v.d), // jours de l'année
        days: Math.floor(((millisecondes%v.y)%v.mo)/v.d), // jours du mois
        hours: Math.floor((((millisecondes%v.y)%v.mo)%v.d)/v.h),
        minutes: Math.floor(((((millisecondes%v.y)%v.mo)%v.d)%v.h)/v.m),
        seconds: Math.floor((((((millisecondes%v.y)%v.mo)%v.d)%v.h)%v.m)/v.s),
    }
    //console.log(la_date)

    function formatThis(thing, length=2) {
        return `0000${thing}`.substr(-2)
    }

    let return_string = format.replace("YYYY", la_date.years).replace("MM", formatThis(la_date.months)).replace("DDDDD", la_date.all_days).replace("DD", formatThis(la_date.days)).replace("hh", formatThis(la_date.hours)).replace("mm", formatThis(la_date.minutes)).replace("ss", formatThis(la_date.seconds))

    return {
        string: return_string,
        json: la_date
    }
}

function _formatDate(timestamp, format) {
    /*
    YYYY: year
    MM: month
    DDDDD: jour de la semaine
    DD: day
    hh: heure
    mm: minute
    ss: seconde
    */
    let la_date = new Date(timestamp)
    function formatThis(thing, length=2) {
        return `0000${thing}`.substr(-2)
    }

    function getDayName() {
        let list = [
            "lundi",
            "mardi",
            "mercredi",
            "jeudi",
            "vendredi",
            "samedi",
            "dimanche"
        ]
        return list[la_date.getDay()-1]
    }

    let return_string = format.replace("YYYY", la_date.getFullYear()).replace("MM", formatThis(la_date.getMonth()+1)).replace("DDDDD", getDayName()).replace("DD", formatThis(la_date.getDate())).replace("hh", formatThis(la_date.getHours())).replace("mm", formatThis(la_date.getMinutes())).replace("ss", formatThis(la_date.getSeconds()))
    
    return return_string
}


function _copyTextToClipboard(text) {
    /*
    var copyText = document.getElementById("myInput");
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(copyText.value);
    */
    navigator.clipboard.writeText(text);
    alert("Copié dans le presse-papier");
}