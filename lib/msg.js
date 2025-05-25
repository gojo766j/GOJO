const { proto, downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')

const downloadMediaMessage = async(m, filename) => {
	try {
		if (m.type === 'viewOnceMessage') {
			m.type = m.msg.type
		}

		let name, stream, buffer = Buffer.from([])

		switch(m.type) {
			case 'imageMessage':
				name = filename ? filename + '.jpg' : 'undefined.jpg'
				stream = await downloadContentFromMessage(m.msg, 'image')
				break
			case 'videoMessage':
				name = filename ? filename + '.mp4' : 'undefined.mp4'
				stream = await downloadContentFromMessage(m.msg, 'video')
				break
			case 'audioMessage':
				name = filename ? filename + '.mp3' : 'undefined.mp3'
				stream = await downloadContentFromMessage(m.msg, 'audio')
				break
			case 'stickerMessage':
				name = filename ? filename + '.webp' : 'undefined.webp'
				stream = await downloadContentFromMessage(m.msg, 'sticker')
				break
			case 'documentMessage':
				// safer file extension extraction
				const originalFileName = m.msg.fileName || 'file.bin'
				let ext = path.extname(originalFileName).slice(1).toLowerCase() || 'bin'
				// normalize extensions if needed
				if (ext === 'jpeg') ext = 'jpg'
				if (ext === 'png') ext = 'jpg'  // this seems odd but keeping from your original
				if (ext === 'm4a') ext = 'mp3'

				name = filename ? filename + '.' + ext : 'undefined.' + ext
				stream = await downloadContentFromMessage(m.msg, 'document')
				break
			default:
				throw new Error(`Unsupported message type: ${m.type}`)
		}

		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(name, buffer)
		return fs.readFileSync(name)

	} catch (err) {
		console.error('Error in downloadMediaMessage:', err)
		throw err
	}
}

const sms = (robin, m) => {
	try {
		if (m.key) {
			m.id = m.key.id
			m.chat = m.key.remoteJid
			m.fromMe = m.key.fromMe
			m.isGroup = m.chat.endsWith('@g.us')
			m.sender = m.fromMe ? robin.user.id.split(':')[0] + '@s.whatsapp.net' : (m.isGroup ? m.key.participant : m.key.remoteJid)
		}

		if (m.message) {
			m.type = getContentType(m.message)
			m.msg = (m.type === 'viewOnceMessage') ? m.message[m.type].message[getContentType(m.message[m.type].message)] : m.message[m.type]

			if (m.msg) {
				if (m.type === 'viewOnceMessage') {
					m.msg.type = getContentType(m.message[m.type].message)
				}

				const contextInfo = m.msg.contextInfo || {}
				const quotedMention = contextInfo.participant || ''
				const tagMention = contextInfo.mentionedJid || []
				const mention = Array.isArray(tagMention) ? [...tagMention] : (tagMention ? [tagMention] : [])

				if (quotedMention) mention.push(quotedMention)
				m.mentionUser = mention.filter(x => x)

				// body text extraction
				m.body =
					(m.type === 'conversation') ? m.msg :
					(m.type === 'extendedTextMessage') ? m.msg.text :
					(m.type === 'imageMessage' && m.msg.caption) ? m.msg.caption :
					(m.type === 'videoMessage' && m.msg.caption) ? m.msg.caption :
					(m.type === 'templateButtonReplyMessage' && m.msg.selectedId) ? m.msg.selectedId :
					(m.type === 'buttonsResponseMessage' && m.msg.selectedButtonId) ? m.msg.selectedButtonId : ''

				m.quoted = contextInfo.quotedMessage || null

				if (m.quoted) {
					m.quoted.type = getContentType(m.quoted)
					m.quoted.id = contextInfo.stanzaId
					m.quoted.sender = contextInfo.participant
					m.quoted.fromMe = m.quoted.sender?.split('@')[0].includes(robin.user.id.split(':')[0]) || false
					m.quoted.msg = (m.quoted.type === 'viewOnceMessage') ? m.quoted[m.quoted.type].message[getContentType(m.quoted[m.quoted.type].message)] : m.quoted[m.quoted.type]

					if (m.quoted.type === 'viewOnceMessage') {
						m.quoted.msg.type = getContentType(m.quoted[m.quoted.type].message)
					}

					const qContextInfo = m.quoted.msg.contextInfo || {}
					const quoted_quotedMention = qContextInfo.participant || ''
					const quoted_tagMention = qContextInfo.mentionedJid || []
					const quoted_mention = Array.isArray(quoted_tagMention) ? [...quoted_tagMention] : (quoted_tagMention ? [quoted_tagMention] : [])

					if (quoted_quotedMention) quoted_mention.push(quoted_quotedMention)
					m.quoted.mentionUser = quoted_mention.filter(x => x)

					m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
						key: {
							remoteJid: m.chat,
							fromMe: m.quoted.fromMe,
							id: m.quoted.id,
							participant: m.quoted.sender
						},
						message: m.quoted
					})

					m.quoted.download = (filename) => downloadMediaMessage(m.quoted, filename)
					m.quoted.delete = () => robin.sendMessage(m.chat, { delete: m.quoted.fakeObj.key })
					m.quoted.react = (emoji) => robin.sendMessage(m.chat, { react: { text: emoji, key: m.quoted.fakeObj.key } })
				}
			}

			m.download = (filename) => downloadMediaMessage(m, filename)
		}

		m.reply = (teks, id = m.chat, option = { mentions: [m.sender] }) =>
			robin.sendMessage(id, { text: teks, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })

		m.replyS = (stik, id = m.chat, option = { mentions: [m.sender] }) =>
			robin.sendMessage(id, { sticker: stik, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })

		m.replyImg = (img, teks, id = m.chat, option = { mentions: [m.sender] }) =>
			robin.sendMessage(id, { image: img, caption: teks, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })

		m.replyVid = (vid, teks, id = m.chat, option = { mentions: [m.sender], gif: false }) =>
			robin.sendMessage(id, { video: vid, caption: teks, gifPlayback: option.gif, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })

		m.replyAud = (aud, id = m.chat, option = { mentions: [m.sender], ptt: false }) =>
			robin.sendMessage(id, { audio: aud, ptt: option.ptt, mimetype: 'audio/mpeg', contextInfo: { mentionedJid: option.mentions } }, { quoted: m })

		m.replyDoc = (doc, id = m.chat, option = { mentions: [m.sender], filename: 'undefined.pdf', mimetype: 'application/pdf' }) =>
			robin.sendMessage(id, { document: doc, mimetype: option.mimetype, fileName: option.filename, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })

		m.replyContact = (name, info, number) => {
			const vcard = 'BEGIN:VCARD\n' +
				'VERSION:3.0\n' +
				'FN:' + name + '\n' +
				'ORG:' + info + ';\n' +
				'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' +
				'END:VCARD'
			robin.sendMessage(m.chat, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: m })
		}

		m.react = (emoji) =>
			robin.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

		return m
	} catch (err) {
		console.error('Error in sms function:', err)
		throw err
	}
}

module.exports = { sms, downloadMediaMessage }
