var nodemailer = require('nodemailer');
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
const DeliverEmailRepo = require('../SchemaModels/DeliverEmail');

var smtpConfig = {
        host: config.smtp2.host,
        port: config.smtp2.port,
        secure: true, // true for 465, false for other ports
        auth: {
            user: config.smtp2.auth.user,
            pass: config.smtp2.auth.pass
        }
}
let transporter = nodemailer.createTransport(smtpConfig);
exports.GetMailObject = function (to, subject, html, cc, bcc) {
    //console.log('getmailobj')
    var tag0 = "key0=value0";
    var tag1 = "key1=value1";
        function MailException(message) {
            this.message = message;
            this.name = 'MailException';
        }
    
        var mailObject = {};
        if (to && to !="")
        {
            if(env==='dev'){
    mailObject.to =   ['kpamulapati@innoclique.com','avinash@innoclique.com','kramachandra@innoclique.com','yviswanadh@innoclique.com','pbhargav@innoclique.com']
          //   mailObject.to =   "brajesh@innoclique.com"
            }else{
                mailObject.to = to;
            }
        }
        else
            throw new MailException("To filed is maindatory");
    
        if (subject)
            mailObject.subject = subject;
        else
            throw new MailException("Subject is maindatory");
    
        if (html)
            mailObject.html = html;
        else
            throw new MailException("Body is maindatory");
    
        if (cc)
            mailObject.cc = cc;
    
        if (bcc)
            mailObject.bcc = bcc;
        mailObject.headers= {
                //'X-SES-CONFIGURATION-SET': configurationSet,
                'X-SES-MESSAGE-TAGS': tag0,
                'X-SES-MESSAGE-TAGS': tag1
              }
    //console.log('mailobject',mailObject)
        return mailObject;
    }

exports.SendEmail = async function (contents, cb) {
     //console.log('sendemail',smtpConfig)
    
    var _deliveremails=[];
    _deliveremails.push({
        Type: contents.subject,
        IsDelivered: true,
        Email: env==='dev'? contents.to[0]: contents.to ,
        Template: contents.html,
        Subject: contents.subject
    })
  var de = await DeliverEmailRepo.insertMany(_deliveremails);
     contents.from = config.smtp2.smtp_user; 
     //console.log(contents);
     return transporter.sendMail(contents, function (error, info) {
         if (error) {
             console.log('error',error);
             cb({
                 mailsuccess: false,
                 data: null
             });
         } else
             cb({
                 mailsuccess: true,
                 data: info
             });
     });
 }