const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const sendRequestFunction = require('./server-modules/getWorkGetRequest');

const YOUR_SERVER_PORT = 4000;
const app = express();
app.use(cors());
app.options('*', cors());
// app.use(
//   cors({
//     origin: 'http://188.190.63.226:5500',
//   })
// );
app.use(express.json());

const cheerioParser = (response, element, className, attribute) => {
  const $ = cheerio.load(response);
  const targetElement = $(`${element}.${className}`);
  const targetId = targetElement.attr(`${attribute}`);
  const targetRate = targetElement.attr('data-rate');
  const targetBalance = targetElement.attr('data-balance');

  return {
    tab: targetId,
    rate: targetRate,
    balance: targetBalance,
  };
};

// const users = [
//   {
//     login: 'thegreatedog',
//     password: '321915',
//   },
//   {
//     login: 'jeka',
//     password: 'Evgeniu10',
//   },
//   {
//     login: 'Uziy',
//     password: 'vfntvfnbrf',
//   },
// ];

// app.post('/getAllAccs', async (req, res) => {
//   const { login, password } = req.body;
//   console.log(req.body);
//   const user = users.find(
//     (user) => user.login === login && user.password === password
//   );
//   if (user) {
//     try {
//       const response = await fetch(
//         'https://react-course-http-6ee84-default-rtdb.firebaseio.com/work.json',
//         {
//           method: 'GET',
//         }
//       );
//       const responseData = await response.json();

//       const accountsArray = Object.values(responseData)
//         .map((account) => ({
//           accountName: account.accountName,
//           password: account.password,
//           owner: account.owner,
//         }))
//         .filter((account) => account.owner === login);

//       res.send(accountsArray);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   } else {
//     res.status(401).json({ error: 'Wrong login or password' });
//   }
// });

app.post('/getAllAccs', async (req, res) => {
  const login = req.body.login;
  console.log(req.body);

  try {
    const response = await fetch(
      'https://react-course-http-6ee84-default-rtdb.firebaseio.com/work.json',
      {
        method: 'GET',
      }
    );
    const responseData = await response.json();

    const accountsArray = Object.values(responseData)
      .map((account) => ({
        accountName: account.accountName,
        password: account.password,
        owner: account.owner,
      }))
      .filter((account) => account.owner === login);

    res.send(accountsArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/sendRequest', async (req, res) => {
  const accountName = req.body.accountName;
  const password = req.body.password;
  // console.log(accountName, password);
  try {
    const response = await fetch('http://www.protypers.com/login', {
      method: 'POST',
      headers: {
        accept: 'text/plain, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded',
        'x-requested-with': 'XMLHttpRequest',
      },
      referrer: 'http://www.protypers.com/login',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: `email=${accountName}&password=${password}&request_type=ajax`,
    });

    const responseData = await response.text();
    const responseStatus = response.status;
    const responseHeaderList = response.headers;
    const responseCookies = responseHeaderList.get('set-cookie');

    const accountData = {
      accountName,
      password,
      accountCookie: responseCookies.split(';')[0],
      accBalance: 0,
      rate: 0,
      tab: '',
      banned: false,
    };
    // console.log(accountData);

    if (response.ok) {
      try {
        const response = await sendRequestFunction(
          'http://www.protypers.com/work/faster',
          null,
          'GET',
          accountData.accountCookie
        );
        const statsData = await response.text();

        const parserData = cheerioParser(statsData, 'body', 'claro', 'id');
        accountData.accBalance = parserData.balance;
        accountData.rate = parserData.rate;
        accountData.tab = parserData.tab;

        // }
      } catch (error) {
        console.log(error);
      }
    }
    // console.log(accountData);
    res.json(accountData);
    const responseStatusText = response.statusText;
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/startWork', async (req, res) => {
  // console.log(req.body);
  const accountName = req.body.accountName;
  const cookie = req.body.cookie;
  const tab = req.body.tab;
  // console.log(accountName);

  try {
    const response = await sendRequestFunction(
      `http://www.protypers.com/work/faster/captcha/${tab}`,
      null,
      'GET',
      cookie
    );

    const responseData = await response.json();

    // console.log(responseData);
    res.json(responseData);
  } catch (error) {
    console.log(error.message, 'get');
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
  }
});

app.post('/sendAnswer', async (req, res) => {
  try {
    const { text, token, tab, type, cookie } = req.body;
    // console.log(text, token, tab, type, cookie);
    const body = `text=${text}&token=${token}&tab=${tab}&type=${type}`;
    // console.log(body);
    const response = await fetch(
      'http://www.protypers.com/work/faster/solve/',
      {
        method: 'POST',
        headers: {
          accept: '*/*',
          'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6',
          'content-type': 'application/x-www-form-urlencoded',
          'x-requested-with': 'XMLHttpRequest',
          cookie: `__utmz=163308157.1687681435.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); ${cookie}; __utmc=163308157; __utma=163308157.1173496640.1687681435.1692868845.1692872191.23; __utmt=1; __utmb=163308157.1.10.1692872191`,
          Referer: 'http://www.protypers.com/work/faster',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
        body: body,
      }
    );
    // console.log(response);
    const responseData = await response.text();
    if (response.ok) {
      res.json('done');
    }
    // console.log(responseData);
  } catch (error) {
    console.log(error);
  }
});

app.post('/getBoost', async (req, res) => {
  const cookie = req.body.cookie;

  try {
    const response = await sendRequestFunction(
      'http://www.protypers.com/work/boostpack',
      null,
      'GET',
      cookie
    );
    const responseData = await response.json();
    console.log(responseData);
    res.json(responseData);
  } catch (e) {
    console.log(e);
  }
});

app.post('/buyBoost', async (req, res) => {
  const cookie = req.body.cookie;
  try {
    const response = await sendRequestFunction(
      'http://www.protypers.com/work/boostpack/1',
      null,
      'POST',
      cookie
    );

    const responseData = await response.json();
    console.log(responseData);
    res.json(responseData);
  } catch (e) {
    console.log(e);
  }
});

app.post('/addAccToBase', async (req, res) => {
  const { owner, accountName, password } = req.body;
  console.log(owner, accountName, password);
  const body = JSON.stringify({
    owner,
    accountName,
    password,
  });
  try {
    const response = await sendRequestFunction(
      'https://react-course-http-6ee84-default-rtdb.firebaseio.com/work.json',
      body,
      'POST'
    );
    const responseData = await response.json();

    console.log(responseData);
    if (response.ok) {
      res.json('Account added successful');
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/removeAccFromBase', async (req, res) => {
  const enteredEmail = req.body.enteredEmail;
  const owner = req.body.login;
  try {
    const response = await sendRequestFunction(
      'https://react-course-http-6ee84-default-rtdb.firebaseio.com/work.json'
    );
    const responseData = await response.json();
    let keyToDelete;
    if (responseData) {
      for (const key in responseData) {
        if (
          responseData[key].accountName === enteredEmail &&
          responseData[key].owner === owner
        ) {
          keyToDelete = key;

          break;
        }
      }
      console.log(keyToDelete);
    } else {
      res.json('err');
      return;
    }
    if (keyToDelete) {
      const response = await sendRequestFunction(
        `https://react-course-http-6ee84-default-rtdb.firebaseio.com/work/${keyToDelete}.json`,
        null,
        'DELETE'
      );
      const responseData = await response.json();

      if (response.ok) {
        res.json('Account deleted successful');
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.listen(YOUR_SERVER_PORT, () => {
  console.log(`Your server is listening on port ${YOUR_SERVER_PORT}`);
});
