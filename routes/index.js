const express    = require('express');
const router     = express.Router();
const fs         = require('fs');
const readline   = require('readline');
const google     = require('googleapis');
const googleAuth = require('google-auth-library');
const auth       = google.auth
const adsense    = google.adsense('v1.4');
const csv        = require('fast-csv');
const xl         = require('excel4node');

// Create a new instance of a Workbook class
var wb = new xl.Workbook();
var ws = wb.addWorksheet('月次');
 
// Add Worksheets to the workbook
var workSheet = wb.addWorksheet('月次');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET home page. */
router.post('/adsense', function(req, res, next) {
  let SCOPES = ['https://www.googleapis.com/auth/adsense.readonly'];
  let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
      process.env.USERPROFILE) + '/.credentials/';
  let TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Drive API.
    authorize(JSON.parse(content), adsenseCallback);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   *
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    let clientSecret = credentials.installed.client_secret;
    let clientId = credentials.installed.client_id;
    let redirectUrl = credentials.installed.redirect_uris[0];
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        callback(oauth2Client);
      }
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   *
   * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback to call with the authorized
   *     client.
   */
  function getNewToken(oauth2Client, callback) {
    let authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        callback(oauth2Client);
      });
    });
  }

  /**
   * Store token to disk be used in later program executions.
   *
   * @param {Object} token The token to store to disk.
   */
  function storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
  }


  /**
   * Lists the names and IDs of up to 10 files.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function adsenseCallback(auth) {
    console.log("inside adsenseCallback");

    adsense.reports.generate(parameters, function(err, response) {
      console.log(response);
      let reportData = []

      let date = []
      let displayNbr = []
      let clickRatio = []
      let cpc = []
      let impressionRevenue = []
      let revenue = []

      

      response.data.rows.map(e => {
          if(date.indexOf(e[0]) === -1) date.push(e[0]);
          if(e[1] === "CPC bids") {
            cpc.push(e[4])
            impressionRevenue.push(e[5])
            clickRatio.push(String(Number(e[6])*100).split('.')[0] + '.' + String(Number(e[6])*100).split('.')[1][0] + String(Number(e[6])*100).split('.')[1][1])
            displayNbr.push(Math.floor(Number(e[7])))
          }
      });

      for(let i = 0; i < date.length; i++) {
        reportData.push([date[i], displayNbr[i], clickRatio[i], cpc[i], impressionRevenue[i]])
      }

      let parameters = {
        "auth": auth,    
        "accountId": 'pub-7342164699178968',
        "dimension" : ["MONTH", "BID_TYPE_NAME"],
        "endDate": req.body.date2,
        "startDate": req.body.date1,
        "metric"  :["EARNINGS","CLICKS","COST_PER_CLICK","INDIVIDUAL_AD_IMPRESSIONS_RPM","AD_REQUESTS_CTR", "INDIVIDUAL_AD_IMPRESSIONS"]
      };
      var style = wb.createStyle({
        fill: { type: 'pattern', patternType: 'solid', fgColor: '#CCFFFF'},
        font: { color: '#000000', size: 12 },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: { bottom: { style: 'thin', color: '#000000' } }
      });
  
      var styleWithoutBorder = wb.createStyle({
        fill: { type: 'pattern', patternType: 'solid', fgColor: '#CCFFFF'},
        font: { color: '#000000', size: 12 },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
      });
  
      var headerLeftStyle = wb.createStyle({
        fill: { type: 'pattern', patternType: 'solid', fgColor: '#CCFFFF'},
        font: { bold: true, color: '#000000', size: 12 },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: {
            left: { style: 'double', color: '#000000' },
            bottom: { style: 'thin', color: '#000000' }
        }
      })
  
      ws.cell(1, 2, 1, 11, true).string('Google Travel').style(headerLeftStyle);
      ws.cell(2, 2, 2, 6, true).string('Adsense').style(
        wb.createStyle({
            fill: { type: 'pattern', patternType: 'solid', fgColor: '#CCFFFF'},
            font: { bold: true, color: '#000000', size: 12 },
            numberFormat: '$#,##0.00; ($#,##0.00); -',
            border: { left: { style: 'double', color: '#000000' } }
        })
      );
  
      ws.cell(2, 7, 2, 11, true).string('AdExchange').style(
        wb.createStyle({
            fill: { type: 'pattern', patternType: 'solid', fgColor: '#CCFFFF'},
            font: { bold: true, color: '#000000', size: 12 },
            numberFormat: '$#,##0.00; ($#,##0.00); -',
            border: { left: { style: 'double', color: '#000000' } }
        })
      );
  
      ws.cell(3,2).string('表示回数').style(headerLeftStyle);
      ws.cell(3,3).string('クリック率').style(style);
      ws.cell(3,4).string('CPC').style(style);
      ws.cell(3,5).string('インプレッション収益').style(style);
      ws.cell(3,6).string('収益').style(style);
  
      ws.cell(3,7).string('広告の表示回数').style(headerLeftStyle);
      ws.cell(3,8).string('CTR').style(style);
      ws.cell(3,9).string('CPC').style(style);
      ws.cell(3,10).string('eCPM').style(style);
      ws.cell(3,11).string('収益').style(style);
  
      ws.row(3).freeze()
  
      wb.write('report.xlsx');

      // csv.
      //   write(reportData, {headers: true})
      //   .pipe(ws);
      res.send(JSON.stringify(reportData));
    });
  }
});

module.exports = router;