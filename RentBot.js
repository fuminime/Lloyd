const { modul } = require("./module");
const {
  baileys,
  boom,
  chalk,
  fs,
  figlet,
  FileType,
  path,
  process,
  PhoneNumber,
} = modul;
const { Boom } = boom;
const Pino = require("pino");

const {
  default: makeWaSocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  proto,
  makeCacheableSignalKeyStore,
} = baileys;
const { color, bgcolor } = require("./lib/color");
const log = (pino = require("pino"));
const qrcode = require("qrcode");
const rimraf = require("rimraf");
const {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid,
} = require("./lib/exif");
const {
  smsg,
  isUrl,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  fetchJson,
  await,
  sleep,
  reSize,
} = require("./lib/myfunc");
const owner = JSON.parse(fs.readFileSync("./database/owner.json").toString());
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

if (global.conns instanceof Array) console.log();
else global.conns = [];

const rentfromxeon = async (XeonBotIncc, m, from, number) => {
  const { sendImage, sendMessage } = XeonBotIncc;
  const { reply, sender } = m;
  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, `./database/rentbot/${number}`),
    log({ level: "silent" })
  );

  try {
    async function start() {
      let { version, isLatest } = await fetchLatestBaileysVersion();
      const XeonBotInc = await makeWaSocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            Pino({ level: "fatal" }).child({ level: "fatal" })
          ),
        },
        browser: ["Chrome (Linux)", "", ""],
        mobile: false,
        printQRInTerminal: false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
          if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg.message || undefined;
          }
          return {
            conversation: "Zeta's Here",
          };
        },
        logger: log({ level: "silent" }),
        version,
      });

      if (!(await XeonBotInc.authState.creds.registered)) {
        if (!Object.keys(await baileys.PHONENUMBER_MCC).some((v) => number)) {
          sendMessage(from, {
            text: "Nomor tidak ada di whatsapp!, Example : 62xxx",
          });
        }

        setTimeout(async () => {
          let codek = await XeonBotInc.requestPairingCode(
            parseInt(await number.replace(/[^0-9]/g, ""))
          );

          codek = codek?.match(/.{1,4}/g)?.join("-") || codek;
          sendMessage(from, { text: "Kode pairing anda adalah " + codek });
          console.log("Kode pairing anda adalah: " + codek);
        }, 3000);
      }

      XeonBotInc.ws.on("CB:Blocklist", (json) => {
        if (blocked.length > 2) return;
        for (let i of json[1].blocklist) {
          blocked.push(i.replace("c.us", "s.whatsapp.net"));
        }
      });

      XeonBotInc.ws.on("CB:call", async (json) => {
        const callerId = json.content[0].attrs["call-creator"];
        const idCall = json.content[0].attrs["call-id"];
        const Id = json.attrs.id;
        const T = json.attrs.t;
        XeonBotInc.sendNode({
          tag: "call",
          attrs: {
            from: "6289677216812@s.whatsapp.net",
            id: Id,
            t: T,
          },
          content: [
            {
              tag: "reject",
              attrs: {
                "call-creator": callerId,
                "call-id": idCall,
                count: "0",
              },
              content: null,
            },
          ],
        });
        if (json.content[0].tag == "offer") {
          let qutsnya = await XeonBotInc.sendContact(callerId, owner);
          await XeonBotInc.sendMessage(
            callerId,
            {
              text: `Block Automatic System!!!\nDon't Call Bots!!!\nPlease contact the owner to open the block!!!`,
            },
            { quoted: qutsnya }
          );
          await sleep(8000);
          await XeonBotInc.updateBlockStatus(callerId, "block");
        }
      });

      XeonBotInc.ev.on("messages.upsert", async (chatUpdate) => {
        try {
          kay = chatUpdate.messages[0];
          if (!kay.message) return;
          kay.message =
            Object.keys(kay.message)[0] === "ephemeralMessage"
              ? kay.message.ephemeralMessage.message
              : kay.message;
          if (kay.key && kay.key.remoteJid === "status@broadcast") return;
          if (
            !XeonBotInc.public &&
            !kay.key.fromMe &&
            chatUpdate.type === "notify"
          )
            return;
          if (kay.key.id.startsWith("BAE5") && kay.key.id.length === 16) return;
          m = smsg(XeonBotInc, kay, store);
          require("./XeonCheems8")(XeonBotInc, m, chatUpdate, store);
        } catch (err) {
          console.log(err);
        }
      });

      XeonBotInc.public = true;

      store.bind(XeonBotInc.ev);
      XeonBotInc.ev.on("creds.update", saveCreds);
      XeonBotInc.ev.on("connection.update", async (up) => {
        const { lastDisconnect, connection } = up;
        if (connection == "connecting") return;
        if (connection) {
          if (connection != "connecting")
            console.log("Connecting to rent bot..");
        }
        console.log(up);

        if (connection == "open") {
          XeonBotInc.id = XeonBotInc.decodeJid(XeonBotInc.user.id);
          XeonBotInc.time = Date.now();
          global.conns.push(XeonBotInc);
          await m.reply(
            `*Connected to ${botname}*\n\n*User :*\n _*× id : ${XeonBotInc.decodeJid(
              XeonBotInc.user.id
            )}*_`
          );
          user = `${XeonBotInc.decodeJid(XeonBotInc.user.id)}`;
          txt = `*Terdeteksi seseorang sudah jadibot clone*\n\n _× User : @${
            user.split("@")[0]
          }_`;
          sendMessage(`6289677216812@s.whatsapp.net`, {
            text: txt,
            mentions: [user],
          });
        }

        if (connection === "close") {
          let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
          if (reason === DisconnectReason.badSession) {
            console.log(
              `Bad Session File, Please Delete Session and Scan Again`
            );
            XeonBotInc.logout();
          } else if (reason === DisconnectReason.connectionClosed) {
            console.log("Connection closed, reconnecting....");
            start();
          } else if (reason === DisconnectReason.connectionLost) {
            console.log("Connection Lost from Server, reconnecting...");
            start();
          } else if (reason === DisconnectReason.connectionReplaced) {
            console.log(
              "Connection Replaced, Another New Session Opened, Please Close Current Session First"
            );
            XeonBotInc.logout();
          } else if (reason === DisconnectReason.loggedOut) {
            console.log(`Device Logged Out, Please Scan Again And Run.`);
            XeonBotInc.logout();
          } else if (reason === DisconnectReason.restartRequired) {
            console.log("Restart Required, Restarting...");
            start();
          } else if (reason === DisconnectReason.timedOut) {
            console.log("Connection TimedOut, Reconnecting...");
            start();
          } else
            XeonBotInc.end(`Unknown DisconnectReason: ${reason}|${connection}`);
        }
      });

      XeonBotInc.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
          let decode = jidDecode(jid) || {};
          return (
            (decode.user &&
              decode.server &&
              decode.user + "@" + decode.server) ||
            jid
          );
        } else return jid;
      };

      XeonBotInc.ev.on("contacts.update", (update) => {
        for (let contact of update) {
          let id = XeonBotInc.decodeJid(contact.id);
          if (store && store.contacts)
            store.contacts[id] = { id, name: contact.notify };
        }
      });

      XeonBotInc.getName = (jid, withoutContact = false) => {
        id = XeonBotInc.decodeJid(jid);
        withoutContact = XeonBotInc.withoutContact || withoutContact;
        let v;
        if (id.endsWith("@g.us"))
          return new Promise(async (resolve) => {
            v = store.contacts[id] || {};
            if (!(v.name || v.subject)) v = XeonBotInc.groupMetadata(id) || {};
            resolve(
              v.name ||
                v.subject ||
                PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber(
                  "international"
                )
            );
          });
        else
          v =
            id === "0@s.whatsapp.net"
              ? {
                  id,
                  name: "WhatsApp",
                }
              : id === XeonBotInc.decodeJid(XeonBotInc.user.id)
              ? XeonBotInc.user
              : store.contacts[id] || {};
        return (
          (withoutContact ? "" : v.name) ||
          v.subject ||
          v.verifiedName ||
          PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
            "international"
          )
        );
      };

      XeonBotInc.parseMention = (text = "") => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
          (v) => v[1] + "@s.whatsapp.net"
        );
      };

      XeonBotInc.sendContact = async (jid, kon, quoted = "", opts = {}) => {
        let list = [];
        for (let i of kon) {
          list.push({
            displayName: await XeonBotInc.getName(i + "@s.whatsapp.net"),
            vcard: `BEGIN:VCARD\n
VERSION:3.0\n
N:${await XeonBotInc.getName(i + "@s.whatsapp.net")}\n
FN:${await XeonBotInc.getName(i + "@s.whatsapp.net")}\n
item1.TEL;waid=${i}:${i}\n
item1.X-ABLabel:Ponsel\n
item2.EMAIL;type=INTERNET:tesheroku123@gmail.com\n
item2.X-ABLabel:Email\n
item3.URL:https://bit.ly/39Ivus6\n
item3.X-ABLabel:YouTube\n
item4.ADR:;;Indonesia;;;;\n
item4.X-ABLabel:Region\n
END:VCARD`,
          });
        }
        XeonBotInc.sendMessage(
          jid,
          {
            contacts: { displayName: `${list.length} Contact`, contacts: list },
            ...opts,
          },
          { quoted }
        );
      };

      XeonBotInc.sendImage = async (
        jid,
        path,
        caption = "",
        quoted = "",
        options
      ) => {
        let buffer = Buffer.isBuffer(path)
          ? path
          : /^data:.*?\/.*?;base64,/i.test(path)
          ? Buffer.from(path.split`,`[1], "base64")
          : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
          ? fs.readFileSync(path)
          : Buffer.alloc(0);
        return await XeonBotInc.sendMessage(
          jid,
          { image: buffer, caption: caption, ...options },
          { quoted }
        );
      };

      XeonBotInc.copyNForward = async (
        jid,
        message,
        forceForward = false,
        options = {}
      ) => {
        let vtype;
        if (options.readViewOnce) {
          message.message =
            message.message &&
            message.message.ephemeralMessage &&
            message.message.ephemeralMessage.message
              ? message.message.ephemeralMessage.message
              : message.message || undefined;
          vtype = Object.keys(message.message.viewOnceMessage.message)[0];
          delete (message.message && message.message.ignore
            ? message.message.ignore
            : message.message || undefined);
          delete message.message.viewOnceMessage.message[vtype].viewOnce;
          message.message = {
            ...message.message.viewOnceMessage.message,
          };
        }
        let mtype = Object.keys(message.message)[0];
        let content = await generateForwardMessageContent(
          message,
          forceForward
        );
        let ctype = Object.keys(content)[0];
        let context = {};
        if (mtype != "conversation")
          context = message.message[mtype].contextInfo;
        content[ctype].contextInfo = {
          ...context,
          ...content[ctype].contextInfo,
        };
        const waMessage = await generateWAMessageFromContent(
          jid,
          content,
          options
            ? {
                ...content[ctype],
                ...options,
                ...(options.contextInfo
                  ? {
                      contextInfo: {
                        ...content[ctype].contextInfo,
                        ...options.contextInfo,
                      },
                    }
                  : {}),
              }
            : {}
        );
        await XeonBotInc.relayMessage(jid, waMessage.message, {
          messageId: waMessage.key.id,
        });
        return waMessage;
      };

      XeonBotInc.sendButtonText = (
        jid,
        buttons = [],
        text,
        footer,
        quoted = "",
        options = {}
      ) => {
        let buttonMessage = {
          text,
          footer,
          buttons,
          headerType: 2,
          ...options,
        };
        XeonBotInc.sendMessage(jid, buttonMessage, { quoted, ...options });
      };

      XeonBotInc.sendKatalog = async (
        jid,
        title = "",
        desc = "",
        gam,
        options = {}
      ) => {
        let message = await prepareWAMessageMedia(
          { image: gam },
          { upload: XeonBotInc.waUploadToServer }
        );
        const tod = generateWAMessageFromContent(
          jid,
          {
            productMessage: {
              product: {
                productImage: message.imageMessage,
                productId: "9999",
                title: title,
                description: desc,
                currencyCode: "INR",
                priceAmount1000: "100000",
                url: `https://chat.whatsapp.com/JnHhQpOy4VN5Yot9nGUy1W`,
                productImageCount: 1,
                salePriceAmount1000: "0",
              },
              businessOwnerJid: `6289677216812@s.whatsapp.net`,
            },
          },
          options
        );
        return XeonBotInc.relayMessage(jid, tod.message, {
          messageId: tod.key.id,
        });
      };

      XeonBotInc.send5ButLoc = async (
        jid,
        text = "",
        footer = "",
        img,
        but = [],
        options = {}
      ) => {
        var template = generateWAMessageFromContent(
          jid,
          proto.Message.fromObject({
            templateMessage: {
              hydratedTemplate: {
                hydratedContentText: text,
                locationMessage: {
                  jpegThumbnail: img,
                },
                hydratedFooterText: footer,
                hydratedButtons: but,
              },
            },
          }),
          options
        );
        XeonBotInc.relayMessage(jid, template.message, {
          messageId: template.key.id,
        });
      };

      XeonBotInc.sendButImg = async (jid, path, teks, fke, but) => {
        let img = Buffer.isBuffer(path)
          ? path
          : /^data:.*?\/.*?;base64,/i.test(path)
          ? Buffer.from(path.split`,`[1], "base64")
          : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
          ? fs.readFileSync(path)
          : Buffer.alloc(0);
        let fjejfjjjer = {
          image: img,
          jpegThumbnail: img,
          caption: teks,
          fileLength: "1",
          footer: fke,
          buttons: but,
          headerType: 4,
        };
        XeonBotInc.sendMessage(jid, fjejfjjjer, { quoted: m });
      };

      XeonBotInc.setStatus = (status) => {
        XeonBotInc.query({
          tag: "iq",
          attrs: {
            to: "@s.whatsapp.net",
            type: "set",
            xmlns: "status",
          },
          content: [
            {
              tag: "status",
              attrs: {},
              content: Buffer.from(status, "utf-8"),
            },
          ],
        });
        return status;
      };

      XeonBotInc.downloadAndSaveMediaMessage = async (
        message,
        filename,
        attachExtension = true
      ) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || "";
        let messageType = message.mtype
          ? message.mtype.replace(/Message/gi, "")
          : mime.split("/")[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        let type = await FileType.fromBuffer(buffer);
        trueFileName = attachExtension ? filename + "." + type.ext : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
      };

      XeonBotInc.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || "";
        let messageType = message.mtype
          ? message.mtype.replace(/Message/gi, "")
          : mime.split("/")[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      };

      XeonBotInc.sendText = (jid, text, quoted = "", options) =>
        XeonBotInc.sendMessage(jid, { text: text, ...options }, { quoted });
    }
    await start();
  } catch (e) {
    console.log(e);
  }
};

module.exports = { rentfromxeon, conns };

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
