(() => {
    var a = [
        [4, "语文"],
        [5, "数学"],
        [6, "外语"],
        [7, "物理"],
        [8, "化学"],
        [9, "生物"],
        [10, "政治"],
        [11, "历史"],
        [12, "地理"],
        [13, "全科专用（级部发布）"],
        [14, "信息技术"],
        [15, "通用技术"],
        [24, "体育与健康"],
        [34, "技术"],
        [35, "艺术"],
        [41, "研创大任务"],
        [42, "级部管理"],
        [53, "家务劳动"],
        [66, "调查问卷"]
    ];
    for (var i in a)
        $(ques_subject).append(`<option value="${a[i][0]}">${a[i][1]}</option>`)

    let aeskey = () => {
        var e = ":F0wKU!Qg3}UkbW+w[:9|D3-5h=:T;7t#_GZ4#G;~ZNSq{8;}QIP>'{q.lje",
            t = new Date,
            n = t.getFullYear(),
            r = t.getMonth() + 1,
            o = t.getDate(),
            i = 33 + o * r * 33,
            a = String.fromCharCode(i % 94 + 33),
            s = e[o + r],
            c = n * r * o % e.length,
            u = e.substring(0, c),
            l = e.substring(c),
            f = (l + u).substring(0, 14);
        return "".concat(a).concat(f).concat(s)
    }

    window.key = CryptoJS.enc.Utf8.parse(aeskey()),
        window.aesDecrypt = (encryptedBase64Str) => {
            if (!encryptedBase64Str)
                return "";
            try {
                let decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7
                });
                return decryptedData.toString(CryptoJS.enc.Utf8);
            } catch (e) {
                console.log(e);
            }
        },
        window.aesEncrypt = (data) => {
            let encryptedData = CryptoJS.AES.encrypt(data, key, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return encryptedData.toString();
        };

    if (localStorage.getItem("token")) {
        var ezyToken = localStorage.getItem("token");
        if (JSON.parse(atob(ezyToken.split(".")[1])).exp < (new Date).getTime() / 1000)
            $(welc).html("身份过期，建议重新登录");
        else $(welc).html(`你好！<img src="${localStorage.getItem("photo")}" style="height:calc(1.425rem + 2.5vw);margin-right:2%;margin-bottom:0.5vh;">${localStorage.getItem("realName")}`);
        $(login_btn).html("重新登录");
    }
})();

/*ques_subject.onchange = function() {
    if (this.value == "-1") return;
    $.ajax({
        type: "GET",
        headers: {
            "token": localStorage.getItem("ezyToken"),
            "id": this.value
        },
        url: location.origin + `/getCatalogs`,
        dataType: "json",
        success: function(data) {
            ques_topic.innerHTML = `<option value="-1">请选择</option>`;
            for (i in data) {
                $(ques_topic).append(`<option value="${data[i].id}">${data[i].name}</option>`)
            }
        }
    })
};*/

ques_query.onclick = async function () {
    var topic = $(ques_topic).val(),
        subject = $(ques_subject).val();
    if (topic == '-1 ' || subject == '-1 ') return;

    let data = await fetch(`http://sxz.api.zykj.org/api/services/app/Quora/GetSessions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            "catalogId": topic,
            "orderBy": 0,
            "skip": 0,
            "take": 1000,
            "topicId": subject
        })
    })
        .then(response => response.json());
    data = data.result;

    $(ques_list).html("");
    for (i in data) {
        var tb = $(`<tr class="table" background-color: rgba(255,255,255,0.8) !important;>
                    <th scope="row">${Number(i) + 1}</th>
                    <td><img src="${data[i].askUserPhoto || "https://s4.anilist.co/file/anilistcdn/user/avatar/large/default.png"}" class="avatar">${data[i].askUserName}</td>
                    <td>${data[i].summary}</td>
                    <td>${data[i].updateTime}</td>
                </tr>`)
        tb.data("snap", data[i].snapshot);
        tb.data("id", data[i].id);
        tb.click(async function () {
            ques_focus = this;
            var s = "";
            let data = await fetch(`http://sxz.api.zykj.org/api/services/app/Quora/GetMessages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    "SessionId": $(this).data("id"),
                    "Skip": 0,
                    "Take": 1000
                })
            })
                .then(response => response.json());
            data = data.result;


            for (var i in data)
                s += `
                    <div class="carousel-item ${i == "0" ? "active" : ""}" data-link="${data[i].content}">
                        <img src="${data[i].snapShot}" class="d-block w-100">
                        <div style="padding-bottom:0" class="carousel-caption d-none d-md-block">
                                <p>第${Number(i) + 1}/${data.length}页 发布者： ${data[i].userName}</p>
                        </div>
                    </div>`
            $(ques_preview_body).html(`
                <div id="ques_preview_pic" class="carousel slide carousel-dark" data-bs-interval="false">
                    <div class="carousel-inner">${s}</div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#ques_preview_pic" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#ques_preview_pic" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>`)
            ques_preview.click()

        })
        $(ques_list).append(tb);
    }

};
ques_download.onclick = function () {
    download($('.carousel-item.active')[0].dataset.link, 'test.zip')
};

