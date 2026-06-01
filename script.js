const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");

let previousFrame = null;
let photoCount = 0;
let lastSnapshotTime = 0;
let stream = null;
let detectorInterval = null;
let startTime = null;

startBtn.addEventListener("click", async () => {

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            video:true
        });

        video.srcObject = stream;

        startTime = Date.now();

        document.getElementById("status").innerText =
            "Статус: камера запущена";

        document.getElementById("status").style.color =
            "green";

        if(!detectorInterval){
            startMotionDetection();
        }

    } catch(error){

        document.getElementById("status").innerText =
            "Ошибка: " + error.message;
    }

});

stopBtn.addEventListener("click",()=>{

    if(stream){

        stream.getTracks().forEach(track=>{
            track.stop();
        });

        stream = null;
    }

    if(detectorInterval){

        clearInterval(detectorInterval);

        detectorInterval = null;
    }

    video.srcObject = null;

    document.getElementById("status").innerText =
        "Статус: остановлено";

    document.getElementById("status").style.color =
        "red";

});

clearBtn.addEventListener("click",()=>{

    document.getElementById("gallery").innerHTML = "";

});

function startMotionDetection(){

    const canvas =
        document.getElementById("canvas");

    const ctx =
        canvas.getContext("2d");

    detectorInterval = setInterval(()=>{

        if(video.videoWidth === 0) return;

        canvas.width = 160;
        canvas.height = 120;

        ctx.drawImage(video,0,0,160,120);

        const currentFrame =
            ctx.getImageData(
                0,0,160,120
            ).data;

        if(previousFrame){

            let difference = 0;

            for(
                let i = 0;
                i < currentFrame.length;
                i += 4
            ){

                difference += Math.abs(
                    currentFrame[i]
                    -
                    previousFrame[i]
                );
            }

            const sensitivity =
                Number(
                    document.getElementById(
                        "sensitivity"
                    ).value
                );

            if(difference > sensitivity){

                document.getElementById("motion")
                    .innerText =
                    "Движение: ОБНАРУЖЕНО";

                document.getElementById("motion")
                    .style.color =
                    "green";

                document.getElementById(
                    "lastMotion"
                ).innerText =
                "Последнее движение: "
                +
                new Date()
                .toLocaleTimeString();

                makeSnapshot();

            }else{

                document.getElementById("motion")
                    .innerText =
                    "Движение: нет";

                document.getElementById("motion")
                    .style.color =
                    "black";
            }
        }

        previousFrame =
            new Uint8ClampedArray(
                currentFrame
            );

    },500);
}

function makeSnapshot(){

    const now = Date.now();

    if(now - lastSnapshotTime < 3000)
        return;

    lastSnapshotTime = now;

    const canvas =
        document.getElementById("canvas");

    const image =
        canvas.toDataURL("image/jpeg");

    document.getElementById(
        "snapshot"
    ).src = image;

    photoCount++;

    document.getElementById(
        "counter"
    ).innerText =
        "Фотографий: "
        + photoCount;

    addToGallery(image);
}

function addToGallery(image){

    const gallery =
        document.getElementById(
            "gallery"
        );

    const card =
        document.createElement("div");

    card.className =
        "gallery-card";

    const img =
        document.createElement("img");

    img.src = image;

    img.className =
        "gallery-image";

    const download =
        document.createElement("a");

    download.href = image;

    download.download =
        "photo_" +
        Date.now() +
        ".jpg";

    download.innerText =
        "Скачать";

    card.appendChild(img);
    card.appendChild(download);

    gallery.prepend(card);

    if(gallery.children.length > 10){

        gallery.removeChild(
            gallery.lastChild
        );
    }
}

document
.getElementById("sensitivity")
.addEventListener("input",(e)=>{

    document
    .getElementById("sensValue")
    .innerText =
    e.target.value;

});

setInterval(()=>{

    if(startTime){

        const seconds =
            Math.floor(
                (
                    Date.now()
                    -
                    startTime
                ) / 1000
            );

        document.getElementById(
            "runtime"
        ).innerText =
        "Время работы: "
        + seconds
        + " сек";
    }

},1000);