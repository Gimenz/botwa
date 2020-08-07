const { create, decryptMedia } = require('@open-wa/wa-automate')
const fs = require('fs-extra')
const moment = require('moment')
const {tiktok, instagram, twitter, facebook} = require('./lib/tiktok')
const fbvid = require('fbvideos');
const malScraper = require('mal-scraper')
const urlShortener = require('./lib/shortener')
const {artinama,
    quotes,
    weton,
    corona,
    alay,
    namaninjaku,
    liriklagu,
    quotemaker,
    yt,
    ytmp3,
    gd,
    jodoh,
    hilih,
    weather,
} = require('./lib/functions')


const serverOption = {
    headless: true,
    qrRefreshS: 20,
    qrTimeout: 0,
    authTimeout: 0,
    autoRefresh: true,
    devtools: false,
    cacheEnabled:false,
    chromiumArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
}

const opsys = process.platform;
if (opsys == "win32" || opsys == "win64") {
serverOption['executablePath'] = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
} else if (opsys == "linux") {
serverOption['browserRevision'] = '737027';
} else if (opsys == "darwin") {
serverOption['executablePath'] = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

const startServer = async (from) => {
create('Imperial', serverOption)
        .then(client => {
            console.log('[SERVER] Server Started!')

            // Force it to keep the current session
            client.onStateChanged(state => {
                console.log('[Client State]', state)
                if (state === 'CONFLICT') client.forceRefocus()
            })

            client.onMessage((message) => {
                msgHandler(client, message)
            })
        })
}

async function msgHandler (client, message) {
    try {
        const { type, body, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg } = message
        const { id, pushname } = sender
        const { name } = chat
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const commands = [
            '#menu',
            '#help',
            '#sticker',
            '#stiker',
            '#tiktok',
            '#fb',
            '#unsplash',
            '#kuching',
            '#anime',
            '#wp',
            '#lasegar',
            '#kopi',
            '#artinama',
            '#weton',
            '#corona',
            '#alay',
            '#namaninjaku',
            '#quotemaker',
            '#liriklagu',
            '#quotes',
            '#yt',
            '#ytmp3',
            '#gd',
            '#jodoh',
            '#hilih',
            '#weather',
            '#ig',
            '#instagram',
            '#twt',
            '#twitter',
            ]

        const cmds = commands.map(x => x + '\\b').join('|')
        const cmd = type === 'chat' ? body.match(new RegExp(cmds, 'gi')) : type === 'image' && caption ? caption.match(new RegExp(cmds, 'gi')) : ''

        if (cmd) {
            if (!isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(cmd[0]), 'from', color(pushname))
            if (isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(cmd[0]), 'from', color(pushname), 'in', color(name))
            const args = body.trim().split(' ')
            const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
            switch (cmd[0]) {
                case '#menu':
                case '#help':
                    client.sendText(from, 'mg-bot\n' +
                    '\nlist command:\n\n' +
                    '*#menu | #help* : Tampilkan semua fitur\n' +
                    '*#corona* : Cek data corona terbaru di Indonesia\n' +
                    '*#quotes* : Random quotes bucin\n' +
                    '*#liriklagu wong-sepele* : Tampilkan lirik lagu *wong sepele*\n'+
                    '*#artinama mg* : Cek arti nama dari *mg*\n' +
                    '*#weton 06 08 1995* : Cek weton dan watak (tgl bulan tahun)\n' +
                    '*#alay aku+sayang+kamu* : Tampilkan kalimat alay dari *aku sayang kamu*\n' +
                    '*#quotemaker coba-coba-saja mg random* : Tampilkan gambar quotes (pisahkan dengan -) dengan nama *mg* dan gambar tema *random*\n' +
                    '*#namaninjaku ahmad+lemon* : Tampilkan nama ninja terkeren dari *ahmad lemon*\n' +
                    '*#stiker url-gambar* : Tampilkan stiker dengan url yang kamu masukkan\n' +
                    '*#stiker* : Tampilkan stiker dengan gambar yang kamu kirimkan dengan caption #stiker\n' +
                    '*#tiktok url-video* : Download video tiktok dengan url yang kamu berikan\n' +
                    '*#fb url-video* : Download video facebook dengan url\n ' +
                    '*#unsplash* : Download wallpaper dari unsplash \n' +
                    '*#kuching* : Download gambar kucing random\n' +
                    '*#anime* : Download gambar anime\n' +
                    '*#wp nature* : Download gambar dari unsplash dengan keyword *nature*\n' +
                    '*#lasegar* : gambar penyemangat hidup\n'+
                    '*#kopi* : bikin kopi\n'+
                    '*#jodoh* ayam bebek : Ramal jodoh dari nama *ayam* & *bebek*\n'+
                    '*#yt* link youtube : Download video youtube \n'
                    )
                    break;
                case '#sticker':
                case '#stiker':
                    if (isMedia) {
                        const mediaData = await decryptMedia(message)
                        const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendImageAsSticker(from, imageBase64)
                    } else if (quotedMsg && quotedMsg.type == 'image') {
                        const mediaData = await decryptMedia(quotedMsg)
                        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendImageAsSticker(from, imageBase64)
                    } else if (args.length == 2) {
                        const url = args[1]
                        if (url.match(isUrl)) {
                            await client.sendStickerfromUrl(from, url, { method: 'get' })
                                .catch(err => console.log('Caught exception: ', err))
                        } else {
                            client.sendText(from, 'Maaf, Url yang kamu kirim tidak valid')
                        }
                    } else {
                        client.sendText(from, 'Tidak ada gambar! Untuk membuat sticker kirim gambar dengan caption #stiker')
                    }
                    break;
                case '#tiktok':
                    await client.simulateTyping(from, true)
                    client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')                 
                    if (args.length == 2) {
                        const url = args[1]
                        if (url.match(isUrl) && url.includes('tiktok.com')) {
                            const videoMeta = await tiktok(url)
                            const filename = videoMeta.authorMeta.name + '.mp4'
                            await client.sendFile(from, videoMeta.videobase64, filename, videoMeta.NoWaterMark ? '' : 'Maaf, video tanpa watermark tidak tersedia')
                                .then(await client.sendText(from, `Metadata:\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'}`))
                                .catch(err => console.log('Caught exception: ', err))
                        } else {
                            client.sendText(from, 'Maaf, Url yang kamu kirim tidak valid')
                        }
                    }
                    break;
                case '#fb':
                    await client.simulateTyping(from, true)
                    client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')                 
                    if (args.length >=2) {
                        const urlvid = args[1]
                        const high = await fbvid.high(urlvid)
                        const low = await fbvid.low(urlvid)
                        if (high == "Either the video is deleted or it's not shared publicly!") {
                            client.sendFileFromUrl(from, low.url, "video.mp4", "SD Video successfully downloaded")
                        } else if (high !== "Either the video is deleted or it's not shared publicly!") {
                            client.sendFileFromUrl(from, high.url, "video.mp4", "HD Video successfully downloaded")
                        } else if (high == "Either the video is deleted or it's not shared publicly!" && low == "Either the video is deleted or it's not shared publicly!") {
                            client.reply(from,"URL tidak valid / video tidak publik !",message)
                        }
                    } else {
                        client.reply(from,"#fb [URL Video]",message)
                    }
                    break;
                case '#ig':
                case '#instagram':
                    await client.simulateTyping(from, true)
                    client.sendText(from, '⏳ Tunggu yaa 👉👈, sedang proses . . . ⏳')                    
                    if (args.length == 2) {
                        const url = args[1]
                        if (!url.match(isUrl) && !url.includes('instagram.com')) return client.sendText(from, 'Maaf, link yang kamu kirim tidak valid')
                        instagram(url)
                            .then(async (videoMeta) => {
                                const content = []
                                for (var i = 0; i < videoMeta.length; i++) {
                                    await urlShortener(videoMeta[i].video)
                                        .then((result) => {
                                            console.log('Shortlink: ' + result)
                                            content.push(`${i+1}. ${result}`)
                                        }).catch((err) => {
                                            client.sendText(from, `Error, ` + err)
                                        });
                                }
                                client.sendText(from, `Link Download:\n${content.join('\n')}`)
                            }).catch((err) => {
                                console.error(err)
                                if (err == 'Not a video') return client.sendText(from, `Error, tidak ada video di link yang kamu kirim`)
                                client.sendText(from, `Error, user private atau link salah`)
                            });
                    }
                    break
                case '#twt':
                case '#twitter':
                    await client.simulateTyping(from, true)
                    client.sendText(from, '⏳ Tunggu yaa 👉👈, sedang proses . . . ⏳')                  
                    if (args.length == 2) {
                        const url = args[1]
                        if (!url.match(isUrl) && !url.includes('twitter.com') || url.includes('t.co')) return client.sendText(from, 'Maaf, url yang kamu kirim tidak valid')
                        twitter(url)
                            .then(async (videoMeta) => {
                                try {
                                    if (videoMeta.type == 'video') {
                                        const content = videoMeta.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                                        const result = await urlShortener(content[0].url)
                                        console.log('Shortlink: ' + result)
                                        client.sendFileFromUrl(from, content[0].url, 'TwitterVideo.mp4', `Link Download: ${result}`)
                                    } else if (videoMeta.type == 'photo') {
                                        for (var i = 0; i < videoMeta.variants.length; i++) {
                                            await client.sendFileFromUrl(from, videoMeta.variants[i], videoMeta.variants[i].split('/media/')[1], '')
                                        }
                                    }
                                } catch (err) {
                                    client.sendText(from, `Error, ` + err)
                                }
                            }).catch((err) => {
                                console.log(err)
                                client.sendText(from, `Maaf, link tidak valid atau tidak ada video di link yang kamu kirim`)
                            });
                    }
                    break                    
                case '#unsplash':
                        client.sendFileFromUrl(from, 'https://source.unsplash.com/daily', 'wallpaper.png'); // UwU)/ Working Fine
                    break;
                case '#kuching':
                    q2 = Math.floor(Math.random() * 900) + 300;
                    q3 = Math.floor(Math.random() * 900) + 300;
                    client.sendFileFromUrl(from, 'http://placekitten.com/'+q3+'/'+q2, 'kuching.png','meong ');
                    break;
                case '#anime' :
                       q4 = Math.floor(Math.random() * 800) + 100;
                    client.sendFileFromUrl(from, 'https://wallpaperaccess.com/download/anime-'+q4,'Anime.png','Here is your wallpaper');
                    break;
                case '#wp':
                    if (args.length >=2) {
                    const keyword = args[1]
                    client.sendFileFromUrl(from, 'https://source.unsplash.com/1600x900/?'+args[1],'wp.jpeg')    
                    };
                    break;
                case '#lasegar':
                    q2 = Math.floor(Math.random() * 10) + 1;
                    client.sendFileFromUrl(from, 'https://lines.masgimenz.com/gambar/'+q2+'.jpg','halo.jpg','sayang ');
                    break;
                case '#kopi':
                    await client.simulateTyping(from, true)
                    client.sendText(from, 'Gawe dewe')
                    await client.simulateTyping(from, false)
                    break;
                case '#quotes':
                    const getBijak = await quotes()
                    client.sendText(from, getBijak);
                    break;
                case '#corona':
                    const result = await corona()
                    client.sendText(from, corona);
                    break;
                case '#artinama':
                    if (args.length == 2) {
                        const nama = args[1]
                        const result = await artinama(nama)
                        client.sendText(from, result)
                    }
                    break;
                case '#liriklagu':
                    if (args.length == 2){
                        const lagu = args[1]
                        const result = await liriklagu(lagu)
                        client.sendText(from, result)
                    }
                    break;
                case '#weton':
                    if (args.length == 4) {
                        const tgl = args[1]
                        const bln = args[2]
                        const thn = args[3]
                        const result = await weton(tgl, bln, thn)
                        client.sendText(from, result)
                    }
                    break;
                case '#alay':
                    if (args.length == 2) {
                        const kata = args[1]
                        const result = await alay(kata)
                        client.sendText(from, result)
                    }
                    break;
                case '#namaninjaku':
                    if (args.length == 2) {
                        const nama = args[1]
                        const result = await namaninjaku(nama)
                        client.sendText(from, result)
                    }
                    break;
                case '#quotemaker':
                    await client.simulateTyping(from, true)
                    client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')                
                    if (args.length == 4) {
                        const quotes = args[1]
                        const author = args[2]
                        const theme = args[3]
                        const result = await quotemaker(quotes, author, theme)
                        client.sendFile(from, result, 'quotesmaker.jpg','nih anak qoutes')
                    }
                    break;
                case '#yt':
                    await client.simulateTyping(from, true)
                    client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                    if (args.length >=2){
                        const url = args[1]
                        const result = await yt(url)
                        client.sendFileFromUrl(from, result , 'video.mp4')
                    }
                    break;  
                case '#ytmp3':
                    await client.simulateTyping(from, true)
                    client.sendText(from, '⏳ Tunggu yaa, sedang proses . . . ⏳')
                    if (args.length >=2){
                        const url = args[1]
                        const result = await ytmp3(url)
                        client.sendFileFromUrl(from, result , 'audio.mp3')
                    }
                    break;                   
                case '#gd':
                    if (args.length >=2){
                        const url = args[1]
                        const result = await gd(url)
                        client.sendText(from, result)
                    }
                    break;  
                case '#jodoh':
                    if (args.length == 3) {
                        const nama1 = args[1]
                        const nama2 = args[2]
                        const result = await jodoh(nama1, nama2)
                        client.sendText(from, result)
                    }
                    break;   
                case '#hilih':
                    if (args.length >=2){
                        const kata = args[1]
                        const result = await hilih(kata)
                        client.sendText(from, result)
                    }
                    break;  
                case '#weather':
                    if (args.length >=2){
                        const kota = args[1]
                        const result = await weather(kota)
                        client.sendText(from, result)
                    }
                    break;                                                          
            }
        } else {
            if (!isGroupMsg) console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname))
            if (isGroupMsg) console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname), 'in', color(name))
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}

process.on('Something went wrong', function (err) {
    console.log('Caught exception: ', err);
  });

function color (text, color) {
  switch (color) {
    case 'red': return '\x1b[31m' + text + '\x1b[0m'
    case 'yellow': return '\x1b[33m' + text + '\x1b[0m'
    default: return '\x1b[32m' + text + '\x1b[0m' // default is green
  }
}

startServer()