mistake_query.onclick = async function () {
    var subject = $(mistake_subject).val();
    let data = await fetch(`http://sxz.api.zykj.org/api/services/app/MistakeBook/SearchMistakeQstItemsAsync`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            "attainedLevel": [],
            "bookId": subject,
            "diff": [],
            "errorReason": [],
            "haveNoTag": false,
            "maxResultCount": 1000,
            "skipCount": 0,
            "tagIdList": []
        })
    })
        .then(response => response.json());
    data = data.result;
    console.log(data);
    data = data.items;

    $(mistake_list).html("");
    for (i in data) {
        var tb = $(`<tr class="table" background-color: rgba(255,255,255,0.8) !important;>
                    <th scope="row">${Number(i) + 1}</th>
                    <td>${data[i].source}</td>
                    <td><img src=${data[i].stemShoot} width=100%></img></td>
                    <td>${data[i].creationTime}</td>
                </tr>`)
        tb.data("id", data[i].id);
        tb.click(async function () {
            let data = await fetch(`http://sxz.api.zykj.org/api/services/app/MistakeBook/GetMistakeQstItemDetailInfoAsync?itemId=` + $(this).data("id"), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            })
                .then(response => response.json());
            data = data.result;
            if (!data) return;
            let noteSrc = data.note;
            if (!noteSrc) {
                alert("无笔记");
                return;
            }
            download(noteSrc);
        })
        $(mistake_list).append(tb);
    }
}

var downloading = 0,
    ques_focus,
    isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
(function () {
    var file_count = 1;
    upload_button.onclick = () => {
        var files = upload_file.files;
        for (var i = 0; i < files.length; ++i) {
            var tb = $(`<tr>
                <th scope="row">${file_count++}</th>
                <td>${files[i].name}</td>
                <td>${files[i].size} Byte</td>
                <td class="status">Uploading</td>
              </tr>`)
            $(upload_msg).append(tb);
            upload(files[i], tb.children(".status"));
        }
    }

    function upload(file, msg) {
        var form = new FormData();
        form.append("file", file);
        var x = new XMLHttpRequest();
        x.open("post", location.origin + "/upload", true);
        x.setRequestHeader("name", encodeURIComponent(localStorage.getItem("realName")));
        x.setRequestHeader("token", localStorage.getItem("token"));
        x.setRequestHeader("userid", localStorage.getItem("id"))
        x.send(form);
        x.onreadystatechange = () => {
            if (x.readyState == 4)
                if (x.status == 200)
                    $(msg).text(x.response);
                else $(msg).text("Unknown Error");
        };
    }
})

login_btn.onclick = async () => {
    localStorage.clear();
    var message;
    let data = await fetch("http://sxz.api.zykj.org/api/TokenAuth/Login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "userName": account.value,
            "password": password.value,
            "clientType": 1
        })
    })
        .then(response => response.json());
    if (!data.result)
        message = data.error.message;
    else {
        let token = data.result.accessToken,
            info = await (fetch("http://sxz.api.zykj.org/api/services/app/User/GetInfoAsync", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(response => response.json()));
        info = info.result, info["token"] = token;
        if (!info.photo)
            info.photo = "https://s4.anilist.co/file/anilistcdn/user/avatar/large/default.png";
        for (var i in info)
            localStorage.setItem(i, info[i]);
        message = `你好！<img src="${localStorage.getItem("photo")}" style="height:calc(1.425rem + 2.5vw);margin-right:2%;margin-bottom:0.5vh;">${localStorage.getItem("realName")}`;
    }
    $(welc).html(message);
}

async function noteGetAll() {
    let response = await fetch("http://sxz.api.zykj.org/CloudNotes/api/Notes/GetAll", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    if (response.status == 401) {
        alert("身份失效，请重新登录");
        return;
    }
    let data = await response.json();
    data = JSON.parse(aesDecrypt(data.data));
    $(noteList).html("");
    let list = data.noteList;
    for (var i in list)
        if (list[i].type != 1 && list[i].type != 12) list.splice(i, 1);
    list = shellsort(list);
    for (var i in list) {
        if (list[i].type != 1 && list[i].type != 12) continue;
        var template = `
                <a onclick="if(downloading)alert('你已经在下载一个文件，耐心等待哦');else noteDownload('${list[i].fileId}','${list[i].fileName}')" class="list-group-item list-group-item-action py-3 lh-tight a-note" aria-current="true" style="background:rgba(255,255,255,0) !important;">
                    <div class="d-flex w-100 align-items-center justify-content-between">
                        <strong class="note-name mb-1">${list[i].fileName}</strong>
                        <small>${list[i].updateTime}</small>
                    </div>
                    <div class="col-10 mb-1 small">${list[i].fileId}</div>
                </a>`
        $("#noteList").append(template);
    }
}

async function noteDownload(fileId, name) {
    if (this.downloading) return;
    this.downloading = 1;

    let response = await fetch(`http://sxz.api.zykj.org/CloudNotes/api/Resources/GetByFileId?${aesEncrypt("fileId=" + fileId)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    if (response.status == 401) {
        alert("身份失效，请重新登录");
        return;
    }
    let data = await response.json();
    let zip = new JSZip();
    let list = JSON.parse(aesDecrypt(data.data)).resourceList;
    let count = [];

    showAlert.click();
    $(download_msg).text("正在获取图片...");

    for (i in list) {
        let url = "http://friday-note.oss-cn-hangzhou.aliyuncs.com/" + list[i].ossImageUrl;
        if (url.match(/\.(jpg|jpeg|png|webp)$/)) {
            let image = await fetch(url)
                .then(response => response.blob())
            if (!count[list[i].pageIndex])
                count[list[i].pageIndex] = 1;
            zip.file(`${list[i].pageIndex + 1}-${list[i].resourceType == 2 ? "thumbnail" : count[list[i].pageIndex]++}.jpg`, image);
        }
    }

    zip.generateAsync({
        type: "blob"
    }).then(function (content) {
        $(download_msg).text("获取完毕，下载启动...");
        download_button.disabled = "";
        download(URL.createObjectURL(content), name + '.zip')
        this.downloading = 0;
    });
}

function download(url, name) {
    downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = name;
    downloadLink.target = "_blank";
    downloadLink.click();
}

function shellsort(data) {
    var len = data.length,
        gap, i, j, temp;
    for (gap = Math.floor(len / 2); gap > 0; gap = Math.floor(gap / 2))
        for (i = gap; i < len; i++)
            for (j = i - gap; j >= 0 && data[j].updateTime < data[j + gap].updateTime; j -= gap)
                temp = data[j], data[j] = data[j + gap], data[j + gap] = temp;
    return data;
}

async function quoraInit() {
    let data = await fetch(`http://sxz.api.zykj.org/api/services/app/Quora/GetCatalogs`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }).then(response => response.json());
    data = data.result;
    $(ques_topic).html(`<option value="-1">请选择</option>`);
    for (i in data) {
        $(ques_topic).append(`<option value="${data[i].id}">${data[i].name}</option>`)
    }
}

async function mistakeInit() {
    let data = await fetch(`http://sxz.api.zykj.org/api/services/app/MistakeBook/GetMyMistakeBooksAsync`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }).then(response => response.json());
    data = data.result;
    $(mistake_subject).html(``);
    for (i in data) {
        $(mistake_subject).append(`<option value="${data[i].id}">${data[i].topic.content}</option>`)
    }
}

zxzl_login.onclick = async () => {
    window.open("http:\/\/sxz.school.zykj.org/navPage.html?apiHost=http:\/\/sxz.api.zykj.org&apiToken=" + localStorage.getItem("token") + "#\/list");
}

var note_link = "http:\/\/ezy-sxz.oss-cn-hangzhou.aliyuncs.com\/1\/appstore\/云笔记_master_20240513.01_1938_1.9.38.apk";
var test_link = "http:\/\/ezy-sxz.oss-cn-hangzhou.aliyuncs.com\/1\/appstore\/新测评_master_20240304.01_release_215_2.1.5.apk";
var learn_link = "http:\/\/ezy-sxz.oss-cn-hangzhou.aliyuncs.com\/1\/appstore\/云笔记_master_20240513.01_1938_1.9.38.apk";
var user_link = "http:\/\/ezy-sxz.oss-cn-hangzhou.aliyuncs.com\/1\/appstore\/用户中心_master_20240426.01_release_40_2.0.15.apk";
var mistake_link = "http:\/\/ezy-sxz.oss-cn-hangzhou.aliyuncs.com\/1\/appstore\/错题本_master_20240326.01_57_1.0.57.apk";
var web_link = "http:\/\/ezy-sxz.oss-cn-hangzhou.aliyuncs.com\/1\/appstore\/浏览器_master_20240221.01_1211_1.2.11.apk";
var chat_link = "http:\/\/ezy-sxz.oss-cn-hangzhou.aliyuncs.com\/1\/appstore\/随身答(学生版)_master_20240326.01_release_11_1.0.11.apk";

function reload_note_link() {
    $.ajax({
        url: 'http:\/\/sxz.api.zykj.org\/api\/services\/app\/AppStore\/CheckUpdateAsync?packageName=com.friday.cloudsnote&version=11&appType=0',
        type: 'get',
        // 设置的是请求参数
        data: {
            packageName: "com.friday.cloudsnote",
            version: 11,
            appType: 0
        },
        dataType: 'json', // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
        success: function (res) {
            // 一旦设置的 dataType 选项，就不再关心 服务端 响应的 Content-Type 了
            // 客户端会主观认为服务端返回的就是 JSON 格式的字符串
            console.log(res.result.fileUrl);
            note_link = res.result.fileUrl;
        }
    });

}

function download_note() {
    window.open(note_link);
}

function reload_test_link() {
    $.ajax({
        url: 'http:\/\/sxz.api.zykj.org\/api\/services\/app\/AppStore\/CheckUpdateAsync?packageName=com.zykj.evaluation&version=11&appType=0',
        type: 'get',
        // 设置的是请求参数
        data: {
            packageName: "com.zykj.evaluation",
            version: 11,
            appType: 0
        },
        dataType: 'json', // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
        success: function (res) {
            // 一旦设置的 dataType 选项，就不再关心 服务端 响应的 Content-Type 了
            // 客户端会主观认为服务端返回的就是 JSON 格式的字符串
            console.log(res.result.fileUrl);
            test_link = res.result.fileUrl;
        }
    });

}

function download_test() {
    window.open(test_link);
}

function reload_learn_link() {
    $.ajax({
        url: 'http:\/\/sxz.api.zykj.org\/api\/services\/app\/AppStore\/CheckUpdateAsync?packageName=com.zhongyukejiao.learningexpert&version=11&appType=0',
        type: 'get',
        // 设置的是请求参数
        data: {
            packageName: "com.zhongyukejiao.learningexpert",
            version: 11,
            appType: 0
        },
        dataType: 'json', // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
        success: function (res) {
            // 一旦设置的 dataType 选项，就不再关心 服务端 响应的 Content-Type 了
            // 客户端会主观认为服务端返回的就是 JSON 格式的字符串
            console.log(res.result.fileUrl);
            learn_link = res.result.fileUrl;
        }
    });

}

function download_learn() {
    window.open(learn_link);
}

function reload_user_link() {
    $.ajax({
        url: 'http:\/\/sxz.api.zykj.org\/api\/services\/app\/AppStore\/CheckUpdateAsync?packageName=com.zykj.manage&version=11&appType=0',
        type: 'get',
        // 设置的是请求参数
        data: {
            packageName: "com.zykj.manage",
            version: 11,
            appType: 0
        },
        dataType: 'json', // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
        success: function (res) {
            // 一旦设置的 dataType 选项，就不再关心 服务端 响应的 Content-Type 了
            // 客户端会主观认为服务端返回的就是 JSON 格式的字符串
            console.log(res.result.fileUrl);
            user_link = res.result.fileUrl;
        }
    });

}

function download_user() {
    window.open(user_link);
}

function reload_mistake_link() {
    $.ajax({
        url: 'http:\/\/sxz.api.zykj.org\/api\/services\/app\/AppStore\/CheckUpdateAsync?packageName=com.zykj.mistake&version=11&appType=0',
        type: 'get',
        // 设置的是请求参数
        data: {
            packageName: "com.zykj.mistake",
            version: 11,
            appType: 0
        },
        dataType: 'json', // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
        success: function (res) {
            // 一旦设置的 dataType 选项，就不再关心 服务端 响应的 Content-Type 了
            // 客户端会主观认为服务端返回的就是 JSON 格式的字符串
            console.log(res.result.fileUrl);
            mistake_link = res.result.fileUrl;
        }
    });

}

function download_mistake() {
    window.open(mistake_link);
}

function reload_web_link() {
    $.ajax({
        url: 'http:\/\/sxz.api.zykj.org\/api\/services\/app\/AppStore\/CheckUpdateAsync?packageName=com.zykj.subscriber&version=11&appType=0',
        type: 'get',
        // 设置的是请求参数
        data: {
            packageName: "com.zykj.subscriber",
            version: 11,
            appType: 0
        },
        dataType: 'json', // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
        success: function (res) {
            // 一旦设置的 dataType 选项，就不再关心 服务端 响应的 Content-Type 了
            // 客户端会主观认为服务端返回的就是 JSON 格式的字符串
            console.log(res.result.fileUrl);
            web_link = res.result.fileUrl;
        }
    });

}

function download_web() {
    window.open(web_link);
}

function reload_chat_link() {
    $.ajax({
        url: 'http:\/\/sxz.api.zykj.org\/api\/services\/app\/AppStore\/CheckUpdateAsync?packageName=com.zykj.student.dialogue&version=11&appType=0',
        type: 'get',
        // 设置的是请求参数
        data: {
            packageName: "com.zykj.student.dialogue",
            version: 11,
            appType: 0
        },
        dataType: 'json', // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
        success: function (res) {
            // 一旦设置的 dataType 选项，就不再关心 服务端 响应的 Content-Type 了
            // 客户端会主观认为服务端返回的就是 JSON 格式的字符串
            console.log(res.result.fileUrl);
            chat_link = res.result.fileUrl;
        }
    });

}

function download_chat() {
    window.open(chat_link);
}

function download_chat() {
    window.open("http:\/\/ezy-sxz.oss-cn-hangzhou.aliyuncs.com\/1\/appstore\/%E4%B8%AD%E8%82%B2%E6%95%99%E5%B8%88%E7%AB%AF_master_20240513.02_38_1.1.27.apk");
}

async function reload_all() {
    reload_test_link();
    reload_chat_link();
    reload_learn_link();
    reload_web_link();
    reload_mistake_link();
    reload_note_link();
    reload_user_link();
}

function reload_token() {
    $("#show_token").attr("value", localStorage.getItem("token"));
}

function show_class() {
    window.open("http:\/\/sxz.school.zykj.org/navPage.html?apiHost=http:\/\/sxz.api.zykj.org&apiToken=" + localStorage.getItem("token") + "#\/class");
}

function show_online_test() {
    window.open("https:\/\/m.dongni100.com\/system\/login?redirectUrl=%2F");
}

function copy_token() {
    const inputElement = document.querySelector('#show_token');
    inputElement.select();
    document.execCommand('copy');
}

function change_object() {
    var leng = 1;
    while (leng > 0) {
        var ob = document.getElementsByTagName("object");
        leng = ob.length;
        for (i = 0; i < ob.length; i++) {
            var name = ob[i].name;
            var link = ob[i].data;
            ob[i].remove();
            var div = document.getElementById('show');
            div.innerHTML += '<video src="' + link + '" type="video/mp4"  width="100%" controls="controls" loop="-1">';
            console.log(name);
            console.log(link);
        }
    }
}

function change_video() {
    var ob = document.getElementsByTagName("video");
    for (i = 0; i < ob.length; i++) {
        if (ob[i].hasAttribute('controls')) {
            console.log("Pass");
        } else {
            var name = ob[i].src;
            var link = ob[i].src;
            ob[i].remove();
            var div = document.getElementById('show');
            div.innerHTML += '<video src="' + link + '" type="video/mp4"  width="100%" controls="controls" loop="-1">';
            div.innerHTML += '<p>' + link + '</p>';
            console.log(name);
            console.log(link);
        }

    }

}

function change_div() {
    var ob = document.getElementsByTagName("div");
    for (i = 0; i < ob.length; i++) {
        if (ob[i].hasAttribute("data-type")) {
            if (ob[i].getAttribute("data-type") == "ppt") {
                var name = ob[i].getAttribute("data-name");
                var link = ob[i].getAttribute("data-url");
                ob[i].remove();
                var div = document.getElementById('show');
                div.innerHTML += '<iframe src="https://view.officeapps.live.com/op/embed.aspx?src=' + link + '" width="100%" height="600"></iframe>';
                div.innerHTML += '<p>' + name + ' 下载链接：' + link + '</p>';
                console.log(name);
                console.log(link);
            }
            if (ob[i].getAttribute("data-type") == "pdf") {
                var name = ob[i].getAttribute("data-name");
                var link = ob[i].getAttribute("data-url");
                ob[i].remove();
                var div = document.getElementById('show');
                div.innerHTML += '<embed src="' + link + '" width="100%" height="1000" type="application/pdf">';
                div.innerHTML += '<p>' + name + ' 下载链接：' + link + '</p>';
                console.log(name);
                console.log(link);
            }

        }
    }
}


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function change_all() {
    $(".ball").fadeIn(500);
    change_object();
    await sleep(100);
    change_video();
    await sleep(100);
    for (i = 1; i < 20; i++) {
        change_div();
        await sleep(50);
    }//无动画效果の滚动到顶部 也可解决ios调用键盘之后的空白问题
    window.scroll(0, 0);
//有动画效果の滚动到顶部
    $("html,body").animate({
        scrollTop: 0
    }, 500);
    await sleep(50);
    //无动画效果の滚动到顶部 也可解决ios调用键盘之后的空白问题
    window.scroll(0, 0);
//有动画效果の滚动到顶部
    $("html,body").animate({
        scrollTop: 0
    }, 500);
    $(".ball").fadeOut(500);

}

function show_page() {
    $.ajax({
        url: 'http:\/\/sxz.api.zykj.org\/SelfStudy\/api\/learn\/readContent?catalogId=' + $('#cid_input').val() + '&courseId=' + $('#id_input').val(),
        type: 'get',
        // 设置的是请求参数
        dataType: 'json', // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
        beforeSend: function (request) {
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        },
        success: function (res) {
            // 一旦设置的 dataType 选项，就不再关心 服务端 响应的 Content-Type 了
            // 客户端会主观认为服务端返回的就是 JSON 格式的字符串
            //console.log(res.data.content);
            var div = document.getElementById('show');
            div.replaceChildren();
            div.innerHTML += res.data.content
            change_all();
        }
    });
}

function show_lesson() {
    $.ajax({
        url: 'http:\/\/sxz.api.zykj.org\/SelfStudy\/api\/Learn\/LearningCourses',
        type: 'get',
        // 设置的是请求参数
        dataType: 'json', // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
        beforeSend: function (request) {
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        },
        success: function (res) {
            // 一旦设置的 dataType 选项，就不再关心 服务端 响应的 Content-Type 了
            // 客户端会主观认为服务端返回的就是 JSON 格式的字符串
            console.log(res.data);
            $("#id_c").find("option").remove();
            for (i = 0; i < res.data.length; i++) {
                console.log(res.data[i]);
                $('#id_c').append('<option value="' + res.data[i].id + '">' + res.data[i].title + '</option>');
            }
            show_class();
        }
    });
}

//$('#id_c').val()
function show_class() {
    $.ajax({
        url: 'http:\/\/sxz.api.zykj.org\/SelfStudy\/api\/Learn\/CourseDetail?id=' + $('#id_c').val(),
        type: 'get',
        // 设置的是请求参数
        dataType: 'json', // 用于设置响应体的类型 注意 跟 data 参数没关系！！！
        beforeSend: function (request) {
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        },
        success: function (res) {
            // 一旦设置的 dataType 选项，就不再关心 服务端 响应的 Content-Type 了
            // 客户端会主观认为服务端返回的就是 JSON 格式的字符串
            //console.log(res.data.catalogs);
            $("#cid_c").find("option").remove();
            for (i = 0; i < res.data.catalogs.length; i++) {
                console.log(res.data.catalogs[i]);
                if (res.data.catalogs[i].isLeaf) {
                    console.log('<option value="' + res.data.catalogs[i].id + '">' + res.data.catalogs[i].title + '</option>');
                    $('#cid_c').append('<option value="' + res.data.catalogs[i].id + '">' + res.data.catalogs[i].title + '</option>');
                } else {
                    for (j = 0; j < res.data.catalogs[i].children.length; j++) {
                        console.log('<option value="' + res.data.catalogs[i].children[j].id + '">' + res.data.catalogs[i].children[j].title + '</option>');
                        $('#cid_c').append('<option value="' + res.data.catalogs[i].children[j].id + '">' + res.data.catalogs[i].children[j].title + '</option>');
                    }
                }
            }
        }
    });
}

function set_ids() {
    $("#id_input").attr("value", $('#id_c').val());
    $("#cid_input").attr("value", $('#cid_c').val());
    show_page();
}